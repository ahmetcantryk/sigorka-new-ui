import { create } from 'zustand';

// Müşteri verisi için arayüz tanımı
interface CustomerData {
  id: string;
  fullName?: string;
  // Diğer müşteri özellikleri burada eklenebilir
  [key: string]: string | number | boolean | object | null | undefined; // Daha spesifik esnek tip
}

interface AuthState {
  token: string | null;
  customerData: CustomerData | null;
  setToken: (token: string) => void;
  setCustomerData: (data: CustomerData) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  customerData: JSON.parse(localStorage.getItem('customerData') || 'null'),

  setToken: (token: string) => {
    localStorage.setItem('token', token);
    set({ token });
  },

  setCustomerData: (data: CustomerData) => {
    localStorage.setItem('customerData', JSON.stringify(data));
    set({ customerData: data });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('customerData');
    set({ token: null, customerData: null });
  },
}));
