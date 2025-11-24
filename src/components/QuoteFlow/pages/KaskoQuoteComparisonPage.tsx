"use client";

import { Container, Paper } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import QuoteComparisonStep from '@/components/QuoteFlow/KaskoQuote/steps/QuoteComparisonStep';
import '../../../styles/form-style.css'
export default function KaskoQuoteComparisonPageComponent() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params?.proposalId as string | undefined;

  const handleNext = (selectedQuoteId: string) => {
    if (proposalId && selectedQuoteId) {
      router.push(`/purchase/${proposalId}/${selectedQuoteId}`);
    } else {
      router.push('/kasko-teklif');
    }
  };

  const handleBack = () => {
    router.push('/kasko-teklif');
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 form-background">
        <div className="flex min-h-screen items-center justify-center pb-8 " >
          <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <QuoteComparisonStep
                onPurchaseClick={handleNext}
                onBack={handleBack}
                onSelectQuote={(quoteId: string) => {
                }}
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