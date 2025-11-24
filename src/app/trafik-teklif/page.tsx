import { Metadata } from 'next';
import { Suspense } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import TrafikQuotePage from '@/components/QuoteFlow/TrafikQuote/TrafikQuotePage';
import '../../styles/form-style.css';

export const metadata: Metadata = {
  title: "Trafik Sigortası Teklif Al - Zorunlu Araç Koruması | Sigorka",
  description: "Zorunlu trafik sigortası tekliflerini hızlıca alın. Online poliçe oluşturun ve aracınızı yasal olarak koruyun.",
  metadataBase: new URL('https://sigorka.com'),
  alternates: {
    canonical: "https://sigorka.com/trafik-teklif"
  },
  openGraph: {
    title: "Trafik Sigortası Teklif Al - Zorunlu Araç Koruması | Sigorka",
    description: "Zorunlu trafik sigortası tekliflerini hızlıca alın. Online poliçe oluşturun ve aracınızı yasal olarak koruyun.",
    url: "https://sigorka.com/trafik-teklif",
    type: "website"
  },
  twitter: {
    title: "Trafik Sigortası Teklif Al - Zorunlu Araç Koruması | Sigorka",
    description: "Zorunlu trafik sigortası tekliflerini hızlıca alın. Online poliçe oluşturun ve aracınızı yasal olarak koruyun.",
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
        Trafik Sigortası formu yükleniyor...
      </Typography>
    </Box>
  );
}

export default function TrafikTeklifPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TrafikQuotePage />
    </Suspense>
  );
} 