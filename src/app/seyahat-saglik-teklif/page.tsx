import { Metadata } from 'next';
import { Suspense } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import SeyahatSaglikQuotePage from '@/components/QuoteFlow/SeyahatSaglikQuote/SeyahatSaglikQuotePage';
import '../../styles/form-style.css';

export const metadata: Metadata = {
  title: "Seyahat Sağlık Sigortası Teklif Al - Güvenli Seyahat | Sigorka",
  description: "Seyahatlerinizde güvenli kalın. Seyahat sağlık sigortası tekliflerini hızlıca alın, online poliçe oluşturun ve rahat seyahat edin.",
  metadataBase: new URL('https://sigorka.com'),
  alternates: {
    canonical: "https://sigorka.com/seyahat-saglik-teklif"
  },
  openGraph: {
    title: "Seyahat Sağlık Sigortası Teklif Al - Güvenli Seyahat | Sigorka",
    description: "Seyahatlerinizde güvenli kalın. Seyahat sağlık sigortası tekliflerini hızlıca alın, online poliçe oluşturun ve rahat seyahat edin.",
    url: "https://sigorka.com/seyahat-saglik-teklif",
    type: "website"
  },
  twitter: {
    title: "Seyahat Sağlık Sigortası Teklif Al - Güvenli Seyahat | Sigorka",
    description: "Seyahatlerinizde güvenli kalın. Seyahat sağlık sigortası tekliflerini hızlıca alın, online poliçe oluşturun ve rahat seyahat edin.",
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
        Seyahat Sağlık Sigortası formu yükleniyor...
      </Typography>
    </Box>
  );
}

export default function SeyahatSaglikTeklifPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SeyahatSaglikQuotePage />
    </Suspense>
  );
} 