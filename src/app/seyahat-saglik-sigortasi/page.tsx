import { Metadata } from 'next';
import SeyahatSaglikSigortasiPage from './client';

export const metadata: Metadata = {
    title: 'Seyahat Sağlık Sigortası - Yurt Dışı ve Vize | Sigorka',
    description: "Yurt dışı seyahatlerinizde sağlığınızı güvence altına alın ve vize başvurularınızda sorun yaşamayın. Sigorka'dan online seyahat sağlık sigortası teklifi alın.",
    alternates: {
        canonical: "https://sigorka.com/seyahat-saglik-sigortasi"
    },
    openGraph: {
        title: 'Seyahat Sağlık Sigortası - Yurt Dışı ve Vize | Sigorka',
        description: "Yurt dışı seyahatlerinizde sağlığınızı güvence altına alın ve vize başvurularınızda sorun yaşamayın. Sigorka'dan online seyahat sağlık sigortası teklifi alın.",
        url: 'https://sigorka.com/seyahat-saglik-sigortasi',
        type: 'website',
        images: [
            {
                url: 'https://sigorka.com/images/sigorka-og-image.png',
                width: 1200,
                height: 630,
                alt: 'Seyahat Sağlık Sigortası - Yurt Dışı ve Vize | Sigorka'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Seyahat Sağlık Sigortası - Yurt Dışı ve Vize | Sigorka',
        description: "Yurt dışı seyahatlerinizde sağlığınızı güvence altına alın ve vize başvurularınızda sorun yaşamayın. Sigorka'dan online seyahat sağlık sigortası teklifi alın.",
        images: ['https://sigorka.com/images/sigorka-og-image.png']
    }
};

export default function SeyahatSaglikPage() {
    return <SeyahatSaglikSigortasiPage />;
} 