/**
 * Özel Sağlık Sigortası Ürün Detay Sayfası - Client Component
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
    question: 'Özel Sağlık Sigortası Poliçeme Çocuğumu Ekletmek İstiyorum Yaş Sınırı Var mı?',
    answer: 'Evet, 24 yaş ve üzeri çocuk kapsamında değerlendirilmemektedir. 24 yaş altı çocuklarınızı aile poliçesi olarak ekletebilirsiniz.'
  },
  {
    question: 'Özel Sağlık Sigortası Yurt Dışında Geçerli mi?',
    answer: 'Poliçenize yurtdışı tedavi teminatı ekletmeniz durumunda geçerlidir.'
  },
  {
    question: 'Özel Sağlık Sigortasında Anlaşmasız Kurumlardaki Tedavi Giderlerim Karşılanıyor mu?',
    answer: 'Evet, poliçenizin anlaşmasız kurum teminat ve limitleri dâhilinde fatura ve evraklarınızı sigorta şirketine ilettiğinizde sonradan ödeme yapılabilmektedir.'
  },
  {
    question: 'Sağlık Sigortasında Anlaşmalı Kurum Nedir?',
    answer: 'Anlaşmalı kurum, poliçenizi yaptırdığınız sigorta şirketiyle anlaşmalı olan özel hastanelere denilmektedir.'
  },
  {
    question: 'Özel Sağlık Sigortasında Doğum Teminatı Satın Aldım Bekleme Süresi Var mı?',
    answer: 'Evet, Özel Sağlık Sigortalarında doğum teminatıyla ilgili 5 ay bekleme süresi bulunmaktadır.'
  },
  {
    question: 'Özel Sağlık Sigortalarında Ömür Boyu Yenileme Garantisi Hakkı Nasıl Kazanılır?',
    answer: "Ömür boyu yenileme garantisi sigorta şirketlerinin genel ve özel şartlarına göre değişkenlik göstermektedir. Ancak en genel ifade ile kesintisiz 3 yıl sigortalı olmak ve hasar prim oranınızın %100'ün altında olması olarak ifade edebiliriz."
  },
  {
    question: 'Özel Sağlık Sigortalarında İndirim Var mı?',
    answer: 'Evet, Özel Sağlık Sigortalarında aile indirimi vardır. Sigorta şirketine göre özel indirimler uygulanabilmektedir.'
  },
  {
    question: 'Özel Sağlık Sigortam Var. Eş ve Çocuklarımı Dâhil Edebilir miyim?',
    answer: 'Evet, poliçe satın alırken eş ve çocuklarınızı poliçenize dâhil edebilirsiniz. Mevcut poliçenize sadece yeni evlilik ile eş, yeni doğum ile çocuk eklenebilmektedir. Bunlar dışında poliçenizin vade ortasında ekleme yapılmamaktadır.'
  },
  {
    question: 'Özel Sağlık Sigortası Süresi Nedir?',
    answer: 'Poliçe başlangıç tarihi itibariyle 1 yıldır.'
  },
  {
    question: 'Özel Sağlık Sigortasından Kimler Faydalanabilir?',
    answer: "Özel sağlık sigortası için SGK şartı yoktur. 0-64 yaş arası herkes faydalanabilir. Türkiye'de ikamet eden yabancı kimlik sahibi kişiler de özel sağlık sigortasından yararlanabilirler."
  }
];

// Banner Area Component - Shows form
const BannerArea = () => {
  const branchConfig = getBranchConfig('ozel-saglik');

  if (!branchConfig) {
    return null;
  }

  return (
    <section id="ozel-saglik-form-banner" className="cover product-page-banner">
      <div className="container">
        <h1 className="pp-product-title">Özel Sağlık Sigortası</h1>
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
              { name: 'Özel Sağlık Katılım Sigortası' }
            ]}
          />
          <div className="text-content">
            <h3>Beklenmedik bir kaza veya hastalık sonucu oluşacak sağlık giderlerinizin yanı sıra sağlığınız için ihtiyaç duyacağınız her türlü tanı ve tedavi işlemlerini, en seçkin sağlık kurumlarında en modern yöntemlerle ve mali kaygı duymadan karşılanması için hazırlanmış sigortalardır. Sağlık giderleriniz, genel ve özel şartlar dahilinde ve poliçede belirtilen limitler doğrultusunda karşılanır. Özel Sağlık Katılım Sigortası, sigortalıların sigorta dönemi içinde karşılaşabileceği bir kaza ve hastalık durumunda acil yardım, doktor, ilaç, tetkik, hastane tedavi ve cerrahi operasyon giderlerini karşılayan bir güvencedir. Sigortalılara bir sağlık problemi ile karşılaştıklarında diledikleri doktor ya da sağlık kurumunu seçme özgürlüğü sağlayarak, yaptırdıkları tedaviler ile ilgili yüksek tedavi giderlerini karşılayıp en zor zamanlarda en büyük yardımcısı olmaktadır.</h3>
            <h4 id="sigorta-nedir">Özel Sağlık Katılım Sigortası Nedir?</h4>
            <p>Özel Sağlık Katılım Sigortası, beklenmedik kaza veya hastalık durumlarında seçkin özel hastanelerde en modern yöntemler uygulanarak her türlü tanı ve tedavi giderlerini poliçede belirtilen şartlar dahilinde güvence altına alır. İhtiyacınıza özel olarak düzenlenen Özel Sağlık Katılım Sigortamızın ayrıca sunduğu avantajlı hizmetlerle, yılda bir kez diş bakım paketi ve check-up hizmetinden yararlanabilir, acil kara ambulansı ve online sağlık paketine sınırsız sahip olabilirsiniz.</p>
            <h4 id="avantajlar">Özel Sağlık Katılım Sigortasının Sunduğu Avantajlar Nelerdir?</h4>
            <ul className="prop-list">
              <li>Anlaşmalı olmayan özel hastanelerden de yararlanırsınız.</li>
              <li>Vergi avantajı elde edersiniz.</li>
              <li>Faizsiz sigorta güvencesine alınırsınız.</li>
              <li>Sınırsız ve ücretsiz kara ambulansından yararlanırsınız.</li>
              <li>7/24 ücretsiz Tıbbi Danışmanlık Hizmeti alırsınız.</li>
            </ul>
            <h4 id="teminat-kapsami">Özel Sağlık Katılım Sigortasının Kapsamı Nedir?</h4>
            <p>Anlaşmalı özel hastanelerde suni uzuv hariç yatarak tedavi giderleri limitsiz karşılanır. Suni Uzuv yıllık 10.000 TL limitlidir. Anlaşmalı olmayan özel hastanelerde ise yıllık 50.000 TL limit ve %20 katılım payı ile karşılanır. Ayakta tedavi giderleri anlaşmalı özel hastanelerde 5.000 TL limit ve %20 katılım payı ile; anlaşmalı olmayan özel hastanelerde ise yıllık 5.000 TL limit ve %40 katılım payı ile karşılanır. Katkı payı (prim) yaşa göre değişir. 0-69 yaş arasında T.C. sınırlarında daimi ikamet eden yabancı uyruklu kişiler yararlanır. Katkı payı (prim) ödemeleri Albaraka Türk ve Kuveyt Türk Katılım Bankaları hesaplarından veya tüm kredi kartlarından peşin, anlaşmalı kredi kartlarından 9 taksite kadar ödenir.</p>
            <h4>Özel Sağlık Katılım Sigortasının Ayakta Teminat Kapsamı Nelerdir?</h4>
            <p>Ayakta tedavi kapsamını genel olarak şu şekilde sıralayabiliriz:</p>
            <ul className="prop-list">
              <li>Röntgen, tomografi, MR gibi tanı ve ileri tanı için uygulanan yöntemler</li>
              <li>Rutin kontroller</li>
              <li>Muayene masrafları</li>
              <li>Reçeteli ilaç masrafları</li>
              <li>Fizik tedavi</li>
              <li>Rehabilitasyon</li>
              <li>Teminat kapsamındaki tahliller</li>
            </ul>
            <h4>Özel Sağlık Katılım Sigortasının Yatarak Teminat Kapsamı Nelerdir?</h4>
            <p>Özel Sağlık Sigortası'nın yatarak tedavi kapsamına girebilen bazı tedaviler ve sağlık hizmetleri şunlardır:</p>
            <ul className="prop-list">
              <li>Radyoterapi</li>
              <li>Diyaliz</li>
              <li>Kemoterapi</li>
              <li>İlaç masrafları</li>
              <li>Yatarak tedaviye ait olan rehabilitasyon masrafları</li>
              <li>Fizik tedavi</li>
              <li>Bazı ameliyatlar (Kaza veya hastalık sonucu yapılması gereken estetik ameliyatları da dahil)</li>
              <li>Tedaviniz sırasında yanınızda kalacak kişinin (refakatçinin) giderleri</li>
              <li>Ameliyat öncesinde ve sonrasında yapılması gereken bazı tetkikler</li>
              <li>Yoğun bakım harcamaları</li>
              <li>Laboratuvar testleri</li>
            </ul>
            <p>Yatarak tedavi teminatı konusunda dikkat edilmesi gereken konulardan biri hastalıklardır. ÖSS poliçesini düzenlerken planlı bir ameliyat veya tedavi teminat altına alınamaz. Bu nedenle ilk kez yaptırılacak Özel Sağlık Sigortası'nın bazı hastalıklar için 3 ay bekleme süresi bulunur. Yani ilk 3 ay bazı hastalıkların tedavileri sigorta kapsamı dışında kalır. Ancak bu süre sonunda söz konusu sağlık sorunu için tedaviler karşılanır.</p>
            <h4 id="nasil-yaptirilir">Özel Sağlık Katılım Sigortası Nasıl Yaptırılır?</h4>
            <p>Özel Sağlık Katılım Sigortası'nı en avantajlı ve güvenilir bir şekilde yaptırabilmek için Sigorka.com üzerinden uzman sigorta danışmanları ile iletişime geçerek kendinize en uygun Özel Sağlık Katılım Sigortası ürününü seçebilirsiniz. Böylelikle bütçenize ve özel sağlık ihtiyaçlarınıza göre sigorta ürünü belirlemeniz kolaylaşır. Aldığınız teklifler içerisinde kendinize en uygun olanı satın alabilmek için Özel Sağlık Sigortası başvuru formunu doldurabilirsiniz. Dilerseniz özel sağlık sigortası yaptırdıktan sonra sigorta şirketinizi değiştirebilirsiniz. Türkiye'de bulunan yabancılar da oturma izinleri varsa ÖSS yaptırabilir. Oturma izinleri yoksa yabancılar için özel olan sağlık sigortasına başvurmaları gerekir.</p>
          </div>
          <div className="col-12 my-5">
            <div className="offer-banner offer-banner-health-bg">
              <div className="offer-banner__content">
                <h3>Özel Sağlık Katılım Sigortasına mı ihtiyacınız var?</h3>
                <p>En uygun tekliflerle sağlığınızı güvence altına almak için yukarıdaki formu doldurun.</p>
              </div>
              <div className="offer-banner__cta">
                <a 
                  className="btn btn-wide btn-tertiary" 
                  href="#ozel-saglik-form-banner"
                  onClick={(e) => {
                    e.preventDefault();
                    const bannerElement = document.getElementById('ozel-saglik-form-banner');
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

export default function OzelSaglikSigortasiPage() {
  const anchors = productAnchors['ozel-saglik-sigortasi'];
  const offerLink = '#ozel-saglik-form-banner';

  useEffect(() => {
    document.body.classList.add('product-detail-page');
    return () => document.body.classList.remove('product-detail-page');
  }, []);

  // Sayfa içi teklif linklerini banner'a yönlendir
  useEffect(() => {
    const handleOfferLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href*="/ozel-saglik-sigortasi"], a[href="#ozel-saglik-form-banner"]');
      
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        
        const bannerElement = document.getElementById('ozel-saglik-form-banner');
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
        formBannerId="ozel-saglik-form-banner"
      />
      
      <ProductDetailContent />

      <section className="page-content pt-0">
        <div className="container">
          <h4>Özel Sağlık Katılım Sigortası Sıkça Sorulan Sorular</h4>
          <FaqList faqs={faqs} />
        </div>
      </section>
    </>
  );
}
