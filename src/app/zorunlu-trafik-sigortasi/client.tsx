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
import Link from 'next/link';



const faqs = [
  {
    question: 'Katılım Sigortacılık Sistemi Nasıl İşler?',
    answer: 'Geleneksel sigortacılıkta sigortalı ile sigortacı arasında karşılıklı sorumluluklar yükleyen bir akit söz konusudur. Sigortalı primini ödeyecek sigortacı da poliçe şartları çerçevesinde gerektiğinde tazminat ödeyecektir. Toplanan primler tazminatlara yetmez ise sigortacı zarar etmiş olmaktadır. Buna karşın toplanan primler ödenen tazminatlardan fazla ise sigortacının karıdır. Sigorta döneminde riziko gerçekleşmez ise sigortalının ödediği prim tamamen sigortacının olmaktadır. Katılım sistemin de ise geleneksel sigortaların aksine toplanan primler Katılım kuruluşunun sigortalılara vekaleten faizsizlik esasına uygun olarak işletmesi amacıyla bir fonda toplanmakta ve gerektiğinde sigortalıların birbirlerine bağış olarak alınmaktadır. Bu havuzda biriken meblağ Katılım kuruluşu tarafından faizsizlik esasına göre işletilmekte ve Katılım kuruluşunun vekalet ya da ortaklık gibi doğal haklarının dışındaki kar sigortalıların primlerinden oluşan havuza aktarılmaktadır. Bu havuz ayrıca sigortanın gereği olarak hasar gerçekleşmesi halinde mağdur olan poliçe sahibinin mağduriyetini gidermede kullanılmaktadır.'
  },
  {
    question: 'Katılım Anlaşması Ticari midir?',
    answer: 'İsminden de anlaşılacağı üzere katılım, karşılıklı dayanışma esaslıdır. Bu sistemde sigortalıların kendi aralarındaki ilişki ortaklık, yardımlaşma ve dayanışmadır. Primleriyle oluşturdukları havuz, Katılım kuruluşunun işletmesi ile kar eder ise başlangıçta Katılım kuruluşuyla yaptıkları sözleşme hükümlerine uygun olarak karda ortaklıkları söz konudur. Sigortalılar ile Katılım kuruluşu arasındaki ilişki ise sigortalıların sigortadan arzu ettikleri bütün teminatları sağlamakla birlikte klasik sigortacı sigortalı ilişkisinden öte sigortalıların fonunu onlara vekaleten işleten vekil müvekkil ilişkisidir. Klasik sigortada ise ticari faaliyet esastır. Sigortacı topladığı primler ile ödediği tazminatlar arasındaki farkı kendisine kar olarak alır. Katılım sigortasında karşılıklı dayanışma esastır ve amaç kar değildir.'
  },
  {
    question: 'Katılım Fonu ile Sermayedarlar Fonu Arasındaki İlişki Nasıldır?',
    answer: 'Katılım sisteminde katılım katılımcılarından (sigortalılar) toplanan fon ile sermayedarların hesapları arasında tam bir ayrım vardır. Katılım fonu Katılım kuruluşunun mülkiyetine geçmez. katılım fonu katılımcılarına vekaleten işletmesi ve sözleşmede belirlenen rizikoya maruz kalan katılımcılara tazminat ödemelerini organize etmesi amacıyla Katılım kuruluşuna emanet edilmiştir. Halbuki klasik sigortada bütün primler ile bu primlerden sağlanan karlar sermayedarlara aittir.'
  },
  {
    question: 'Ödenen Hasar Tutarları Katılım Havuzunu Aşarsa Ne Olur?',
    answer: 'Katılım sisteminde katılımcıların ödediği katılım fonları ödenen tazminatları karşılamaz ise katılım fonunu yöneten katılım kuruluşu (vekil) katılımcıların oluşturduğu Katılım fonuna faizsiz borç (karz-ı hasen) verir. . Yani katılım sistemine katılımcıların ödediği fon toplam sigorta ödemelerini karşılayamaz ise Katılım Kuruluşu hiçbir faiz almadan katılım fonuna borç verir ve katılımcıların hak ettikleri tazminatları öder. Bu faizsiz borç fonun daha sonraki gelirlerinden tahsil edilir. Klasik sigortacılıkta ise şirketlerin topladıkları primler toplam tazminat ödemelerini karşılayamayacak duruma düşerse zarar şirkete aittir.'
  },
  {
    question: 'Katılım Sistemi Faiz İçeriyor mu?',
    answer: 'Klasik sigortayla ilgili en önemli eleştirilerden biri söz konusu sigortacılık işleminin faiz içerdiğidir. Zira klasik sigorta şirketleri topladıkları primi neredeyse bütünüyle faizli işlemlerde değerlendirirler. Sigortalıya ödedikleri tazminatları da faizli işlemlerden kazandıkları fonlarla karşılarlar. Yine sigortacının sigortalıdan aldığı ve mülkiyetine geçirdiği prime mukabil riziko gerçekleşmesi halinde sigortalıya primden kat kat fazla tazminat ödemeyi garanti etmesi de kimi İslam alimlerince faizli işlem addedilmiştir.\n\nKatılım sisteminde katılımcıların katkılarıyla oluşan fon faizsiz enstrümanlarda değerlendirilir. Bu bakımdan fonun karı faizden değil kar ya da kira gibi faiz dışı gelirlerden oluşur.  Katılımcıya ödenen tazminatlar da bu fondan karşılandığından sigortalıya faiz ödemesi yapılmamış olur. Yine katılım sisteminde katılım Kuruluşu sigorta primi karşılığında sigortalıya tazminat ödemeyi garanti eden taraf değil katılımcıların ödedikleri katkı paylarından oluşan Katılım fonunu işleten vekildir. Dolayısıyla prim karşılığı ödenen tazminat arasındaki fark faiz olarak değerlendirilemez. Katılımcıların katılım kuruluşuna emanet ettikleri katkı payları ile rizikoya maruz kalan katılımcıya yaptıkları bağış niteliğindedir.'
  },
  {
    question: 'Katılım Sigortacılığında Fonlar Nerelerde Değerlendirilir?',
    answer: 'Katılım sisteminde katılım kuruluşu toplanan fonu faizsiz işlemlerde değerlendirmek zorundadır. Fonun değerlendirileceği işlemin faizsiz olup olmadığına katılım kuruluşu bünyesinde bulunan danışma kurulu karar verir. Buna göre kuruluş, faiz yerine kar ve kira gibi gelirler elde etmek üzere faaliyette bulunur. Dolayısıyla katılımcıların katkı paylarıyla oluşan fon katılım bankalarının özel cari ve katılma hesaplarıyla, altın ve döviz alım satımı, kıymetli maden alım satımı, emtia alım satımı, katılım endeksine tabi hisse senetlerinin alım satımı, proje ortaklıkları, hazine ve özel sektör kira sertifikalarında değerlendirilebilir.'
  }
];

export default function ZorunluTrafikSigortasiClientPage() {
  const anchors = productAnchors['zorunlu-trafik-sigortasi'];
  const offerLink = getOfferLink('zorunlu-trafik-sigortasi');

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
          title: 'Zorunlu Trafik Sigortası Teklifi Almak İster misiniz?',
          description: 'Hemen birkaç dakika içinde en uygun trafik sigortası tekliflerini karşılaştırın.',
          buttonText: 'Hemen Teklif Al',
          buttonLink: '/trafik-teklif'
        }}
      />
      <StickyProductNav anchors={anchors} offerLink={offerLink} />
      <ProductBanner
        title1="Aracım"
        title2="Katılım Zorunlu Trafik Sigortası"
        buttonText="Hemen Teklif Alın"
        buttonHref="/trafik-teklif"
        size="sm"
      />
      <section className="page-content" >
        <div className="container">
          <Breadcrumb
            items={[
              { name: 'Ana Sayfa', href: '/' },
              { name: 'Ürünler', href: '' },
              { name: 'Aracım', href: '/aracim' },
              { name: 'Katılım Zorunlu Trafik Sigortası' }
            ]}
          />
          <div className="text-content">
            <h3>
              Trafiğe çıkan tüm araçların yaptırmak zorunda olduğu Zorunlu Trafik Sigortası, olası
              bir kaza durumunda iki tarafın da haklarını güvence altına alır ve oluşan hasarların
              karşılanmasını sağlar.
            </h3>
            <h4 id="sigorta-nedir">Zorunlu Trafik Sigortası Nedir?</h4>
            <p>Zorunlu trafik sigortası, sigortalanan aracın kaza sonucunda diğer araç ya da üçüncü şahıslara verebileceği hasarları, mecburi masraflar doğrultusunda karşılayan zorunlu bir sigortadır.</p>
            <p>Sigorta kapsamında poliçenizde tanımlanan motorlu aracın işletilmesi sırasında, bir kimsenin ölümüne, yaralanmasına veya bir şeyin zarara uğramasına sebep olunması durumunda karşılaşılan miktarı zorunlu sigorta limitlerine kadar temin etmekteyiz. Her bir motorlu kara taşıtı için ayrı poliçe düzenlenmektedir. Poliçe kanunen zorunlu olduğu için katkı payı (primi) peşin ödenmek zorundadır.</p>
            <h4 id="avantajlar">Avantajları Nelerdir?</h4>
            <p>Olası bir kaza durumunda iki tarafın da haklarını güvence altına alarak, oluşan hasarların karşılanmasını sağlar. Her aracın kendine ait zorunlu bir trafik sigortası olup, aracın kaza ve hasar geçmişine göre ödenecek katkı payı (prim) tutarı ve aracın bulunduğu hasarsızlık kademesi değişiklik gösterir. Kaza ve hasar durumuna göre kademelendirilen prim ödemeleri, sürücüleri kazalara karşı daha tedbirli olmaya ve trafik kurallarına uymaya teşvik eder. Zorunlu trafik sigortası ile karayollarında oluşabilecek maddi ve bedensel kayıpların minimuma indirilmesi hedeflenir.</p>
            <h4 id="teminatlar">Teminatları Nelerdir?</h4>
            <ul className="prop-list">
              <li>Maddi Zararlar Teminatı</li>
              <li>Sağlık Giderleri Teminatı</li>
              <li>Sürekli Sakatlık Teminatı</li>
              <li>Vefat Teminatı</li>
              <li>Tedavi Teminatı</li>
            </ul>
          </div>
        </div>
      </section>
      <section className="page-content page-content--highlighted">
        <div className="container">
          <div className="text-content">
            <h4 id="limitler">Zorunlu Trafik Sigortası Limitleri Nelerdir?</h4>
            <div className="table-responsive">
              <table className="table table-bordered text-center">
                <thead>
                  <tr>
                    <th rowSpan={2}>Araç Türü</th>
                    <th colSpan={2}>Sağlık Gideri</th>
                    <th colSpan={2}>Sakatlanma ve Ölüm</th>
                    <th colSpan={2}>Maddi Zararlar</th>
                  </tr>
                  <tr>
                    <th>Kişi Başı</th>
                    <th>Kaza Başı</th>
                    <th>Kişi Başı</th>
                    <th>Kaza Başı</th>
                    <th>Araç Başı</th>
                    <th>Kaza Başı</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Otomobil</td>
                    <td>1.800.000 TL</td>
                    <td>9.000.000 TL</td>
                    <td>1.800.000 TL</td>
                    <td>9.000.000 TL</td>
                    <td>200.000 TL</td>
                    <td>400.000 TL</td>
                  </tr>
                  <tr>
                    <td>Kamyonet, Kamyon, Minibüs</td>
                    <td>1.800.000 TL</td>
                    <td>9.000.000 TL</td>
                    <td>1.800.000 TL</td>
                    <td>9.000.000 TL</td>
                    <td>200.000 TL</td>
                    <td>400.000 TL</td>
                  </tr>
                  <tr>
                    <td>Tarım ve Özel Amaçlı Araçlar</td>
                    <td>1.800.000 TL</td>
                    <td>9.000.000 TL</td>
                    <td>1.800.000 TL</td>
                    <td>9.000.000 TL</td>
                    <td>200.000 TL</td>
                    <td>400.000 TL</td>
                  </tr>
                  <tr>
                    <td>Motosiklet</td>
                    <td>1.800.000 TL</td>
                    <td>9.000.000 TL</td>
                    <td>1.800.000 TL</td>
                    <td>9.000.000 TL</td>
                    <td>200.000 TL</td>
                    <td>400.000 TL</td>
                  </tr>
                  <tr>
                    <td>Minibüs (Sürücü dahil 10-17 koltuk)</td>
                    <td>1.800.000 TL</td>
                    <td>9.000.000 TL</td>
                    <td>1.800.000 TL</td>
                    <td>9.000.000 TL</td>
                    <td>200.000 TL</td>
                    <td>400.000 TL</td>
                  </tr>
                  <tr>
                    <td>Otobüs (Sürücü dahil 18-30 koltuk)</td>
                    <td>1.800.000 TL</td>
                    <td>9.000.000 TL</td>
                    <td>1.800.000 TL</td>
                    <td>9.000.000 TL</td>
                    <td>200.000 TL</td>
                    <td>400.000 TL</td>
                  </tr>
                  <tr>
                    <td className="rounded-bottom-left">Otobüs (Sürücü dahil 31 üstü koltuk)</td>
                    <td>1.800.000 TL</td>
                    <td>9.000.000 TL</td>
                    <td>1.800.000 TL</td>
                    <td>9.000.000 TL</td>
                    <td>200.000 TL</td>
                    <td className="rounded-bottom-right">400.000 TL</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h4>Trafik Sigortası Teklifi Nasıl Alınır?</h4>
            <p>Zorunlu trafik sigortası teklif alma aşamasında aracın ruhsatında ve sürücünün kimliğinde yazılı olan bazı bilgilere ihtiyaç duyulur. Araç bilgilerine ilişkin olarak öncelikle poliçe durumuna göre değerlendirme yapılır. Sıfır km araç için ilk poliçe, ikinci el araç için ilk poliçe veya poliçe yenileme seçeneklerinden birisi seçilir. Poliçe yenileme işleminde mevcut plaka üstünden işlem yapılacağı için aracın plakası, sürücünün kimlik numarası ve doğum tarihi gibi bilgiler trafik sigortası teklif alma aşamasında yeterli olur. İkinci el veya sıfır araçlar için hazırlanacak olan ilk poliçede ise aracın plakasının olup olmadığını belirtmeniz gerekir. Bu bilgiler ile hızlı bir şekilde farklı zorunlu trafik sigortası paketlerine ilişkin tarafınıza verilen fiyat tekliflerini görüntüleyip, bu teklifleri birbiriyle karşılaştırarak en kapsamlı ve en ucuz trafik sigortası alternatifleri arasından seçiminizi yapabilirsiniz.</p>
            
            <div className="offer-banner mt-2 mb-5">
              <div className="offer-banner__content">
                <h3>
                  Katılım Zorunlu Trafik Sigortasına mı
                  ihtiyacınız var?
                </h3>
                <p>En uygun tekliflerle aracınızı sigortalamak için şimdi teklif alın.</p>
              </div>
              <div className="offer-banner__cta">
                <Link className="btn btn-wide btn-tertiary" href="/trafik-teklif">Hemen Teklif Alın</Link>
              </div>
            </div>

            <h4 id="hasarsizlik-oranlari">Zorunlu Trafik Sigortasında <span>Hasarsızlık İndirimi</span> Nedir?</h4>
            <p>Aracın hasarsızlık durumuna göre sigorta indirim basamakları ve sürprim oranları değişkenlik gösterir. Toplam yedi basamaktan oluşur.</p>
            <h4>Zorunlu Trafik Sigortası <span>Hasarsızlık İndirim Oranları</span> Nelerdir?</h4>
            <div className="table-responsive">
              <table className="table table-bordered text-center">
                <thead>
                  <tr>
                    <th>Basamak No</th>
                    <td>0</td>
                    <td>1</td>
                    <td>2</td>
                    <td>3</td>
                    <td>4</td>
                    <td>5</td>
                    <td>6</td>
                    <td>7</td>
                    <td className="rounded-top-right">8</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>İndirim</th>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>%5</td>
                    <td>%20</td>
                    <td>%40</td>
                    <td>%50</td>
                  </tr>
                  <tr>
                    <th>Artırım</th>
                    <td>%200</td>
                    <td>%135</td>
                    <td>%90</td>
                    <td>%45</td>
                    <td>%10</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td className="rounded-bottom-right"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      <section className="page-content">
        <div className="container">
          <h4>Zorunlu Trafik Sigortası Sıkça Sorulan Sorular</h4>
          <FaqList faqs={faqs} />
        </div>
      </section>
    </>
  );
} 