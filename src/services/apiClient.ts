import axios from 'axios';
// Axios tiplerini 'type' keyword'ü ile import etmek genellikle önerilir
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// Token yenileme isteğinin zaten yapılıp yapılmadığını takip etmek için
let isRefreshing = false;
// Token yenilenirken gelen istekleri bekletmek için (response interceptor'da retry için)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- Merkezi Token Yenileme Fonksiyonu ---
export const performTokenRefresh = async (): Promise<string> => {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();

  if (!refreshToken) {
    logout(); // Store'dan gelen logout
    throw new Error('No refresh token, logged out.');
  }

  try {
    // Yenileme isteği için ayrı bir axios instance
    const refreshResponse = await axios.post<{ accessToken: string; refreshToken: string }>(
      API_ENDPOINTS.AUTH_REFRESH_TOKEN,
      { refreshToken },
      { baseURL: API_BASE_URL }
    );

    const newAccessToken = refreshResponse.data.accessToken;
    const newRefreshToken = refreshResponse.data.refreshToken;

    setTokens(newAccessToken, newRefreshToken); // Store'u güncelle
    return newAccessToken; // Yeni access token'ı döndür
  } catch (error) {
    logout(); // Yenileme başarısız olursa logout yap

    // Hatanın Axios hatası olup olmadığını ve 401 olup olmadığını kontrol edelim
    const isAuthError = error instanceof Error && 'response' in error && (error as any).response?.status === 401;
    if (isAuthError) {
      throw new Error('Refresh token invalid, logged out.');
    }
    throw error; // Diğer hataları tekrar fırlat
  }
};
// --- --- --- --- --- --- --- --- --- ---

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor (Token Ekleme) ---
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    // Token gerektirmeyen endpoint'leri (örn. login, refresh) kontrol edebilirsiniz
    // Örnek: const noAuthRequired = ['/auth/login', '/auth/refresh'];
    // if (accessToken && !noAuthRequired.includes(config.url || '')) {
    if (accessToken && config.headers ) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor (Yenileme Mantığı Değişti) ---
apiClient.interceptors.response.use(
  (response) => {
    // Başarılı yanıtları doğrudan geri döndür
    return response;
  },
  async (error: AxiosError) => {
    // error.config AxiosError içinde tanımlıdır, InternalAxiosRequestConfig olarak cast edilebilir.
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Hata objesini ve response'u kontrol et
    if (!error.response) {
      // Network hatası veya başka bir non-HTTP hata
      return Promise.reject(error);
    }

    // 401 hatası değilse veya zaten tekrar denenen bir istekse, hatayı doğrudan fırlat
    if (error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Token yenileme endpoint'inden 401 geldiyse (refresh token geçersiz), logout yap
    if (originalRequest.url === API_ENDPOINTS.AUTH_REFRESH_TOKEN) {
      useAuthStore.getState().logout(); // logout fonksiyonunu çağır
      processQueue(error); // Bekleyen istekleri hata ile sonlandır
      isRefreshing = false; // Yenileme durumunu sıfırla
      return Promise.reject(error);
    }

    // --- Token Yenileme Mantığı --- 
    if (isRefreshing) {
      // Eğer zaten token yenileme işlemi sürüyorsa, bu isteği kuyruğa ekle
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          // Orijinal isteğin header'larını güncelle (eğer varsa)
          if (originalRequest.headers) {
             originalRequest.headers['Authorization'] = `Bearer ${token}`;
          }
          // Axios config objesiyle isteği tekrar dene
          return apiClient(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err); // Kuyruk işlenirken hata olursa
        });
    }

    // Token yenileme işlemini başlat
    originalRequest._retry = true; // Tekrar deneme döngüsüne girmemek için işaretle
    isRefreshing = true;

    const { refreshToken, setTokens, logout } = useAuthStore.getState();

    if (!refreshToken) {
      logout();
      isRefreshing = false;
      processQueue(error); // Bekleyen isteklere hata döndür
      return Promise.reject(error);
    }

    try {
      const refreshResponse = await axios.post<{ accessToken: string; refreshToken?: string }>(
        `${API_BASE_URL}/auth/refresh`, // Tam refresh URL'si
        { refreshToken }, // Body'de refresh token gönderiliyor varsayımı
        { withCredentials: true } // Cookie tabanlı refresh token kullanıyorsanız gerekebilir
      );

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;

      // Yeni tokenları store'a kaydet (yeni refresh token geldiyse onu da kaydet)
      setTokens(newAccessToken, newRefreshToken || refreshToken);

      // Yeni access token'ı mevcut axios instance'ının default header'ına ayarla
      if (apiClient.defaults.headers.common) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      }
      // Orijinal isteğin header'ını da güncelleyelim (retry için)
      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
      }

      // Bekleyen istekleri yeni token ile işle
      processQueue(null, newAccessToken);

      // Orijinal isteği yeni token ile tekrar gönder
      return apiClient(originalRequest);

    } catch (refreshError) {
      logout(); // Refresh başarısız olursa logout yap
      processQueue(refreshError as AxiosError, null); // Bekleyen isteklere hata döndür
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient; 