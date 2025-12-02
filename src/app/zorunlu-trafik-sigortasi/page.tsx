import { Metadata } from 'next';
import ZorunluTrafikSigortasiClientPage from './client';

export const metadata: Metadata = {
  title: 'Zorunlu Trafik Sigortası - Anında Teklif Al | Sigorka',
  description: 'Aracınız için en uygun zorunlu trafik sigortası tekliflerini dakikalar içinde alın, online poliçe oluşturun. Sigorta ürünlerimiz için sitemizi ziyaret edin.',
  alternates: {
    canonical: 'https://sigorka.com/zorunlu-trafik-sigortasi'
  },
  openGraph: {
    title: 'Zorunlu Trafik Sigortası - Anında Teklif Al | Sigorka',
    description: 'Aracınız için en uygun zorunlu trafik sigortası tekliflerini dakikalar içinde alın, online poliçe oluşturun. Sigorta ürünlerimiz için sitemizi ziyaret edin.',
    url: 'https://sigorka.com/zorunlu-trafik-sigortasi',
    type: 'website',
    images: [
      {
        url: 'https://sigorka.com/images/sigorka-og-image.png',
        width: 1200,
        height: 630,
        alt: 'Zorunlu Trafik Sigortası - Anında Teklif Al | Sigorka'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zorunlu Trafik Sigortası - Anında Teklif Al | Sigorka',
    description: 'Aracınız için en uygun zorunlu trafik sigortası tekliflerini dakikalar içinde alın, online poliçe oluşturun. Sigorta ürünlerimiz için sitemizi ziyaret edin.',
    images: ['https://sigorka.com/images/sigorka-og-image.png']
  }
};


export default function ZorunluTrafikSigortasiPage() {
  return <ZorunluTrafikSigortasiClientPage />;
} 