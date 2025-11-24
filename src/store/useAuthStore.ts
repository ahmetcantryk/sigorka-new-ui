import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthState {
  user: User | null;
  customerId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loginTime: number | null;
  lastActivityTime: number | null;
  rememberMe: boolean;
  sessionDurationMinutes: number;
  rememberMeDurationDays: number;
  autoLogoutWarningMinutes: number;
  extendSessionOnActivity: boolean;
  logoutTimer: NodeJS.Timeout | null;
  warningTimer: NodeJS.Timeout | null;
  setUser: (user: User) => void;
  setCustomerId: (id: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  logout: () => void;
  setRememberMe: (remember: boolean) => void;
  updateAuthConfig: (config: {
    sessionDurationMinutes?: number;
    rememberMeDurationDays?: number;  
    autoLogoutWarningMinutes?: number;
    extendSessionOnActivity?: boolean;
  }) => void;
  updateActivity: () => void;
  checkSessionExpiry: () => boolean;
  startSessionTimer: () => void;
  clearSessionTimers: () => void;
  initializeAuth: () => void;
}

const ACCESS_TOKEN_LIFETIME_SECONDS = 10 * 60;
const REFRESH_BUFFER_SECONDS = 60;

// Default config values
const DEFAULT_AUTH_CONFIG = {
  sessionDurationMinutes: 60,
  rememberMeDurationDays: 7,
  autoLogoutWarningMinutes: 5,
  extendSessionOnActivity: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      customerId: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loginTime: null,
      lastActivityTime: null,
      rememberMe: false,
      logoutTimer: null,
      warningTimer: null,
      ...DEFAULT_AUTH_CONFIG,

      setUser: (user) => {
        const now = Date.now();
        set({ 
          user, 
          isAuthenticated: true, 
          loginTime: now, 
          lastActivityTime: now 
        });
        get().startSessionTimer();
      },

      setCustomerId: (id) => set({ customerId: id }),

      setTokens: (accessToken, refreshToken) => 
        set({ accessToken, refreshToken, isAuthenticated: true }),

      clearTokens: () => 
        set({ accessToken: null, refreshToken: null, isAuthenticated: false }),

      logout: () => {
        get().clearSessionTimers();
        
        // LocalStorage'ı tamamen temizle
        if (typeof window !== 'undefined') {
          localStorage.clear();
        }
        
        set({ 
          user: null, 
          customerId: null,
          accessToken: null, 
          refreshToken: null, 
          isAuthenticated: false,
          loginTime: null,
          lastActivityTime: null,
          rememberMe: false
        });
      },

      setRememberMe: (remember) => set({ rememberMe: remember }),

      updateAuthConfig: (config) => {
        set({
          sessionDurationMinutes: config.sessionDurationMinutes ?? get().sessionDurationMinutes,
          rememberMeDurationDays: config.rememberMeDurationDays ?? get().rememberMeDurationDays,
          autoLogoutWarningMinutes: config.autoLogoutWarningMinutes ?? get().autoLogoutWarningMinutes,
          extendSessionOnActivity: config.extendSessionOnActivity ?? get().extendSessionOnActivity,
        });
        // Eğer kullanıcı giriş yapmışsa, timer'ları yeniden başlat
        if (get().isAuthenticated) {
          get().startSessionTimer();
        }
      },

      updateActivity: () => {
        const state = get();
        if (state.isAuthenticated && state.extendSessionOnActivity) {
          const now = Date.now();
          set({ lastActivityTime: now });
          // Timer'ları yeniden başlat
          state.startSessionTimer();
        }
      },

      checkSessionExpiry: () => {
        const state = get();
        if (!state.isAuthenticated || !state.loginTime) {
          return false;
        }

        const now = Date.now();
        const sessionDuration = state.rememberMe 
          ? state.rememberMeDurationDays * 24 * 60 * 60 * 1000 // Remember me durumunda gün cinsinden
          : state.sessionDurationMinutes * 60 * 1000; // Normal durumda dakika cinsinden

        const timeToCheck = state.extendSessionOnActivity && state.lastActivityTime 
          ? state.lastActivityTime 
          : state.loginTime;

        const isExpired = (now - timeToCheck) > sessionDuration;
        
        if (isExpired) {
          state.logout();
          return true;
        }
        return false;
      },

      startSessionTimer: () => {
        const state = get();
        state.clearSessionTimers();

        if (!state.isAuthenticated) return;

        const sessionDuration = state.rememberMe 
          ? state.rememberMeDurationDays * 24 * 60 * 60 * 1000
          : state.sessionDurationMinutes * 60 * 1000;

        const warningTime = state.autoLogoutWarningMinutes * 60 * 1000;
        const logoutTime = sessionDuration;
        const warningTimer = setTimeout(() => {
          // Uyarı göster (bu kısmı UI component'lerinde handle edebilirsiniz)
          // Custom event dispatch edebiliriz
          window.dispatchEvent(new CustomEvent('sessionWarning', {
            detail: { minutesLeft: state.autoLogoutWarningMinutes }
          }));
        }, logoutTime - warningTime);

        const logoutTimer = setTimeout(() => {
          state.logout();
          window.dispatchEvent(new CustomEvent('sessionExpired'));
        }, logoutTime);

        set({ warningTimer, logoutTimer });
      },

      clearSessionTimers: () => {
        const state = get();
        if (state.warningTimer) {
          clearTimeout(state.warningTimer);
        }
        if (state.logoutTimer) {
          clearTimeout(state.logoutTimer);
        }
        set({ warningTimer: null, logoutTimer: null });
      },

      initializeAuth: () => {
        const state = get();
        // Sayfa yüklendiğinde session kontrolü yap
        if (state.isAuthenticated) {
          const isExpired = state.checkSessionExpiry();
          if (!isExpired) {
            state.startSessionTimer();
          }
        }
      },

      hydrate: () => {
        try {
          const storedAuth = localStorage.getItem('auth-storage');
          if (storedAuth) {
            const { state } = JSON.parse(storedAuth);
            set({
              accessToken: state.accessToken,
              refreshToken: state.refreshToken,
              isAuthenticated: state.isAuthenticated,
              user: state.user,
              customerId: state.customerId,
              loginTime: state.loginTime,
              lastActivityTime: state.lastActivityTime,
              rememberMe: state.rememberMe,
              sessionDurationMinutes: state.sessionDurationMinutes || DEFAULT_AUTH_CONFIG.sessionDurationMinutes,
              rememberMeDurationDays: state.rememberMeDurationDays || DEFAULT_AUTH_CONFIG.rememberMeDurationDays,
              autoLogoutWarningMinutes: state.autoLogoutWarningMinutes || DEFAULT_AUTH_CONFIG.autoLogoutWarningMinutes,
              extendSessionOnActivity: state.extendSessionOnActivity ?? DEFAULT_AUTH_CONFIG.extendSessionOnActivity,
            });
            
            // Session kontrolü ve timer başlatma
            get().initializeAuth();
            return true;
          }
          return false;
        } catch (error) {
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
