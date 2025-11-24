import { Metadata } from 'next';
import { Suspense } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import OzelSaglikQuotePage from '@/components/QuoteFlow/OzelSaglikQuote/OzelSaglikQuotePage';
import '../../styles/form-style.css';

export const metadata: Metadata = {
  title: "Özel Sağlık Sigortası Teklif Al - Kapsamlı Sağlık Koruması | Sigorka",
  description: "Kapsamlı sağlık koruması için özel sağlık sigortası tekliflerini hızlıca alın. Online poliçe oluşturun ve sağlığınızı güvence altına alın.",
  metadataBase: new URL('https://sigorka.com'),
  alternates: {
    canonical: "https://sigorka.com/ozel-saglik-teklif"
  },
  openGraph: {
    title: "Özel Sağlık Sigortası Teklif Al - Kapsamlı Sağlık Koruması | Sigorka",
    description: "Kapsamlı sağlık koruması için özel sağlık sigortası tekliflerini hızlıca alın. Online poliçe oluşturun ve sağlığınızı güvence altına alın.",
    url: "https://sigorka.com/ozel-saglik-teklif",
    type: "website"
  },
  twitter: {
    title: "Özel Sağlık Sigortası Teklif Al - Kapsamlı Sağlık Koruması | Sigorka",
    description: "Kapsamlı sağlık koruması için özel sağlık sigortası tekliflerini hızlıca alın. Online poliçe oluşturun ve sağlığınızı güvence altına alın.",
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
        Özel Sağlık Sigortası formu yükleniyor...
      </Typography>
    </Box>
  );
}

export default function OzelSaglikTeklifPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OzelSaglikQuotePage />
    </Suspense>
  );
} 