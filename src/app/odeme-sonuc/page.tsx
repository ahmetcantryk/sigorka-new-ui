'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Typography, Card, CardContent, Button, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

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

export default function OdemeSonucPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const eventTriggeredRef = useRef(false);

  const success = searchParams.get('success') === 'true';
  const type = searchParams.get('type') || 'sigorta';
  const policyId = searchParams.get('policyId') || '';
  const error = searchParams.get('error') || '';

  useEffect(() => {
    // Sayfa yüklendiğinde loading'i kapat
    setTimeout(() => setLoading(false), 500);
  }, []);

  // Event tracking - sadece 1 kez tetiklenmeli
  useEffect(() => {
    if (eventTriggeredRef.current) return; // Zaten tetiklenmişse tekrar tetikleme
    
    const eventConfig = {
      kasko: {
        eventName: 'kasko_satinal',
        successFormName: 'kasko_odeme_basarili',
        failureFormName: 'kasko_odeme_basarisiz'
      },
      trafik: {
        eventName: 'trafik_satinal',
        successFormName: 'trafik_odeme_basarili',
        failureFormName: 'trafik_odeme_basarisiz'
      },
      imm: {
        eventName: 'imm_satinal',
        successFormName: 'imm_odeme_basarili',
        failureFormName: 'imm_odeme_basarisiz'
      },
      tss: {
        eventName: 'tss_satinal',
        successFormName: 'tss_odeme_basarili',
        failureFormName: 'tss_odeme_basarisiz'
      },
      dask: {
        eventName: 'dask_satinal',
        successFormName: 'dask_odeme_basarili',
        failureFormName: 'dask_odeme_basarisiz'
      },
      konut: {
        eventName: 'konut_satinal',
        successFormName: 'konut_odeme_basarili',
        failureFormName: 'konut_odeme_basarisiz'
      }
    };

    const config = eventConfig[type as keyof typeof eventConfig];
    
    if (config) {
      const formName = success ? config.successFormName : config.failureFormName;
      
      pushToDataLayer({
        event: config.eventName,
        form_name: formName
      });
      
      
      eventTriggeredRef.current = true; // Event'in tekrar tetiklenmesini engelle
    } else {
    }
  }, [type, success]);

  const getProductName = () => {
    switch (type) {
      case 'kasko': return 'Kasko Sigortası';
      case 'trafik': return 'Zorunlu Trafik Sigortası';
      case 'dask': return 'DASK Sigortası';
      case 'konut': return 'Konut Sigortası';
      case 'saglik': return 'Sağlık Sigortası';
      case 'seyahat': return 'Seyahat Sigortası';
      default: return 'Sigorta';
    }
  };

  const handleDashboard = () => {
    router.push('/dashboard/policies');
  };

  const handleHomepage = () => {
    router.push('/');
  };

  const handleRetry = () => {
    router.back(); // Önceki sayfaya geri dön
  };

  if (loading) {
    return (
      <Box
        sx={{
          maxWidth: 600,
          mx: 'auto',
          mt: 8,
          p: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Sonuç kontrol ediliyor...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        mt: 8,
        p: 4,
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Card
        sx={{
          width: '100%',
          textAlign: 'center',
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          border: success ? '2px solid #4CAF50' : '2px solid #f44336'
        }}
      >
        <CardContent sx={{ p: 6 }}>
          {success ? (
            <>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: '#4CAF50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  mx: 'auto'
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 60, color: 'white' }} />
              </Box>
              
              <Typography variant="h4" gutterBottom color="success.main" fontWeight="600">
                🎉 Satın Alma Başarılı!
              </Typography>
              
              <Typography variant="h6" gutterBottom color="text.primary" sx={{ mb: 3 }}>
                {getProductName()} poliçeniz başarıyla oluşturuldu
              </Typography>

              {policyId && (
                <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
                  <Typography variant="body1" fontWeight="500">
                    Poliçe Numarası: {policyId}
                  </Typography>
                </Alert>
              )}

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Poliçe detaylarınızı dashboard'unuzdan görüntüleyebilir, 
                poliçe belgelerinizi indirebilirsiniz.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={handleDashboard}
                  sx={{ px: 4 }}
                >
                  Poliçelerimi Görüntüle
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: '#f44336',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  mx: 'auto'
                }}
              >
                <ErrorIcon sx={{ fontSize: 60, color: 'white' }} />
              </Box>
              
              <Typography variant="h4" gutterBottom color="error.main" fontWeight="600">
                ❌ Satın Alma Başarısız
              </Typography>
              
              <Typography variant="h6" gutterBottom color="text.primary" sx={{ mb: 3 }}>
                {getProductName()} satın alma işlemi tamamlanamadı
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Lütfen bilgilerinizi kontrol ederek tekrar deneyiniz. 
                Sorun devam ederse müşteri hizmetlerimizle iletişime geçebilirsiniz.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleRetry}
                  sx={{ px: 4 }}
                >
                  Tekrar Dene
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={handleHomepage}
                >
                  Anasayfa
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* İletişim Bilgileri */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Yardıma mı ihtiyacınız var?
        </Typography>
        <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
          📞 0 850 404 04 04
        </Typography>
      </Box>
    </Box>
  );
} 