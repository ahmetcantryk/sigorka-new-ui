import { Metadata } from 'next';
import KonutSigortasiPage from './client';

export const metadata: Metadata = {
    title: "Konut Sigortası - Evinizi Güvende Tutun | Sigorka",
    description: "Yangın, hırsızlık ve doğal afetlere karşı evinizi koruyun. Uygun fiyatlı konut sigortasını Sigorka ile kolayca alın. Daha fazlası için sitemizi ziyaret edin.",
    alternates: {
        canonical: "https://sigorka.com/konut-sigortasi"
    },
    openGraph: {
        title: "Konut Sigortası - Evinizi Güvende Tutun | Sigorka",
        description: "Yangın, hırsızlık ve doğal afetlere karşı evinizi koruyun. Uygun fiyatlı konut sigortasını Sigorka ile kolayca alın. Daha fazlası için sitemizi ziyaret edin.",
        url: "https://sigorka.com/konut-sigortasi",
        type: "website",
        images: [
            {
                url: "https://sigorka.com/images/sigorka-og-image.png",
                width: 1200,
                height: 630,
                alt: "Konut Sigortası - Evinizi Güvende Tutun | Sigorka"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Konut Sigortası - Evinizi Güvende Tutun | Sigorka",
        description: "Yangın, hırsızlık ve doğal afetlere karşı evinizi koruyun. Uygun fiyatlı konut sigortasını Sigorka ile kolayca alın. Daha fazlası için sitemizi ziyaret edin.",
        images: ["https://sigorka.com/images/sigorka-og-image.png"]
    }
};

export default function KonutPage() {
    return <KonutSigortasiPage />;
} 