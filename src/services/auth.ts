import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { User } from '../store/useAuthStore';
import { useAuthStore } from '../store/useAuthStore';

interface LoginParams {
  $type?: string;
  identityNumber: number;
  phoneNumber: {
    number: string;
    countryCode: number;
  };
  birthDate?: string;
  agentId?: string;
 
}

interface LoginResponse {
  token: string;
  customerId?: string;
}

interface VerifyMfaParams {
  token: string;
  code: string;
}

interface VerifyMfaResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  customerId: string;
}

interface RefreshTokenParams {
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface CustomerProfile {
  id: string;
  fullName: string | null;
  primaryEmail: string | null;
  primaryPhoneNumber: {
    number: string;
    countryCode: number;
  };
  identityNumber: number;
  createdAt: string;
  birthDate: string | null;
  city: string | null;
  district: string | null;
  gender: string | null;
  educationStatus: string | null;
  nationality: string | null;
  maritalStatus: string | null;
  job: string | null;
  representedBy: string | null;
}

// Fetch wrapper with token refresh
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const authStore = useAuthStore.getState();
  const accessToken = authStore.accessToken;
  const url = `${API_BASE_URL}${endpoint}`;

  // Add authorization header if token exists
  if (accessToken) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    };
  }

  try {
    const response = await fetch(url, options);

    // Token yenileme gerekiyorsa
    if (response.status === 401) {
      const refreshToken = authStore.refreshToken;
      
      if (!refreshToken) {
        authStore.logout();
        window.location.href = '/giris-yap';
        throw new Error('Oturum süresi doldu');
      }

      try {
        // Token yenileme isteği
        const refreshResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_REFRESH_TOKEN}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error('Token yenileme başarısız');
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
          await refreshResponse.json();

        // Yeni tokenları kaydet
        authStore.setTokens(newAccessToken, newRefreshToken);

        // Orijinal isteği yeni token ile tekrarla
        const retryOptions = {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newAccessToken}`,
          },
        };

        return fetch(url, retryOptions);
      } catch (error) {
        authStore.logout();
        window.location.href = '/giris-yap';
        throw error;
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};

// Authenticated istekler için yardımcı fonksiyon
const fetchAuthenticated = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const authStore = useAuthStore.getState();
  const accessToken = authStore.accessToken;

  if (!accessToken) {
    throw new Error('Oturum açmanız gerekiyor');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Bir hata oluştu' }));
    throw new Error(error.message || 'İstek başarısız');
  }

  return response.json();
};

export const authApi = {
  login: async (params: LoginParams): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        $type: params.$type || 'individual',
        ...params
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      // Error nesnesini genişletilmiş haliyle throw et
      const enhancedError: any = new Error(error.detail || error.message || 'Giriş başarısız');
      enhancedError.status = response.status;
      enhancedError.codes = error.codes;
      enhancedError.type = error.type;
      throw enhancedError;
    }

    return response.json();
  },

  verifyMfa: async (params: VerifyMfaParams): Promise<VerifyMfaResponse> => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_VERIFY_MFA}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Doğrulama başarısız');
    }

    return response.json();
  },

  refreshToken: async (params: RefreshTokenParams): Promise<RefreshTokenResponse> => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_REFRESH_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Token yenileme başarısız');
    }

    return response.json();
  },

  getProfile: async (): Promise<CustomerProfile> => {
    const response = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Profil bilgileri alınamadı');
    }

    return response.json();
  },

  // Örnek authenticated istekler için metodlar
  updateProfile: async (data: Partial<CustomerProfile>): Promise<CustomerProfile> => {
    return fetchAuthenticated<CustomerProfile>(API_ENDPOINTS.CUSTOMER_ME, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getAddresses: async () => {
    return fetchAuthenticated('/api/customers/me/addresses');
  },

  getVehicles: async () => {
    return fetchAuthenticated('/api/customers/me/vehicles');
  },

  // Diğer authenticated istekler için metodlar eklenebilir
};

// Export fetchWithAuth for use in other services
export { fetchWithAuth, fetchAuthenticated }; 