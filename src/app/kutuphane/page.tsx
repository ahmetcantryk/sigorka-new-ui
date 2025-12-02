import Banner from '../components/common/Banner';
import Breadcrumb from '../components/common/Breadcrumb';
import React from 'react';
import '../../styles/subpage.min.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sigorta Kütüphanesi - Katılım Sigortacılığı Dokümanları | Sigorka',
  description: 'Sigorka kütüphanesinde sigorta ve katılım sigortacılığı hakkında detaylı bilgilendirici dokümanlar, araştırmalar ve raporlar bulabilirsiniz. PDF formatında indirilebilir kaynaklar.',
  alternates: {
    canonical: 'https://sigorka.com/kutuphane'
  },
  openGraph: {
    title: 'Sigorta Kütüphanesi - Sigorta ve Katılım Sigortacılığı Dokümanları | Sigorka',
    description: 'Sigorka kütüphanesinde sigorta ve katılım sigortacılığı hakkında detaylı bilgilendirici dokümanlar, araştırmalar ve raporlar bulabilirsiniz. PDF formatında indirilebilir kaynaklar.',
    url: 'https://sigorka.com/kutuphane',
    type: 'website',
    images: [
      {
        url: 'https://sigorka.com/images/sigorka-og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sigorta Kütüphanesi - Sigorta ve Katılım Sigortacılığı Dokümanları | Sigorka'
      }
    ]
  },
  twitter: {
    title: 'Sigorta Kütüphanesi - Sigorta ve Katılım Sigortacılığı Dokümanları | Sigorka',
    description: 'Sigorka kütüphanesinde sigorta ve katılım sigortacılığı hakkında detaylı bilgilendirici dokümanlar, araştırmalar ve raporlar bulabilirsiniz. PDF formatında indirilebilir kaynaklar.',
    card: 'summary_large_image',
    images: ['https://sigorka.com/images/sigorka-og-image.png']
  }
};

export default function KutuphanePage() {
  return (
    <>
      <Banner title1="Bilgi Merkezi" title2="Kütüphane" size="sm" />
      <section className="page-content">
        <div className="container">
          <Breadcrumb items={[
            { name: "Ana Sayfa", href: "/" },
            { name: "Bilgi Merkezi" },
            { name: "Kütüphane" }
          ]} />
          <p className="mb-5">
            Sigorta ve katılım sigortacılığı hakkında bilgilendirici dokümanlarımıza aşağıdan ulaşabilirsiniz.
          </p>
          <div className="row">
            <div className="col-md-6 col-lg-4 mb-4">
              <div className="partners__item flex-column align-items-start justify-content-between">
                <div className="mb-0">
                  Katılım Bankaları Sigorta Uygulamalarında Tekafülün Yeri ve Geleceği
                </div>
                <p>
                  <strong>Hazırlayan:</strong> Serdar Polat
                </p>
                <div className="align-self-end">
                  <a
                    href="/content/docs/katilim-bankalari-sigorta-uygulamalarinda-tekafulun-yeri-ve-gelecegi.pdf"
                    className="btn btn-secondary btn-library"
                    download="Katılım_Bankaları_Sigorta_Uygulamalarında_Tekafülün_Yeri_ve_Geleceği.pdf"
                    rel="noopener noreferrer"
                  >
                    İndir (PDF)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 