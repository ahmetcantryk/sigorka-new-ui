"use client";

import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Alert,
  CircularProgress
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface OrderData {
  proposalId: string;
  productId: string;
  productType: string;
  amount: number;
  customerInfo: any;
}

export default function ParatikaSuccessPage() {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // localStorage'dan order data'yı al
    const orderDataStr = localStorage.getItem('current_order_data');
    if (orderDataStr) {
      try {
        const data = JSON.parse(orderDataStr);
        setOrderData(data);
      } catch (error) {
      }
    }
    setIsLoading(false);

    // localStorage'u temizle
    localStorage.removeItem('paratika3dHtmlContent');
    localStorage.removeItem('paratika_merchantPaymentId');
    localStorage.removeItem('paratika_3d_url');
    localStorage.removeItem('paratika_3d_params');
    localStorage.removeItem('current_order_data');
  }, []);

  const handleContinue = () => {
    // Ana sekmeye geri dön veya dashboard'a yönlendir
    if (window.opener && !window.opener.closed) {
      // Ana sekme açıksa onu yenile ve bu sekmeyi kapat
      window.opener.location.href = '/dashboard/policies';
      window.close();
    } else {
      // Ana sekme kapalıysa bu sekmede devam et
      router.push('/dashboard/policies');
    }
  };

  const handleDashboard = () => {
    if (window.opener && !window.opener.closed) {
      window.opener.location.href = '/dashboard';
      window.close();
    } else {
      router.push('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6">
              Ödeme sonucu kontrol ediliyor...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Alert 
            severity="success" 
            icon={<CheckCircle fontSize="large" />}
            sx={{ mb: 3, '& .MuiAlert-icon': { fontSize: '3rem' } }}
          >
            <Typography variant="h5" gutterBottom>
              🎉 Ödemeniz Başarıyla Tamamlandı!
            </Typography>
            <Typography variant="body1">
              Sigorta poliçeniz başarıyla satın alındı.
            </Typography>
          </Alert>

          {orderData && (
            <Box sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                İşlem Detayları
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Ürün:</strong> {orderData.productType?.toUpperCase() || orderData.productId}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Teklif ID:</strong> {orderData.proposalId}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Tutar:</strong> ₺{orderData.amount?.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Müşteri:</strong> {orderData.customerInfo?.name}
              </Typography>
            </Box>
          )}

          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              📧 <strong>E-posta:</strong> Poliçe belgeleriniz e-posta adresinize gönderilecektir.
              <br />
              📱 <strong>SMS:</strong> İşlem onayı telefon numaranıza SMS ile bildirilecektir.
              <br />
              📋 <strong>Dashboard:</strong> Poliçenizi istediğiniz zaman panelinizden görüntüleyebilirsiniz.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleContinue}
              sx={{ minWidth: 200 }}
            >
              Poliçelerimi Görüntüle
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={handleDashboard}
              sx={{ minWidth: 120 }}
            >
              Ana Sayfa
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            Herhangi bir sorunuz varsa müşteri hizmetlerimizle iletişime geçebilirsiniz.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
} 