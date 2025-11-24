import SozlukSearch from './SozlukSearch';
import Banner from '../components/common/Banner';
import Breadcrumb from '../components/common/Breadcrumb';
import '../../styles/subpage.min.css';
import dictionary from './dictionary.json';
import ProposalCta from '../components/common/ProposalCta';

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