"use client";

import { useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import FaqList from '../components/common/FaqList';
import ProductBanner from '../components/common/ProductBanner';
import StickyProductNav from '../components/common/StickyProductNav';
import ConditionalCTAPopup from '../components/common/ConditionalCTAPopup';
import { productAnchors, getOfferLink } from '../../config/productAnchors';
import '../../styles/subpage.min.css';
import '../../styles/armorbroker.css';

const faqs = [
  {
    question: 'Doktorum Benimle Ol Nedir?',
    answer: 'Doktorum Benimle Ol, beklenmedik acil sağlık durumlarında hızlı ve etkili müdahale için tasarlanmış bir sigorta ürünüdür. Acil durumlarda hastane masraflarınızı ve acil tedavi giderlerinizi karşılar.'
  },
  {
    question: 'Doktorum Benimle Ol Hangi Durumları Kapsar?',
    answer: 'Acil sağlık durumları, kaza sonucu yaralanmalar, ani hastalık durumları, acil cerrahi müdahaleler ve acil tıbbi müdahale gerektiren tüm durumları kapsar.'
  },
  {
    question: 'Doktorum Benimle Ol\'da Bekleme Süresi Var mı?',
    answer: 'Doktorum Benimle Ol\'da acil durumlar için bekleme süresi bulunmamaktadır. Poliçe başlangıç tarihinden itibaren acil durumlar için teminat aktif olur.'
  },
  {
    question: 'Doktorum Benimle Ol\'dan Kimler Faydalanabilir?',
    answer: "Doktorum Benimle Ol, 0-64 yaş arası herkes için uygundur. Türkiye'de ikamet eden tüm bireyler bu sigortadan yararlanabilir."
  },
  {
    question: 'Doktorum Benimle Ol\'da Anlaşmalı Hastaneler Var mı?',
    answer: 'Evet, sigorta şirketlerinin anlaşmalı olduğu geniş bir hastane ağı bulunmaktadır. Anlaşmalı hastanelerde direkt ödeme imkanı sağlanır.'
  },
  {
    question: 'Doktorum Benimle Ol\'da Ambulans Hizmeti Var mı?',
    answer: 'Evet, Doktorum Benimle Ol kapsamında acil durumlarda ambulans hizmeti teminat altındadır ve ek ücret talep edilmez.'
  },
  {
    question: 'Doktorum Benimle Ol Süresi Nedir?',
    answer: 'Poliçe başlangıç tarihi itibariyle 1 yıldır ve yıllık olarak yenilenebilir.'
  },
  {
    question: 'Doktorum Benimle Ol\'da Ödeme Nasıl Yapılır?',
    answer: 'Katkı payı (prim) ödemeleri peşin veya taksitli olarak yapılabilir. Kredi kartı ile 9 taksite kadar ödeme seçeneği bulunmaktadır.'
  },
  {
    question: 'Doktorum Benimle Ol\'da Aile Üyeleri Eklenebilir mi?',
    answer: 'Evet, eş ve çocuklarınızı poliçenize ekleyebilirsiniz. Aile üyeleri için özel indirimler uygulanmaktadır.'
  },
  {
    question: 'Doktorum Benimle Ol\'da Hasar Bildirimi Nasıl Yapılır?',
    answer: 'Acil durumlarda 7/24 hizmet veren hasar hattımızı arayarak veya web sitemizdeki hasar bildirim formunu doldurarak hasar bildirimi yapabilirsiniz.'
  }
];

export default function AcilSaglikSigortasiPage() {
  const anchors = productAnchors['acil-saglik-sigortasi'];
  const offerLink = getOfferLink('acil-saglik-sigortasi');

  useEffect(() => {
    document.body.classList.add('product-detail-page');
    return () => document.body.classList.remove('product-detail-page');
  }, []);

  return (
    <>
      <ConditionalCTAPopup
        condition="inactivity"
        inactivityDelay={15}
        config={{
          title: 'Doktorum Benimle Ol Teklifi Almak İster misiniz?',
          description: 'Hemen birkaç dakika içinde en uygun Doktorum Benimle Ol tekliflerini karşılaştırın.',
          buttonText: 'Hemen Teklif Al',
          buttonLink: '/acil-saglik-teklif'
        }}
      />
      <StickyProductNav anchors={anchors} offerLink={offerLink} />
      <ProductBanner
        title1="Sağlığım"
        title2="Doktorum Benimle Ol"
        buttonText="Hemen Teklif Alın"
        buttonHref="/acil-saglik-teklif"
        size="sm"
      />
      <section className="page-content">
        <div className="container">
          <Breadcrumb
            items={[
              { name: 'Ana Sayfa', href: '/' },
              { name: 'Ürünler', href: '' },
              { name: 'Sağlığım', href: '/sagligim' },
              { name: 'Doktorum Benimle Ol' }
            ]}
          />
          <div className="text-content">
            <h3>Beklenmedik acil sağlık durumlarında hızlı ve etkili müdahale için tasarlanmış Doktorum Benimle Ol, ani hastalık veya kaza durumlarında sağlık giderlerinizi güvence altına alır. Acil durumlarda hastane masraflarınızı, acil tedavi giderlerinizi ve acil cerrahi müdahale masraflarınızı karşılayan bu sigorta ürünü, en zor zamanlarda yanınızda olur. Doktorum Benimle Ol, sigortalıların acil sağlık durumlarında anında müdahale edebilmeleri ve en iyi sağlık hizmetlerine erişebilmeleri için hazırlanmıştır. Genel ve özel şartlar dahilinde ve poliçede belirtilen limitler doğrultusunda acil sağlık giderleriniz karşılanır.</h3>
            <h4 id="sigorta-nedir">Doktorum Benimle Ol Nedir?</h4>
            <p>Doktorum Benimle Ol, beklenmedik acil sağlık durumlarında hızlı ve etkili müdahale için tasarlanmış bir sigorta ürünüdür. Kaza sonucu yaralanmalar, ani hastalık durumları, acil cerrahi müdahaleler ve acil tıbbi müdahale gerektiren tüm durumlarda sağlık giderlerinizi güvence altına alır. Acil durumlarda hastane masraflarınızı, acil tedavi giderlerinizi ve acil cerrahi müdahale masraflarınızı karşılayan bu sigorta ürünü, en zor zamanlarda yanınızda olur.</p>
            <h4 id="avantajlar">Doktorum Benimle Ol'un Sunduğu Avantajlar Nelerdir?</h4>
            <ul className="prop-list">
              <li>Acil durumlarda hızlı müdahale imkanı sağlar.</li>
              <li>Geniş hastane ağında acil tedavi imkanı sunar.</li>
              <li>Ambulans hizmeti dahildir.</li>
              <li>7/24 acil sağlık danışmanlık hizmeti alırsınız.</li>
              <li>Acil durumlarda direkt ödeme imkanı sağlar.</li>
              <li>Bekleme süresi olmadan acil durumlar için anında teminat aktif olur.</li>
            </ul>
            <h4 id="teminat-kapsami">Doktorum Benimle Ol'un Kapsamı Nedir?</h4>
            <p>Doktorum Benimle Ol kapsamında acil durumlarda yatarak tedavi giderleri, acil cerrahi müdahale masrafları, acil ilaç ve tıbbi malzeme giderleri, acil tetkik ve görüntüleme giderleri, acil yoğun bakım masrafları ve ambulans hizmeti giderleri karşılanır. Anlaşmalı hastanelerde direkt ödeme imkanı sağlanırken, anlaşmalı olmayan hastanelerde de belirli limitler dahilinde geri ödeme yapılır. Katkı payı (prim) yaşa göre değişir ve 0-64 yaş arası T.C. sınırlarında daimi ikamet eden tüm bireyler yararlanabilir.</p>
            <h4>Doktorum Benimle Ol'un Acil Durum Kapsamı Nelerdir?</h4>
            <p>Acil durum kapsamını genel olarak şu şekilde sıralayabiliriz:</p>
            <ul className="prop-list">
              <li>Kaza sonucu yaralanmalar ve acil müdahale gerektiren durumlar</li>
              <li>Ani hastalık durumları ve acil tedavi gerektiren sağlık sorunları</li>
              <li>Acil cerrahi müdahaleler</li>
              <li>Acil yoğun bakım ihtiyacı</li>
              <li>Acil ilaç ve tıbbi malzeme ihtiyacı</li>
              <li>Acil tetkik ve görüntüleme işlemleri</li>
              <li>Ambulans ve acil nakil hizmetleri</li>
            </ul>
            <h4>Doktorum Benimle Ol'da Hangi Durumlar Kapsam Dışıdır?</h4>
            <p>Doktorum Benimle Ol kapsamında olmayan durumlar şunlardır:</p>
            <ul className="prop-list">
              <li>Planlı ameliyatlar ve tedaviler</li>
              <li>Kronik hastalıkların rutin takibi</li>
              <li>Estetik amaçlı müdahaleler</li>
              <li>Alkol ve uyuşturucu madde kullanımına bağlı durumlar</li>
              <li>İntihar girişimleri</li>
              <li>Savaş, terör ve benzeri durumlar</li>
            </ul>
            <h4 id="nasil-yaptirilir">Doktorum Benimle Ol Nasıl Yaptırılır?</h4>
            <p>Doktorum Benimle Ol'u en avantajlı ve güvenilir bir şekilde yaptırabilmek için Sigorka.com üzerinden uzman sigorta danışmanları ile iletişime geçerek kendinize en uygun Doktorum Benimle Ol ürününü seçebilirsiniz. Böylelikle bütçenize ve acil sağlık ihtiyaçlarınıza göre sigorta ürünü belirlemeniz kolaylaşır. Aldığınız teklifler içerisinde kendinize en uygun olanı satın alabilmek için Doktorum Benimle Ol başvuru formunu doldurabilirsiniz. Doktorum Benimle Ol, acil durumlarda hızlı müdahale ve en iyi sağlık hizmetlerine erişim sağlamak için tasarlanmıştır.</p>
          </div>
          <div className="col-12 my-5">
            <div className="offer-banner offer-banner-health-bg">
              <div className="offer-banner__content">
                <h3>Doktorum Benimle Ol'a mı ihtiyacınız var?</h3>
                <p>En uygun tekliflerle acil durumlarda sağlığınızı güvence altına almak için hemen teklif alın.</p>
              </div>
              <div className="offer-banner__cta">
                <a className="btn btn-wide btn-tertiary" href="/acil-saglik-teklif" target="_self">
                  Hemen Teklif Alın
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="page-content pt-0">
        <div className="container">
          <h4>Doktorum Benimle Ol Sıkça Sorulan Sorular</h4>
          <FaqList faqs={faqs} />
        </div>
      </section>
    </>
  );
}

