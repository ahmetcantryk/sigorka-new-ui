/**
 * Kasko Sigortası Ürün Detay Sayfası
 * 
 * Query parametrelerine göre farklı içerikler gösterir:
 * - Default: Ürün detay içeriği
 * - ?mode=form: Teklif formu
 * - ?proposalId=xxx: Teklif detayları
 * - ?purchaseId=xxx: Satın alma ekranı
 */

import { Metadata } from 'next';
import KaskoSigortasiClientPage from './client';
import faqData from '../sikca-sorulan-sorular/faq.json';

export const metadata: Metadata = {
    title: "Kasko Sigortası - Araç Korumasında Güvence | Sigorka",
    description: "Çarpma, çalınma, yangın ve bir çok çeşitli beklenmedik risklere karşı aracınızı güvence altına almak için uygun kasko tekliflerini hemen inceleyebilirsiniz.",
    alternates: {
      canonical: "https://sigorka.com/kasko-sigortasi"
    },
    openGraph: {
      title: "Kasko Sigortası - Araç Korumasında Güvence | Sigorka",
      description: "Çarpma, çalınma, yangın ve bir çok çeşitli beklenmedik risklere karşı aracınızı güvence altına almak için uygun kasko tekliflerini hemen inceleyebilirsiniz.",
      url: "https://sigorka.com/kasko-sigortasi",
      type: "website",
      images: [
        {
          url: "https://sigorka.com/images/sigorka-og-image.png",
          width: 1200,
          height: 630,
          alt: "Kasko Sigortası - Araç Korumasında Güvence | Sigorka"
        }
      ]
    },
    twitter: {
      title: "Kasko Sigortası - Araç Korumasında Güvence | Sigorka",
      description: "Çarpma, çalınma, yangın ve bir çok çeşitli beklenmedik risklere karşı aracınızı güvence altına almak için uygun kasko tekliflerini hemen inceleyebilirsiniz.",
      card: "summary_large_image",
      images: ["https://sigorka.com/images/sigorka-og-image.png"]
    }
  };

interface FaqQuestion {
    question: string;
    answer: string;
}

interface FaqCategory {
    title: string;
    questions: FaqQuestion[];
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function KaskoSigortasiPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const kaskoFaqCategory = faqData.find((cat: FaqCategory) => cat.title === 'Katılım Kasko Sigortası');
    const kaskoFaqs = kaskoFaqCategory ? kaskoFaqCategory.questions.map((q: FaqQuestion) => ({ question: q.question, answer: q.answer })) : [];

    return <KaskoSigortasiClientPage faqs={kaskoFaqs} searchParams={params} />;
} 