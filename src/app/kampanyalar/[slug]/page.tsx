import React from 'react';
import path from 'path';
import { promises as fs } from 'fs';
import Banner from '../../components/common/Banner';
import FaqList from '../../components/common/FaqList';
import '../../../styles/subpage.min.css';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

type Kampanya = {
  slug: string;
  title: string;
  summary: string;
  image: string;
  detailImage: string;
  detailHtml: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  category?: string;
  status?: string;
  faqs?: { question: string; answer: string }[];
};

// Next.js SSG için static paramlar
export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'public/kampanyalar.json');
  const data = await fs.readFile(filePath, 'utf8');
  const kampanyalar: Kampanya[] = JSON.parse(data);
  return kampanyalar.map((kampanya) => ({
    slug: kampanya.slug,
  }));
}

// Kategori bazlı CTA mesajları
function getCTAMessage(category: string | undefined): { title: string; description: string } {
  const ctaMessages: Record<string, { title: string; description: string }> = {
    'konut': {
      title: 'Katılım Konut Sigortasına mı ihtiyacınız var?',
      description: 'En uygun fiyatlı katılım konut sigortaları için şimdi teklif alın.'
    },
    'kasko': {
      title: 'Katılım Kasko Sigortasına mı ihtiyacınız var?',
      description: 'En uygun tekliflerle aracınızı kaskolamak için şimdi teklif alın.'
    },
    'tamamlayici-saglik': {
      title: 'Katılım Tamamlayıcı Sağlık Sigortasına mı ihtiyacınız var?',
      description: 'Uygun fiyatlı katılım sağlık sigortaları için şimdi teklif alın.'
    },
    'trafik': {
      title: 'Zorunlu Trafik Sigortasına mı ihtiyacınız var?',
      description: 'En uygun fiyatlı zorunlu trafik sigortası için hemen teklif alın.'
    },
    'dask': {
      title: 'DASK Sigortasına mı ihtiyacınız var?',
      description: 'Deprem riskine karşı korunmak için en uygun DASK sigortası tekliflerini alın.'
    },
    'seyahat-saglik': {
      title: 'Seyahat Sağlık Sigortasına mı ihtiyacınız var?',
      description: 'Güvenli seyahatler için kapsamlı seyahat sağlık sigortası tekliflerini inceleyin.'
    },
    'ozel-saglik': {
      title: 'Özel Sağlık Sigortasına mı ihtiyacınız var?',
      description: 'Kapsamlı sağlık koruması için en uygun özel sağlık sigortası tekliflerini alın.'
    },
    'ferdi-kaza': {
      title: 'Ferdi Kaza Sigortasına mı ihtiyacınız var?',
      description: 'Beklenmedik kazalara karşı korunmak için ferdi kaza sigortası tekliflerini inceleyin.'
    },
    'imm': {
      title: 'İMM Sigortasına mı ihtiyacınız var?',
      description: 'İşveren Mali Mesuliyet sigortası için en uygun teklifleri alın.'
    }
  };

  // Kategori bulunamazsa default mesaj döndür
  return ctaMessages[category || ''] || {
    title: 'Kampanyadan yararlanmak için hemen teklif alın!',
    description: 'En uygun fiyatlarla teklif almak için hemen tıklayın.'
  };
}

async function getKampanya(slug: string): Promise<Kampanya | undefined> {
  const filePath = path.join(process.cwd(), 'public/kampanyalar.json');
  const data = await fs.readFile(filePath, 'utf8');
  const kampanyalar: Kampanya[] = JSON.parse(data);
  return kampanyalar.find((k) => k.slug === slug);
}

async function getTumKampanyalar(): Promise<Kampanya[]> {
  const filePath = path.join(process.cwd(), 'public/kampanyalar.json');
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

export async function generateMetadata({params}: {params: Promise<{ slug: string }>}): Promise<Metadata> {
  const { slug } = await params;
  const kampanya = await getKampanya(slug);
  if (!kampanya) {
    return {
      title: "Kampanya Bulunamadı | Sigorka",
      description: "Aradığınız kampanya bulunamadı. Güncel kampanyalarımızı incelemek için sitemizi ziyaret edin."
    };
  }

  return {
    title: `${kampanya.title} - Sigorta Fırsatları | Sigorka`,
    description: "Sigorta kampanyalarına dair tüm detaylar, katılım koşulları ve geçerlilik tarihleri bu sayfada sizi bekliyor. Sigorta hizmetlerimiz için sitemizi ziyaret edin.",
    alternates: {
      canonical: `https://sigorka.com/kampanyalar/${kampanya.slug}`
    },
    openGraph: {
      title: `${kampanya.title} - Sigorta Fırsatları | Sigorka`,
      description: "Sigorta kampanyalarına dair tüm detaylar, katılım koşulları ve geçerlilik tarihleri bu sayfada sizi bekliyor. Sigorta hizmetlerimiz için sitemizi ziyaret edin.",
      url: `https://sigorka.com/kampanyalar/${kampanya.slug}`,
      type: "article",
      images: [
        {
          url: kampanya.image,
          alt: kampanya.title
        }
      ]
    },
    twitter: {
      title: `${kampanya.title} - Sigorta Fırsatları | Sigorka`,
      description: "Sigorta kampanyalarına dair tüm detaylar, katılım koşulları ve geçerlilik tarihleri bu sayfada sizi bekliyor. Sigorta hizmetlerimiz için sitemizi ziyaret edin.",
      card: "summary_large_image",
      images: [kampanya.image]
    }
  };
}

export default async function KampanyaDetayPage({params}: {params: Promise<{ slug: string }>}) {
  const { slug } = await params;
  const kampanya = await getKampanya(slug);
  if (!kampanya) notFound();

  // Diğer kampanyaları getir (mevcut kampanya hariç, maksimum 3 tane)
  const tumKampanyalar = await getTumKampanyalar();
  const digerKampanyalar = tumKampanyalar
    .filter((k) => k.slug !== slug)
    .slice(0, 3);

  const ctaMessage = getCTAMessage(kampanya.category);

  return (
    <>
      <Banner title1="" title2="Kampanyalar" size="sm" />
      <section className="blog-post">
        <div className="container container--sm">
          <div className="blog-post-intro">
            <div className="row">
              <div className="col-md-8">
                <div className="blog-post-intro__img">
                  {/* Mobil görsel (dar) */}
                  <Image 
                    src={kampanya.image} 
                    className="blog-promo__item-img img-fluid campaign-mobile-img" 
                    alt={kampanya.title}
                    width={792}
                    height={662}
                  />
                  {/* Desktop görsel (geniş) */}
                  <Image 
                    src={kampanya.detailImage} 
                    className="blog-promo__item-img img-fluid campaign-desktop-img" 
                    alt={kampanya.title}
                    width={800}
                    height={400}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="offer-banner offer-banner--alt">
                  <div className="offer-banner__content">
                    <h3>{ctaMessage.title}</h3>
                    <p>{ctaMessage.description}</p>
                  </div>
                  <div className="offer-banner__cta">
                    <Link className="btn btn-wide btn-tertiary" href={kampanya.ctaLink}>
                      {kampanya.ctaText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-content">
            <div dangerouslySetInnerHTML={{ __html: kampanya.detailHtml }} />
            {kampanya.faqs && kampanya.faqs.length > 0 && (
             
                <FaqList faqs={kampanya.faqs} />
            
            )}
          </div>

          <div className="offer-banner mt-2 mb-5">
            <div className="offer-banner__content">
              <h3>{ctaMessage.title}</h3>
              <p>{ctaMessage.description}</p>
            </div>
            <div className="offer-banner__cta">
              <Link className="btn btn-wide btn-tertiary" href={kampanya.ctaLink}>
                {kampanya.ctaText}
              </Link>
            </div>
          </div>

          {digerKampanyalar.length > 0 && (
            <>
              <h3 className="blog-section__title">
                Diğer Kampanyalar
              </h3>
              <div className="row">
                {digerKampanyalar.map((k) => (
                  <div key={k.slug} className="col-md-4 mb-4">
                    <Link href={`/kampanyalar/${k.slug}`} className="campaign-item">
                      <Image 
                        src={k.image} 
                        className="campaign-item__img img-fluid" 
                        alt={k.title}
                        width={792}
                        height={662}
                      />
                      <div className="campaign-item__content">
                        <h3 className="campaign-item__title" dangerouslySetInnerHTML={{ __html: k.title }} />
                        <span className="campaign-item__link">
                          Detaylı Bilgi <span className="icon-arrow-right"></span>
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
} 