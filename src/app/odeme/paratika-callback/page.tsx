"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container, Box, Typography, CircularProgress, Paper, Alert } from '@mui/material';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { useAuthStore } from '@/store/useAuthStore';
import { completePaymentAfter3D } from '@/services/insurupApi';

export default function ParatikaCallbackPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Tüm URL parametrelerini log'la
        const allParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          allParams[key] = value;
        });
        
        const debugData = `URL Parametreleri: ${JSON.stringify(allParams, null, 2)}`;
        setDebugInfo(debugData);
        
        const action = searchParams.get('action');
        const type = searchParams.get('type');
        
        
        if (action === 'validate') {
          // Bu bir 3D doğrulama callback'i - Paratika doğrulamadan sonra Insurup'a geç
          await handle3DValidationCallback();
        } else {
          // Eski format callback
          await handleOldFormatCallback();
        }

      } catch (error) {
        setError(error instanceof Error ? error.message : 'İşlem sırasında beklenmeyen bir hata oluştu');
      } finally {
        setIsProcessing(false);
      }
    };

    const handle3DValidationCallback = async () => {
      // Paratika'dan gelen 3D doğrulama sonucu
      const responseCode = searchParams.get('responseCode');
      const responseMessage = searchParams.get('responseMessage');
      const auth3DToken = searchParams.get('auth3DToken');
      const mdStatus = searchParams.get('mdStatus');
      const sessionToken = searchParams.get('sessionToken');
      

      // Pending payment data'yı al
      const pendingPaymentString = localStorage.getItem('pendingPaymentData');
      if (!pendingPaymentString) {
        // Paratika'dan gelen parametreleri localStorage'a kaydet
        const paratikaData = {
          responseCode,
          responseMessage,
          auth3DToken,
          mdStatus,
          sessionToken
        };
        localStorage.setItem('paratika3dResult', JSON.stringify({
          success: responseCode === '00',
          ...paratikaData
        }));
        
        throw new Error('Bekleyen ödeme bilgileri bulunamadı. Sonuç popup pencereye aktarılacak.');
      }

      const pendingPayment = JSON.parse(pendingPaymentString);
      
      if (!accessToken) {
        throw new Error('Yetkilendirme token\'ı bulunamadı');
      }

      // 3D doğrulama başarılı mı kontrol et
      if (responseCode !== '00') {
        throw new Error(responseMessage || '3D güvenli doğrulama başarısız');
      }


      // ADIM 4: 3D doğrulama başarılı - InsurUp API'ye ödeme tamamlama isteği gönder
      
      // 🔒 Güvenli session'dan kart bilgilerini al
      const { secureCardStorage } = await import('@/utils/secureCardStorage');
      let cardInfo = null;
      
      if (pendingPayment.cardSessionId) {
        cardInfo = secureCardStorage.getCardInfo(pendingPayment.cardSessionId);
        if (!cardInfo) {
          throw new Error('Kart bilgileri session\'da bulunamadı veya süresi dolmuş');
        }
      } else {
        throw new Error('Kart bilgileri bulunamadı - güvenlik nedeniyle işlem iptal ediliyor');
      }

      // InsurUp API ile satın alma işlemini tamamla
      const purchaseResult = await completePaymentAfter3D(
        pendingPayment.proposalId,
        pendingPayment.proposalProductId,
        {
          installmentNumber: pendingPayment.installmentNumber,
          merchantPaymentId: pendingPayment.merchantPaymentId,
          paratikaTransactionResult: {
            responseCode,
            responseMessage,
            auth3DToken,
            mdStatus,
            sessionToken
          },
          cardInfo: {
            number: cardInfo.number,
            cvc: cardInfo.cvc,
            expiryMonth: cardInfo.expireMonth.toString().padStart(2, '0'),
            expiryYear: cardInfo.expireYear.toString(),
            holderName: cardInfo.holderName
          }
        },
        accessToken
      );

      
      // 🔒 Güvenli session'ı temizle
      secureCardStorage.clearSession(pendingPayment.cardSessionId);
      
      if (purchaseResult.success) {
        setSuccess(true);
        
        // localStorage'ı temizle
        localStorage.removeItem('pendingPaymentData');
        localStorage.removeItem('paratika3dHtmlContent');
        localStorage.removeItem('paratikaSessionToken');

        // 3 saniye bekle ve poliçeler sayfasına yönlendir
        setTimeout(() => {
          router.push('/dashboard/policies?status=success&message=Sigorta poliçeniz başarıyla satın alındı');
        }, 3000);
      } else {
        throw new Error(purchaseResult.error || 'InsurUp satın alma işlemi başarısız');
      }
    };

    const handleOldFormatCallback = async () => {
      // Eski format için mevcut kod
      const proposalId = searchParams.get('proposalId');
      const productId = searchParams.get('productId');
      
      const merchantOrderId = searchParams.get('merchantOrderId');
      const transactionId = searchParams.get('transactionId');
      const responseCode = searchParams.get('responseCode');
      const responseMessage = searchParams.get('responseMessage');
      const authCode = searchParams.get('authCode');
      const procReturnCode = searchParams.get('procReturnCode');
      const amount = searchParams.get('amount');
      const currency = searchParams.get('currency');
      
      if (!proposalId || !productId || !accessToken) {
        throw new Error('Gerekli bilgiler eksik');
      }

      if (responseCode !== '00' && procReturnCode !== '00') {
        throw new Error(responseMessage || 'Ödeme başarısız oldu');
      }

      const response = await fetchWithAuth(
        API_ENDPOINTS.PROPOSAL_PRODUCT_PURCHASE_ASYNC(proposalId, productId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            $type: '3d-secure',
            paymentMethod: 'PARATIKA_3D_SECURE',
            paratikaData: {
              merchantOrderId,
              transactionId,
              responseCode,
              responseMessage,
              authCode,
              procReturnCode,
              amount,
              currency,
            },
            sessionToken: localStorage.getItem('paratikaSessionToken'),
            installmentNumber: parseInt(localStorage.getItem('selectedInstallmentNumber') || '1'),
          }),
        }
      );

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/policies?status=success&message=Sigorta poliçeniz başarıyla satın alındı');
        }, 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Satın alma işlemi tamamlanamadı');
      }
    };

    processCallback();
  }, [searchParams, router, accessToken]);

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Ödeme Başarısız
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ana sayfaya dönerek tekrar deneyebilirsiniz.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="success.main" gutterBottom>
            Ödeme Başarılı!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Sigorta poliçeniz başarıyla satın alınmıştır.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Poliçeleriniz sayfasına yönlendiriliyorsunuz...
          </Typography>
          <Box sx={{ mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Ödeme İşleniyor
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Ödeme sonucunuz kontrol ediliyor, lütfen bekleyiniz...
        </Typography>
        <CircularProgress />
        
        {/* Debug bilgisi */}
        {debugInfo && (
          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Debug Bilgisi:
            </Typography>
            <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {debugInfo}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
} 