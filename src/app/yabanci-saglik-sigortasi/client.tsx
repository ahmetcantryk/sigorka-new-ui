/**
 * Yabancı Sağlık Sigortası Ürün Detay Sayfası - Client Component
 * 
 * Banner içinde offline talep formu gösterir
 * Kasko/TSS ile aynı yapıda
 */

"use client";

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Breadcrumb from '../components/common/Breadcrumb';
import FaqList from '../components/common/FaqList';
import StickyProductNav from '../components/common/StickyProductNav';
import { productAnchors } from '../../config/productAnchors';
import { getBranchConfig } from '@/components/ProductPageFlow/OfflineFlow';
import '../../styles/subpage.min.css';
import '../../styles/armorbroker.css';
import '../../styles/product-flow/product-page-flow.css';

// Dynamic import for better code splitting
const OfflineProductForm = dynamic(
  () => import('@/components/ProductPageFlow/OfflineFlow').then(mod => mod.OfflineProductForm),
  { ssr: false }
);

const faqs = [
  {
    question: "Misafirim Güvende Sağlık Sigortası Nedir?",
    answer: "Misafirim Güvende Sağlık Katılım Sigortası, 16.06.2021 tarihli ve 2021/8 sayılı Vize ve İkamet Taleplerinde Yaptırılacak Sağlık Sigortalarına İlişkin Genelge'de belirlenen asgari şartlar gereğince ikamet izni talebinde bulunan yabancı uyruklu (T.C. vatandaşı olmayan) kişilere sunulur. Yabancı uyruklu misafirlerimizin Türkiye'deki ikametleri boyunca yararlanabilecekleri ayakta ve yatarak tedavilere ilişkin sağlık giderleri güvencemiz altına alınır."
  },
  {
    question: "Yabancı Sağlık Sigortası Kapsamı Nedir?",
    answer: "Yabancı sağlık sigortası kapsamı Hazine Müsteşarlığı'nın belirlediği limit ve teminat dahilinde yatarak tedavi teminatı limitsiz %100, ayakta tedavi teminatı 5000 TL limitli %20 katılım paylıdır. Yatarak tedaviler de 9 ay, ayakta tedavilerde 6 ay bekleme süresi vardır."
  },
  {
    question: 'Yabancı Sağlık Sigortası Zorunlu mu?',
    answer: 'Evet, 18-65 yaş yabancı uyruklu kişilerin ikamet izni başvurularında göç idaresine teslim edilmesi gereken bir sigortadır.'
  },
  {
    question: 'Yabancı Sağlık Sigortası Poliçem Var. Çocuklarım da Faydalanabilir mi?',
    answer: 'Hayır, her aile bireyi için poliçe düzenlenmesi gerekmektedir.'
  },
  {
    question: 'Yabancı Sağlık Sigortasının Süresi Nedir?',
    answer: 'Yabancı Sağlık Sigortaları 1 ve 2 yıl olarak düzenlenmektedir.'
  },
  {
    question: 'Yabancı Sağlık Poliçesi İptal Edilir mi?',
    answer: 'Evet, ancak ilgili kanun genelgesine uygun şartların yerine getirilmesi koşuluyla iptal edilebilir.'
  },
  {
    question: 'Yabancı Sağlık Sigortası Devlet Hastanesinde Geçer mi?',
    answer: 'Hayır, ancak anlaşmasız kurum olarak fatura ödemesi sigorta şirketi tarafından değerlendirmeye alınabilir.'
  },
  {
    question: 'Yabancı Sağlık Sigortası Hangi Hastanelerde Kullanılır?',
    answer: 'Sigorta şirketlerinin Yabancı Sağlık Sigortası ürünü ile anlaşmalı olduğu özel hastanelerde geçerlidir.'
  },
  {
    question: "Yabancı Sağlık Sigortası'nı Kimler Satın Alabilir?",
    answer: "0-70 yaş arası Türkiye'de bulunan yabancı uyruklu vatandaşlar satın alabilir."
  }
];

// Banner Area Component - Shows form
const BannerArea = () => {
  const branchConfig = getBranchConfig('yabanci-saglik');

  if (!branchConfig) {
    return null;
  }

  return (
    <section id="yabanci-saglik-form-banner" className="cover product-page-banner">
      <div className="container">
        <h1 className="pp-product-title">Yabancı Sağlık Sigortası</h1>
        <OfflineProductForm branchConfig={branchConfig} />
      </div>
    </section>
  );
};

// Product Detail Content Component
const ProductDetailContent = () => {
  return (
    <>
      <BannerArea />
      <section className="page-content">
        <div className="container">
          <Breadcrumb
            items={[
              { name: 'Ana Sayfa', href: '/' },
              { name: 'Ürünler', href: '' },
              { name: 'Sağlığım', href: '/sagligim' },
              { name: 'Yabancı Sağlık Katılım Sigortası' }
            ]}
          />
          <div className="text-content">
            <h3>Yabancı uyruklu kişilerin Türkiye'de ikamet ettikleri süre boyunca yararlanabilecekleri ayakta ve yatarak tedavilere ilişkin sağlık giderlerinin karşılandığı sigorta türüdür. Bu sigortaya sahip olan yabancı uyruklu kişilerin sağlık ihtiyaçları anlaşmalı sağlık kurumlarında poliçede yazılı limit ve oranlar dâhilinde karşılanır.</h3>
            <h4 id="sigorta-nedir">Yabancı Sağlık Sigortası Nedir?</h4>
            <p>Türkiye'de 1 yıl üzeri kalacak olan yabancı uyruklu kişiler, yabancı sağlık sigortası yaptırarak oturma izni alabilir. Türk vatandaşlığı olmayan yabancılar için sağlık sigortası zorunlu bir sigorta türüdür. Hem ikamet izni alabilmek hem de Türkiye'de bulundukları süre boyunca sağlıklarını güvence altına almak için yabancıların bu sigortayı yaptırması gerekir.</p>
            <h4 id="avantajlar">Yabancı Sağlık Katılım Sigortasının Avantajları Nelerdir?</h4>
            <p>Yabancılara özel sağlık sigortası pek çok avantaja sahiptir. Bunları şu şekilde sıralamak mümkündür:</p>
            <ul className="prop-list">
              <li>Türkiye'de ikamet etme başvurusunda bulunan yabancıların; yabancı sağlık sigortasına sahip olması zorunludur. Bu sigorta sayesinde Türkiye'de kaldıkları süre boyunca poliçe kapsamında sağlık hizmetlerinden yararlanabilirler.</li>
              <li>1 ya da 2 yıllık poliçe düzenlenebilir.</li>
              <li>Kaza ve hastalık gibi acil durumlarda hastaneye ulaşım ve tedavi giderleri karşılanır.</li>
              <li>Pek çok ciddi hastalığın tedavisi güvence altına alınır.</li>
              <li>Bu sigorta sayesinde yabancılar, Türkiye'nin herhangi bir şehrinde sağlık hizmeti alabilir.</li>
              <li>Sigorta şirketleri, kredi kartları ile ödeme kolaylığı sağlar.</li>
              <li>Kemoterapi, radyoterapi, ilaç ve diyaliz giderleri de yabancı uyruklu sağlık sigortası tarafından belirli bir bekleme süresinden sonra karşılanır.</li>
            </ul>
            <h4>Yabancılar için Sağlık Sigortası Fiyatları Ne Kadar?</h4>
            <p>Yabancı sağlık sigortası fiyatları, yabancıların ikametgah almaları için zorunlu bir sigorta ve teminatları açısından daha sınırlı olduğu için uygun fiyatlıdır. Sigorta şirketlerine göre Yabancı Sağlık Sigortası fiyatları değişkenlik gösterir. Bu nedenle yabancı sağlık fiyat teklifi alarak güncel bilgilere ulaşabilirsiniz.</p>
            <h4>Yabancıların Sağlık Sigortası Hangi Koşullarda iptal Edilir?</h4>
            <p>Yurt dışından gelen misafirlere sigorta yapılması zorunlu olduğundan iptali de bazı şartlara bağlıdır.</p>
            <ul className="prop-list">
              <li>Mükerrer poliçesinin bulunması (diğer poliçe örneği)</li>
              <li>Oturma izninin iptal olması (göç idaresinden oturma izninin iptal olduğuna dair belge)</li>
              <li>Sigortalının SGK kaydı altına alınması (işe giriş veya SGK'lı bir vatandaş ile evlenme halinde SGK kaydı)</li>
            </ul>
            <h4>Türkiye'de Yeni Doğan veya Çocuk Yabancıların Sağlık Sigortası Nasıl Alınır?</h4>
            <p>Sigortadan 60 yaş ve altı yabancı uyruklu vatandaşlar yararlanır. Poliçe, 65 yaşına kadar yenilenir ve 0-65 yaşındaki kişileri teminat altına alır. 6-17 yaş aralığındaki çocuklar, sigorta ettirenin 18 yaşından büyük olması şartı ile tek başına sigortalanabilir. 15 gün-5 yaş aralığındaki çocuklar ise tek başına sigortalanmamakla birlikte en az bir ebeveyn ile sigortalanabilir. Sigorta ettiren yeni doğan çocuğu, annenin de bu Sigorta Sözleşmesi kapsamında bulunması ve yeni doğan çocuk için doğum tarihinden itibaren 30 gün içerisinde başvuru formu ile başvurması halinde sigortacı teminat kapsamına dâhil edilmesini teklif edebilir. Ancak bu 30 günlük süre aşıldığı takdirde sigorta ettiren, yeni doğan çocuğu bu sigorta sözleşmesinin yineleme tarihinde teminat altına alabilir.</p>
            <h4 id="nasil-teklif-alinir">Yabancılar için En Uygun Sağlık Sigortası Nereden Yapılır?</h4>
            <p>Yabancılar İçin Sağlık Sigortası yaptırmanın en pratik ve güvenli yolu Sigorka.com üzerinden uzman sigorta danışmanları ile iletişime geçmektir. Böylelikle kendinize veya çocuğunuza en uygun Yabancılar Sağlık Katılım Sigortası ürününüzü seçebilirsiniz. Böylelikle bütçenize ve özel sağlık ihtiyaçlarınıza göre sigorta ürününüzü belirleyebilirsiniz. Türkiye'de bulunan yabancılarda oturma izinleri varsa Özel Sağlık Katılım Sigortası da yaptırabilir. Bunun için Özel Sağlık Katılım Sigortası avantajlarımıza bakmayı unutmayın.</p>
          </div>
          <div className="col-12 my-5">
            <div className="offer-banner offer-banner-health-bg">
              <div className="offer-banner__content">
                <h3>Yabancı Sağlık Katılım Sigortasına mı ihtiyacınız var?</h3>
                <p>En uygun tekliflerle sağlığınızı güvence altına almak için yukarıdaki formu doldurun.</p>
              </div>
              <div className="offer-banner__cta">
                <a 
                  className="btn btn-wide btn-tertiary" 
                  href="#yabanci-saglik-form-banner"
                  onClick={(e) => {
                    e.preventDefault();
                    const bannerElement = document.getElementById('yabanci-saglik-form-banner');
                    if (bannerElement) {
                      const offset = 120;
                      const elementPosition = bannerElement.offsetTop - offset;
                      window.scrollTo({
                        top: elementPosition,
                        behavior: 'smooth'
                      });
                    }
                  }}
                >
                  Hemen Teklif Alın
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default function YabanciSaglikSigortasiPage() {
  const anchors = productAnchors['yabanci-saglik-sigortasi'];
  const offerLink = '#yabanci-saglik-form-banner';

  useEffect(() => {
    document.body.classList.add('product-detail-page');
    return () => document.body.classList.remove('product-detail-page');
  }, []);

  // Sayfa içi teklif linklerini banner'a yönlendir
  useEffect(() => {
    const handleOfferLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href*="/yabanci-saglik-sigortasi"], a[href="#yabanci-saglik-form-banner"]');
      
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        
        const bannerElement = document.getElementById('yabanci-saglik-form-banner');
        if (bannerElement) {
          const offset = 120;
          const elementPosition = bannerElement.offsetTop - offset;
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }
      }
    };

    document.addEventListener('click', handleOfferLinkClick, true);

    return () => {
      document.removeEventListener('click', handleOfferLinkClick, true);
    };
  }, []);

  return (
    <>
      <StickyProductNav 
        anchors={anchors} 
        offerLink={offerLink}
        enableMobileScrollBasedVisibility={true}
        formBannerId="yabanci-saglik-form-banner"
      />
      
      <ProductDetailContent />

      <section className="page-content pt-0">
        <div className="container">
          <h4>Yabancı Sağlık Sigortası ile İlgili Sıkça Sorulan Sorular</h4>
          <FaqList faqs={faqs} />
        </div>
      </section>
    </>
  );
}
