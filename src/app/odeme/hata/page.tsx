"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Container, Box, Typography, Button, Paper, Alert } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const errorMessage = searchParams.get('message') || 'Ödeme sırasında bir hata oluştu';

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        
        <Typography variant="h4" gutterBottom color="error">
          Ödeme Hatası
        </Typography>
        
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          {errorMessage}
        </Alert>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Ödeme işlemi tamamlanamadı. Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={handleGoBack}
            size="large"
          >
            Geri Dön
          </Button>
          
          <Button 
            variant="contained" 
            onClick={handleGoHome}
            size="large"
          >
            Ana Sayfaya Dön
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 