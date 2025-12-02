import { Metadata } from 'next';
import FerdiKazaSigortasiPage from './client';

export const metadata: Metadata = {
    title: "Ferdi Kaza Sigortası - Anında Güvence | Sigorka",
    description: "Beklenmedik kazalara karşı hayatınızı ve sevdiklerinizi güvenceye alın. Uygun fiyatlı ferdi kaza sigortası Sigorka'da! Daha fazlası için sitemizi ziyaret edin.",
    alternates: {
        canonical: "https://sigorka.com/ferdi-kaza-sigortasi"
    },
    openGraph: {
        title: "Ferdi Kaza Sigortası - Anında Güvence | Sigorka",
        description: "Beklenmedik kazalara karşı hayatınızı ve sevdiklerinizi güvenceye alın. Uygun fiyatlı ferdi kaza sigortası Sigorka'da! Daha fazlası için sitemizi ziyaret edin.",
        url: "https://sigorka.com/ferdi-kaza-sigortasi",
        type: "website",
        images: [
            {
                url: "https://sigorka.com/images/sigorka-og-image.png",
                width: 1200,
                height: 630,
                alt: "Ferdi Kaza Sigortası - Anında Güvence | Sigorka"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Ferdi Kaza Sigortası - Anında Güvence | Sigorka",
        description: "Beklenmedik kazalara karşı hayatınızı ve sevdiklerinizi güvenceye alın. Uygun fiyatlı ferdi kaza sigortası Sigorka'da! Daha fazlası için sitemizi ziyaret edin.",
        images: ["https://sigorka.com/images/sigorka-og-image.png"]
    }
};

export default function FerdiKazaPage() {
    return <FerdiKazaSigortasiPage />;
} 