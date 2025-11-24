"use client";
import QuoteComparisonStep from '@/components/QuoteFlow/KonutQuote/steps/QuoteComparisonStep';
import { useParams, useRouter } from 'next/navigation';
import { Container, Paper } from '@mui/material';
import '../../../../styles/form-style.css';
export default function QuoteComparisonPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.proposalId as string | undefined;

  const handleNext = () => {
  };

  const handleBack = () => {
    router.back();
  };

  if (!proposalId) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
              Yükleniyor veya Teklif ID bulunamadı...
            </Paper>
          </Container>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 form-background">
        <div className="flex min-h-screen items-center justify-center pb-8">
          <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
              <QuoteComparisonStep
                isFirstStep={false}
                isLastStep={false}
                proposalId={proposalId}
                onSelectQuote={(quoteId) => {
                }}
              />
            </Paper>
          </Container>
        </div>
      </div>
    </>
  );
} 