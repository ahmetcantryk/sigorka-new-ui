"use client";

import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Step, Stepper, StepLabel } from '@mui/material';
import { queryTransactionViaAPI, ParatikaTransactionResponse } from '@/services/paratika';

type PaymentStage = 'loading' | 'processing' | 'success' | 'error';

export default function Paratika3DVerifyPage() {
  const [stage, setStage] = useState<PaymentStage>('loading');
  const [message, setMessage] = useState('Ödeme işleminiz kontrol ediliyor...');
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    
    // URL parametrelerini localStorage'a kaydet
    const urlParams = new URLSearchParams(window.location.search);
    const paratikaData: any = {};
    
    urlParams.forEach((value, key) => {
      paratikaData[key] = value;
    });

    // Tüm URL verilerini localStorage'a kaydet
    if (Object.keys(paratikaData).length > 0) {
      localStorage.setItem('paratika_3d_result', JSON.stringify(paratikaData));
      
      // Success durumunu kontrol et
      const isSuccess = paratikaData.success === '1' || 
                       paratikaData.responseCode === '00' || 
                       paratikaData.mdStatus === '1';
      
      if (isSuccess) {
        localStorage.setItem('paratika_3d_status', 'success');
        setStage('processing');
        setMessage('Satın alma işleminiz devam etmektedir...');
        
        // Ana pencereye başarı mesajı gönder
        if (window.opener) {
          window.opener.postMessage({
            type: 'PARATIKA_3D_SUCCESS',
            data: paratikaData,
            status: 'success'
          }, '*');
        }
        
        // Başarı durumunu bildirip modal'ı kapat
        setTimeout(() => {
          setStage('success');
          setMessage('3D doğrulama başarılı! Ana sayfaya dönülüyor...');
          setTimeout(cleanupAndClose, 2000);
        }, 1000);
        
      } else {
        
        // 1. ÖNCE localStorage'a error durumunu kaydet (polling için)
        localStorage.setItem('paratika_3d_status', 'error');
        localStorage.setItem('paratika_3d_error', paratikaData.responseMsg || 'Doğrulama başarısız');
        
        setStage('error');
        setMessage('3D doğrulama başarısız: xxx ' + (paratikaData.responseMsg || 'Bilinmeyen hata'));
        
        // 2. PostMessage gönder (çoklu hedef) - MODAL KAPATMA İÇİN
        
        const errorMessage = {
              type: 'PARATIKA_3D_ERROR',
          message: paratikaData.responseMsg || 'Doğrulama başarısız'
        };
        
        // Modal kapatma mesajı (iframe parent'ına)
        const closeModalMessage = {
          type: 'CLOSE_PAYMENT_MODAL',
          source: 'paratika-3d-verify',
          error: true,
          message: paratikaData.responseMsg || 'Doğrulama başarısız'
        };
        
        // Farklı window hedeflerine HATA mesajı gönder
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(errorMessage, '*');
          window.parent.postMessage(closeModalMessage, '*');
        }
        
          if (window.opener) {
          window.opener.postMessage(errorMessage, '*');
          window.opener.postMessage(closeModalMessage, '*');
        }
        
        if (window.top && window.top !== window) {
          window.top.postMessage(errorMessage, '*');
          window.top.postMessage(closeModalMessage, '*');
        }
        
        // 3. Modal mesajı gönderildi, 500ms sonra localStorage temizle 
        setTimeout(() => {
          localStorage.removeItem('paratika_3d_result');
          localStorage.removeItem('paratika_3d_error');
          localStorage.removeItem('paratika_3d_status');
          localStorage.removeItem('paratika3dHtmlContent');
          localStorage.removeItem('paratika_merchantPaymentId');
          localStorage.removeItem('paratikaSessionToken');
          localStorage.removeItem('paratika_3d_url');
          localStorage.removeItem('paratika_3d_params');
          
          // Popup ise kapat
          if (window.opener) {
            window.close();
          }
        }, 500); // Modal zaten kapatıldığı için kısa süre yeterli
      }
    } else {
      // URL parametresi yoksa, sürekli localStorage kontrol et
      setStage('processing');
      setMessage('Satın alma işleminiz devam etmektedir...');
      startLocalStoragePolling();
    }
  }, []);

  const startLocalStoragePolling = () => {
    if (isPolling) return;
    
    setIsPolling(true);
    
    const pollingInterval = setInterval(() => {
      const status = localStorage.getItem('paratika_3d_status');
      const result = localStorage.getItem('paratika_3d_result');
      
      if (status === 'success' && result) {
        clearInterval(pollingInterval);
        setIsPolling(false);
        
        setStage('processing');
        setMessage('3D doğrulama başarılı! Ana sayfaya dönülüyor...');
        
        // Başarı durumunu bildirip modal'ı kapat
        setTimeout(() => {
          setStage('success');
          setTimeout(cleanupAndClose, 2000);
        }, 1000);
        
      } else if (status === 'error') {
        clearInterval(pollingInterval);
        setIsPolling(false);
        
        const errorMsg = localStorage.getItem('paratika_3d_error') || 'Bilinmeyen hata';
        setStage('error');
        setMessage('Satın alma işlemi başarısız: ' + errorMsg);
        
        // Modal kapatma mesajı gönder (polling'den tespit edildi)
        const closeModalMessage = {
          type: 'CLOSE_PAYMENT_MODAL',
          source: 'paratika-3d-verify-polling',
          error: true,
          message: errorMsg
        };
        
        // Parent window'a modal kapatma mesajı gönder
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(closeModalMessage, '*');
        }
        if (window.opener) {
          window.opener.postMessage(closeModalMessage, '*');
        }
        if (window.top && window.top !== window) {
          window.top.postMessage(closeModalMessage, '*');
        }
      }
    }, 1000); // Her saniye kontrol et

    // 5 dakika sonra timeout
    setTimeout(() => {
      clearInterval(pollingInterval);
      if (isPolling) {
        setIsPolling(false);
        setStage('error');
        setMessage('İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.');
      }
    }, 300000);
  };

  const cleanupAndClose = () => {
    
    // İşlemle ilgili tüm localStorage verilerini temizle
    localStorage.removeItem('paratika_3d_result');
    localStorage.removeItem('paratika_3d_status');
    localStorage.removeItem('paratika_3d_error');
    localStorage.removeItem('paratika3dHtmlContent');
    localStorage.removeItem('paratika_merchantPaymentId');
    localStorage.removeItem('paratikaSessionToken');
    localStorage.removeItem('paratika_3d_url');
    localStorage.removeItem('paratika_3d_params');
    localStorage.removeItem('pendingPaymentData');
    localStorage.removeItem('purchaseReturnUrl');
    localStorage.removeItem('paratika_purchase_status');
    localStorage.removeItem('paratika_purchase_result');
    localStorage.removeItem('paratika_purchase_error');
    localStorage.removeItem('current_order_data');
    
    // Ürün özel localStorage verileri
    localStorage.removeItem('currentProposalId');
    localStorage.removeItem('selectedProductId');
    localStorage.removeItem('paymentAmount');
    localStorage.removeItem('paymentBranch');
    
    // Ana pencereye başarı mesajı gönder (çoklu hedef)
    
    const successMessage = {
      type: 'PARATIKA_3D_SUCCESS',
      message: '3D doğrulama başarılı'
    };
    
    // Farklı window hedeflerine mesaj gönder
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(successMessage, '*');
    }
    
    if (window.opener) {
      window.opener.postMessage(successMessage, '*');
      
      // Modal'ı kapat
      setTimeout(() => {
        window.close();
      }, 1000);
    } else {
      // Popup değilse purchase sayfasına dön
      const returnUrl = localStorage.getItem('purchaseReturnUrl');
      
      if (returnUrl) {
        window.location.href = returnUrl;
      } else {
        // Fallback: Ana sayfaya git
        window.location.href = '/';
      }
    }
    
    if (window.top && window.top !== window) {
      window.top.postMessage(successMessage, '*');
    }
  };

  const handleRetry = () => {
    // Sayfayı yenile
    window.location.reload();
  };

  return (
    <Box
      sx={{
        maxWidth: 500,
        mx: 'auto',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        bgcolor: 'white',
        borderRadius: 3,
        p: 6,
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        m: 2
      }}
    >
        {stage === 'loading' && (
          <Box>
            <CircularProgress size={60} sx={{ mb: 3, color: '#4CAF50' }} />
            <Typography variant="h6" gutterBottom color="text.primary">
              Ödeme Kontrolü
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {message}
            </Typography>
          </Box>
        )}

        {stage === 'processing' && (
          <Box>
            <CircularProgress size={60} sx={{ mb: 3, color: '#ff9800' }} />
            <Typography variant="h6" gutterBottom color="text.primary">
              Satın Alma İşleminiz Devam Etmektedir
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Lütfen bekleyiniz...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Bu işlem birkaç dakika sürebilir
            </Typography>
          </Box>
        )}

        {stage === 'success' && (
          <Box>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: '#4CAF50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                mx: 'auto'
              }}
            >
              <Typography sx={{ fontSize: 40, color: 'white' }}>✓</Typography>
            </Box>
            <Typography variant="h6" gutterBottom color="success.main">
              Başarılı Satın Alma
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {message}
            </Typography>
          </Box>
        )}

        {stage === 'error' && (
          <Box>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: '#f44336',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                mx: 'auto'
              }}
            >
              <Typography sx={{ fontSize: 40, color: 'white' }}>✗</Typography>
            </Box>
            <Typography variant="h6" gutterBottom color="error.main">
              Başarısız Satın Alma
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>
            <Button
              variant="contained"
              onClick={handleRetry}
              sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
            >
              Tekrar Dene
            </Button>
          </Box>
        )}
      </Box>
  );
} 