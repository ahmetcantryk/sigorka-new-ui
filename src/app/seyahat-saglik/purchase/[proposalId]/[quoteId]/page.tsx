"use client";

import { Container, Paper, Box } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import PurchaseStep from '@/components/QuoteFlow/SeyahatSaglikQuote/steps/PurchaseStep';
import React, { useEffect } from 'react';
import '../../../../../styles/form-style.css';

export default function SeyahatSaglikPurchasePage() {
  const router = useRouter();
  const params = useParams();
  const proposalId = params?.proposalId as string;
  const quoteId = params?.quoteId as string;

  const handleNext = () => {
    router.push(`/odeme-sonuc?type=SeyahatSaglik&proposalId=${proposalId}`);
  };

  // URL'den gelen parametreleri localStorage'a kaydet
  useEffect(() => {
    if (proposalId) {
      localStorage.setItem('SeyahatSaglikProposalId', proposalId);
      localStorage.setItem('currentProposalId', proposalId);
    }
    if (quoteId) {
      localStorage.setItem('currentProductId', quoteId);
    }
  }, [proposalId, quoteId]);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Box sx={{ pt: { xs: 8, sm: 10, md: 12 } }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <PurchaseStep onNext={handleNext} proposalId={proposalId} />
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

