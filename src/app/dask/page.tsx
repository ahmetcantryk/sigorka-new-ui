import { Metadata } from 'next';
import DaskSigortasiPage from './client';

export const metadata: Metadata = {
    title: "DASK - Zorunlu Deprem Sigortası Teklif Al | Sigorka",
    description: "Evinizi deprem riskine karşı koruma altına almanız geleceğiniz için olmazsa olmazınız. Zorunlu DASK poliçenizi Sigorka'dan online ve uygun fiyatla oluşturun.",
    alternates: {
        canonical: "https://sigorka.com/dask"
    },
    openGraph: {
        title: "DASK - Zorunlu Deprem Sigortası Teklif Al | Sigorka",
        description: "Evinizi deprem riskine karşı koruma altına almanız geleceğiniz için olmazsa olmazınız. Zorunlu DASK poliçenizi Sigorka'dan online ve uygun fiyatla oluşturun.",
        url: "https://sigorka.com/dask",
        type: "website",
        images: [
            {
                url: "https://sigorka.com/images/sigorka-og-image.png",
                width: 1200,
                height: 630,
                alt: "DASK - Zorunlu Deprem Sigortası Teklif Al | Sigorka"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "DASK - Zorunlu Deprem Sigortası Teklif Al | Sigorka",
        description: "Evinizi deprem riskine karşı koruma altına almanız geleceğiniz için olmazsa olmazınız. Zorunlu DASK poliçenizi Sigorka'dan online ve uygun fiyatla oluşturun.",
        images: ["https://sigorka.com/images/sigorka-og-image.png"]
    }
};

export default function DaskPage() {
    return <DaskSigortasiPage />;
}
