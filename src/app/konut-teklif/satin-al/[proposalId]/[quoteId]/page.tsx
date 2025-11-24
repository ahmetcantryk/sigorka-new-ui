"use client";
import PurchaseStep from '@/components/QuoteFlow/KonutQuote/steps/PurchaseStep';
import { Container, Paper, Box } from '@mui/material';

interface PurchasePageProps {
  params: {
    proposalId: string;
    quoteId: string;
  };
}

export default function PurchasePage({ params }: PurchasePageProps) {
  return (
    <>
      <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'grey.50', py: 4, display: 'flex', alignItems: 'center' }}>
        <Container maxWidth="lg">
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
            <PurchaseStep
              onNext={() => {
              }}
              onBack={() => {
                window.history.back();
              }}
              isFirstStep={false}
              isLastStep={true}
              proposalId={params.proposalId}
              quoteId={params.quoteId}
            />
          </Paper>
        </Container>
      </Box>
    </>
  );
} 