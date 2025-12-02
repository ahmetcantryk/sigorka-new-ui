import Banner from '../components/common/Banner';
import Breadcrumb from '../components/common/Breadcrumb';

import BizKimizClient from './client';
import React from 'react';
import '../../styles/subpage.min.css';
import Image from 'next/image';

export const metadata = {
  title: "Sigorka Hakkında - Kimiz, Ne Yapıyoruz? | Sigorka",
  description: "Katılım sigortacılığını dijitalle buluşturan Sigorka markasının kimliği hakkında tüm detaylı bilgilere bu sayfa üzerinden kolayca ulaşabilirsiniz.",
  alternates: {
    canonical: "https://sigorka.com/biz-kimiz"
  },
  openGraph: {
    title: "Sigorka Hakkında - Kimiz, Ne Yapıyoruz? | Sigorka",
    description: "Katılım sigortacılığını dijitalle buluşturan Sigorka markasının kimliği hakkında tüm detaylı bilgilere bu sayfa üzerinden kolayca ulaşabilirsiniz.",
    url: "https://sigorka.com/biz-kimiz",
    type: "website",
    images: [
      {
        url: "https://sigorka.com/images/sigorka-og-image.png",
        width: 1200,
        height: 630,
        alt: "Sigorka Hakkında - Kimiz, Ne Yapıyoruz? | Sigorka"
      }
    ]
  },
  twitter: {
    title: "Sigorka Hakkında - Kimiz, Ne Yapıyoruz? | Sigorka",
    description: "Katılım sigortacılığını dijitalle buluşturan Sigorka markasının kimliği hakkında tüm detaylı bilgilere bu sayfa üzerinden kolayca ulaşabilirsiniz.",
    card: "summary_large_image",
    images: ["https://sigorka.com/images/sigorka-og-image.png"]
  }
};

export default function BizKimizPage() {
  return (
    <>
      <BizKimizClient />
      <Banner title1="Hakkımızda" title2="Biz Kimiz?" size="sm" />
      <section className="page-content">
        <div className="container">
          <Breadcrumb items={[
            { name: "Ana Sayfa", href: "/" },
            { name: "Hakkımızda" },
            { name: "Biz Kimiz?" }
          ]} />
          <div className="text-content">
            <h3>Güvenli geleceğe katılım.</h3>
            <h4>
              Türkiye&apos;nin ilk ve tek online katılım sigortası platformu
              Sigorka.com&apos;a hoş geldiniz.
            </h4>

            <p>
              Kasko, Trafik, DASK, Konut, Yangın Sigortaları ve Sağlık Sigortası
              branşlarında ihtiyacınıza uygun tasarlanmış karşılaştırmalı sigorta
              tekliflerini <strong>online olarak</strong> veya
              <strong>çağrı merkezi</strong> aracılığıyla sunar. Bunu yaparken, en
              yeni ve ileri teknolojileri kullanır.
            </p>
            <ul className="prop-list prop-list--w100">
              <li>
                Her zaman doğru bilgiyi sağlama misyonuyla, şeffaflık ve
                tarafsızlık ilkesiyle siz müşterilerinin yanında yer alır.
              </li>
              <li>
                Poliçelerinizi, online platform üzerinde hazırlayarak, fiyat
                tekliflerini anında görebilmenizi sağlar.
              </li>
            </ul>
            <p>
              Sigorta ürünlerinizi bu sayede hızlı, pratik ve güvenli bir şekilde
              satın alabilirsiniz. <strong>Hem de 7/24!</strong>
            </p>
            <h4>
              Sektörün önde gelen katılım sigorta kuruluşlarının ürünlerini kendi
              çatısı altında sunan<br />
              Sigorka.com&apos;un temelleri 2023 yılında atılmıştır.
            </h4>
            <p>
              Bir ARMOR KATILIM SİGORTA VE REASÜRANS BROKERLİĞİ A.Ş. markası olan
              Sigorka.com, Türkiye pazarında katılım sigortacılığının lideri olma
              yolunda ilerlemektedir.
            </p>
            <p>
              Sigorka.com, yurt dışı merkezli birçok reasürans şirketlerinin yanı
              sıra,
            </p>
            <div className="row custom-gutters flex-row mb-4">
              <div className="col-md-3 col-xl-2 col-6 mb-3">
                <a href="#" className="partners__item">
                  <Image
                    src="/images/partners/bereket-sigorta.png"
                    width={114}
                    height={29}
                    className="partners__item-img"
                    alt="Bereket Sigorta"
                    // style={{ width: '100%', height: 'auto' }}
                  />
                </a>
              </div>
              <div className="col-md-3 col-xl-2 col-6 mb-3">
                <a href="#" className="partners__item">
                  <Image
                    src="/images/partners/hdi-katilim.png"
                    width={77}
                    height={77}
                    className="partners__item-img"
                    alt="HDI Katılım Sigorta"
                    // style={{ width: '100%', height: 'auto' }}
                  />
                </a>
              </div>
              <div className="col-md-3 col-xl-2 col-6 mb-3">
                <a href="#" className="partners__item">
                  <Image
                    src="/images/partners/katilim-emeklilik.png"
                    width={180}
                    height={80}
                    className="partners__item-img"
                    alt="Katılım Emeklilik"
                    style={{ width: '100%', height: 'auto' }}
                  />
                </a>
              </div>
              <div className="col-md-3 col-xl-2 col-6 mb-3">
                <a href="#" className="partners__item">
                  <Image
                    src="/images/brand/neova-logo-2.png"
                    width={154}
                    height={51}
                    className="partners__item-img"
                    alt="Neova Sigorta"
                    style={{ width: '100%', height: 'auto' }}
                  />
                </a>
              </div>
              <div className="col-md-3 col-xl-2 col-6 mb-3">
                <a href="#" className="partners__item">
                  <Image
                    src="/images/partners/turkiye-katilim.png"
                    width={180}
                    height={80}
                    className="partners__item-img"
                    alt="Türkiye Katılım Sigorta"
                    style={{ width: '100%', height: 'auto' }}
                  />
                </a>
              </div>
            </div>
            <p>
              gibi öncü Türk katılım sigorta şirketleri ile güçlü iş birliği
              içindedir.
            </p>
          </div>
        </div>
      </section>
    </>
  );
} 