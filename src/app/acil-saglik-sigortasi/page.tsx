import { Metadata } from 'next';
import AcilSaglikSigortasiPage from './client';

export const metadata: Metadata = {
    title: "Doktorum Benimle - Acil Durumlarda Güvence | Sigorka",
    description: "Acil sağlık durumlarında kapsamlı sağlık hizmetleri için Doktorum Benimle'u Sigorka ile yaptırın. Daha fazlası için sitemizi ziyaret edin.",
    alternates: {
      canonical: "https://sigorka.com/acil-saglik-sigortasi"
    },
    openGraph: {
      title: "Doktorum Benimle - Acil Durumlarda Güvence | Sigorka",
      description: "Acil sağlık durumlarında kapsamlı sağlık hizmetleri için Doktorum Benimle'u Sigorka ile yaptırın. Daha fazlası için sitemizi ziyaret edin.",
      url: "https://sigorka.com/acil-saglik-sigortasi",
      type: "website",
      images: [
        {
          url: "https://sigorka.com/images/sigorka-og-image.png",
          width: 1200,
          height: 630,
          alt: "Doktorum Benimle - Acil Durumlarda Güvence | Sigorka"
        }
      ]
    },
    twitter: {
      title: "Doktorum Benimle - Acil Durumlarda Güvence | Sigorka",
      description: "Acil sağlık durumlarında kapsamlı sağlık hizmetleri için Doktorum Benimle'u Sigorka ile yaptırın. Daha fazlası için sitemizi ziyaret edin.",
      card: "summary_large_image",
      images: ["https://sigorka.com/images/sigorka-og-image.png"]
    }
  };

export default function AcilSaglikPage() {
    return <AcilSaglikSigortasiPage />;
}

