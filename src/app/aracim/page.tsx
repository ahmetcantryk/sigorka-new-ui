import { Metadata } from 'next';
import Banner from '../components/common/Banner';
import Breadcrumb from '../components/common/Breadcrumb';
import ProductBoxList from '../components/product/ProductBoxList';
import FaqList from '../components/common/FaqList';
import '../../styles/subpage.min.css';

export const metadata: Metadata = {
  title: "Araç Sigortaları - Zorunlu Trafik ve Kasko | Sigorka",
  description: "Aracınıza özel en uygun kasko ve trafik sigortası seçeneklerini Sigorka'da kolayca karşılaştırın ve endişe etmeden, güven içinde sigortanızı yapın.",
  alternates: {
    canonical: "https://sigorka.com/aracim"
  },
  openGraph: {
    title: "Araç Sigortaları - Zorunlu Trafik ve Kasko | Sigorka",
    description: "Aracınıza özel en uygun kasko ve trafik sigortası seçeneklerini Sigorka'da kolayca karşılaştırın ve endişe etmeden, güven içinde sigortanızı yapın.",
    url: "https://sigorka.com/aracim",
    type: "website"
  },
  twitter: {
    title: "Araç Sigortaları - Zorunlu Trafik ve Kasko | Sigorka",
    description: "Aracınıza özel en uygun kasko ve trafik sigortası seçeneklerini Sigorka'da kolayca karşılaştırın ve endişe etmeden, güven içinde sigortanızı yapın.",
    card: "summary_large_image"
  }
};

const aracimProducts = [
  {
    title: "Katılım Kasko Sigortası",
    img: "/images/product-icons-subpage/katilim-kasko-sigortasi.svg",
    alt: "Katılım Kasko Sigortası",
    link: "/kasko-teklif"
  },
  {
    title: "Katılım Zorunlu Trafik Sigortası",
    img: "/images/product-icons-subpage/katilim-zorunlu-trafik-sigortasi.svg",
    alt: "Katılım Zorunlu Trafik Sigortası",
    link: "/trafik-teklif"
  },
  {
    title: "İMM Sigortası",
    img: "/images/product-icons-subpage/ferdi-kaza-sigortasi.svg",
    alt: "İMM Sigortası",
    link: "/imm-teklif"
  }
];

const aracimFaqs = [
  {
    question: 'Trafik Sigortası Neleri Kapsar?',
    answer: 'Zorunlu trafik sigortası, sigortalanan aracın kaza sonucunda diğer araç ya da üçüncü şahıslara verebileceği hasarları, mecburi masraflar doğrultusunda karşılayan zorunlu bir sigortadır. Zorunlu Trafik Sigortanız maddi zararınızı, sağlık giderlerinizi, sürekli sakatlık veya ölüm durumlarında verilecek teminatlarınızı kapsar.'
  },
  {
    question: 'Kasko Sigortası Nedir? Ne İşe Yarar?',
    answer: 'Kasko sigortası, aracınızı olası risklere karşı koruma altına alan kapsamlı bir sigorta türüdür. Araç sahipleri tarafından isteğe bağlı olarak yaptırılan bu sigorta, birçok farklı durumu kapsar. Kasko, aracın çalınmasından doğal afetlere, kazalardan yangına kadar geniş bir yelpazede maddi zararları karşılar. Temelde, aracınızın başına gelebilecek her türlü olumsuzluğa karşı güvence sağlar.'
  },
  {
    question: 'Kasko Sigortası ile Trafik Sigortası Arasındaki Fark Nedir?',
    answer: 'Kasko Sigortası ile kendi aracınızda meydana gelen maddi zararları teminat altına almaktadır. Trafik Sigortası ise, aracınızın üçüncü kişilere vereceği maddi ve bedeni zararları teminat altına alan ve yaptırılması zorunlu olan bir sigortadır. Trafik Sigortası, sadece üçüncü kişilere verilen zararları karşılamakta olup, kendi aracınızın hasarını ödemez. Bu durumda, kendi aracınızdaki hasarın karşılanması için Kasko Sigortası yaptırılması gerekmektedir.'
  }
];

export default function AracimPage() {
  return (
    <>
      <Banner
        title1=""
        title2="Aracım"
        size="md"
        bgImage="/images/covers/aracim.jpg"
        icon="/images/subpage/icon-aracim.png"
        icon2x="/images/subpage/icon-aracim@2x.png"
      />
      <section className="page-content">
        <div className="container">
          <ProductBoxList products={aracimProducts} />
          <Breadcrumb
            items={[
              { name: 'Ana Sayfa', href: '/' },
              { name: 'Ürünler', href: '' },
              { name: 'Aracım' }
            ]}
          />
          <div className="text-content">
            <h3>Katılım Araç Sigortaları ile aracımızın başına gelebilecek maddi zararları ve karıştığımız kazada karşı tarafa verebileceğimiz bedeni veya maddi zararları teminat altına alarak, ön görülemez harcamalara karşı kendimizi güvence altına almak elimizdedir.</h3>
            <p>Zorunlu Trafik Sigortası 2918 sayılı Karayolları Trafik Kanunu ile düzenlenmiş, kazaya karışan karşı tarafın aracının, sürücü ve yolcuların giderlerini karşılamak üzere tasarlanmış ve tüm araç sahiplerinin yaptırmakla yükümlü oldukları bir poliçe türüdür. Başka bir deyişle trafiğe çıkmak isteyen tüm araç sahipleri için zorunlu bir sigortadır ve olası bir kazaya karışan diğer bireyler ve araçları için maddi ve bedeni hasar teminatıdır.</p>
            <p><a href="/zorunlu-trafik-sigortasi" target="_self">Katılım Zorunlu Trafik Sigorta</a> poliçesi, bir kazaya karışmanız durumunda karşı taraftaki araca vereceğiniz maddi zararları ve 3. kişilerin sağlık giderlerini, yaralanma ve ölümden kaynaklanan tedavi ve diğer masrafları karşılamak için kullanılmaktadır. Bu sigorta türü, karşı tarafa maddi ve manevi güvence sağlayarak, herhangi bir kaza durumunda korunduğunuza dair içinizin rahat olmasını sağlar. Ayrıca trafik kazası sonucu karşı tarafa ait eşyalara verilen maddi zararlar ve kamu malına kasıtsız olarak verilen zararların tazmini de Zorunlu Trafik Sigortası poliçe kapsamındadır. Üstelik poliçenizin kapsamını araç bakımı, kaza sonrası taksi hizmetleri, yol yardım/çekici gibi ek hizmetleri de içerecek şekilde ek teminatlar ile genişletebilir ve bir kaza durumunda cebinize koruma ve destek sağlayabilirsiniz.</p>
            <p>Zorunlu Trafik Sigortasının sadece kazaya karışan karşı tarafın uğradığı zarar ve masrafları karşıladığına vurgu yaptıktan sonra aklınıza şöyle bir soru gelecektir: Peki kendi aracıma verilen zararları karşılamak için ne yapmalıyım? Kendi aracınıza verilen maddi zararlara karşı cüzdanınızı güvence altına alacak çözüm <a href="/kasko-sigortasi" target="_self">Katılım Kasko Sigortası</a> yaptırmak olacaktır. Kasko, araç sahibini çeşitli risklere karşı koruyan bir sigorta türüdür. Katılım Kasko Sigortası ile aracınızın kaza yapması, çalınması, yanması veya doğal afetler gibi durumlarda oluşabilecek zararları poliçeniz dahilinde karşılayabilirsiniz. Aracınızın kaza sonucu uğrayabileceği hasarları, aracınızın veya parçalarının çalınması sonucu cebinizi yakacak masrafları, bir yangın sonucunda aracın zarar görmesine karşılık uğrayacağınız maddi kayıpları, deprem, sel, dolu gibi doğal afetler sonucunda meydana gelebilecek zararları ve hatta aracınızın üçüncü kişilerin kötü niyetli hareketleri sonucu uğradığı maddi zararları bu poliçe kapsamında karşılayabilirsiniz.</p>
            <p>Şimdi Sigorka.com&apos;un anlaşmalı olduğu <strong>Bereket Katılım Sigorta</strong> ve <strong>Türkiye Katılım Sigorta</strong>&apos;nın ayrıcalıklı <a href="/zorunlu-trafik-sigortasi" target="_self">Katılım Zorunlu Trafik Sigorta</a> ürünlerine ve ya <strong>Bereket Katılım Sigorta</strong> ve <strong>HDI Katılım Sigorta</strong>&apos;nın <a href="/kasko-sigortasi" target="_self">Katılım Kasko Sigorta</a> poliçelerine sahip olmak bir tık uzağınızda. Hemen tıklayın, teklifleri sıralayın, karşılaştırın, size en uygununu satın alın.</p>
            <h4>Araç Sigortaları Hakkında Bilmeniz Gereken Her Şey</h4>
            <FaqList faqs={aracimFaqs} />
          </div>
        </div>
      </section>
    </>
  );
} 