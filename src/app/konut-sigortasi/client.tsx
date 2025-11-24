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
    question: 'Konut Sigortası İle Kombi Bakımı Yaptırabilir miyim?',
    answer: 'Konut Sigortası yapan bazı ve birçok firma poliçe süresi boyunca ücretsiz kombi bakım hizmeti sağlar. Kombi bakımı hizmeti yılda bir veya iki defa olmak şartıyla ücretsizdir.'
  },
  {
    question: 'Konut Sigortası Hasar Ödemesi Nasıl Yapılır?',
    answer: 'Poliçe sahibi sigortalının evinde hasar olması durumunda hasar bildirimi yapmak zorundadır. Hasar bildirildikten sonra, konut hasarı tutanağı tutulur. Daha sonra ise ekspertiz işlemleri gerçekleşir ve sigortalı ile sigorta şirketinin anlaşması durumunda hasar ödemesi yapılır.'
  },
  {
    question: 'Konut Sigortasında Teminat Dışında Kalan Durumlar Nelerdir?',
    answer: `Askeri hareketler sonucunda oluşan zararlar, savaşlar, istila, düşmanların yaptığı hareketler, çarpışma esnasında oluşan zararlar, Nükleer atıkların ve yanıkların sebep olduğu artıkları önlemek amacıyla askerlerin veya inzibatların verdiği zararlar, Kamu otoritesi tarafından Sigorta kapsamına alınmış konut üzerinde verilecek tasarruf kararlarının sonucu çıkan zararlar, Kasti olarak yapılan veya bireysel hatalardan kaynaklandığı ispatlanan yangınların verdiği zararlar, Yangın dışında çıkan konut içindeki eşyaların yakılması, ateşlendirilmesi, sıcaklık verilmesi, kavrulması veya aydınlatmadan, ütü, lamba, sigara ve mumdan oluşan yangınlardan oluşan zararlar, Elektrikli motorun çalışmasından, elektrikli ev aletleri, tesisatı, kısa devre, voltaj düşüklüğü gibi motorların çalışması veya işletilmesinden kaynaklanan yangınlardan oluşan zararlar, Alçak basıncın sebebiyet verdiği, içe doğru oluşan çökme, yırtılma ve buna benzer dezenformasyonların verdiği ve sigortalı motorların yada cihazların oluşturduğu zararlar.`
  },
  {
    question: 'Konut Sigortası Deprem Hasarını Karşılar mı?',
    answer: 'Konut Sigortası poliçenizde "deprem ve yanardağ püskürmesi" teminatı bulunuyorsa olası bir deprem veya yanardağ püskürmesi durumunda gerçekleşecek hasar, teminat limitleriniz kapsamında Sigorta şirketi tarafından karşılanacaktır.'
  },
  {
    question: 'Konut Sigortası Komşuya Verilen Zararı Karşılar mı?',
    answer: 'Evinizi su basması, evinizde yangın çıkması vb. durumlarda komşularınızın da zarar görmesi halinde meydana gelen hasarın sigorta tarafından karşılanması mümkün. Eğer Konut Sigortası poliçenizde "komşu mali sorumluluk" teminatı bulunuyorsa, komşunuzun evinde meydana gelen hasar, teminat limitleriniz dahilin de sigorta tarafından karşılanır.'
  },
  {
    question: 'Konut Sigortası Misafir Zararını Karşılar mı?',
    answer: 'Evinizde meydana gelen yangın, hırsızlık, dahili su vb. durumlarda misafirlerinizin eşyaları zarar görmüşse hasarın sigorta şirketi tarafından karşılanması mümkün. Eğer Konut Sigortası poliçenizde misafir sorumluluk teminatı bulunuyorsa teminat limitleri dahilinde misafirinizin zararı karşılanabilir.'
  },
  {
    question: 'Konut Sigortası Cam Kırılması Karşılar Mı?',
    answer: 'Konut sigortası poliçenize ek olarak alacağınız "cam kırılması teminatı" ile evinizdeki pencere, kapı, tezgah, vitrin, dolap, raf vb. camlar için hasarınızı sigorta şirketi karşılar. Bazı sigorta şirketleri bu camlar üzerindeki süsleme ve yazılar için de teminat verebilmektedir.'
  },
  {
    question: 'İzolasyon Hasarı ile İlgili Teminat Limiti Nedir?',
    answer: 'İzolasyon yetersizliği ya da kaybı nedeniyle yağmur ve kar sularının binanın dış cephe ya da terasından veya pencere, kapı ve pervazlarından sızması nedeniyle meydana gelen zararlar teminat altındadır. Nemlenme ve ısı farkı nedeniyle oluşan terleme ile küflenme sonucu sıva veya boya kabarmaları gibi iç dekorasyonda meydana gelebilecek zararlar da teminata dâhildir.'
  },
  {
    question: 'Konut Poliçesi Alırken Binanın Bedelini Nasıl Belirlemeliyim?',
    answer: 'Konut poliçesinde bina bedelini saptarken yapılması gereken, binanın arsa değerini dışarıda bırakarak binanın yeniden inşa edilmesinin güncel maliyetidir. Çünkü hasar anında ödenecek olan tutar bu bedeli aşamaz. Sigortacılığın temel prensiplerinden biri uğranılan zararın ikame edilmesi, sigortalıyı kara geçirici bir tazminat ödemesi yapılmamasıdır. Bu prensip ışığında sigortalı binada meydana gelen bir hasarla binanın tamamen yıkılması durumunda dahi, arsa değerinde bir kayıp olmayacağı için, ödenecek tazminat binanın o arsa üzerine yeniden inşaa edilmesinin maliyetidir.'
  },
  {
    question: 'Asistans Hizmetleri Poliçemin Hasarsızlığını Bozar mı? Ücretli mi?',
    answer: 'Sigorta şirketlerinin sunmuş olduğu asistans hizmetleri ücretsiz olup gelecek yıl poliçe hasarını bozmamaktadır.'
  },
  {
    question: 'Oturduğum Ev Tapusu Babamın-Annemin Adına Poliçe Benim Adıma Yapılsa Ödeme Yapılır mı?',
    answer: 'Konut Sigortalarında ikamet eden kişiyi sigorta ettiren olarak, tapu sahibini sigortalı olarak belirtmek gereklidir.'
  },
  {
    question: 'Konut Sigortası Zorunlu mu?',
    answer: 'Kanunen zorunlu bir sigorta ürünü değildir. Fakat yılların yatırımıyla edinilen evler ve eşyaların, risklere karşı, korunması için mutlaka sahip olunması gereken bir poliçedir.'
  },
  {
    question: 'Kiracıyım, Konut Poliçesi Yaptırabilir miyim?',
    answer: 'İster kiracı, ister ev sahibi olun konut poliçesi yaptırabilirsiniz. Ev sahibiyseniz, hem eşyalarınızı hem binanızı güvence altına alabilir, kiracıysanız sadece eşya teminatı alarak eşyalarınızı yangın, su baskını, hırsızlık, deprem gibi pek çok riske karşı sigortalatabilirsiniz. Teminat detaylarını poliçenizden kontrol edebilirsiniz.'
  }
];

export default function KonutSigortasiPage() {
  const anchors = productAnchors['konut-sigortasi'];
  const offerLink = getOfferLink('konut-sigortasi');

  useEffect(() => {
    document.body.classList.add('product-detail-page');
    return () => {
      document.body.classList.remove('product-detail-page');
    };
  }, []);

  return (
    <>
      <ConditionalCTAPopup
        condition="inactivity"
        inactivityDelay={15}
        config={{
          title: 'Konut Sigortası Teklifi Almak İster misiniz?',
          description: 'Evinizi yangın, hırsızlık ve doğal afetlere karşı güvence altına almak için hemen teklif alın.',
          buttonText: 'Hemen Teklif Al',
          buttonLink: '/konut-teklif'
        }}
      />
      <StickyProductNav anchors={anchors} offerLink={offerLink} />
      <ProductBanner
        title1="Yuvam"
        title2="Katılım Konut Sigortası"
        buttonText="Hemen Teklif Alın"
        buttonHref="/konut-teklif"
        size="sm"
      />
      <section className="page-content">
        <div className="container">
          <Breadcrumb
            items={[
              { name: 'Ana Sayfa', href: '/' },
              { name: 'Ürünler', href: '' },
              { name: 'Yuvam', href: '/yuvam' },
              { name: 'Katılım Konut Sigortası' }
            ]}
          />
          <div className="text-content">
            <h3>Konut Sigortası, kiracı ya da ev sahibi olmanız fark etmeksizin eviniz ve eşyalarınızı karşılaşabileceğiniz hasarlara karşı teminat altına alan bir sigortadır. Bu poliçe ev ve eşyanın yanı sıra ev içerisinde yaşayanlar ve komşulara ait sorumlulukları da güvence altına almaktadır. Sigorta kapsamında sel ve su baskınından depreme, yangından hırsızlığa kadar oluşabilecek birçok risk yer almaktadır. Konut Paket Sigortası ile yangın, deprem, hırsızlık, fırtına, elektronik aletlerin bozulması gibi birçok riske karşı koruma altına alır. Cam ve Eşya teminatlarında da ilk ateş bedel alternatifli seçenekleri mevcuttur. Aynı zamanda evinizde yaşayan ev halkını da düşünüyoruz ve acil durumlar veya yaşanabilecek kazalar sonucu da çıkabilecek acil tıbbi masraflarınız karşılanır.</h3>
            <h4 id="sigorta-nedir">Katılım Konut Sigortası Nedir?</h4>
            <p>Siz rahat uyuyun diye yaşadığınız tüm mekanı, eşyalarınız ile birlikte birçok riske karşı kapsamlı bir şekilde güvence altına alan sigortadır.Katılım Konut Sigortası ile evinizden eşyalarınıza kadar yaşayacağımız riskler bu poliçeyle güvende. Konut Paket Sigortası ile yangın, deprem, hırsızlık, fırtına, elektronik aletlerin bozulması gibi birçok riske karşı hasarlarınızı telafi etmek artık kolay. Cam ve Eşya teminatlarında da ilk ateş bedel alternatifli seçenekleri mevcuttur. Konut Sigortası ile herhangi bir hasar sonucu evinizi, eşyalarınızı da güvence altına alıyoruz. Aynı zamanda evinizde yaşayan ev halkını da düşünüyoruz ve acil durumlar veya yaşanabilecek kazalar sonucu da çıkabilecek acil tıbbi masraflarınız karşılanır.</p>
            <h4 id="teminatlar">Katılım Konut Sigortası Teminatları Nelerdir?</h4>
            <ul className="prop-list">
              <li>Yangın, yıldırım, İnfilak</li>
              <li>Hırsızlık</li>
              <li>Dahili su</li>
              <li>İzolasyon Eksikliği/Olay Başı-Yıllık</li>
              <li>Sel-Su Baskını</li>
              <li>Fırtına</li>
              <li>Yer kayması</li>
              <li>Deniz Taşıtları Çarpması</li>
              <li>Enkaz kaldırma</li>
              <li>Kar ağırlığı</li>
              <li>Cam kırılması</li>
              <li>GLKHHKNH ve Terör</li>
              <li>Duman</li>
            </ul>
            <h4>Katılım Konut Sigortası Teminatları Dışı Haller Nelerdir?</h4>
            <p>Konut sigortası sorgulama ile poliçenizin teminatlarını öğrenebilir ve hangi avantajlara sahip olduğunuzu da görebilirsiniz. Ancak bazı durumlarda konut sigortasının da karşılamadığı giderler vardır. Konut sigortasında teminat dışı haller şu şekildedir:</p>
            <ul className="prop-list">
              <li>Nükleer yakıttan dolayı oluşan radyasyon bulaşması ve bundan kaynaklanan askeri tedbirlerin yol açacağı giderler</li>
              <li>Sigortalı eşyaların kendi kusurlarından, bozulmalarından ya da kavrulmalarından dolayı meydana gelen hasarlar</li>
              <li>Savaş, isyan, ayaklanma, istila gibi durumlarda oluşan zararlar</li>
              <li>Sigortalı eşyaların ateşe ya da sıcağa tutulmasından, ocağa ya da ateş bulunan yerlere düşmesinden dolayı oluşan hasarlar</li>
              <li>Kamu otoritesinin sigortalı eşyalar üzerinde tasarruf yapmasından dolayı meydana gelen zararlar</li>
              <li>Elektrikli motora sahip aletlerin kısa devre, topraklanma vb. sonucu alabilecekleri hasarlar</li>
              <li>Alçak basınç dolayısıyla kapıların içeriye çökmesi, yıpranması ya da yırtılması sonucu oluşan zararlar</li>
            </ul>
            <h4>Konut Sigortası Zorunlu Mudur?</h4>
            <p>Konut sigortası yaptırmak zorunlu değildir. Ancak yasal zorunluluk olmasa bile geniş güvenceler sunduğu için sıklıkla tercih edilen bir sigortadır.</p>
            <h4>Konut Sigortası Hesaplama Nasıl Yapılır?</h4>
            <p>Konut sigortası fiyatları yani ödenecek katkı payları (primler), konutunun bulunduğu il ve ilçeye, metrekaresine, binanın yapı tarzına, konutunun bulunduğu kata, alınan güvenlik önlemlerine ve poliçede yer alan teminatlara göre belirlenir. Örneğin poliçenizde bina teminatı olmadan sadece evinizin içindeki eşyaları teminat altına alabilirsiniz.</p>
            <h4 id="nasil-teklif-alinir">En Uygun Konut Sigortası Teklifi Nasıl Alınır?</h4>
            <p>Aşağıdaki bilgiler ile doğru teminatı, uygun fiyat seçenekleriyle <a href="/konut-sigortasi" target="_self">Sigorka.com</a> web sitemizden teklif alabilirsiniz.</p>
            <ul className="prop-list">
              <li>TC kimlik numarası / Yabancı kimlik numarası</li>
              <li>Doğum tarihi</li>
              <li>Riziko adresi ya da UAVT numarası</li>
              <li>Cep numarası</li>
              <li>Brüt metrekare</li>
              <li>Bina yapı tarzı (ahşap, betonarme vb.)</li>
              <li>Bina inşa yılı</li>
              <li>Binanın kaç katlı olduğu ve dairenin bulunduğu kat sayısı</li>
              <li>Bina bedeli</li>
              <li>Dekorasyon bedeli</li>
              <li>Eşya bedeli</li>
              <li>Cam bedeli</li>
            </ul>
            <h4 id="faydalari">Konut Sigortası Yaptırmanın Faydaları Nelerdir?</h4>
            <ul className="prop-list">
              <li>Konutunuzun hasar riskine karşı maddi güvence altına alınmasını sağlar.</li>
              <li>Doğal afet ve hırsızlık gibi durumlarda evde meydana gelebilecek maddi hasarı karşılar.</li>
              <li>Yalnızca konutu değil, konut içindeki eşyaları da sigortalayarak bunları güvenceye alır.</li>
              <li>Sigorta poliçesine ekleteceğiniz teminatlar sayesinde herhangi bir acil durumda tesisatçı, çilingir, tıbbi destek gibi hizmetlere ücretsiz bir şekilde ulaşabilmenizi sağlar.</li>
              <li>Enflasyondan kaynaklanan değer kayıplarını karşılar.</li>
              <li>Herhangi bir çökme durumunda zararla birlikte enkaz giderlerini de karşılar.</li>
              <li>DASK sigortasının deprem sonucu meydana gelen zararlarda teminat dışı bıraktığı durumları, konut sigortası karşılar. Bu sayede DASK&apos;ın karşılamadığı limitleri karşılayarak size maddi güvence sunar.</li>
            </ul>
          </div>
          <div className="col-12 mb-4">
            <div className="offer-banner offer-banner-home-bg">
              <div className="offer-banner__content">
                <h3>Katılım Konut Sigortasına mı ihtiyacınız var?</h3>
                <p>En uygun Katılım Konut teklifleri için tıklayınız.</p>
              </div>
              <div className="offer-banner__cta">
                <a className="btn btn-wide btn-tertiary" href="/konut-teklif" target="_self">
                  Hemen Teklif Alın
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="page-content pt-0">
        <div className="container">
          <h4>Konut Sigortası Hakkında Sıkça Sorulan Sorular</h4>
          <FaqList faqs={faqs} />
        </div>
      </section>
    </>
  );
} 