import { Container, Paper, Box } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import PurchaseStep from '@/components/QuoteFlow/KaskoQuote/steps/PurchaseStep';
import React from 'react';

export default function KaskoPurchasePage() {
  const router = useRouter();
  const params = useParams();
  const proposalId = params?.proposalId as string;
  const productId = params?.productId as string;

  const handleNext = () => {
    router.push('/kasko/odeme-sonuc');
  };

  // URL'den gelen parametreleri localStorage'a kaydet
  React.useEffect(() => {
    if (proposalId && productId) {
      localStorage.setItem('proposalIdForKasko', proposalId);
      localStorage.setItem('selectedProductIdForKasko', productId);
    }
  }, [proposalId, productId]);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Box sx={{ pt: { xs: 8, sm: 10, md: 12 } }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <PurchaseStep onNext={handleNext} />
          </Paper>
        </Container>
      </Box>
    </Box>
  );
} 