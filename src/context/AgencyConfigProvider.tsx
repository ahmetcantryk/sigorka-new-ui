'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // MUI imports
import LoadingOverlay from '../components/common/LoadingOverlay';
import { fetchWithAuth } from '../services/fetchWithAuth';
import { useAuthStore } from '../store/useAuthStore';


// Agency config context type
type AgencyConfigContextType = {
  agency: {
    id: string;
    name: string;
    legalName: string;
    browserTitle: string;
    faviconPath: string;
    logo: {
      path: string;
      alt: string;
    };
    contact: {
      phone: {
        primary: string;
        secondary: string;
      };
      email: {
        primary: string;
        secondary: string;
      };
      address: string;
      workingHours: {
        type: string;
        custom: string;
        options: {
          weekdays: string;
          weekdaysAndSaturday: string;
          allWeek: string;
        };
      };
    };
    socialMedia: {
      facebook: string;
      instagram: string;
      twitter: string;
      linkedin: string;
      youtube: string;
      whatsapp: string;
    };
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  homepage: {
    hero: {
      headline: string;
      subtext: string;
    };
    products: {
      title: string;
      subtext: string;
      items: Array<{
        id: string;
        name: string;
        isActive: boolean;
        order: number;
        link: string;
        icon: string;
      }>;
    };
    threeSteps: {
      title: string;
      subtext: string;
      steps: Array<{
        id: number;
        title: string;
        description: string;
        icon: string;
      }>;
    };
    whyChooseUs: {
      title: string;
      subtext: string;
      reasons: Array<{
        id: number;
        title: string;
        description: string;
        icon: string;
      }>;
    };
    partners: {
      title: string;
      subtext: string;
      companies: Array<{
        name: string;
        insuranceCompanyId: number;
        products: {
          kasko: number[];
          trafik: number[];
          dask: number[];
          tss: number[];
          konut: number[];
          imm: number[];
          yuvamguvende?: number[];
        };
      }>;
      logosDirectory: string;
    };
    faq: {
      title: string;
      subtext: string;
      questions: Array<{
        id: number;
        question: string;
        answer: string;
      }>;
    };
    contactUs: {
      title: string;
      subtext: string;
      formEnabled: boolean;
      formFields: {
        name: boolean;
        email: boolean;
        phone: boolean;
        subject: boolean;
        message: boolean;
      };
    };
  };
  legal: {
    kvkk: {
      title: string;
      content: string;
      lastUpdated: string;
    };
    privacyPolicy: {
      title: string;
      content: string;
      lastUpdated: string;
    };
    commercialElectronicMessages: {
      title: string;
      content: string;
      lastUpdated: string;
    };
    cookiePolicy: {
      title: string;
      content: string;
      lastUpdated: string;
    };
  };
  footer: {
    copyright: string;
    navLinks: Array<{
      title: string;
      link: string;
    }>;
    showPartnerLogos: boolean;
    showSocialMedia: boolean;
  };
  auth: {
    sessionDurationMinutes: number;
    rememberMeDurationDays: number;
    autoLogoutWarningMinutes: number;
    extendSessionOnActivity: boolean;
  };
  coverageGroupIds?: {
    kasko?: string[];
    trafik?: string[];
    dask?: string[];
    konut?: string[];
    tss?: string[];
    imm?: string[];
  };
};

// Helper function to get nested value from object using dot notation path
const getNestedValue = (obj: any, path: string): string => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || '';
};

// Helper function to process placeholders in a string
const processPlaceholders = (text: string, config: AgencyConfigContextType): string => {
  if (!text) return '';
  return text.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
    return getNestedValue(config, key);
  });
};

// Create context with default value
const AgencyConfigContext = createContext<AgencyConfigContextType | null>(null);

// Custom hook to use the agency config
export const useAgencyConfig = () => {
  const context = useContext(AgencyConfigContext);
  if (!context) {
    throw new Error('useAgencyConfig must be used within an AgencyConfigProvider');
  }
  return context;
};

// Auth configuration hook
const useAuthConfig = () => {
  const context = useAgencyConfig();
  const authStore = useAuthStore();
  
  useEffect(() => {
    if (context?.auth) {
      authStore.updateAuthConfig({
        sessionDurationMinutes: context.auth.sessionDurationMinutes,
        rememberMeDurationDays: context.auth.rememberMeDurationDays,
        autoLogoutWarningMinutes: context.auth.autoLogoutWarningMinutes,
        extendSessionOnActivity: context.auth.extendSessionOnActivity,
      });
    }
  }, [context?.auth]);

  return context?.auth;
};

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): string | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
    : null;
};

// Provider component
type AgencyConfigProviderProps = {
  children: ReactNode;
};

export const AgencyConfigProvider: React.FC<AgencyConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<AgencyConfigContextType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Doğru dosya adını kullanıyoruz (büyük/küçük harf duyarlı)
        const url = '/defaultAgencyConfig.json';
        
        // Window location origin kullanarak dinamik base URL
        const baseUrl = window.location.origin;
        
        const fullUrl = `${baseUrl}${url}`;

        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          // Vercel'de CORS sorunlarını önlemek için
          credentials: 'same-origin'
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Config yüklenemedi: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as AgencyConfigContextType;

        // Process placeholders in legal content
        if (data.legal) {
          if (data.legal.kvkk) {
            data.legal.kvkk.content = processPlaceholders(data.legal.kvkk.content, data);
          }
          if (data.legal.privacyPolicy) {
            data.legal.privacyPolicy.content = processPlaceholders(
              data.legal.privacyPolicy.content,
              data
            );
          }
          if (data.legal.commercialElectronicMessages) {
            data.legal.commercialElectronicMessages.content = processPlaceholders(
              data.legal.commercialElectronicMessages.content,
              data
            );
          }
          // Note: Cookie policy content is not processed currently, add if needed
        }

        setConfig(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu';
        setError(`Agency config yüklenirken bir hata oluştu: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Set CSS variables when config is loaded
  useEffect(() => {
    if (config) {
      const root = document.documentElement;

      // Set Browser Title and Favicon
      // document.title = config.agency.browserTitle;
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = config.agency.faviconPath;

      // Set Theme Colors
      const primaryRgb = hexToRgb(config.theme.primaryColor);
      const secondaryRgb = hexToRgb(config.theme.secondaryColor);
      const accentRgb = hexToRgb(config.theme.accentColor);

      if (primaryRgb) {
        root.style.setProperty('--color-primary-rgb', primaryRgb);
      }
      if (secondaryRgb) {
        root.style.setProperty('--color-secondary-rgb', secondaryRgb);
      }
      if (accentRgb) {
        root.style.setProperty('--color-accent-rgb', accentRgb);
      }
      // Ayrıca hex değerlerini de değişken olarak atayabiliriz (opsiyonel)
      root.style.setProperty('--color-primary-hex', config.theme.primaryColor);
      root.style.setProperty('--color-secondary-hex', config.theme.secondaryColor);
      root.style.setProperty('--color-accent-hex', config.theme.accentColor);
    }
  }, [config]);

  // Create MUI theme based on config
  const muiTheme = useMemo(() => {
    if (!config) {
      // Return default theme or handle loading state
      return createTheme();
    }
    return createTheme({
      palette: {
        primary: {
          main: config.theme.primaryColor || '#FFA500', // Fallback color
        },
        secondary: {
          main: config.theme.secondaryColor || '#FF8C00', // Fallback color
        },
        error: {
          main: config.theme.accentColor || '#F59E0B', // Fallback color
        },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: config.theme.primaryColor || '#FFA500',
                },
              },
              '& label.Mui-focused': {
                color: config.theme.primaryColor || '#FFA500',
              },
            },
          },
        },
        MuiCheckbox: {
          styleOverrides: {
            root: {
              '&.Mui-checked': {
                color: config.theme.primaryColor || '#FFA500',
              },
            },
          },
        },
        MuiLink: {
          styleOverrides: {
            root: {
              color: config.theme.primaryColor || '#FFA500',
            },
          },
        },
      },
    });
  }, [config]);

  if (loading) return <LoadingOverlay isVisible={true} />;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!config) return <div>Config bulunamadı</div>;

  return (
    <AgencyConfigContext.Provider value={config}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </AgencyConfigContext.Provider>
  );
};

export { useAuthConfig };
