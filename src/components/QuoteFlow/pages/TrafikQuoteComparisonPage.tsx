"use client";

import { Container, Paper } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import QuoteComparisonStep from '@/components/QuoteFlow/TrafikQuote/steps/QuoteComparisonStep';

export default function TrafikQuoteComparisonPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = (params?.proposalId as string | undefined) || localStorage.getItem('proposalIdForTrafik');

  const handleNext = () => {
    if (proposalId) {
      router.push(`/trafik/satin-al/${proposalId}`);
    } else {
      router.push('/trafik/satin-al');
    }
  };

  const handleBack = () => {
    router.push('/trafik-teklif');
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 form-background">
        <div className="flex min-h-screen items-center justify-center pb-8">
          <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <QuoteComparisonStep
                onNext={handleNext}
                onBack={handleBack}
                onSelectQuote={() => {}}
                proposalId={proposalId ?? null}
                isFirstStep={false}
                isLastStep={false}
              />
            </Paper>
          </Container>
        </div>
      </div>
    </>
  );
} 