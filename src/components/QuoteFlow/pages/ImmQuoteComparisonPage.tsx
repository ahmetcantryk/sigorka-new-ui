"use client";

import { Container, Paper, Typography, Button } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import ImmQuoteComparisonStep from '@/components/QuoteFlow/ImmQuote/steps/QuoteComparisonStep';
import '../../../styles/form-style.css'

export default function ImmQuoteComparisonPageComponent() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.proposalId as string | undefined;

  // IMM QuoteComparisonStep kendi routing'ini yapıyor, handleNext gereksiz

  // Teklif ana sayfasına (veya form adımlarına) geri dönme
  const handleBack = () => {
    router.push('/imm-teklif'); 
  };

  if (!proposalId) {
    // Eğer URL'den proposalId gelmediyse, kullanıcıyı bilgilendir veya ana sayfaya yönlendir.
    return (
        <Container sx={{py:5}}>
            <Paper sx={{p:3, textAlign: 'center'}}>
                <Typography variant="h6" color="error">Teklif ID bulunamadı.</Typography>
                <Typography sx={{my:2}}>Lütfen teklifinizi tekrar oluşturun veya ana sayfaya dönün.</Typography>
                <Button variant="contained" onClick={() => router.push('/imm-teklif')}>Teklif Sayfasına Dön</Button>
            </Paper>
        </Container>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 form-background">
        <div className="flex min-h-screen items-center justify-center pb-8">
          <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <ImmQuoteComparisonStep
                onBack={handleBack}
                onSelectQuote={(quoteId: string) => {
                }}
                proposalId={proposalId}
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