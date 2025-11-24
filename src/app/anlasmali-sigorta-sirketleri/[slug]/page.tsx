import { notFound } from 'next/navigation';
import path from 'path';
import { promises as fs } from 'fs';
import Banner from '../../components/common/Banner';
import Breadcrumb from '../../components/common/Breadcrumb';
import '../../../styles/main.min.css';
import '../../../styles/subpage.min.css';
import '../../../styles/armorbroker.css';
import React from 'react';
import type { Metadata, ResolvingMetadata } from 'next';

type TableType = { title: string; rows: [string, string][] };
type Sirket = {
  slug: string;
  name: string;
  logo: string;
  logo2x?: string;
  summary: string;
  detail: string;
  tables?: TableType[];
  actions?: { label: string; href: string }[];
};

type Props = {
  params: Promise<{ slug: string }>;
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getSirket(slug: string): Promise<Sirket | undefined> {
  const filePath = path.join(process.cwd(), 'src/app/anlasmali-sigorta-sirketleri/sirketler.json');
  const data = await fs.readFile(filePath, 'utf8');
  const sirketler: Sirket[] = JSON.parse(data);
  return sirketler.find((s) => s.slug === slug);
}

async function getAllSirketler(): Promise<Sirket[]> {
  const filePath = path.join(process.cwd(), 'src/app/anlasmali-sigorta-sirketleri/sirketler.json');
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

export async function generateStaticParams() {
  const sirketler = await getAllSirketler();
  return sirketler.map((sirket) => ({
    slug: sirket.slug,
  }));
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Params'ı çözümle
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const sirket = await getSirket(slug);

  // Parent metadata'yı al
  const previousImages = (await parent).openGraph?.images || [];

  if (!sirket) {
    return {
      title: "Sigorta Şirketi Bulunamadı | Sigorka",
      description: "Aradığınız sigorta şirketi bulunamadı. Tüm anlaşmalı sigorta şirketlerimizi incelemek için sitemizi ziyaret edin.",
      robots: {
        index: false,
        follow: false,
      }
    };
  }

  const metaInfo = {
    'turkiye-katilim-sigorta': {
      title: "Türkiye Katılım Sigorta - Ürün ve Hizmetler | Sigorka",
      description: "Türkiye Katılım Sigorta güvencesiyle sunulan ürünleri inceleyin, katılım esaslı sigortacılık anlayışıyla tanışın. Daha fazlası için sitemizi ziyaret edin."
    },
    'bereket-sigorta': {
      title: "Bereket Sigorta | Katılım Sigortacılığı Hizmetleri",
      description: "Bereket Sigorta'nın sunduğu katılım esaslı sigorta ürünlerini Sigorka üzerinden keşfedin ve güvenle sizin için en doğru poliçeyi oluşturun."
    },
    'hdi-katilim-sigorta': {
      title: "HDI Katılım Sigorta - Uyumlu Sigorta Ürünleri | Sigorka",
      description: "HDI Katılım Sigorta çözümlerini detaylıca inceleyin, faizsiz ve etik sigortacılık anlayışıyla güven içinde kalın. Daha fazlası için sitemizi ziyaret edin."
    },
    'katilim-emeklilik': {
      title: "Katılım Emeklilik - Sigorta ve BES Ürünleri | Sigorka",
      description: "Katılım Emeklilik'in sunduğu bireysel emeklilik ve sigorta ürünlerini karşılaştırarak avantajlı seçenekleri değerlendirin ve geleceğinizi garanti altına alın."
    }
  };

  const meta = metaInfo[sirket.slug as keyof typeof metaInfo] || {
    title: `${sirket.name} - Anlaşmalı Kurum Bilgisi | Sigorka`,
    description: "Sigorka ile çalışan sigorta şirketlerinin hizmet kapsamı ve ayrıcalıklarına dair detaylı bilgiyi keşfedin. Sigorta ürünlerimiz için sitemizi ziyaret edin."
  };

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `https://sigorka.com/anlasmali-sigorta-sirketleri/${sirket.slug}`
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://sigorka.com/anlasmali-sigorta-sirketleri/${sirket.slug}`,
      type: "article",
      images: [
        {
          url: sirket.logo,
          alt: sirket.name
        },
        ...previousImages
      ]
    },
    twitter: {
      title: meta.title,
      description: meta.description,
      card: "summary_large_image",
      images: [sirket.logo]
    },
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    }
  };
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const sirket = await getSirket(slug);
  if (!sirket) notFound();

  return (
    <>
      <Banner title1="Hakkımızda" title2="Anlaşmalı Sigorta Şirketleri" size="sm" />
      <section className="page-content">
        <div className="container">
          <Breadcrumb
            items={[
              { name: 'Ana Sayfa', href: '/' },
              { name: 'Hakkımızda' ,href: '/biz-kimiz'},
              { name: 'Anlaşmalı Sigorta Şirketleri', href: '/anlasmali-sigorta-sirketleri' },
              { name: sirket.name }
            ]}
          />
          <div className="text-content">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="mb-0">{sirket.name}</h3>
            </div>
            <div dangerouslySetInnerHTML={{ __html: sirket.detail }} />
            {sirket.actions && (
              <div className="d-flex flex-wrap mt-4">
                {sirket.actions.map(action => (
                  <a
                    key={action.href}
                    className="btn btn-wide btn-primary justify-content-center mr-3 mb-3 btn-sigorka-blue"
                    href={action.href}
                    target="_self"
                  >
                    {action.label}
                  </a>
                ))}
              </div>
            )}
            {sirket.tables && (
              <div className="table-responsive">
                {sirket.tables.map((table) => (
                  <table className="company-table" key={table.title}>
                    <thead>
                      <tr>
                        <th colSpan={2}>{table.title}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map(([key, value]) => (
                        <tr key={key}>
                          <td>{key}</td>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}