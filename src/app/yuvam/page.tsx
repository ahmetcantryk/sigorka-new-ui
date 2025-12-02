import Banner from '../components/common/Banner';
import Breadcrumb from '../components/common/Breadcrumb';
import ProductBoxList from '../components/product/ProductBoxList';
import FaqList from '../components/common/FaqList';
import Link from 'next/link';
import '../../styles/subpage.min.css';

const yuvamProducts = [
  {
    title: "DASK",
    img: "/images/product-icons-subpage/dask.svg",
    alt: "DASK",
    link: "/dask"
  },
  {
    title: "Katılım Konut Sigortası",
    img: "/images/product-icons-subpage/katilim-konut-sigortasi.svg",
    alt: "Katılım Konut Sigortası",
    link: "/konut-sigortasi"
  },
  {
    title: "Ferdi Kaza Sigortası",
    img: "/images/product-icons-subpage/ferdi-kaza-sigortasi.svg",
    alt: "Ferdi Kaza Sigortası",
    link: "/ferdi-kaza-sigortasi"
  }
];

const yuvamFaqs = [
  {
    question: 'DASK Sigortası Nedir?',
    answer: 'DASK, ülkemizde Zorunlu Deprem Sigortası\'nın uygulaması, edindirilmesi ve yönetimi gibi zorunlu deprem sigortasının tüm adımlarından sorumlu olan, tüzel kimlikli bir kamu kuruluşudur. DASK Sigortası binanızda olası bir depremin ve depremin sonucunda meydana gelen yangın, yer kayması gibi olayların neden olduğu maddi zararları karşılamaya yönelik olan bir teminat sistemidir.'
  },
  {
    question: 'Katılım Konut Sigortası Neleri Kapsar?',
    answer: 'Katılım Konut Sigorta poliçeniz ile deprem, sel, fırtına, dolu gibi doğal afetlerden kaynaklanan zararları, yangın sonucu oluşan hasarlar, evinize yapılan hırsızlık sonucunda oluşan zararlarınızı, evinizdeki tesisat arızaları ve su baskınları sonucu meydana gelen hasarları, cam kırılmaları sonucu oluşan zararlarınızı karşılayabilir ve hatta poliçenize ek teminatlar ekleterek alternatif konaklama masraflarınızı karşılayabilirsiniz.'
  },
  {
    question: 'DASK ve Katılım Konut Sigortası Arasındaki Fark Nedir?',
    answer: 'Katılım DASK Sigortasında deprem riskine göre belirlenmiş standart bir prim tarifesi bulunur ve sadece deprem ve deprem sonrası oluşan zararları kapsar. Katılım Konut Sigortası ise çok daha kapsamlı teminatlara sahip olabilir ve yuvanızı daha güvenli hale getirebilir.'
  }
];

export default function YuvamPage() {
  return (
    <>
      <Banner
        title1=""
        title2="Yuvam"
        size="md"
        bgImage="/images/covers/yuvam.jpg"
        icon="/images/subpage/icon-yuvam.png"
        icon2x="/images/subpage/icon-yuvam@2x.png"
      />
      <section className="page-content">
        <div className="container">
          <ProductBoxList products={yuvamProducts} />
          <Breadcrumb
            items={[
              { name: 'Ana Sayfa', href: '/' },
              { name: 'Ürünler', href: '' },
              { name: 'Yuvam' }
            ]}
          />
          <div className="text-content">
            <h3>Doğal afetlerin önüne geçmek imkansızdır. Ancak yuvamızı koruma altına almak mümkün. Peki Katılım Konut Sigortaları ile konutlarımızı koruma altına almak, ailemizi güvende tutmak değil midir?</h3>
            <p>Ekosistemin her geçen gün daha da bozulduğu gezegenimizde doğal afetlerin daha sık ve daha kuvvetli vurduğu bir dönemden geçiyoruz. Aşırı ısınmadan ormanlarımız geçmişe oranla kat kat fazla yanıyor, yuvalarımız sel altında kalıyor. Özellikle ülkemiz bulunduğu konum dolayısıyla deprem bölgesinde. Doğal afetlerin önüne geçmek imkansızdır. Ama kendimizi ve sevdiklerimizi güvence altına almak mümkün. Bu yollardan bazıları Katılım DASK Sigortası ve Katılım Konut Sigortası sahibi olmaktır.</p>
            <p>DASK&apos;ın açılımı &quot;Doğal Afetler Sigortalar Kurumu&quot; şeklindedir. DASK; ülkemizde Zorunlu Deprem Sigortası&apos;nın uygulaması, edindirilmesi ve yönetimi gibi zorunlu deprem sigortasının tüm adımlarından sorumlu olan, tüzel kimlikli bir kamu kuruluşudur. 17 Ağustos Marmara deprem felaketini yaşadığımız süreçten hemen sonra, 2000 yılında kurulan, Doğal Afetler Sigortalar Kurumu ile beraber DASK Sigortası yaptırmak zorunlu hale getirilmiştir. DASK Sigortası binanızda olası bir depremin ve depremin sonucunda meydana gelen yangın, yer kayması gibi olayların neden olduğu maddi zararları karşılamaya yönelik olan bir teminat sistemi olarak bilinmektedir. Peki Sadece DASK Sigortası yaptırarak yuvamızı güvende tutmak gerçekten mümkün mü? İsteğe bağlı yaptırabileceğiniz Katılım Konut Sigortaları ile çok daha kapsamlı teminatlara sahip olabilir, yuvanızı daha güvenli hale getirebilirsiniz.</p>
            <p>Katılım Konut Sigorta poliçeniz ile deprem, sel, fırtına, dolu gibi doğal afetlerden kaynaklanan zararları, yangın sonucu oluşan hasarlar, evinize yapılan hırsızlık sonucunda oluşan zararlarınızı, evinizdeki tesisat arızaları ve su baskınları sonucu meydana gelen hasarları, cam kırılmaları sonucu oluşan zararlarınızı karşılayabilir ve hatta poliçenize ek teminatlar ekleterek alternatif konaklama masraflarınızı karşılayabilir ve ya istemeden de olsa komşularınıza verebileceğiniz zararlara karşı kendinizi güvence altına alabilirsiniz. Ayrıca yine ek teminatlar vesilesiyle evinizdeki en değerli eşyalarınızı teminata bağlayabilirsiniz. Tabi Katılım Konut Sigortasının kapsamı teminatlara göre değişiklik göstereceğinden, poliçe kapsamınız ve poliçenize ekleteceğiniz ek teminatlara göre değişen prim maliyetleriniz olacaktır. Oysa Katılım DASK Sigortasında deprem riskine göre belirlenmiş standart bir prim tarifesi bulunmaktadır. Bu sebeple bütçenize en uygun Katılım Konut Sigortası sahibi olmak için ihtiyaçlarınıza yönelik poliçeleri belirlemelisiniz.</p>
            <p>Dilerseniz hemen <strong>0850 404 04 04</strong> numaralı telefondan bize ulaşın, ihtiyaçlarınızı dinleyelim. Sigorka.com&apos;un anlaşmalı olduğu Türkiye Katılım, Bereket Katılım ve HDI Katılım&apos;ın <Link href="/konut-sigortasi">Katılım Konut Sigortalarından</Link> sunduğu poliçe seçeneklerinden size en uygun teklifleri anında iletelim.</p>
            <h4>Yuvam Sigortaları Hakkında Bilmeniz Gerekenler</h4>
            <FaqList faqs={yuvamFaqs} />
          </div>
        </div>
      </section>
    </>
  );
} 