import { Metadata } from 'next';
import { Suspense } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import YabanciSaglikQuotePage from '@/components/QuoteFlow/YabanciSaglikQuote/YabanciSaglikQuotePage';
import '../../styles/form-style.css';

export const metadata: Metadata = {
  title: "Yabancı Sağlık Sigortası Teklif Al - İkamet İzni İçin | Sigorka",
  description: "Türkiye'de ikamet izni için zorunlu yabancı sağlık sigortası tekliflerini hızlıca alın. Online poliçe oluşturun ve hemen koruma altına girin.",
  metadataBase: new URL('https://sigorka.com'),
  alternates: {
    canonical: "https://sigorka.com/yabanci-saglik-teklif"
  },
  openGraph: {
    title: "Yabancı Sağlık Sigortası Teklif Al - İkamet İzni İçin | Sigorka",
    description: "Türkiye'de ikamet izni için zorunlu yabancı sağlık sigortası tekliflerini hızlıca alın. Online poliçe oluşturun ve hemen koruma altına girin.",
    url: "https://sigorka.com/yabanci-saglik-teklif",
    type: "website"
  },
  twitter: {
    title: "Yabancı Sağlık Sigortası Teklif Al - İkamet İzni İçin | Sigorka",
    description: "Türkiye'de ikamet izni için zorunlu yabancı sağlık sigortası tekliflerini hızlıca alın. Online poliçe oluşturun ve hemen koruma altına girin.",
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
        Yabancı Sağlık Sigortası formu yükleniyor...
      </Typography>
    </Box>
  );
}

export default function YabanciSaglikTeklifPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <YabanciSaglikQuotePage />
    </Suspense>
  );
} 