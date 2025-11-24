"use client";

import { Container, Paper } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import QuoteComparisonStep from '@/components/QuoteFlow/DaskQuote/steps/QuoteComparisonStep';

export default function DaskQuoteComparisonPageComponent() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params?.proposalId as string | undefined;

  const handleNext = () => {
    if (proposalId) {
      router.push(`/dask/purchase/${proposalId}`);
    } else {
      router.push('/dask/satin-al');
    }
  };

  const handleBack = () => {
    router.push('/dask-teklif');
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 form-background">
        <div className="flex min-h-screen items-center justify-center pb-8 " >
          <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <QuoteComparisonStep
                onNext={handleNext}
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