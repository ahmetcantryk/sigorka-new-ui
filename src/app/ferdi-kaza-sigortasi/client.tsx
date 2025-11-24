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
    question: 'Ferdi Kaza Sigortası Zorunlu mudur?',
    answer: 'Hayır, Ferdi Kaza Sigortası isteğe bağlı bir sigorta ürünüdür. Ancak riskli meslek gruplarında çalışan kişiler için ferdi kaza sigortası hayati nitelik taşımaktadır. 26/1/2015 tarihli 2015/7249 sayılı Bakanlar Kurulu Kararı ile yürürlüğe konulan Maden Çalışanları Zorunlu Ferdi Kaza Sigortası ile yeraltı ve yerüstü kömür madenciliği faaliyetinde bulunan gerçek ve tüzel kişilerin söz konusu faaliyetlerin icrası sırasında oluşabilecek kazalar sonucunda tesislerinde üretim hazırlığı faaliyetinde bulunan personeller için sigorta poliçesi yaptırmak zorundadırlar.'
  },
  {
    question: 'Ferdi Kaza Sigortası Ne İşe Yarar?',
    answer: 'Ferdi Kaza Sigortası, sigortalının kazada oluşan maddi kayıplarını karşılamakta ve kaza sonucu oluşan maddi hasarın yanı sıra, ölüm veya sakatlanma gibi sonuçları da kapsamaktadır. Bu sigorta, genellikle özel bir poliçe şeklinde satılır ve sigortalının yaşamında herhangi bir zamanda meydana gelebilecek riskleri teminat altına alır.'
  },
  {
    question: 'Ferdi Kaza Sigortası Fiyatları Ne Kadar?',
    answer: 'Ferdi kazada sigorta ücreti sigorta şirketlerine göre farklılık göstermektedir. Ferdi Kaza Sigortası kapsamında bulunan ek teminat seçenekleri ile poliçe primlerinde değişiklik olabilmektedir. Ferdi kaza sigortası hesaplamaları yaş, meslek risk durumu, seçilen sigorta poliçesi gibi birkaç temel faktöre bağlı olarak yapılmaktadır.'
  }
];

export default function FerdiKazaSigortasiPage() {
  const anchors = productAnchors['ferdi-kaza-sigortasi'];
  const offerLink = getOfferLink('ferdi-kaza-sigortasi');

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
          title: 'Ferdi Kaza Sigortası Teklifi Almak İster misiniz?',
          description: 'Beklenmedik kazalara karşı kendinizi ve ailenizi güvence altına almak için hemen teklif alın.',
          buttonText: 'Hemen Teklif Al',
          buttonLink: '/ferdi-kaza-teklif'
        }}
      />
      <StickyProductNav anchors={anchors} offerLink={offerLink} />
      <ProductBanner
        title1="Yuvam"
        title2="Katılım Ferdi Kaza Sigortası"
        buttonText="Hemen Teklif Alın"
        buttonHref="/ferdi-kaza-teklif"
        size="sm"
      />
      <section className="page-content">
        <div className="container">
          <Breadcrumb
            items={[
              { name: 'Ana Sayfa', href: '/' },
              { name: 'Ürünler', href: '' },
              { name: 'Yuvam', href: '/yuvam' },
              { name: 'Katılım Ferdi Kaza Sigortası' }
            ]}
          />
          <div className="text-content">
            <h3>Hayat, çeşitli sürprizler ile bizi olumlu ya da olumsuz etkileyebilir. Ferdi Kaza Sigortaları, teminatları doğrultusunda, bir kaza sonucunda ihtiyaç duyulabilecek tedavi masrafları için ya da maluliyet, vefat gibi durumlarda devreye girebilir.</h3>
            <h4 id="sigorta-nedir">Ferdi Kaza Katılım Sigortası Nedir?</h4>
            <p>Ferdi Kaza Sigortası; kişilerin başlarına gelebilecek ani ve beklenmedik olaylar nedeniyle uğrayabilecekleri bedensel zararlar veya vefat durumlarını teminat altına alırken, farklı konularda ihtiyaç duyabilecekleri ek fayda hizmetlerini de ücretsiz olarak sunar.</p>
            <h4 id="sartlar">Ferdi Kaza Sigortası Şartları Nelerdir?</h4>
            <ul className="prop-list">
              <li>Birdenbire ve beklenilmeyen bir şekilde intişar eden gazların teneffüsü,</li>
              <li>Yanıklardan ve ani bir hareket neticesinde adale ve sinirlerin incinmesi, burkulması ve kopması,</li>
              <li>Yılan veya haşerat sokması neticesinde husule gelen zehirlenmeler</li>
              <li>Isırılma neticesinde meydana gelen kuduzdan mütevellit vefat hali veya cismani arızalar</li>
            </ul>
            <h4>Ferdi Kaza Sigortası ile Hayat Sigortası Arasındaki Farklar Nelerdir?</h4>
            <p>Ferdi Kaza Sigortası ve Hayat Sigortası kişileri olası kaza durumlarına karşı güvence altına alma işlevi olan iki sigorta türü olsa da aralarında temel farklılıklar bulunmaktadır.</p>
            <p>Hayat Sigortası;</p>
            <ul className="prop-list">
              <li>Her türlü ölüm durumunu güvence haline alır.</li>
              <li>Kişiler hastalık durumlarında sağlık hizmetlerinden yararlanabilirler.</li>
            </ul>
            <p>Ferdi Kaza Sigortası ;</p>
            <ul className="prop-list">
              <li>Yalnızca kaza sonucu vefat durumunu güvence altına alır.</li>
              <li>Sağlık masraflarının karşılanması için kişilerin kaza sonucu fiziksel hasar almaları gerekir.</li>
            </ul>
            <h4>Ferdi Kaza Sigortası Genel Şartları Nelerdir?</h4>
            <p>Ferdi Kaza Sigortasının genel şartları Türkiye Sigortalar Birliği tarafından belirlenmiştir. Ferdi kaza sigortası genel şartları kapsamında, kaza sonucu geçici ya da sürekli olarak iş yapma yeteneğini kaybetmiş veya vefat etmiş olan sigorta sahibine maddi tazminat ödenmektedir. Ferdi Kaza Sigortasının genel şartları sigortalı kişinin günlük yaşantısında başına gelebilecek olası kazanın sonuçlarına ve bu sonuçların teminatlarına ilişkin sınırlar çizmektedir. Bu genel şartlar kişinin sözleşme süresince geçerliliğini korumaktadır.</p>
            <h4>Ferdi Kaza Sigortası Genel Şartları</h4>
            <ul className="prop-list">
              <li>Ferdi kaza sigortası kapsamında beklenmeyen biçimde ortaya çıkan gazların solunması sonucunda gerçekleşen zararlar teminat altına alınmaktadır.</li>
              <li>Ferdi kaza sigortası kapsamında kişi alkollüyken kaza gerçekleşmiş ise teminat alınamamaktadır. Bu şart ferdi kaza poliçesi yapılmadan önce kabul edilmelidir.</li>
              <li>Olası kaza sonucunda kişinin adele ve sinirlerinin zarar görmesi ve vücudunda yanık meydana gelmesi durumunda teminattan faydalanılabilmektedir.</li>
              <li>Kişinin ısırılması ile kuduz sonucunda vefat durumu varsa sigortalı kişinin yakınları teminattan faydalanabilmektedir.</li>
              <li>Bir hastalık sonrası, kaza durumu yoksa teminat alınamamaktadır.</li>
              <li>Genel şartlar kapsamında grev, savaş, lokavt ve isyan sonrası alınan fiziki zararların sigorta kapsamı içinde olmadığı kabul edilmelidir.</li>
              <li>Kişinin intihar sonucunda vefat etmesi durumunda yakınların teminattan faydalanamayacağı kabul edilmelidir.</li>
              <li>Sigorta poliçesinde temel alınan kaza tanımı kişinin iradesi dışında meydana gelen beklenmedik durumlar için yapılmaktadır Bu kural değiştirilemez.</li>
            </ul>
            <h3>Sayılan söz konusu şartlar kapsamında kişiler Ferdi Kaza Sigortası teminatı altında olmaktadır. Ancak Ferdi Kaza Sigortası teminatı dışındaki haller için sigorta şirketleri tarafından ödeme yapılmamaktadır. Ferdi Kaza Sigortası genel şartları kapsamında kaza sayılmayan durumlar ile sigorta dışında kalan durumlar için sigorta şirketleri muaftır.</h3>
            <h4 id="kapsam-disi-durumlar">Ferdi Kaza Sigortası Kapsamında Kaza Sayılmayan Durumlar</h4>
            <ul className="prop-list">
              <li>Sigorta kapsamında bulunmayan bir kaza sonucunda gerçekleşen sıcaklık, boğulma, güneş çarpması, tıkanıklık ve donma gibi durumlar</li>
              <li>Akıl ve ruh sağlığı farketmeksizin kişinin intihara teşebbüste bulunduğu durumlar</li>
              <li>Her türlü hastalık durumları</li>
              <li>Motosiklet kullanımı ile takma motorlu bisiklet kullanımı</li>
              <li>Spor müsabakaları ile sürat yarışları</li>
              <li>Ferdi kaza sigortası kapsamına giren bir kazanın neden olmadığı durumlarda gerçekleşen cerrahi müdahaleler ile herhangi bir tıbbi işlemi yol açtığı sakatlıklar ve vefat durumu</li>
              <li>Havada yolcu sıfatı dışında bir sıfat ile uçuş durumu</li>
              <li>Deprem, yanardağ püskürmesi, yer kayması ve sel gibi doğal afetler</li>
              <li>Açık deniz balıkçılığı, sürek ve sürgün avları, vahşi hayvan avcılığı, yaban domuzu avcılığı ile yüksek dağlarda avcılık durumları</li>
              <li>Buzul ve dağlara tırmanma ile yapılan dağcılık, kar veya buz üzerinde gerçekleştirilen bütün sporlar (hokey, kayak, patinaj, boksley), manialı binicilik, eskrim, cirit oyunu, basketbol, boks, güreş, halter, rugby, polo, futbol ve yelken sporları ile profesyonel spor hareketleri ve ağır, tehlikeli spor hareketleri</li>
              <li>Alkol, uyuşturucu madde etkisinde gerçekleşen kazalar</li>
            </ul>
            <h4 id="teminatlar">Ferdi Kaza Sigortasının Teminatları Nelerdir?</h4>
            <ul className="prop-list">
              <li>Kaza Sonucu Ölüm Tazminatı</li>
              <li>Kaza Sonucu Sürekli Sakatlık Tazminatı</li>
              <li>Kaza Sonucu Tedavi Masrafları</li>
              <li>Kaza Sonucu İş Görememezlik Halinde Günlük Tazminat</li>
            </ul>
            <h4 id="avantajlar">Ferdi Kaza Sigortasının Avantajları Nelerdir?</h4>
            <p>Ferdi Kaza Sigortası ile;</p>
            <ul className="prop-list">
              <li>Tüm kazalarda teminat altına alınırsınız.</li>
              <li>İhtiyacınıza göre özelleşen sigorta seçeneklerinden yararlanırsınız.</li>
              <li>Vergi avantajı elde edersiniz.</li>
              <li>Ayrıcalıklı asistans hizmetlerinden faydalanırsınız.</li>
            </ul>
            <h4>Ferdi Kaza Sigortası Kimlere Yapılır?</h4>
            <p>Beklenmedik risk durumlarına karşı kişiler için bir güvence niteliği taşıyan bireysel ferdi kaza sigortası, kendini güvence altına almak isteyen herkes tarafından yapılabilmektedir. Ancak riskli meslek gruplarında çalışan kişiler için ferdi kaza sigortası hayati nitelik taşımaktadır. 26/1/2015 tarihli 2015/7249 sayılı Bakanlar Kurulu Kararı ile yürürlüğe konulan Maden Çalışanları Zorunlu Ferdi Kaza Sigortası ile yeraltı ve yerüstü kömür madenciliği faaliyetinde bulunan gerçek ve tüzel kişilerin söz konusu faaliyetlerin icrası sırasında oluşabilecek kazalar sonucunda tesislerinde üretim hazırlığı faaliyetinde bulunan personeller için sigorta poliçesi yaptırmak zorundadırlar. Zorunlu ferdi kaza sigortası kapsamında, ani ortaya çıkan gazların solunması, yanık ve ani hareketler sonucunda oluşan sinir zararları da kaza olarak değerlendirilmektedir.</p>
            <p>Ferdi kaza sigortası yaş sınırı 65 olmakla birlikte, 16 ile 65 yaş arası her vatandaş sigortalanabilmektedir. Ancak 16 yaşından küçükler ile 65 yaşından büyüklere ferdi kaza sigortası belirli esaslar dahilinde uygulanmaktadır. 16 yaşından küçük kişiler için vefat teminatı faturalanmış cenaze masrafları ile sınırlandırılmıştır. 65 yaşından büyük kişiler için ise sürekli sakatlık teminatı, vefat teminatının %10&apos;u ile sınırlıdır. Söz konusu teminat maksimum 70 yaşına kadar geçerlidir.</p>
          </div>
          <div className="col-12 mb-4">
            <div className="offer-banner offer-banner-home-bg">
              <div className="offer-banner__content">
                <h3>Katılım Ferdi Kaza Sigortasına mı ihtiyacınız var?</h3>
                <p>En uygun Katılım Ferdi Kaza teklifleri için tıklayınız.</p>
              </div>
              <div className="offer-banner__cta">
                <a className="btn btn-wide btn-tertiary" href="/ferdi-kaza-teklif" target="_self">
                  Hemen Teklif Alın
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="page-content pt-0">
        <div className="container">
          <h4>Ferdi Kaza Sigortası Hakkında Sıkça Sorulan Sorular</h4>
          <FaqList faqs={faqs} />
        </div>
      </section>
    </>
  );
} 