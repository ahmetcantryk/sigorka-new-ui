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
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zorunlu Trafik Sigortası - Anında Teklif Al | Sigorka',
    description: 'Aracınız için en uygun zorunlu trafik sigortası tekliflerini dakikalar içinde alın, online poliçe oluşturun. Sigorta ürünlerimiz için sitemizi ziyaret edin.'
  }
};


export default function ZorunluTrafikSigortasiPage() {
  return <ZorunluTrafikSigortasiClientPage />;
} 