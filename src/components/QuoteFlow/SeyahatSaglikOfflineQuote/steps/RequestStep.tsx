"use client";

import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../../store/useAuthStore';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { CheckCircle, Shield, Zap, Heart, AlertTriangle, XCircle, Clock } from 'lucide-react';

// DataLayer helper functions
declare global {
  interface Window {
    dataLayer: any[];
  }
}

const pushToDataLayer = (eventData: any) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventData);
  }
};

interface RequestStepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const RequestStep = ({ onNext, onBack, isFirstStep, isLastStep }: RequestStepProps) => {
  const { customerId, accessToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestCreated, setRequestCreated] = useState(false);
  const [requestResult, setRequestResult] = useState<'idle' | 'success' | 'error' | 'existing'>('idle');

  useEffect(() => {
    // localStorage'dan gelen durumları kontrol et
    const errorFromStorage = localStorage.getItem('seyahatSaglikRequestError');
    const successFromStorage = localStorage.getItem('seyahatSaglikRequestSuccess');

    if (successFromStorage) {
      setRequestResult('success');
      setRequestCreated(true);
      localStorage.removeItem('seyahatSaglikRequestSuccess');
    } else if (errorFromStorage) {
      setError(errorFromStorage);
      
      // Mevcut talep hatasını özel olarak işle
      if (errorFromStorage.includes('zaten açık bir') || errorFromStorage.includes('bulunmaktadır')) {
        setRequestResult('existing');
      } else {
        setRequestResult('error');
      }
      
      localStorage.removeItem('seyahatSaglikRequestError');
    }
  }, []);

  const handleCreateRequest = async () => {
    if (!customerId) {
      setError('Müşteri bilgisi bulunamadı. Lütfen önceki adımları kontrol edin.');
      setRequestResult('error');
      return;
    }

    if (!accessToken) {
      setError('Oturum bilgisi bulunamadı. Lütfen sayfayı yenileyin.');
      setRequestResult('error');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRequestResult('idle');
    setRequestCreated(false);

    try {
      const requestPayload = {
        customerId: customerId,
        customerAssetReference: null,
        productBranch: "SEYAHAT",
        channel: "OFFLINE_PROPOSAL_FORM"
      };


      const response = await fetchWithAuth(API_ENDPOINTS.CASES_NEW_SALE_OPPORTUNITY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // API'den gelen hata mesajını parse etmeye çalış
        let errorMessage = `Talep oluşturulamadı: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
            const apiError = errorData.errors[0];
            
            // Özel hata mesajlarını kontrol et
            if (apiError.includes('zaten açık bir yeni satış fırsatı talebi bulunmaktadır')) {
              setRequestResult('existing');
              setIsLoading(false);
              return; // Don't throw error for existing request
            } else {
              errorMessage = apiError;
              setRequestResult('error');
            }
          }
        } catch (parseError) {
          // JSON parse hatası durumunda default mesaj kullan
          setRequestResult('error');
        }
        
        if (response.status === 401) {
          errorMessage = 'Oturum süreniz dolmuş. Lütfen sayfayı yenileyin ve tekrar deneyin.';
          setRequestResult('error');
        } else if (response.status === 400 && !errorMessage.includes('zaten açık')) {
          errorMessage = 'Geçersiz talep bilgileri. Lütfen bilgilerinizi kontrol edin.';
          setRequestResult('error');
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      
      // Manuel talep oluşturma - analytics talep event
      pushToDataLayer({
        event: "seyahat_saglik_formsubmit",
        form_name: "seyahat_saglik_talep"
      });
      
      setRequestCreated(true);
      setRequestResult('success');
      
      // 3 saniye sonra otomatik olarak devam et
      setTimeout(() => {
        onNext();
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Talep oluşturulurken bir hata oluştu';
      setError(errorMessage);
      setRequestResult('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Başarılı talep durumu
  if (requestResult === 'success' || requestCreated) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, paddingBottom: 10 }}>
        <CheckCircle size={64} color="#4caf50" style={{ marginBottom: 16, marginLeft: 'auto', marginRight: 'auto', display: 'block' }} />
        <Typography variant="h5" gutterBottom color="success.main" sx={{ fontWeight: 'bold' }}>
          Talebiniz Başarıyla Oluşturuldu!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Seyahat Sağlık Sigortası teklif talebiniz sisteme kaydedildi.<br />
          En kısa sürede uzman ekibimiz sizinle iletişime geçecektir.
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.href = '/'}
          sx={{
            minWidth: 200,
            maxWidth: 200,
            mx: 'auto',
            height: 40,
            marginTop: 2,
            borderRadius: 2,
            textTransform: 'none',
          }}
        >
          Anasayfaya Dön
        </Button>
      </Box>
    );
  }

  // Mevcut talep var durumu
  if (requestResult === 'existing') {
    return (
      <Box sx={{ textAlign: 'center', py: 4, paddingBottom: 10 }}>
        <Clock size={64} color="#ffa500" style={{ marginBottom: 16, marginLeft: 'auto', marginRight: 'auto', display: 'block' }} />
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#ffa500' }}>
          Talebiniz İnceleniyor
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Seyahat Sağlık Sigortası için mevcut bir talebiniz bulunuyor.<br />
          Lütfen talebin sonuçlandırılmasını bekleyin.
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.href = '/'}
          sx={{
            minWidth: 200,
            maxWidth: 200,
            mx: 'auto',
            height: 40,
            marginTop: 2,
            borderRadius: 2,
            textTransform: 'none',
            backgroundColor: '#ffa500',
            '&:hover': {
              backgroundColor: '#ffa500',
            }
          }}
        >
          Anasayfaya Dön
        </Button>
      </Box>
    );
  }

  // Hata durumu
  if (requestResult === 'error' && error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, paddingBottom: 10 }}>
        <XCircle size={64} color="#f44336" style={{ marginBottom: 16, marginLeft: 'auto', marginRight: 'auto', display: 'block' }} />
        <Typography variant="h5" gutterBottom color="error" sx={{ fontWeight: 'bold' }}>
          Talep Oluşturulamadı
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
          {error}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
           <Button
             variant="outlined"
             onClick={handleCreateRequest}
             disabled={isLoading}
             sx={{
               minWidth: 150,
               height: 40,
               borderRadius: 2,
               textTransform: 'none',
             }}
           >
             {isLoading ? 'Tekrar Deniyor...' : 'Tekrar Dene'}
           </Button>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/'}
            sx={{
              minWidth: 150,
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            Anasayfaya Dön
          </Button>
        </Box>
      </Box>
    );
  }

  // Normal talep oluşturma ekranı (önceden login olmuş kullanıcılar için)
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Seyahat Sağlık Sigortası Teklif Talebi
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
        Talebinizi oluşturduktan sonra uzman ekibimiz sizinle iletişime geçerek 
        ihtiyaçlarınıza en uygun teklifi hazırlayacaktır.
      </Typography>

      <Button
        variant="contained"
        onClick={handleCreateRequest}
        disabled={isLoading}
        sx={{ 
          minWidth: 200,
          height: 40,
          borderRadius: 2,
          textTransform: 'none',
        }}
      >
        {isLoading ? 'Talep Oluşturuluyor...' : 'Talep Oluştur'}
      </Button>
    </Box>
  );
};

export default RequestStep;

