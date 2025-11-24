import { Metadata } from 'next';
import FerdiKazaSigortasiPage from './client';

export const metadata: Metadata = {
    title: "Ferdi Kaza Sigortası - Anında Güvence | Sigorka",
    description: "Beklenmedik kazalara karşı hayatınızı ve sevdiklerinizi güvenceye alın. Uygun fiyatlı ferdi kaza sigortası Sigorka’da! Daha fazlası için sitemizi ziyaret edin.",
    alternates: {
        canonical: "https://sigorka.com/dask"
    },
    openGraph: {
        title: "Ferdi Kaza Sigortası - Anında Güvence | Sigorka",
        description: "Beklenmedik kazalara karşı hayatınızı ve sevdiklerinizi güvenceye alın. Uygun fiyatlı ferdi kaza sigortası Sigorka’da! Daha fazlası için sitemizi ziyaret edin.",
        url: "https://sigorka.com/dask",
        type: "website"
    },
    twitter: {
        card: "summary_large_image",
        title: "Ferdi Kaza Sigortası - Anında Güvence | Sigorka",
        description: "Beklenmedik kazalara karşı hayatınızı ve sevdiklerinizi güvenceye alın. Uygun fiyatlı ferdi kaza sigortası Sigorka’da! Daha fazlası için sitemizi ziyaret edin."
    }
};

export default function FerdiKazaPage() {
    return <FerdiKazaSigortasiPage />;
} 