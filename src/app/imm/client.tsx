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
    question: 'IMM ne zaman devreye girer?',
    answer: 'İMM, trafik sigortasının tavan sigorta bedelinin toplam hasarı karşılamaya yetmediği zaman devreye giren bir teminattır. Yani kalan hasarı poliçede yer alan limitlere göre karşılar.'
  },
  {
    question: 'IMM poliçem en az ne kadar olmalı?',
    answer: '3.000.000 TL, 10.000.000 TL gibi limitli ve sınırsız İMM olarak adlandırılan limitsiz paket seçenekleri mevcuttur. İhtiyaçlarına ve bütçene göre İMM paketini kendin seçebilirsin. 10.000.000 TL gibi limiti olan paketler belirli bir sınır dahilinde hasarı karşılar.'
  },
  {
    question: 'Sınırsız IMM nasıl yapılır?',
    answer: 'Limitsiz İMM Sigortası yaptırmanız için Kasko Poliçesi zorunluluğu bulunmamaktadır. Trafik Sigortanızın olması yeterlidir. Trafik Sigortanız hangi şirketten olursa olsun limitsiz İMM Sigortasını başka bir katılım sigortasından alabilirsiniz. Size en uygun IMM Sigortası için Sigorka.com web sitemizden teklif alabilir veya Çağrı Merkezimizi arayarak soru ve taleplerinizi uzman danışmanlarımıza iletebilirsiniz.'
  },
  {
    question: 'Motorlu kara taşıtları IMM Sigortası neden önemli?',
    answer: 'İMM, kaza sonrası karşı tarafa verilen zarar bedelinin Zorunlu Trafik Sigortası poliçe limitlerinin üzerinde kalması durumunda, aşılan tutarın sigorta şirketi tarafından güvence altına alınmasını sağlayacağından yüksek araç hasarlı bir trafik kazası durumunda karşı tarafın hasar bedelini teminat altına alır.'
  }
];

export default function IMMSigortasiPage() {
  const anchors = productAnchors['imm-sigortasi'];
  const offerLink = getOfferLink('imm-sigortasi');

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
          title: 'İMM Sigortası Teklifi Almak İster misiniz?',
          description: 'Hemen birkaç dakika içinde en uygun İMM sigortası tekliflerini karşılaştırın.',
          buttonText: 'Hemen Teklif Al',
          buttonLink: '/imm-teklif'
        }}
      />
      <StickyProductNav anchors={anchors} offerLink={offerLink} />
      <ProductBanner
        title1="Aracım"
        title2="Katılım İhtiyari Mali Mesuliyet Sigortası (İMM)"
        buttonText="Hemen Teklif Alın"
        buttonHref="/imm-teklif"
        size="sm"
      />
      <section className="page-content">
        <div className="container">
          <Breadcrumb
            items={[
              { name: 'Ana Sayfa', href: '/' },
              { name: 'Ürünler', href: '' },
              { name: 'Aracım', href: '/aracim' },
              { name: 'Katılım İhtiyari Mali Mesuliyet Sigortası (İMM)' }
            ]}
          />
          <div className="text-content">
            <h3>İhtiyari Mali Sorumluluk Sigortası, aracın kullanılmasından doğan maddi/hukuki sorumluluğu, Trafik Sigortası limitleri ile varsa Kasko Sigortası kapsamında yer alan, İhtiyari Mali Sorumluluk teminatı limitlerinin üzerinde kalan kısmını sınırsız olarak tazmin eder. Üstelik manevi tazminat talepleri de teminata dahildir. İMM Sigortası yaptırmanız için Kasko Poliçesi zorunluluğu bulunmamaktadır. Trafik Sigortanızın olması yeterlidir.</h3>
            <h4 id="sigorta-nedir">İhtiyari Mali Mesuliyet Sigortası (İMM) Nedir?</h4>
            <p>İMM limiti, karşı araca ve üçüncü kişilere verilen hasarların limit dahilinde ödenmesini ifade eder. İMM limitleri sigorta ürünlerinin kapsamına göre değişebilir. 3.000.000 TL, 10.000.000 TL gibi limitli ve sınırsız İMM olarak adlandırılan limitsiz paket seçenekleri mevcuttur. İhtiyaçlarına ve bütçene göre İMM paketini kendiniz seçebilirsiniz.</p>
            <h4 id="teminat-disi">İMM Sigortasında Neler Teminat Dışındadır?</h4>
            <p>Aşağıdaki haller sigorta teminatının dışındadır:</p>
            <ul className="prop-list list-full-width">
              <li style={{width: '100%'}}>Sigortalının kendisinin uğrayacağı zararlar</li>
              <li style={{width: '100%'}}>Aracı sevk ve idare edenin, aracı sevk ve idare ederken uğrayacağı zararlar dolayısıyla ileri sürülen talepler</li>
              <li style={{width: '100%'}}>İşletenin veya aracı sevk edenin eşinin, usul ve füruunun (kendisi ile evlat edinme ilişkisi ile bağlı olanların) ve birlikte yaşadığı kardeşlerinin uğrayacağı zararlar dolayısıyla ileri sürülen talepler</li>
              <li style={{width: '100%'}}>Araç sahibi ile işleteni arasındaki ilişkide araca gelen zararlar dolayısıyla ileri sürülen talepler</li>
              <li style={{width: '100%'}}>Poliçede gösterilen aracın ve bu araç ile taşınan malların (yolcu bagajı ve benzeri eşya teminat dahilindedir) veya çekilen şeylerin bozulması zarar ve ziya uğraması yüzünden ileri sürülen talepler</li>
              <li style={{width: '100%'}}>Çalınan veya gasp edilen aracın sebep olduğu ve Karayolları Trafik Kanunu'na göre işletenin sorumlu olmadığı zararlar ile aracın çalındığını ve/veya gaspedildiğini bilerek binen yolcuların zarara uğramaları nedeniyle ileri sürülen talepler</li>
              <li style={{width: '100%'}}>Sürat yarışlarına iştirak ve yarış güzergâhında yapılan antrenmanlar sırasında meydana gelebilecek zarar ve ziyan nedeniyle ileri sürülen talepler</li>
              <li style={{width: '100%'}}>Aracın gözetim, onarım, bakım, alım-satım, araçta değişiklik yapılması amacı ile veya benzeri bir amaçla faaliyette bulunan teşebbüslere bırakılmasından sonra aracın sebep olduğu zararlara ilişkin her türlü talepler</li>
              <li style={{width: '100%'}}>Patlayıcı ve parlayıcı maddeler taşınması (yedek akaryakıt hariç) sebebiyle meydana gelen zarar ve ziyanlardan dolayı ileri sürülen talepler.</li>
              <li style={{width: '100%'}}>3713 sayılı Terörle Mücadele Kanununda belirtilen terör eylemlerinde ve bu eylemlerden doğan sabotajda kullanılan araçların neden olduğu ve 2918 sayılı Karayolları Trafik Kanunu'na göre işletenin sorumlu olmadığı zararlar ile aracın terör eylemlerinde kullanıldığını veya kullanılacağını bilerek binen kişilerin zarara uğramaları nedeniyle ileri sürecekleri talepler, aracı terör ve buna bağlı sabotaj eylemlerinde kullanan kişilerin talepleri.</li>
            </ul>
            <h4>İMM Ne İşe Yarar?</h4>
            <p>Trafik kazalarında küçük bir hasar bile maliyeti çok yüksek sonuçlara neden olabiliyor. Bu tür aksilikler başınıza gelmeden İMM sigortası ile kaza sonucu ortaya çıkabilecek yüksek hasar masraflarına karşı bütçenizi koruma altına alabilirsiniz.</p>
            <h4 id="limitler">İMM Sigortası'nın Limitleri Nelerdir?</h4>
            <p>İMM limiti, karşı araca ve üçüncü kişilere verilen hasarların limit dahilinde ödenmesini ifade eder. İMM limitleri sigorta ürünlerinin kapsamına göre değişebilir. 3.000.000 TL, 10.000.000 TL gibi limitli ve sınırsız İMM olarak adlandırılan limitsiz paket seçenekleri mevcuttur. İhtiyaçlarınıza ve bütçenize göre İMM paketinizi kendiniz seçebilirsiniz.</p>
            <h4 id="teminatlar">İMM Sigortası'nın Teminatları Nelerdir?</h4>
            <p>İMM teminatları da ihtiyari mali mesuliyet gibi farklı limitlere sahiptir. Teminat ve limitleri için aşağıdaki tablomuzu inceleyebilirsiniz. Teminat limitleri düşükten yükseğe doğru farklı avantaj imkanlarıyla sunulur.</p>
            <h4 id="avantajlar">İMM Yaptırmanın Avantajları Nelerdir?</h4>
            <p>Eğer İMM teminatının belirli bir limiti varsa, o limitler dahilinde karşı tarafın hasarı karşılanır. Limitsiz İMM teminatında ise karşı tarafın hasarı ne kadar olursa olsun tüm hasar masrafları limit sınırına takılmadan sigorta şirketi tarafından ödenir.</p>
            <h4>İMM Sigortası Nasıl Sorgulanır?</h4>
            <p>E-devlet üzerinden sorgulama yapabilirsiniz.</p>
          </div>
          <div className="col-12 mb-4">
            <div className="offer-banner offer-banner-car-bg">
              <div className="offer-banner__content">
                <h3>Katılım İMM Sigortasına mı ihtiyacınız var?</h3>
                <p>En uygun tekliflerle aracınızı kaskolamak için şimdi teklif alın.</p>
              </div>
              <div className="offer-banner__cta">
                <a className="btn btn-wide btn-tertiary" href="/imm-teklif" target="_self">
                  Hemen Teklif Alın
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="page-content">
        <div className="container">
          <h4>İMM (İhtiyari Mali Mesuliyet Sigortası) Hakkında Sıkça Sorulan Sorular</h4>
          <FaqList faqs={faqs} />
        </div>
      </section>
    </>
  );
} 