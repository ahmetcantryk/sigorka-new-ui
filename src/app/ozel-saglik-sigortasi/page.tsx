import { Metadata } from 'next';
import OzelSaglikSigortasiPage from './client';

export const metadata: Metadata = {
    title: "Özel Sağlık Sigortası - Geniş Hastane Ağı | Sigorka",
    description: "Türkiye genelindeki özel hastanelerde kapsamlı sağlık hizmetleri için özel sağlık sigortasını Sigorka ile yaptırın. Daha fazlası için sitemizi ziyaret edin.",
    alternates: {
      canonical: "https://sigorka.com/ozel-saglik-sigortasi"
    },
    openGraph: {
      title: "Özel Sağlık Sigortası - Geniş Hastane Ağı | Sigorka",
      description: "Türkiye genelindeki özel hastanelerde kapsamlı sağlık hizmetleri için özel sağlık sigortasını Sigorka ile yaptırın. Daha fazlası için sitemizi ziyaret edin.",
      url: "https://sigorka.com/ozel-saglik-sigortasi",
      type: "website"
    },
    twitter: {
      title: "Özel Sağlık Sigortası - Geniş Hastane Ağı | Sigorka",
      description: "Türkiye genelindeki özel hastanelerde kapsamlı sağlık hizmetleri için özel sağlık sigortasını Sigorka ile yaptırın. Daha fazlası için sitemizi ziyaret edin.",
      card: "summary_large_image"
    }
  };

export default function OzelSaglikPage() {
    return <OzelSaglikSigortasiPage />;
} 