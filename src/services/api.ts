import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
export const API_BASE_URL =  'https://api.insurup.com';


export interface CustomerProfile {
  id: string;
  fullName: string;
  primaryEmail: string;
  primaryPhoneNumber: {
    number: string;
    countryCode: number;
  };
  identityNumber: number;
  createdAt: string;
  birthDate: string;
  city: {
    value: string;
    text: string;
  };
  district: {
    value: string;
    text: string;
  };
  gender: string;
  educationStatus: string;
  nationality: string;
  maritalStatus: string;
  job: string;
  representedBy: string | null;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - her istekte token'ı ekle
api.interceptors.request.use(
  (config: any) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor - token yenileme ve hata yönetimi
api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;

    // Token süresi dolmuşsa
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        // Global axios'u tam URL ile çağır
        const response = await axios.post<RefreshTokenResponse>(
          `${API_BASE_URL}/api/auth/customer/refresh`,
          {
            refreshToken,
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (error) {
        // Refresh token da geçersizse kullanıcıyı logout yap
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const customerApi = {
  getProfile: async (): Promise<CustomerProfile> => {
    const response = await api.get<CustomerProfile>('/customers/me');
    return response.data;
  },
  
  refreshInfo: async (): Promise<void> => {
    await api.post('/customers/me/refresh-info');
  },
};

export default api; 