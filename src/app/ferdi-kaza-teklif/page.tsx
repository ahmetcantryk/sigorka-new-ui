import { Metadata } from 'next';
import { Suspense } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import FerdiKazaQuotePage from '@/components/QuoteFlow/FerdiKazaQuote/FerdiKazaQuotePage';
import '../../styles/form-style.css';

export const metadata: Metadata = {
  title: "Ferdi Kaza Sigortası Teklif Al - Kapsamlı Koruma | Sigorka",
  description: "Beklenmedik kazalara karşı kapsamlı koruma için ferdi kaza sigortası tekliflerini hızlıca alın. Online poliçe oluşturun ve güvende kalın.",
  metadataBase: new URL('https://sigorka.com'),
  alternates: {
    canonical: "https://sigorka.com/ferdi-kaza-teklif"
  },
  openGraph: {
    title: "Ferdi Kaza Sigortası Teklif Al - Kapsamlı Koruma | Sigorka",
    description: "Beklenmedik kazalara karşı kapsamlı koruma için ferdi kaza sigortası tekliflerini hızlıca alın. Online poliçe oluşturun ve güvende kalın.",
    url: "https://sigorka.com/ferdi-kaza-teklif",
    type: "website"
  },
  twitter: {
    title: "Ferdi Kaza Sigortası Teklif Al - Kapsamlı Koruma | Sigorka",
    description: "Beklenmedik kazalara karşı kapsamlı koruma için ferdi kaza sigortası tekliflerini hızlıca alın. Online poliçe oluşturun ve güvende kalın.",
    card: "summary_large_image"
  }
};

// Loading component
function LoadingFallback() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body1" color="text.secondary">
        Ferdi Kaza Sigortası formu yükleniyor...
      </Typography>
    </Box>
  );
}

export default function FerdiKazaTeklifPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FerdiKazaQuotePage />
    </Suspense>
  );
} 