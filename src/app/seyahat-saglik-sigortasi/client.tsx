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
    question: 'Yurt Dışına Çıktıktan Sonra Poliçe Yaptırabilir Miyim?',
    answer: 'Hayır yaptıramazsınız, poliçe yapılması durumunda geçerliliği olmayacaktır. Ülkeden çıkış tarihinizin şirketler tarafından tespit edilmesi durumunda ödeme yapılmamaktadır.'
  },
  {
    question: 'Seyahatim Sırasında Başıma Gelebilecek Kaza ve Hastalık Durumunda Teslim Etmem Gereken Belgeler Nelerdir?',
    answer: 'Sigorta ettiren veya sigortalı kaza veya hastalık sonucu ödenmesi gereken muayene, tedavi ilaç ve hastane masraflarını gösteren belgelerin asıllarını veya onaylı suretlerini, tedaviyi yapan hekim veya hastanece doldurulacak ihbar ve tedavi formları ekinde teslim etmekle yükümlüdür.'
  },
  {
    question: 'Yurt Dışı Seyahatim Sırasında Hastalanırsam Tedavi Giderlerim Karşılanır mı?',
    answer: 'Önceden var olan kronik hastalıklar haricinde acil durum ve kaza halinde poliçeniz teminat ve limit kapsamında karşılanır.'
  },
  {
    question: 'Seyahat Sağlık Sigortasını Seyahatimden Kaç Gün Önce Başlatmalıyım?',
    answer: 'Seyahat Sağlık Sigortaları, poliçe genel şartlar gereği öğlen 12.00\'de başlayıp öğlen 12.00\'de sona ermektedir. Bu sebeple seyahat başlangıç saatiniz öğlen 12.00\'den önce ise poliçenizi 1 gün öncesinden başlatmanız gerekmektedir. Aynı durum seyahat bitimi için de geçerlidir.'
  },
  {
    question: 'Seyahat Sigortasının Geçerlilik Süresi Nedir?',
    answer: 'Seyahat Sigortası, sigortalı tarafından belirtilen poliçe başlangıç ve bitiş tarihleri arasında geçerlidir.'
  },
  {
    question: 'Seyahat Sigortası Nedir?',
    answer: 'Yurt dışı seyahatlerde olası hastalık, kaza, bagaj kaybı gibi riskleri teminat altına alan bir sigorta türüdür.'
  }
];

export default function SeyahatSaglikSigortasiPage() {
  const anchors = productAnchors['seyahat-saglik-sigortasi'];
  const offerLink = getOfferLink('seyahat-saglik-sigortasi');

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
          title: 'Seyahat Sağlık Sigortası Teklifi Almak İster misiniz?',
          description: 'Güvenli ve sağlıklı seyahatler için hemen en uygun seyahat sağlık sigortası tekliflerini karşılaştırın.',
          buttonText: 'Hemen Teklif Al',
          buttonLink: '/seyahat-saglik-teklif'
        }}
      />
      <StickyProductNav anchors={anchors} offerLink={offerLink} />
      <ProductBanner
        title1="Sağlığım"
        title2="Seyahat Sağlık Katılım Sigortası"
        buttonText="Hemen Teklif Alın"
        buttonHref="/seyahat-saglik-teklif"
        size="sm"
      />
      <section className="page-content">
        <div className="container">
          <Breadcrumb
            items={[
              { name: 'Ana Sayfa', href: '/' },
              { name: 'Ürünler', href: '' },
              { name: 'Sağlığım', href: '/sagligim' },
              { name: 'Seyahat Sağlık Katılım Sigortası' }
            ]}
          />
          <div className="text-content">
            <h3>Seyahat esnasında aniden meydana gelebilecek hastalık durumlarına karşı sağlığınızı güvence altına almak için seyahat sağlık sigortası yaptırabilirsiniz. Hem yurt içi hem de yurt dışı seyahatleriniz için yaptırabileceğiniz bu sigorta sayesinde keyifli ve güvenli seyahat imkanı elde edebilirsiniz. Geniş kapsamlı ve ek teminatlar ile kapsamı daha da genişletilebilen bir sigorta türü olduğu için ihtiyaçlarınıza ve bütçenize uygun poliçeyi tercih edebilirsiniz. Kendiniz için seyahat sağlık sigortası yaptırabileceğiniz gibi aileniz için de bu sigorta türünü tercih edebilirsiniz.</h3>
            <h4 id="sigorta-nedir">Seyahat Sigortası Nedir?</h4>
            <p>Seyahat Sigortası, seyahate çıkan sigortalıların bu esnada yaşayabilecekleri acil sağlık sorununa karşı onları güvence altına alır. Seyahat süresi boyunca sağlık hizmetlerine erişimi kolaylaştıran ve oluşan masrafları karşılayan bir sigorta türüdür. Özel sigorta türleri arasında yer alır ve oldukça geniş kapsamı ile sigortalıların güvende olmasını sağlar. Hem yurt içinde hem de yurt dışına yapılan seyahatlerde kullanılabilir. Özellikle vize başvurusunda pek çok konsolosluğun zorunlu kıldığı bir sigorta çeşididir.</p>
            <h4 id="teminatlar">Seyahat Sigortası Teminatları Nelerdir?</h4>
            <p>Acil sağlık sorunlarına karşı güvence sunan yurt dışı seyahat sigortası teminat kapsamı çok geniştir. Yurt dışı seyahat sigortasının ana teminatları, asistansları, genişletilmiş asistansları ve ek teminatları şu şekildedir:</p>
            <ul className="prop-list">
              <li>Kaza ve ani hastalıktan dolayı oluşan tedavi giderleri</li>
              <li>Sağlık ve cenaze nakilleri</li>
              <li>Taburcu olduktan sonra ikametgaha geri dönüş masrafları</li>
              <li>Seyahatin gecikmesi</li>
              <li>Seyahatin iptali</li>
              <li>Bagajın gecikmesi</li>
              <li>Bagaj kaybı</li>
              <li>Gıda zehirlenmesi</li>
              <li>Overbooking nedeniyle gecikme</li>
              <li>Erken dönüş giderleri</li>
              <li>Mücbir sebeplerle uçuşun kaçırılması</li>
              <li>Aktarma uçuşunun kaçırılması</li>
              <li>Refakatçinin ulaşımı ve konaklaması</li>
              <li>Bagajın bulunması ve ulaştırılması</li>
              <li>Tedavi nedeniyle konaklama</li>
              <li>Kefalet için avans ödeme</li>
              <li>İlaç gönderimi</li>
              <li>Hukuki danışma</li>
              <li>Acil mesajların iletilmesi</li>
              <li>Yurt dışında nakit avans</li>
              <li>Salgın hastalık teminatı</li>
              <li>Kapkaç teminatı</li>
            </ul>
            <h4>Seyahat Sağlık Sigortası Ne İşe Yarar?</h4>
            <p>Seyahat Sağlık Sigortası; seyahat sırasında aniden oluşabilecek hastalık durumlarında sağlık hizmeti almanızı sağlayan sigortadır. Hem yurt içi hem de yurt dışı seyahatleri için yapılabilir. Sağlık sorunu yaşadığınızda tedavi imkanının yanında bagajın kaybolması ya da seyahatin iptal edilmesi gibi beklenmeyen durumlarda hasar masraflarını da karşılar. Bu sayede seyahatinizi keyifli ve güvence altında geçirmenize yardımcı olur. Seyahat sağlık sigortasının teminat kapsamı ürünlere göre değişebilir. Bu nedenle ihtiyaçlarınıza ve bütçenize göre poliçenizi tercih edebilirsiniz.</p>
            <h4>Seyahat Sigortası Neleri Kapsar?</h4>
            <p>Seyahat Sigortası en genel anlamda seyahat sırasında kaza ya da ani rahatsızlanma durumlarında sağlık hizmeti alabilmenizi sağlar. Artı olarak asistans hizmetleri sayesinde bagajınızın gecikmesinden uçuşu kaçırmanıza kadar birçok beklenmeyen durumda limitler dahilinde masraflarınızı öder. <br />Başta Schengen ülkeleri olmak üzere birçok ülkenin vize işlemlerinde şart koştuğu Yurt Dışı Seyahat Sağlık Sigortası, sigortalıya yurt dışında bulunduğu süre zarfında karşılaşabileceği olumsuz anlarda çok önemli teminatlar sunar. Yurt dışı seyahat sağlık sigortası genel şartlarında; Covid-19 sebebiyle (Ek katkı payı (prim) ödenmesi koşuluyla poliçeye eklenir) gerekecek sağlık giderleri dahil olmak üzere hastalanma ve tıbbi tedavi ile sigorta şirketinden sağlanacak ek teminatlarla hırsızlık ve bagaj hasarı gibi durumlar da teminat altındadır. Seyahat sigortası teminatları ve limitleri şirketlere ve ürünlere göre değişebilir. Bu nedenle en güncel teminat bilgisini teklif aldığınızda görebilmeniz mümkündür.<br />Yurtdışı seyahat sağlık sigortası covid-19 teminatının olması günümüz koşullarında oldukça faydalı olacaktır. Bu nedenle poliçe kapsamına ekleterek güvencenizi arttırabilirsiniz.<br />Yurt dışı seyahat sigortası teminatları; yatarak tedavi, ayakta tedavi, hasta nakli ve vefat durumunda cenaze nakli olarak sıralanır. Teminatların tutarları ise gidilecek ülkeye göre değişiklik gösterebilir. Örneğin bazı ülkeler 10 bin € yatarak tedavi teminatı olan poliçeleri kabul eder. Bu nedenle de sigorta şirketleri, limitlere uygun seçenekler hazırlar.</p>
            <h4 id="gecerli-ulkeler">Seyahat Sağlık Sigortası Hangi Ülkelerde Geçerlidir?</h4>
            <p>Yurt dışı seyahat sağlık sigortası, Türkiye'ye vize uygulayan bazı ülkeler tarafından zorunlu kılınmıştır. Dolayısıyla vize için sağlık sigortası zorunluluğu getiren ülkelerde bu sigorta türü geçerlidir. Örneğin; Schengen ülkelerini ziyaret etmek için Türkiye Cumhuriyeti vatandaşlarından seyahat sağlık sigortası istenir. Ayrıca Schengen ülkesi olmasa da bu vizeyi talep eden ülkeler de mevcuttur. Schengen vizesi başvurunuzun olumlu sonuçlanması için seyahat sağlık sigortası yaptırmanız gerekir. Bu sigortanın zorunlu olduğu ve dolayısıyla geçerli olduğu ülkeler şu şekilde listelenebilir:</p>
            <ul className="prop-list">
              <li>Almanya</li>
              <li>Yunanistan</li>
              <li>Avusturya</li>
              <li>Slovenya</li>
              <li>Belçika</li>
              <li>Slovakya</li>
              <li>Bulgaristan</li>
              <li>Çek Cumhuriyeti</li>
              <li>Romanya</li>
              <li>Danimarka</li>
              <li>Portekiz</li>
              <li>Estonya</li>
              <li>Polonya</li>
              <li>Finlandiya</li>
              <li>Norveç</li>
              <li>Fransa</li>
              <li>Malta</li>
              <li>Hollanda</li>
              <li>İzlanda</li>
              <li>Macaristan</li>
              <li>İsveç</li>
              <li>İsviçre</li>
              <li>Lüksemburg</li>
              <li>İspanya</li>
              <li>Litvanya</li>
              <li>İtalya</li>
              <li>Lihtenştayn</li>
              <li>İzlanda</li>
              <li>Letonya</li>
            </ul>
            <p>Bazı sigorta şirketleri ise askeri ve siyasi olarak risk taşıyan ülkeler için seyahat sağlık sigortası yapmamaktadır. Örneğin; Afganistan, Sudan, İran, Kuzey Kore, Suriye, Kırım, Küba ve Demokratik Kongo Cumhuriyeti bu ülkeler arasındadır.</p>
            <p>Yurt dışı sağlık sigortası yaptırmak için sigorta şirketleri ile iletişime geçerek daha doğru ve net bilgi alabilirsiniz. Özellikle gitmek istediğiniz ülke için hangi seyahat sigortası türünü istediklerini de bu sigorta şirketleri size söyler. Yani yurtdışı seyahat sigortası fiyatları ile ilgili de detaylı bilgi edinebilirsiniz. Fiyatlar kişiden kişiye değişiklik gösterdiği için sizden istenen bilgileri vererek net fiyat alabilirsiniz. Ayrıca sigorta şirketine bağlı olarak da değişen fiyatlar için farklı sigorta firmalarına başvurarak kendinize en uygun poliçeyi bulabilirsiniz.</p>
            <h4>Yurt Dışı Seyahat Sigortası Zorunlu mu?</h4>
            <p>Yurt dışı seyahat sağlık sigortası yaptırmak, yolculuk risklerinin en aza indirgenmesi için işlevsel yöntemlerin başında yer alır. Seyahat sağlık sigortası sayesinde yolcular, seyahat sırasında karşılaşma ihtimalleri olan maddi kayıpları güvence altına alabilir. <br />Öte yandan Türkiye için vize uygulaması bulunan ülkelere giriş sırasında seyahat sağlık sigortasının yapılmış olması bir zorunluluktur. Dolayısıyla yolculuk planlamaları sırasında, gidilen ülke vize talebinde bulunan bir ülke ise sigorta işlemleri de yapılmalıdır. <br />Seyahat sağlık sigortasının yapılması işlemleri tüm ülkeler için zorunlu değildir. Bu ülkelere giriş sırasında zorunluluk bulunmasa bile, seyahat güvencesi sağlamak amacıyla seyahat sağlık sigortası yapılması avantaj sağlar. <br />Sonuç olarak zorunlu olsa da olmasa da uluslararası seyahatler sırasında sigorta güvencesi, yolcuların maddi kayıplarını güvence altına almak için işlevsel bir hizmettir.<br />Seyahat sağlık sigortası yaptırmanın zorunlu olmadığı ülkeler arasında Amerika, Rusya, İngiltere, Dubai ve Kanada gibi ülkeler sayılabilir. Yolcular zorunluluk bulunmaması durumlarında da bu avantajlı işlemi tercih etmelidir. Çünkü özellikle ülkeler arası yolculuklar sırasında karşılaşılabilecek çeşitli riskler mevcuttur. Bu riskleri en aza indirgemek ve kayıpları güvence altına almak için seyahat sigortası yapılmalıdır. Aynı zamanda ülke girişinde Türkiye'den gelen yolcular için seyahat sağlık sigortasını zorunlu tutan ülkeler de bulunmaktadır.</p>
            <h4>Seyahat Sağlık Sigortası Fiyatları Ne Kadar?</h4>
            <p>Seyahat sağlık sigortası fiyatları pek çok faktöre göre değişiklik göstermektedir. Bu sigorta türünün fiyatı belirlenirken; sigortalının yaşına, cinsiyetine, seyahate gidilecek ülke ya da kıtaya, sigortanın geçerli olacağı süreye, teminat kapsamına ve limitlere bakılır. Her sigortalı için poliçe fiyatı aynı değildir. Çünkü bu kişilerin sahip oldukları özellikler ve seyahat edecekleri yerler değişiklik gösterir. Bu da fiyatların değişkenlik göstermesinde etkilidir. Çünkü bu kişilerin olası bir sağlık problemi yaşama riski daha yüksektir ve dolayısıyla katkı payı (prim) ücretleri de sağlıklı bireylere nazaran yüksek olabilir. 0-75 yaş aralığındaki herkese yurt dışı sağlık sigortası yapılabilmektedir. Ancak yaş arttıkça poliçe fiyatında da yükseliş görülebilir. Ayrıca yurt dışına gezmek, çalışmak ya da okumak amaçlı gidebilirsiniz. Bu durumlarda sizden istenen sağlık sigortası türü de değişiklik gösterebilir. Öğrenciler için kişisel sorumluluk teminatı dahil ve hariç olarak seyahat sağlık sigortası düzenlenebilmektedir Her ülkede sağlık hizmetleri bedeli eşit olmadığı için kişinin gideceği ülke seyahat sigortası fiyatları üzerinde çok etkilidir. Seyahati boyunca alacağı sağlık hizmetlerinin karşılanabilmesi için ülkeye özel olarak hazırlanan fiyat aralığı poliçe ücretlerini belirler. Poliçenin geçerlilik süresi de fiyatla belirlenirken göz önünde bulundurulur. Sigorta süresinin seyahat tarihlerini kapsaması oldukça önemlidir. 30 günlük, 3 aylık, 6 aylık ya da 1 yıllık sürelerle seyahat sigortası yaptırılabilir. Buna göre de seyahat sağlık sigortası ücreti değişiklik gösterir.</p>
            <p>Seyahat sağlık sigortalarına bakıldığında 30.000 euro teminatlı ve 50.000 USD teminatlı seçenekler olduğunu görmek mümkündür. Bu iki sigorta türü arasındaki tek fark ülke bazlıdır. Kanada, Amerika, Japonya gibi ülkeler 50.000 USD teminatlı yurtdışı için sağlık sigortası isterken; Schengen ve Avrupa ülkeleri 30.000 euro teminatlı sigorta talep eder. Gideceğiniz ülkenin talep ettiği seyahat sağlık sigortası teminatını öğrenerek doğru sigorta poliçesini satın almanız oldukça önemlidir. Tercih edeceğiniz poliçe türünün kapsamını ek teminatlarla genişletebilir ve ihtiyacınıza ve bütçenize hitap eden seyahat sağlık sigortası poliçesine sahip olabilirsiniz.</p>
            <h4>Seyahat Sağlık Sigortası İptal Şartları Nelerdir?</h4>
            <ul className="prop-list">
              <li>Seyahatin gerçekleşmemesi durumunda sigortalı beyanı ile poliçe vadesi başlamadan 24 saat önce</li>
              <li>Terör saldırısı doğal afet gibi felaketler</li>
              <li>Vize reddi (belge ibrazı)</li>
              <li>Mükerrer poliçesinin bulunması (diğer poliçe örneği)</li>
            </ul>
            <h4>Yurt Dışı Sağlık Sigortası Asistans Hizmetleri Nelerdir?</h4>
            <p>Asistans hizmetleri ise genel olarak yurt dışı seyahat sigortalarında mevcuttur ve poliçe türlerine göre değişmekle birlikte oldukça geniş bir yelpazededir.<br />Seyahat sigortası asistans hizmetleri şunlardır:</p>
            <ul className="prop-list">
              <li>Seyahat ve bagajın gecikmesi</li>
              <li>Bagajın bulunması ve ulaştırılması</li>
              <li>Aktarma yapan uçuşun kaçırılması</li>
              <li>Mücbir sebepler sonucu uçuşun kaçırılması</li>
              <li>Erken dönüş masrafları</li>
              <li>Gıda zehirlenmesi</li>
              <li>Tedavi nedeniyle konaklama</li>
              <li>Refakatçinin ulaşımı ve konaklaması</li>
              <li>Yurt dışında nakit avans</li>
              <li>İlaç gönderi masrafları</li>
              <li>Acil mesajların iletilmesi</li>
              <li>Hukuki açıdan danışma</li>
            </ul>
            <h4 id="nasil-teklif-alinir">Seyahat Sağlık Sigortası Teklifi Nasıl Alınır?</h4>
            <p>Sigorka.com çağrı merkezi ve web sitemiz üzerinden en avantajlı Seyahat Sağlık Katılım Sigortası tekliflerinizi kolay ve hızlı bir biçimde alabilirsiniz.</p>
          </div>
          <div className="col-12 my-5">
            <div className="offer-banner offer-banner-health-bg">
              <div className="offer-banner__content">
                <h3>Seyahat Sağlık Katılım Sigortasına mı ihtiyacınız var?</h3>
                <p>En uygun tekliflerle sağlığınızı güvence altına almak için hemen teklif alın.</p>
              </div>
              <div className="offer-banner__cta">
                <a className="btn btn-wide btn-tertiary" href="/seyahat-saglik-teklif" target="_self">
                  Hemen Teklif Alın
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="page-content pt-0">
        <div className="container">
          <h4>Seyahat Sigortası hakkında Sıkça Sorulan Sorular</h4>
          <FaqList faqs={faqs} />
        </div>
      </section>
    </>
  );
} 

