import { Metadata } from 'next';
import YabanciSaglikSigortasiPage from './client';

export const metadata: Metadata = {
    title: 'Yabancı Sağlık Sigortası - İkamet İzni İçin | Sigorka',
    description: "Türkiye'de ikamet izni için zorunlu olan yabancı sağlık sigortasını Sigorka ile hızlı ve kolay bir şekilde online olarak alın. Hemen teklif alın!",
    alternates: {
        canonical: "https://sigorka.com/yabanci-saglik-sigortasi"
    },
    openGraph: {
        title: 'Yabancı Sağlık Sigortası - İkamet İzni İçin | Sigorka',
        description: "Türkiye'de ikamet izni için zorunlu olan yabancı sağlık sigortasını Sigorka ile hızlı ve kolay bir şekilde online olarak alın. Hemen teklif alın!",
        url: 'https://sigorka.com/yabanci-saglik-sigortasi',
        type: 'website'
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Yabancı Sağlık Sigortası - İkamet İzni İçin | Sigorka',
        description: "Türkiye'de ikamet izni için zorunlu olan yabancı sağlık sigortasını Sigorka ile hızlı ve kolay bir şekilde online olarak alın. Hemen teklif alın!"
    }
};

export default function YabanciSaglikPage() {
    return <YabanciSaglikSigortasiPage />;
} 