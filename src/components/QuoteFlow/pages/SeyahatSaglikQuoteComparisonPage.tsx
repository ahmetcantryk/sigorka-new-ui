"use client";

import { Container, Paper } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import QuoteComparisonStep from '@/components/QuoteFlow/SeyahatSaglikQuote/steps/QuoteComparisonStep';
import '../../../styles/form-style.css';

export default function SeyahatSaglikQuoteComparisonPageComponent() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params?.proposalId as string | undefined;

  const handlePurchaseClick = (selectedQuoteId: string) => {
    if (proposalId && selectedQuoteId) {
      router.push(`/seyahat-saglik/purchase/${proposalId}/${selectedQuoteId}`);
    } else {
      router.push('/seyahat-saglik-sigortasi');
    }
  };

  const handleBack = () => {
    router.push('/seyahat-saglik-sigortasi');
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 form-background">
        <div className="flex min-h-screen items-center justify-center pb-8">
          <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <QuoteComparisonStep
                onPurchaseClick={handlePurchaseClick}
                onBack={handleBack}
                onSelectQuote={(quoteId: string) => {
                  // Quote seçildiğinde yapılacak işlemler
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

