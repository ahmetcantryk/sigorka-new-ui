import { Metadata } from 'next';
import SikcaSorulanSorularClientPage from './client';
import faqData from './faq.json';

export const metadata: Metadata = {
    title: 'Sıkça Sorulan Sorular - Katılım Sigortacılığı | Sigorka',
    description: 'Katılım sigortacılığı ve sigorta ürünleri hakkında merak ettiğiniz tüm soruların yanıtlarını burada bulabilirsiniz. Sigorka ile bilinçli sigorta yaptırın.',
    alternates: {
        canonical: "https://sigorka.com/sikca-sorulan-sorular"
    },
    openGraph: {
        title: 'Sıkça Sorulan Sorular - Katılım Sigortacılığı | Sigorka',
        description: 'Katılım sigortacılığı ve sigorta ürünleri hakkında merak ettiğiniz tüm soruların yanıtlarını burada bulabilirsiniz. Sigorka ile bilinçli sigorta yaptırın.',
        url: 'https://sigorka.com/sikca-sorulan-sorular',
        type: 'website'
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Sıkça Sorulan Sorular - Katılım Sigortacılığı | Sigorka',
        description: 'Katılım sigortacılığı ve sigorta ürünleri hakkında merak ettiğiniz tüm soruların yanıtlarını burada bulabilirsiniz. Sigorka ile bilinçli sigorta yaptırın.'
    }
};

export default function SikcaSorulanSorularPage() {
    return <SikcaSorulanSorularClientPage categories={faqData} />;
} 