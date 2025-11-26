import { Metadata } from 'next';
import { Suspense } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import AcilSaglikQuotePage from '@/components/QuoteFlow/AcilSaglikQuote/AcilSaglikQuotePage';
import '../../styles/form-style.css';

export const metadata: Metadata = {
  title: "Doktorum Benimle Teklif Al | Sigorka",
  description: "Doktorum Benimle tekliflerini hızlıca alın. Online poliçe oluşturun ve sağlığınızı güvence altına alın.",
  metadataBase: new URL('https://sigorka.com'),
  alternates: {
    canonical: "https://sigorka.com/acil-saglik-teklif"
  },
  openGraph: {
    title: "Doktorum Benimle Teklif Al | Sigorka",
    description: "Doktorum Benimle tekliflerini hızlıca alın. Online poliçe oluşturun ve sağlığınızı güvence altına alın.",
    url: "https://sigorka.com/acil-saglik-teklif",
    type: "website"
  },
  twitter: {
    title: "Doktorum Benimle Teklif Al | Sigorka",
    description: "Doktorum Benimle tekliflerini hızlıca alın. Online poliçe oluşturun ve sağlığınızı güvence altına alın.",
    card: "summary_large_image"
  }
};

// Loading component
function LoadingFallback() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ bgcolor: 'background.default' }}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
        Sayfa yükleniyor...
      </Typography>
    </Box>
  );
}

export default function AcilSaglikTeklifPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcilSaglikQuotePage />
    </Suspense>
  );
}

