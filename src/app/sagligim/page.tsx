import Banner from '../components/common/Banner';
import Breadcrumb from '../components/common/Breadcrumb';
import ProductBoxList from '../components/product/ProductBoxList';
import FaqList from '../components/common/FaqList'; 
import '../../styles/subpage.min.css';

export const metadata = {
  title: "Sağlık Sigortaları - Bireysel ve Tamamlayıcı | Sigorka",
  description: "Size ve ailenize özel tamamlayıcı, bireysel ve seyahat sağlık sigortası çözümlerini avantajlı fiyatlarla keşfedin. Daha fazlası için sitemizi ziyaret edin.",
  alternates: {
    canonical: "https://sigorka.com/sagligim"
  },
  openGraph: {
    title: "Sağlık Sigortaları - Bireysel ve Tamamlayıcı | Sigorka",
    description: "Size ve ailenize özel tamamlayıcı, bireysel ve seyahat sağlık sigortası çözümlerini avantajlı fiyatlarla keşfedin. Daha fazlası için sitemizi ziyaret edin.",
    url: "https://sigorka.com/sagligim",
    type: "website"
  },
  twitter: {
    title: "Sağlık Sigortaları - Bireysel ve Tamamlayıcı | Sigorka",
    description: "Size ve ailenize özel tamamlayıcı, bireysel ve seyahat sağlık sigortası çözümlerini avantajlı fiyatlarla keşfedin. Daha fazlası için sitemizi ziyaret edin.",
    card: "summary_large_image"
  }
};

const sagligimProducts = [
  {
    title: "Özel Sağlık Katılım Sigortası",
    img: "/images/product-icons-subpage/ozel-saglik-katilim-sigortasi.svg",
    alt: "Özel Sağlık Katılım Sigortası",
    link: "/ozel-saglik-sigortasi"
  },
  {
    title: "Seyahat Sağlık Katılım Sigortası",
    img: "/images/product-icons-subpage/seyahat-saglik-sigortasi.svg",
    alt: "Seyahat Sağlık Katılım Sigortası",
    link: "/seyahat-saglik-sigortasi"
  },
  {
    title: "Tamamlayıcı Sağlık Katılım Sigortası",
    img: "/images/product-icons-subpage/tamamlayici-saglik-sigortasi.svg",
    alt: "Tamamlayıcı Sağlık Katılım Sigortası",
    link: "/tamamlayici-saglik-sigortasi"
  },
  {
    title: "Yabancı Sağlık Katılım Sigortası",
    img: "/images/product-icons-subpage/yabanci-saglik-sigortasi.svg",
    alt: "Yabancı Sağlık Katılım Sigortası",
    link: "/yabanci-saglik-sigortasi"
  }
];

const sagligimFaqs = [
  {
    question: 'Katılım Tamamlayıcı Sağlık Sigortası Nedir?',
    answer: 'SGK ile anlaşmalı özel hastanelerde ekonomik bir şekilde sağlık hizmeti almanızı sağlayan, SGK\'nın karşılamadığı fark ücretlerini ödeyebileceğiniz, ayakta ve yatarak tedavi masraflarınızı karşılayan bir sigorta türüdür.'
  },
  {
    question: 'Katılım Özel Sağlık Sigortası Nedir?',
    answer: 'SGK\'ya bağlı olmadan, tamamen özel hastanelerden geniş kapsamlı sağlık hizmeti almanızı sağlayan, poliçe kapsamına göre ameliyat, yoğun bakım, refakatçi giderleri, ayakta tedavi, diş, doğum, göz gibi ek teminatları da içerebilen bir sigorta türüdür.'
  },
  {
    question: 'Tamamlayıcı Sağlık ile Özel Sağlık Sigortası Arasındaki Fark Nedir?',
    answer: 'Tamamlayıcı Sağlık Sigortası, SGK ile anlaşmalı özel hastanelerde SGK\'nın karşılamadığı fark ücretlerini öder. Özel Sağlık Sigortası ise SGK\'dan bağımsız, daha geniş kapsamlı ve kişiselleştirilebilir teminatlar sunar.'
  }
];

export default function SagligimPage() {
  return (
    <>
      <Banner
        title1=""
        title2="Sağlığım"
        size="md"
        bgImage="/images/covers/sagligim.jpg"
        icon="/images/subpage/icon-sagligim.png"
        icon2x="/images/subpage/icon-sagligim@2x.png"
      />
      <section className="page-content">
        <div className="container">
          <ProductBoxList products={sagligimProducts} />
          <Breadcrumb
            items={[
              { name: 'Ana Sayfa', href: '/' },
              { name: 'Ürünler', href: '' },
              { name: 'Sağlığım' }
            ]}
          />
          <div className="text-content">
            <h3>Sağlığımızı kaybetmeden önce cebimizi yormadan ödediğimiz küçük meblağlar ile, zor günlerimizi güvence altına alan Katılım Sağlık Sigortaları bir seçenek değil, ihtiyaçtır.</h3>
            <p>Sağlığımız her şeyden değerlidir. Özellikle pandemi döneminde sağlığımızın değerini bir kere daha anladık ve acil sağlık harcamalarına karşı önlem almanın bir seçenek değil; bir ihtiyaç olduğunun fakına vardık. Sağlığımızı kaybetmeden önce cebimizi yormadan ödediğimiz küçük pirimlerle zor günlerimizi güvence altına alan sağlık sigorta ürünlerinin bir seçenek değil, ihtiyaç olduğunun farkına vardık.</p>
            <p>Sigorka.com&apos;un sağlığınızı güvence altına alan Katılım Sağlık Sigortası ve Özel Sağlık Sigortası ürünlerini inceleyerek size en uygun sigorta paketini seçmeden önce hangi ürüne ihtiyacınız olduğuna gelin önce bir bakalım çünkü her iki sigorta türü sağlık harcamalarınızı kontrol altında tutmanıza yardımcı olurken farklı ihtiyaçlarınıza hitap eder.</p>
            <p>Sigorka.com&apos;un sunduğu <a href="#">Katılım Tamamlayıcı Sağlık Sigortaları</a> ile SGK&apos;nın karşılamadığı fark ücretlerini ödeyebilir, SGK ile anlaşmalı özel hastanelerde ekonomik bir şekilde sağlık hizmeti alabilirsiniz. Yani Katılım Özel Sağlık Sigortanız SGK&apos;ya bağlı kalmadan tamamen özel hastanelerden geniş kapsamlı sağlık hizmeti almanızı sağlar. Böylece SGK&apos;nın anlaşmalı olduğu özel hastanelerde, Katılım Tamamlayıcı Sağlık Sigorta paketiniz sayesinde SGK tarafından karşılanan tutarın üzerindeki fark ücretlerini hiçbir ek maliyet ödemeden sağlık hizmeti alabilirsiniz. Poliçe paket içeriğinize bağlı olarak ameliyat, yoğun bakım, refakatçi giderleri gibi yatarak tedavi masraflarınızı veya doktor muayeneleri, laboratuvar hizmetleri, görüntüleme hizmetleri gibi ayakta tedavi ihtiyaçlarınızı Katılım Tamamlayıcı Sağlık Sigorta paketinizden karşılayabilirsiniz.</p>
            <p>Özetle Katılım Tamamlayıcı Sağlık Sigortalarının en belirgin özelliği sağlık harcamalarınız esnasında SGK&apos;nın size sunduğu güvencenin üzerinde ki fark ücretlerini karşılamasıdır. Üstelik SGK ile anlaşmalı birçok özel hastaneden hizmet alabilir ve Özel Sağlık Sigorta ürünlerine göre genellikle daha düşük prim ödersiniz.</p>
            <p>Ancak unutmayın ki bu sigorta ürününe sahip olmak için  ya Sosyal Güvenlik Kurumu (SGK) çatısı altında bulunmanız ya da ilgili kamu kuruluşuna Genel  Sağlık Sigortası (GSS) pirimlerinizi düzenli olarak ödemiş olmanız gerekmektedir. Bu şartları sağladığınız taktirde Katılım Tamamlayıcı Sağlık Sigortasına sahip olabilir ve aynı zamanda bu paketinize eş ve çocuklarınızı da dahil ederek poliçenizi genişletebilirsiniz.</p>
            <p>Katılım Özel Sağlık Sigorta ürünleri ise SGK&apos;ya bağlı kalmaksızın, özel sağlık kuruluşlarından hizmet almanızı sağlayan ve geniş kapsamlı sağlık güvencesi sunan bir sigorta türüdür. Katılım Özel Sağlık Sigortanız sayesinde, SGK çatısı altında olmasanız dahi özel hastanelerden hizmet alabilir; poliçenizin içeriğine göre ve ameliyat, yoğun bakım, refakatçi giderleri gibi yatarak tedavi masraflarınızı veya doktor muayeneleri, laboratuvar hizmetleri, görüntüleme hizmetleri gibi ayakta tedavi giderleriniz ve hatta ek teminatlarla diş tedavileri, doğum masrafları, göz tedavileri gibi masraflarınızı  karşılayabilirsiniz. Üstelik Katılım Tamamlayıcı Sağlık Sigorta paketlerine göre daha geniş kapsamlı sağlık hizmetleri sunan bu ürünlerde poliçe kapsamı ve limitlerinizi kişiselleştirilebilir, poliçenizi esnek hale getirebilirsiniz.</p>
            <p>Şimdi ihtiyacınıza yönelik sigorta türüne karar verdiniz. Seçiminiz hangi ürün olursa olsun Sigorka.com&apos;un anlaşmalı olduğu   Türkiye Katılım ve  Katılım Emeklilik&apos;in   ayrıcalıklı Katılım Özel Sağlık Sigortaları&apos;na ve ya Katılım Tamamlayıcı Özel Sağlık Sigorta paketlerine bir tıkla ulaşın, karşılaştırın ve teklif alın.</p>
            <h4>Sağlık Sigortaları Hakkında Bilmeniz Gerekenler</h4>
            <FaqList faqs={sagligimFaqs} />
          </div>
        </div>
      </section>
    </>
  );
} 