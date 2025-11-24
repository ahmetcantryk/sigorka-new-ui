import { Metadata } from 'next';
import TamamlayiciSaglikSigortasiPage from './client';

export const metadata: Metadata = {
    title: 'Tamamlayıcı Sağlık Sigortası - SGK Anlaşmalı | Sigorka',
    description: 'SGK anlaşmalı özel hastanelerde fark ücreti ödemeden sağlık hizmeti alın. Sigorka ile en uygun tamamlayıcı sağlık sigortası tekliflerini hemen inceleyin.',
    alternates: {
        canonical: "https://sigorka.com/tamamlayici-saglik-sigortasi"
    },
    openGraph: {
        title: 'Tamamlayıcı Sağlık Sigortası - SGK Anlaşmalı | Sigorka',
        description: 'SGK anlaşmalı özel hastanelerde fark ücreti ödemeden sağlık hizmeti alın. Sigorka ile en uygun tamamlayıcı sağlık sigortası tekliflerini hemen inceleyin.',
        url: 'https://sigorka.com/tamamlayici-saglik-sigortasi',
        type: 'website'
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Tamamlayıcı Sağlık Sigortası - SGK Anlaşmalı | Sigorka',
        description: 'SGK anlaşmalı özel hastanelerde fark ücreti ödemeden sağlık hizmeti alın. Sigorka ile en uygun tamamlayıcı sağlık sigortası tekliflerini hemen inceleyin.'
    }
};

export default function TamamlayiciSaglikPage() {
    return <TamamlayiciSaglikSigortasiPage />;
} 