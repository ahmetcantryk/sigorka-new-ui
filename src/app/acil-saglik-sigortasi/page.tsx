import { Metadata } from 'next';
import AcilSaglikSigortasiPage from './client';

export const metadata: Metadata = {
    title: "Doktorum Benimle Ol - Acil Durumlarda Güvence | Sigorka",
    description: "Acil sağlık durumlarında kapsamlı sağlık hizmetleri için Doktorum Benimle Ol'u Sigorka ile yaptırın. Daha fazlası için sitemizi ziyaret edin.",
    alternates: {
      canonical: "https://sigorka.com/acil-saglik-sigortasi"
    },
    openGraph: {
      title: "Doktorum Benimle Ol - Acil Durumlarda Güvence | Sigorka",
      description: "Acil sağlık durumlarında kapsamlı sağlık hizmetleri için Doktorum Benimle Ol'u Sigorka ile yaptırın. Daha fazlası için sitemizi ziyaret edin.",
      url: "https://sigorka.com/acil-saglik-sigortasi",
      type: "website"
    },
    twitter: {
      title: "Doktorum Benimle Ol - Acil Durumlarda Güvence | Sigorka",
      description: "Acil sağlık durumlarında kapsamlı sağlık hizmetleri için Doktorum Benimle Ol'u Sigorka ile yaptırın. Daha fazlası için sitemizi ziyaret edin.",
      card: "summary_large_image"
    }
  };

export default function AcilSaglikPage() {
    return <AcilSaglikSigortasiPage />;
}

