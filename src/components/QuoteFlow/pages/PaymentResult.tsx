import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

export default function PaymentResult() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [productType, setProductType] = useState<string>('');

  useEffect(() => {
    const success = params?.success;
    const type = params?.type as string || '';
    
    setIsSuccess(success === 'True');
    setProductType(type);
    setIsLoading(false);

    // 5 saniye sonra ana sayfaya yönlendir
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [params, router]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const getProductName = () => {
    switch (productType) {
      case 'kasko':
        return 'Kasko Sigortası';
      case 'trafik':
        return 'Trafik Sigortası';
      case 'dask':
        return 'DASK Sigortası';
      case 'konut':
        return 'Konut Sigortası';
      case 'tss':
        return 'TSS Sigortası';
      default:
        return 'Sigorta';
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        mt: 8,
        p: 4,
        textAlign: 'center',
      }}
    >
      {isSuccess ? (
        <>
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="h6">Ödeme Başarılı!</Typography>
          </Alert>
          <Typography variant="body1" color="text.secondary">
            {getProductName()} ödemeniz başarıyla tamamlandı. 5 saniye içinde ana sayfaya yönlendirileceksiniz.
          </Typography>
        </>
      ) : (
        <>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6">Ödeme Başarısız!</Typography>
          </Alert>
          <Typography variant="body1" color="text.secondary">
            {getProductName()} ödeme işlemi sırasında bir hata oluştu. 5 saniye içinde ana sayfaya yönlendirileceksiniz.
          </Typography>
        </>
      )}
    </Box>
  );
} 