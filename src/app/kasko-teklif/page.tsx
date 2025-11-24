import { Metadata } from 'next';
import { Suspense } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import KaskoQuotePage from '@/components/QuoteFlow/KaskoQuote/KaskoQuotePage';
import '../../styles/form-style.css';

export const metadata: Metadata = {
  title: "Kasko Sigortası Teklif Al - Kapsamlı Araç Koruması | Sigorka",
  description: "Aracınız için kapsamlı kasko sigortası tekliflerini hızlıca alın. Online poliçe oluşturun ve aracınızı güvence altına alın.",
  metadataBase: new URL('https://sigorka.com'),
  alternates: {
    canonical: "https://sigorka.com/kasko-teklif"
  },
  openGraph: {
    title: "Kasko Sigortası Teklif Al - Kapsamlı Araç Koruması | Sigorka",
    description: "Aracınız için kapsamlı kasko sigortası tekliflerini hızlıca alın. Online poliçe oluşturun ve aracınızı güvence altına alın.",
    url: "https://sigorka.com/kasko-teklif",
    type: "website"
  },
  twitter: {
    title: "Kasko Sigortası Teklif Al - Kapsamlı Araç Koruması | Sigorka",
    description: "Aracınız için kapsamlı kasko sigortası tekliflerini hızlıca alın. Online poliçe oluşturun ve aracınızı güvence altına alın.",
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
        Kasko Sigortası formu yükleniyor...
      </Typography>
    </Box>
  );
}

export default function KaskoTeklifPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <KaskoQuotePage />
    </Suspense>
  );
} 