import React from 'react';
import Banner from '../../components/common/Banner';
import Breadcrumb from '../../components/common/Breadcrumb';
import ProposalCta from '../../components/common/ProposalCta';
import '../../../styles/subpage.min.css';
import dictionary from '../dictionary.json';
import Link from 'next/link';

interface DictionaryItem {
  id: number;
  title: string;
  summary: string;
  slug: string;
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>
}

// Next.js SSG için static paramlar
export async function generateStaticParams() {
  return dictionary.map((item) => ({ slug: item.slug }));
}

// Markdown bold formatını HTML'e çeviren utility function
function parseMarkdownBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

/**
 * @param {{ params: { slug: string } }} props
 */
export default async function SozlukDetayPage({params}: {params: Promise<{ slug: string }>}) {
  const { slug } = await params;
  const selectedWord = dictionary.find((item) => item.slug === slug);
  
  // Önerilen kelimeleri rastgele seç
  const suggestedWords = dictionary
    .filter((item) => item.slug !== slug)
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

  if (!selectedWord) {
    return (
      <>
        <Banner title1="Bilgi Merkezi" title2="Sözlük" size="sm" />
        <section className="page-content">
          <div className="container">
            <p className="text-center">Aradığınız kelime bulunamadı.</p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Banner title1="Bilgi Merkezi" title2="Sözlük" size="sm" />
      <section className="page-content">
        <div className="container">
          <Breadcrumb items={[
            { name: 'Ana Sayfa', href: '/' },
            { name: 'Bilgi Merkezi', href: '#' },
            { name: 'Sözlük', href: '/sozluk' },
            { name: selectedWord.title }
          ]} />

          <div className="detail-container">
            <h2>{selectedWord.title}</h2>
            <p 
              style={{ whiteSpace: 'pre-line' }}
              dangerouslySetInnerHTML={{
                __html: parseMarkdownBold(
                  selectedWord.summary
                    .replace(/<\/br>/g, '\n')
                    .replace(/<br>/g, '\n')
                )
              }}
            />
          </div>

          <ProposalCta />

          <h3>Öneri Kelimeler</h3>
          <div className="row suggest-words">
            {suggestedWords.map((item: DictionaryItem) => (
              <div key={item.id} className="col-lg-4 col-md-6">
                <Link href={`/sozluk/${item.slug}`} className="dictionary-item">
                  <h4 className="dictionary-item__title">{item.title}</h4>
                  <p 
                    className="dictionary-item__summary" 
                    style={{ whiteSpace: 'pre-line' }}
                    dangerouslySetInnerHTML={{
                      __html: parseMarkdownBold(
                        item.summary
                          .replace(/<\/br>/g, '\n')
                          .replace(/<br>/g, '\n')
                      )
                    }}
                  />
                  <span className="dictionary-item__link">
                    Devamını Oku <span className="icon-arrow-right"></span>
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
} 