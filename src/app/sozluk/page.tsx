import SozlukSearch from './SozlukSearch';
import Banner from '../components/common/Banner';
import Breadcrumb from '../components/common/Breadcrumb';
import '../../styles/subpage.min.css';
import dictionary from './dictionary.json';
import ProposalCta from '../components/common/ProposalCta';

export const metadata = {
  title: "Sigorta Sözlüğü - Terimler ve Tanımlar | Sigorka",
  description: "Sigorta sektöründe kullanılan terimlerin açıklamalarını içeren kapsamlı sözlüğümüze göz atın. Sigortacılık kavramlarını kolayca öğrenin.",
  alternates: {
    canonical: "https://sigorka.com/sozluk"
  },
  openGraph: {
    title: "Sigorta Sözlüğü - Terimler ve Tanımlar | Sigorka",
    description: "Sigorta sektöründe kullanılan terimlerin açıklamalarını içeren kapsamlı sözlüğümüze göz atın. Sigortacılık kavramlarını kolayca öğrenin.",
    url: "https://sigorka.com/sozluk",
    type: "website",
    images: [
      {
        url: "https://sigorka.com/images/sigorka-og-image.png",
        width: 1200,
        height: 630,
        alt: "Sigorta Sözlüğü - Terimler ve Tanımlar | Sigorka"
      }
    ]
  },
  twitter: {
    title: "Sigorta Sözlüğü - Terimler ve Tanımlar | Sigorka",
    description: "Sigorta sektöründe kullanılan terimlerin açıklamalarını içeren kapsamlı sözlüğümüze göz atın. Sigortacılık kavramlarını kolayca öğrenin.",
    card: "summary_large_image",
    images: ["https://sigorka.com/images/sigorka-og-image.png"]
  }
};

export default function SozlukPage() {
  return (
    <>
      <Banner title1="Bilgi Merkezi" title2="Sözlük" size="sm" />
      <section className="page-content dictionary-page">
        <div className="container">
          <Breadcrumb items={[
            { name: 'Ana Sayfa', href: '/' },
            { name: 'Bilgi Merkezi', href: '#' },
            { name: 'Sözlük' }
          ]} />
          <SozlukSearch dictionary={dictionary} />
          <ProposalCta />
        </div>
      </section>
    </>
  );
} 