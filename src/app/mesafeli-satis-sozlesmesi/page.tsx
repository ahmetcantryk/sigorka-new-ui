import Banner from '../components/common/Banner';
import Breadcrumb from '../components/common/Breadcrumb';
import LegalSideNav from '../components/common/LegalSideNav';
import '../../styles/subpage.min.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi - Sigorka Yasal Bilgi | Sigorka",
  description: "Sigorta satış işlemleri için geçerli mesafeli satış sözleşmesi metnini detaylı olarak buradan inceleyebilir ve geleceğiniz için en doğru adımı atabilirsiniz.",
  alternates: {
    canonical: "https://sigorka.com/mesafeli-satis-sozlesmesi"
  },
  openGraph: { 
    title: "Mesafeli Satış Sözleşmesi - Sigorka Yasal Bilgi | Sigorka",
    description: "Sigorta satış işlemleri için geçerli mesafeli satış sözleşmesi metnini detaylı olarak buradan inceleyebilir ve geleceğiniz için en doğru adımı atabilirsiniz.",
    url: "https://sigorka.com/mesafeli-satis-sozlesmesi",
    type: "website",
    images: [
      {
        url: "https://sigorka.com/images/sigorka-og-image.png",
        width: 1200,
        height: 630,
        alt: "Mesafeli Satış Sözleşmesi - Sigorka Yasal Bilgi | Sigorka"
      }
    ]
  },
  twitter: {
    title: "Mesafeli Satış Sözleşmesi - Sigorka Yasal Bilgi | Sigorka",
    description: "Sigorta satış işlemleri için geçerli mesafeli satış sözleşmesi metnini detaylı olarak buradan inceleyebilir ve geleceğiniz için en doğru adımı atabilirsiniz.",
    card: "summary_large_image",
    images: ["https://sigorka.com/images/sigorka-og-image.png"]
  }
};

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <>
      <Banner title1="Bilgi Merkezi" title2="Mesafeli Satış Sözleşmesi" size="sm" />
      <section className="page-content">
        <div className="container">
          <Breadcrumb items={[
            { name: 'Ana Sayfa', href: '/' },
            { name: 'Bilgi Merkezi', href: '#' },
            { name: 'Mesafeli Satış Sözleşmesi' }
          ]} />
          <div className="row pt-lg-4">
            <div className="col-lg-4 col-md-3">
              <LegalSideNav />
            </div>
            <div className="col-lg-8 col-md-9">
              <div className="text-content text-content-legal-text">
                <h3>Mesafeli Satış Sözleşmesi</h3>
                <p><span><strong>MADDE 1: TARAFLAR </strong></span></p>
                <p><span>İşbu s</span><span>özleşme sigorka.com internet sitesi üzerinden sigorta ve bireysel emeklilik ürünü satın almak isteyen ALICI ile SATICI arasında aşağıdaki hüküm ve koşullar dahilinde akdedilmiştir.</span></p>
                <p><span>MADDE 2: KONU</span></p>
                <p><span>İşbu mesafeli satış s</span><span>özleşmesinin konusu, ARACI</span><span>&apos;ya ait sigorka.com (&quot;Websitesi&quot;) internet sitesi üzerinden ARACI</span><span>&apos;nı</span><span>n ALICI</span><span>&apos;ya sunacağı anlaşmalı olduğu sigorta şirketlerine ait sigorta ürünlerine ilişkin teklif, poliçe ve elektronik ortamda mesafeli olarak satış hizmetiyle ilgili tarafları</span><span>n 6502 sayılı Tüketicinin Korunması Hakkında Kanun, Mesafeli S</span><span>özleşmeler Y</span><span>önetmeliği, 28982 sayılı Sigortacılık Kapsamı</span><span>nda Değerlendirilecek Faaliyetlere, Tüketici Lehine Yapılan Sigorta S</span><span>özleşmeleri İle Mesafeli Akdedilen Sigorta S</span><span>özleşmelerine İlişkin Y</span><span>önetmelik (beraber &quot;Mevzuat&quot; olarak anılacaktır.) çerçevesinde hak ve yükümlülüklerin belirlenmesidir.</span></p>
                <p><span>ALICI, işbu s</span><span>özleşmeyi okuduğunu ve kabul ettiğini onaylamadan, sonraki adımlara geçemeyecek ve poliçe teklifi ve elektronik ortamda mesafeli olarak sigorta ürünü satın alım işlemlerini gerçekleştiremeyecektir.</span></p>
                <p><span>ALICI, ARACI</span><span>&apos;nın isim, unvan, açık adres, telefon ve diğ</span><span>er erişim bilgileri, satışa konu sigorta ürününün temel nitelikleri, vergiler dâhil olmak üzere satış fiyatı, </span><span>ödeme şekli, teslimat ve iade koşulları ve masrafları </span><span>vs. satışa konu mal ile ilgili tüm </span><span>ön bilgiler ve </span><span>&quot;cayma&quot; hakkının kullanılması ve bu hakkın nasıl kullanılacağı, şikâyet ve itirazlarını iletebilecekleri resmi makamlar vs. konusunda açık, anlaşılır ve internet ortamına uygun şekilde ARACI tarafından bilgilendirildiğini, bu </span><span>ön bilgileri elektronik ortamda teyit ettiğini ve sonrasında sigorta ürünü aldığını işbu S</span><span>özleşme hükümleri çerçevesinde kabul, beyan ve taahhüt eder.</span></p>
                <p><span>ALICI, ARACI</span><span>&apos;nın poliçe teklifi ve satışı işlemleri için ve bu amaç</span><span>la sınırlı olmak üzere kişisel verilerini işleme yetkisi verdiğini kabul ve beyan etmektedir. Ayrı</span><span>ca ARACI, ALICI</span><span>&apos;nın kişisel verilerini işbu s</span><span>özleşme amaçları ile sınırlı olmak kaydıyla gerektiğinde kamu kurumları ve iş ortakları ile paylaşabilecektir.</span></p>
                <p><span><strong>MADDE-3 SATIŞ</strong></span><span><strong>A KONU ÜR</strong></span><span><strong>ÜN/</strong></span><span><strong>ÜR</strong></span><span><strong>ÜNLER, Ö</strong></span><span><strong>DEME Bİ</strong></span><span><strong>LGİ</strong></span><span><strong>LERİ </strong></span><span><strong>VE TESLİ</strong></span><span><strong>MAT</strong></span></p>
                <p><span>Ürünün </span><span>özelliklerine (cinsi ve türü) ilişkin bilgiler her sigorta veya bireysel emeklilik ürününün türü</span><span>ne g</span><span>ö</span><span>re değişiklik g</span><span>östermekte olup, ürün seçildiğinde ürünün bedeli kullanıcı ekranında g</span><span>örüntülenmektedir. Bu bilgiler ALICI tarafından da onaylanmıştır.</span></p>
                <p><span>Ödeme Şekli: Sadece Kredi Kartı ile </span><span>ödeme kabul edilmektedir.</span></p>
                <p><span>Satın alınan sigorta ürününe dair poliçeyi ALICI pdf formatında internet sitesinden indirebilecektir. Ayrıca ARACI tarafından ALICI</span><span>&apos;ya poliçe elektronik posta ile de g</span><span>önderecektir. ALICI tarafından verilen elektronik posta adresinin yanlış olmasından veya başkasına ait olmasından dolayı poliçenin ulaşmaması durumunda ALICI ARACI</span><span>&apos;dan herhangi bir talepte bulunamayacağını kabul, beyan ve taahhüt eder.</span></p>
                <p><span><strong>MADDE-4 SÖ</strong></span><span><strong>ZLEŞME TARİHİ</strong></span></p>
                <p><span>İşbu s</span><span>özleş</span><span>me ALICI</span><span>&apos;nın seçtiği sigorta türü</span><span>ne g</span><span>öre yapması gereken </span><span>ödemeyi yaptığı anda akdedilmiş sayılır.</span></p>
                <p><span><strong>MADDE-5 GENEL HÜK</strong></span><span><strong>ÜMLER</strong></span></p>
                <p><span>ALICI sigorka.com internet sitesinde s</span><span>özleşme konusu ürünün tüm </span><span>özelliklerine, temel nitelikleri, kapsadığı rizikoları bildiğ</span><span>ini, satış fiyatı </span><span>ve </span><span>ödeme şekli ile teslimata ilişkin </span><span>ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini kabul, beyan ve taahhüt eder.</span></p>
                <p><span>ALICI, işbu S</span><span>özleşme çerçevesinde verdiği kişisel bilgilerin doğru olduğunu beyan ve taahhüt eder. Kişisel bilgilerin doğruluğundan ALICI sorumludur. ARACI</span><span>&apos;nın bu bilgilerin doğru olmaması nedeniyle uğrayacağı tüm zararlardan ALICI sorumludur.</span></p>
                <p><span>ALICI, doğruluğu, gü</span><span>ncelliği ve verdiği bilgilerin kendisine ait olduğu veya üçüncü kişilere ait olmakla birlikte sigorta veya bireysel emeklilik ürünü satın alabilmek veya üçüncü kişileri lehdar olarak g</span><span>östermek üzere gerekli açık rızanın kendisi tarafından alınmış olduğunu, bu bilgilerle ilgili olarak bir ihlal ortaya çıkması ve ARACI</span><span>&apos;nın bu ihlal nedeniyle bir zarar g</span><span>örmesi durumunda ARACI</span><span>&apos;nın zararlarını nakden ve defaten tazmin edeceğini kabul, beyan ve taahhüt eder.</span></p>
                <p><span>S</span><span>özleşmeye konu sigorta ürününe ait korumanın başlamış sayılması iç</span><span>in işbu mesafeli satış s</span><span>özleşmesi ile </span><span>ön bilgilendirme formunun elektronik ortamda teyit edilmiş olması </span><span>ve ürün/ürünlerin bedelinin ALICI tarafından kredi kartı ile </span><span>ödenmiş olması şarttır. Herhangi bir nedenle ürün/ürünlerin bedeli </span><span>ödenmez veya banka kayıtlarında iptal edilir ise, taraflar arasında bir sigorta s</span><span>özleşmesinin kurulmamış olacağını taraflar kabul, beyan ve taahhüt eder.</span></p>
                <p><span>S</span><span>özleşmeye konu ürüne/ürünlere ilişkin </span><span>ödemenin ALICI tarafından kredi kartı ile yapılması durumunda, ALICI ile kredi kartı sahibinin ya da ürünün/ürünlerin teslim edileceği kişinin farklı olmasından kaynaklanabilecek olan, kredi kartının veya banka kartının yetkisiz kişilerce haksız ve hukuka aykırı olarak kullanılması da dahil olmak üzere türlü hukuki risk, ALICI</span><span>&apos;ya aittir. ALICI, bahsi geçen durumlarda herhangi bir şekilde zarara uğ</span><span>raması halinde ARACI</span><span>&apos;dan hiçbir talepte bulunmayacağını kabul, beyan ve taahhüt eder.</span></p>
                <p><span>ALICI,</span><span> sigorka.com internet sitesi üzerinden kredi kartı gerektiren işlemlerde kredi kartı malikinin rızası ile işlem yapacağını; aksi halde </span><span>ödeme iadesi, hizmeti ifa etmeme veya benzeri sebeplerden kaynaklanabilecek, avukatlık masrafları </span><span>da dâhil olmak üzere her türlü masraflardan ve zarardan mü</span><span>nhasıran sorumlu olacağını ve ARACI</span><span>&apos;yı bunlardan kaynaklanabilecek her türlü talepten âri tutacağını kabul, beyan ve taahhüt eder.</span></p>
                <p><span>Sigorka.com internet sitesini oluşturan tüm yazılımlara ilişkin kaynak kodu, veri kodu, yazılım ve sistem içerisindeki veri tabanı ve bunların geliştirilmiş versiyonları üzerindeki 5846 sayılı Fikir ve Sanat Eserleri Kanunu</span><span>&apos;nun 21. maddesinde &quot;İş</span><span>leme&quot;, 22. maddesinde &quot;Çoğaltma&quot;, 23. Maddesinde &quot;Yayma&quot;, 24. maddesinde &quot;Temsil&quot; ve 25. maddesinde &quot;İşaret Ses ve/veya G</span><span>örüntü Nakline Yarayan Araçlarla Umuma İletim&quot; hakları adı altında düzenlenen mali hakların tamamı üzerinde ve aynı kanunun 14. maddesinde &quot;Umuma Arz Salahiyeti&quot;, 15. maddesinde &quot;Adın Belirtilmesi Salahiyeti&quot; ve 16. maddesinde &quot;Eserde Değişiklik Yapılmasını Men Etme&quot; adı altında düzenlenen manevi hakları kullanma yetkisi dahil olmak ancak bunlarla sınırlı olmamak üzere tüm fikri mülkiyet hakları (telif hakkı ve sair hak) yer, sü</span><span>re, içerik, mecra ve sayı sınırı olmaksızın, mü</span><span>nhası</span><span>ran ARACI</span><span>&apos;ya aittir ve ARACI</span><span>&apos;nın yazılı açık onayı olmadan kopyalanamaz, tamamı ya da bir kısmı üzerinde işleme veya tersine mühendislik yapılamaz; asıl ve/veya işlenecek halinin/ tamamını veya bir kısmını doğrudan veya dolaylı olarak çoğaltılamaz; herhangi bir şekil veya y</span><span>öntemle yayılamaz; doğrudan doğruya veya işaret, ses veya resim nakline yarayan araçlarla umumî mahallerde temsil suretiyle faydalanılamaz; dijital ortamlarda ve/ veya mobil araçlarla kullanılamaz, umuma iletilemez ve üçüncü kişilerin erişimine sunulamaz; S</span><span>özleşme tarihinde bilinen ve S</span><span>özleşme tarihinden sonra geliştirilecek teknik olanaklarla üretilecek veri taşımaya yarayan araçlara kaydedilemez; her türlü g</span><span>ö</span><span>rsel-işitsel eser içerisinde kullanılamaz ve S</span><span>özleşme tarihinde bilinen veya ileride geliştirilecek y</span><span>öntemlerle, işaret-ses ve/veya g</span><span>örüntü nakline yarayan araçlarla veya yeniden yayınlanmak suretiyle umuma iletilemez, sergilenemez, değiştirilemez, uyarlanamaz ya da tercüme edilemez.</span></p>
                <p><span>ALICI, spam, virü</span><span>s, Truva atı ve bunlarla sınırlı olmaksızın benzeri diğer k</span><span>ötü niyetli yazılımlar ile İnternet Sitesi</span><span>&apos;nin çalış</span><span>masını durdurucu veya engelleyici iş, işlem veya eylemlerde bulunmayacağını veya bu y</span><span>ö</span><span>nde iş, işlem veya eylemlerde bulunan üçüncü kişilerle herhangi bir ilişki içerisinde olmayacağını kabul, beyan ve taahhüt eder.</span></p>
                <p><span>ALICI işbu s</span><span>özleşme konusu hizmeti aldığı an itibariyle poliçenin klozlarını kontrol etmeyi kabul ve taahhüt eder.</span></p>
                <p><span>ALICI</span><span>&apos;ya ait kredi kartının alıcının kusurundan kaynaklanmayan bir şekilde yetkisiz kişilerce haksız veya hukuka aykırı kullanılması nedeniyle banka veya finans kuruluşunun prim bedelini ARACI</span><span>&apos;nın anlaşmalı olduğu ilgili Sigorta Şirketi</span><span>&apos;ne </span><span>ödememesi halinde sigorta s</span><span>özleşmesi hükümlerini doğurmamaya başlamayacak ve kendiliğ</span><span>inden geçersiz hale gelecektir.</span></p>
                <p><span>ARACI, cayma beyanının kendisine ulaş</span><span>masından sonra (10) on gün içinde , durumu ilgili Sigorta Şirketi</span><span>&apos;ne bildirecektir. İlgili sigorta şirketi genel şartlarda belirlenen hallerin gerçekleşmesi halinde bedelini iade edebilecektir. Bazı zorunlu sigorta ürünlerinde sigorta ürünü genel şartları </span><span>gereği iptal, cayma ve iade s</span><span>öz konusu değildir. (DASK , Seyahat, Trafik Sigortaları vb.)</span></p>
                <p><span>Satın alınan sigorta veya bireysel emeklilik ürününün satışının akabinde sigortanın kullanımı </span><span>esasında Sigorta şirketi ve ALICI arasında çıkabilecek ihtilaflar ARACI</span><span>&apos;ya bağlanamayacağı gibi bu gibi durumlarda ARACI</span><span>&apos;ya rücu edilemez.</span></p>
                <p><span>ALICI, satı</span><span>n aldığı sigorta ürünün kapsamı ve teminatları ve uygulaması ile ilgili olarak, sigorta genel ve </span><span>özel şartları ile ilgili olarak tek muhatabının sigorta teminatını veren sigorta şirketi olduğunu, ARACI</span><span>&apos;nın sadece acente olduğunu ve bu nedenle sigorta s</span><span>özleşmesinin içeriğini teşkil eden genel ve </span><span>özel şartlar ile poliçe üzerinde yazan bilgiler de dahil olmak üzere herhangi bir etkisinin, bu şartlara bir müdahalesinin olmadığını, bu nedenle sigorta s</span><span>özleşmesinin kendisine dair tüm taleplerin muhatabının sigorta şirketi olduğunu, ARACI</span><span>&apos;nın faaliyetinin bir aracılık faaliyetinden ibaret olduğunu kabul, beyan ve taahhüt eder.</span></p>
                <p><span><strong>MADDE-6 CAYMA HAKKI </strong></span></p>
                <p><span>ALICI, s</span><span>özleşmenin imzalandığı tarihten itibaren 14 (ond</span><span>ört) gün içinde herhangi bir gerekçe g</span><span>östermeksizin ve cezai şart </span><span>ödemeksizin s</span><span>özleşmeden cayma hakkına sahiptir. İşbu 14 (ond</span><span>ört) günlük süre, tüketicinin s</span><span>özleşmenin imzalandığı günden itibaren başlar. Cayma hakkının kullanılması için bu sü</span><span>re içinde ARACI</span><span>&apos;ya aşağıda detayları belirtilen iletişim bilgileri vasıtasıyla ALICI yazılı olarak bildirimde bulunmak zorundadır. Bu bildirimin ARACI</span><span>&apos;ya ulaş</span><span>masını takiben ARACI bildirimin kendisine ulaştığına ilişkin teyit bilgisini ALICI ile paylaşacak ve Cayma talebini ilgili Sigorta Şirketine iletecektir. Sigorta Şirketinin uygun g</span><span>örmesi ve yasal mevzuata uygun olması şartıyla bildirimin ulaşma tarihini takiben de 14 (ond</span><span>ört) gün içinde cayma hakkına konu ürünün/ürünlerin bedelini </span><span>ödeme şekline uygun bir şekilde ALICI</span><span>&apos;ya iade edebilecektir. ARACI</span><span>&apos;nın yukarıda belirtilen yükümlülüklerini yerine getirmemesi hâlinde, ALICI cayma hakkını kullanmak için 14 (ond</span><span>ört) günlük süreye bağlı değildir. Her halükarda bu süre cayma süresinin bittiği tarihten itibaren bir yıl sonra sona erer.</span></p>
                <p><span>Cayma Hakkına Dair Bildirimin yapılacağı İletişim Bilgileri;</span></p>
                <p><span>0850 404 04 04</span></p>
                <p><span>Sarayıcedit Mah. Batman Sk No: 30/42 Kadıköy / İSTANBUL</span></p>
                <p><span>Sarayıcedit Mah. Batman Sk No: 30/42 Kadık</span><span>öy / İSTANBUL</span></p>
                <p><span>ALICI, Seyahat Sağlık, DASK ve Trafik sigortası gibi zorunlu bazı sigorta ürünlerinde getirilebilecek yasal gereklilikler nedeniyle ve hali hazırda sigorka.com sitesinde de yayınlanan Seyahat Sağlık ve Dask Sigortası genel şartlarında belirtilen hususlarda ve bu hususların gerçekleşmemesi halinde cayma hakkının kullanılamayacağını bildiğini kabul, beyan ve taahhüt eder.</span></p>
                <p><span><strong>MADDE-7 YETKİLİ MAHKEME</strong></span></p>
                <p><span>İşbu Mesafeli Satış S</span><span>özleşmesi&apos;nin uygulanmasında, Gümrük ve Ticaret Bakanlığınca ilan edilen değere kadar Alıcının Mal veya Hizmeti satı</span><span>n aldığı ve ikametgâhının bulunduğu yerdeki Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir. 6502 Sayılı Tüketicinin Korunması Hakkında Kanun&apos;un 68&apos;nci. Maddesinin 1. fıkrasında belirtilen alt ve üst limitler doğrultusunda tüketici talepleri hakkında ilç</span><span>e/il tüketici hakem heyetleri yetkilidir.</span></p>
                <p><span>Tüketici sı</span><span>fatını haiz olmayan ALICI için, taraflar arasında işbu S</span><span>özleşme</span><span>&apos;</span><span>den doğabilecek uyuşmazlıkların çözümünde İstanbul Merkez Mahkemeleri ve İcra Müdürlükleri yetkilidir.</span></p>
                <p><span>İşbu mesafeli satış s</span><span>özleşmesinin elektronik ortamda taraflarca okunup, kabul edilip, teyit edilmiştir.</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 