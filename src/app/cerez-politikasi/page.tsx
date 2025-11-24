import Banner from '../components/common/Banner';
import Breadcrumb from '../components/common/Breadcrumb';
import LegalSideNav from '../components/common/LegalSideNav';
import '../../styles/subpage.min.css';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Çerez Politikası - Sigorka Resmi Web Sitesi | Sigorka",
  description: "Web sitemizde çerezlerin nasıl kullanıldığını, ne amaçla toplandığını ve bu verilerin nasıl saklandığını buradan detaylı bir şekilde öğrenebilirsiniz.",
  alternates: {
    canonical: "https://sigorka.com/cerez-politikasi"
  },
  openGraph: {
    title: "Çerez Politikası - Sigorka Resmi Web Sitesi | Sigorka",
    description: "Web sitemizde çerezlerin nasıl kullanıldığını, ne amaçla toplandığını ve bu verilerin nasıl saklandığını buradan detaylı bir şekilde öğrenebilirsiniz.",
    url: "https://sigorka.com/cerez-politikasi",
    type: "website"
  },
  twitter: {
    title: "Çerez Politikası - Sigorka Resmi Web Sitesi | Sigorka",
    description: "Web sitemizde çerezlerin nasıl kullanıldığını, ne amaçla toplandığını ve bu verilerin nasıl saklandığını buradan detaylı bir şekilde öğrenebilirsiniz.",
    card: "summary_large_image"
  }
};

export default function CerezPolitikasiPage() {
  return (
    <>
      <Banner title1="Bilgi Merkezi" title2="Çerez Politikası" size="sm" />
      <section className="page-content">
        <div className="container">
          <Breadcrumb items={[
            { name: 'Ana Sayfa', href: '/' },
            { name: 'Bilgi Merkezi', href: '#' },
            { name: 'Çerez Politikası' }
          ]} />
          <div className="row pt-lg-4">
            <div className="col-lg-4 col-md-3">
              <LegalSideNav />
            </div>
            <div className="col-lg-8 col-md-9">
              <div className="text-content">
                <h4>
                  ARMOR KATILIM SİGORTA VE REASÜRANS BROKERLIĞI A.Ş ÇEREZ
                  BİLGİLENDİRME METNİ
                </h4>
                <p>
                  &quot;Armor Katılım Sigorta ve Reasürans Brokerliği A.Ş.&quot;
                  mümkün olan en iyi kullanıcı deneyimini sunabilmek için çerezler
                  ve diğer çevrim içi tanımlama teknolojileri (örn. pikseller, web
                  işaretçileri) (birlikte kısaca &quot;Çerez(ler)&quot; olarak
                  anılacaktır) kullanmaktadır. Çerezler, bilgisayarınıza, akıllı
                  telefonunuza, tabletinize, giyilebilir cihazınıza, akıllı
                  televizyonunuza ve/veya sair cihazlarınıza yerleştirilen ve
                  tarayıcınız tarafından kaydedilen düşük boyutlu ve zengin metin
                  biçimli metin dosyalarıdır. Çerezler, takma isimli olsalar veya
                  bir kişiyi doğrudan tanımlamasalar dahi, diğer bilgiler ile
                  birleştirilerek bir kişiyi belirlenebilir kılabildiklerinden
                  kişisel veri olarak kabul edilmektedirler.
                </p>
                <h4>A. Veri Sorumlusu</h4>
                <p>
                  Kişisel verileriniz, veri sorumlusu sıfatıyla İstanbul Ticaret
                  Sicil Müdürlüğü nezdinde kayıtlı olan ve “Sahrayıcedit Mah.
                  Batman Sk. No:30/42 Kadıköy / İstanbul” adresinde bulunan
                  &quot;Armor Katılım Sigorta ve Reasürans Brokerliği A.Ş.&quot;
                  (“Şirket”) tarafından 6698 sayılı Kişisel Verilerin Korunması
                  Kanunu (“Kanun”) hükümleri kapsamında ve işbu Çerez ve Diğer
                  Tanımlama Teknolojilerine Yönelik Aydınlatma Metni
                  (&quot;Aydınlatma Metni&quot;) çerçevesinde; doğru ve güncel
                  şekilde; belirli, açık ve meşru amaçlarla, işlendikleri amaçla
                  bağlantılı, sınırlı ve ölçülü olarak, işlendikleri amaç için
                  gerekli sürelere, hukuka ve dürüstlük kurallarına uygun şekilde
                  işlenmektedir.
                </p>
                <p>
                  Şirketimiz, kişisel verilerinizi başta Kanun olmak üzere ilgili
                  mevzuata uygun olarak şeffaf bir şekilde işlemekte ve
                  verilerinizin güvenli şekilde barındırılmasını sağlamak için
                  gerekli tüm güvenlik tedbirlerini almaktadır. Bu kapsamda
                  Aydınlatma Metni’nde, Şirketimiz ile olan iş ilişkiniz
                  çerçevesinde işlemekte olduğumuz kişisel verilerinizin hangileri
                  olduğu ve bu verilerin hangi amaçlarla işlendikleri başta olmak
                  üzere verilerinizin paylaşıldığı üçüncü taraflara, haklarınıza
                  ve bizimle iletişime geçebileceğiniz yöntemlere ilişkin bilgiler
                  sunulmaktadır.
                </p>
                <p>
                  Kişisel verilerinizin işlenmesine ilişkin daha detaylı bilgi
                  almak için
                  <Link href="/kvkk" rel="noreferrer nofollow noopenner">https://sigorka.com/kvkk</Link>
                  adresinde yer alan Kişisel Verilerin Korunması ve İşlenmesi
                  Politikasını okuyabilirsiniz.
                </p>
                <h4>B. Kişisel Verilerinizin Toplanma Yöntemleri</h4>
                <p>
                  Kişisel verileriniz, Şirketimiz tarafından tamamen veya kısmen
                  otomatik yollarla, elektronik ortamdan internet sitelerimiz ve
                  diğer çevrim içi kanallarımız, tarayıcılarınız, üçüncü parti
                  reklam ortaklarımız, üçüncü parti uygulamaları, sosyal medya
                  platformları ile bunlara ileride eklenebilecek sair kanallar
                  vasıtasıyla ve Çerezler aracılığıyla toplanmaktadır.
                </p>

                <h4>C. Çerez Türleri</h4>
                <h5>1. Kullanım Sürelerine Göre Çerez Türleri</h5>
                <ul style={{ listStyleType: 'none' }}>
                  <li>
                    <strong>Oturum Çerezleri</strong> <br />
                    Geçici Çerez olarak da adlandırılan oturum Çerezler’i,
                    oturumun sürekliliğinin sağlanması amacıyla kullanılır.
                    Kullanıcı internet tarayıcısını kapattığında oturum Çerezler’i
                    de silinmektedir.
                  </li>
                  <li>
                    <strong>Kalıcı Çerezler</strong> <br />İnternet tarayıcısı
                    kapatıldığı zaman silinmeyen ve belirli bir tarihte veya
                    belirli bir süre sonra kendiliğinden silinen Çerezler’dir. Bu
                    Çerezler aracılığıyla kullanıcı bir internet sitesini her
                    ziyaret ettiğinde kullanıcının işlenen kişisel verileri
                    sunucuya iletilmektedir. Reklam verenlerin bir kullanıcının
                    internet tarama alışkanlıklarıyla (web browsing habits) ilgili
                    bilgilerini uzun bir süre boyunca kaydederek kullanabilmeleri
                    nedeniyle kalıcı Çerezler, ’İzleme Çerezi’ olarak da
                    adlandırılırlar. Ayrıca, bu Çerezler kullanıcıların tercihleri
                    doğrultusunda internet sitelerindeki hesaplarına giriş
                    yaparken her seferinde giriş bilgilerini yeniden girmemelerini
                    sağlamak üzere de kullanılabilirler.
                  </li>
                </ul>
                <h5>2. Kaynaklarına Göre Çerez Türleri</h5>
                <ul>
                  <li>
                    <strong>Birinci Taraf Çerezler</strong> <br />İlk taraf
                    Çerezleri, Birinci taraf Çerezler, doğrudan ziyaret ettiğiniz
                    çevrim içi platformlarımızın yani tarayıcınızın adres
                    çubuğunda gösterilen URL adreslerimiz tarafından
                    yerleştirilmektedir.
                  </li>
                  <li>
                    <strong>Üçüncü Taraf Çerezler</strong> <br />Üçüncü taraf
                    Üçüncü taraf Çerezler ziyaret ettiğiniz çevrim içi
                    platformlarımızdan (ya da etki alanından) farklı bir üçüncü
                    kişi tarafından yerleştirilmektedir.
                  </li>
                </ul>
                <h5>3. Kullanım Amaçlarına Göre Çerez Türleri</h5>
                <ul>
                  <li>
                    <strong>Zorunlu Çerezler</strong><br />
                    Zorunlu Çerezler, çevrim içi platformlarımızın çalışması ve
                    talep etmiş olduğunuz bilgi toplumu hizmetlerinin (örn. log-in
                    olma, form doldurma ve gizlilik tercihlerinin hatırlanması)
                    yerine getirilebilmesi amaçlarıyla kullanımı zorunlu olan
                    Çerezler’dir ve bu nedenle açık rıza hukuki şartına
                    dayanmamaktadır. Tarayıcı ayarlarınızı bu Çerezler’i
                    engelleyecek veya sizi uyaracak şekilde belirleyebilirsiniz.
                    Ancak bu durumda internet sitemizin bazı bölümleri
                    çalışmayabilecektir.
                  </li>
                  <li>
                    <strong>İşlevsel Çerezler</strong>
                    <br />
                    İşlevsel Çerezler, zorunlu Çerezler dışında kalan ve bilgi
                    toplumu hizmetlerini açıkça talep etmiş olduğunuz durumlar
                    hariç olmak üzere, internet sitelerimizin daha işlevsel
                    kılınması ve tercihlerinizin hatırlanması yoluyla
                    kişiselleştirilmesi (örn. tercih ettiğiniz dil veya erişim
                    sağladığınız bölge gibi internet sitemizin davranışını ve
                    görümünü değiştiren bilgileri hatırlaması) amaçlarıyla
                    kullanılan Çerezler’dir. Söz konusu Çerezler Şirket veya
                    üçüncü taraf hizmet sağlayıcıları tarafından açık rızanıza
                    istinaden kullanılabilir.
                  </li>
                  <li>
                    <strong>Performans / Analitik Çerezler</strong>
                    <br />
                    Performans ve analitik Çerezler, internet sitelerimizde
                    kullanıcı davranışlarının analiz edilmesi, internet sitemizin
                    iyileştirilmesi, tekil kullanıcı sayılarının tahmin edilmesi,
                    en etkili arama motoru anahtar kelimelerinin tespit edilmesi,
                    gezinme durumunuzun izlenmesi ve reklamların kullanıcılar
                    üzerindeki etkisinin ölçümlenmesi amaçlarıyla kullanılan ve
                    istatistiki ölçüme imkân veren Çerezler’dir. Söz konusu
                    Çerezler Şirket veya üçüncü taraf hizmet sağlayıcıları
                    tarafından açık rızanıza istinaden kullanılabilir ve internet
                    sitelerimizi, hizmetlerimizi ve tekliflerimizi sürekli olarak
                    optimize ederek mümkün olan en iyi alışveriş deneyimini size
                    sunmamıza olanak sağlar.
                  </li>
                  <li>
                    <strong>Reklam / Pazarlama Çerezleri</strong>
                    <br />
                    Reklam / Pazarlama Çerezler’i, kullanıcıların internet
                    ortamındaki faaliyetlerinin izlenmesi, bu faaliyetlerin analiz
                    edilmesi ve kullanıcıların profillenmesi yoluyla
                    kullanıcıların tercih ve beğenilerine uygun daha ilgili çekici
                    ve kişiye özel içerikler sunulması amaçlarıyla kullanılan
                    Çerezler’dir. Söz konusu Çerezler Şirket veya üçüncü taraf iş
                    ortakları tarafından açık rızanıza istinaden kullanılabilir ve
                    yalnızca ilginizi çekebilecek reklam, kampanya, ürün ve
                    hizmetlerin tarafınıza sunulmasını sağlar.
                  </li>
                </ul>
                <h4>
                  D. Çerezlerin Hangi Amaçlarla İşleneceği ve İşlemenin Hukuki
                  Sebepleri
                </h4>
                <h5>1. Zorunlu Çerezler</h5>
                <p>
                  Zorunlu Çerezler aracılığıyla toplanan kişisel verileriniz,
                  KVKK’nın 5’inci maddesinin 2’nci fıkrasının (c) bendi uyarınca
                  bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili
                  olması kaydıyla, sözleşmenin taraflarına ait kişisel verilerin
                  işlenmesinin gerekli olması, (ç) bendi uyarınca veri
                  sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için
                  zorunlu olması ve (f) bendi uyarınca ilgili kişinin temel hak ve
                  özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru
                  menfaatleri için veri işlenmesinin zorunlu olması kişisel veri
                  işleme şartları (hukuki sebepleri) kapsamında işlenmektedir.
                  Çevrim içi platformlarımızda kullanılan zorunlu Çerezler’e
                  ilişkin kullanım amaçları da dahil detaylı bilgiye aşağıdaki
                  tabloda yer verilmektedir:
                </p>
                <div className="table-responsive">
                  <table className="table table-bordered text-center">
                    <colgroup>
                      <col />
                      <col />
                      <col />
                      <col />
                      <col />
                      <col />
                      <col />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Çerez Adı</th>
                        <th>Açıklama</th>
                        <th>Kategori</th>
                        <th>Saklanma Süresi</th>
                        <th>Sağlayıcı</th>
                        <th>Çerez Türü</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>.AspNetCore.Antiforgery.h_gSKXoy7G8</td>
                        <td>
                          Siteler arası istek sahteciliğine (XSRF veya CSRF olarak
                          da bilinir) karşı koruma sağlamak için
                          .AspNetCore.Session ile işbirliği yapar.
                        </td>
                        <td>Gerekli</td>
                        <td>Oturum</td>
                        <td>sigorka.com</td>
                        <td>Birinci taraf</td>
                      </tr>
                      <tr>
                        <td>.AspNetCore.Session</td>
                        <td>Oturum yönetimi için kullanılır.</td>
                        <td>Gerekli</td>
                        <td>Oturum</td>
                        <td>sigorka.com</td>
                        <td>Birinci Taraf</td>
                      </tr>
                      <tr>
                        <td className="rounded-bottom-left">language</td>
                        <td>Dil bilgisini hatırlayan çerezdir.</td>
                        <td>Gerekli</td>
                        <td>Oturum</td>
                        <td>sigorka.com</td>
                        <td className="rounded-bottom-right">Birinci Taraf</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <h5>2. İşlevsel Çerezler</h5>
                <p>
                  İşlevsel Çerezler aracılığıyla toplanan kişisel verileriniz,
                  KVKK’nın 5’inci maddesinin 1’inci fıkrası uyarınca bulunması
                  halinde açık rıza kişisel veri işleme şartı (hukuki sebebi)
                  kapsamında işlenmektedir.
                </p>

                <h5>3. Performans / Analitik Çerezler</h5>
                <p>
                  Performans / Analitik çerezler aracılığıyla toplanan kişisel
                  verileriniz, KVKK’nın 5’inci maddesinin 1’inci fıkrası uyarınca
                  bulunması halinde açık rıza kişisel veri işleme şartı (hukuki
                  sebebi) kapsamında işlenmektedir. Çevrim içi platformlarımızda
                  kullanılan performans / analitik Çerezler’e ilişkin kullanım
                  amaçları da dahil detaylı bilgiye aşağıdaki tabloda yer
                  verilmektedir:
                </p>
                <div className="table-responsive">
                  <table className="table table-bordered text-center">
                    <thead>
                      <tr>
                        <th>Çerez Adı</th>
                        <th>Açıklama</th>
                        <th>Kategori</th>
                        <th>Saklanma Süresi</th>
                        <th>Sağlayıcı</th>
                        <th>Çerez Türü</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>_clsk</td>
                        <td>
                          Geçerli oturum sırasında web sitesinde ve alt
                          sayfalarında geçirilen süreye ilişkin verileri depolar
                        </td>
                        <td>Analitik</td>
                        <td>24 saat</td>
                        <td>sigorka.com</td>
                        <td>Birinci Taraf</td>
                      </tr>
                      <tr>
                        <td>_ga_32XTHR0G97</td>
                        <td>
                          Google Analytics tarafından, bir kullanıcının web
                          sitesini kaç kez ziyaret ettiğinin yanı sıra ilk ve en
                          son ziyaretin tarihlerine ilişkin verileri toplamak için
                          kullanılır.
                        </td>
                        <td>Analitik</td>
                        <td>1 yıl</td>
                        <td>sigorka.com</td>
                        <td>Birinci Taraf</td>
                      </tr>
                      <tr>
                        <td>_clck</td>
                        <td>
                          Kullanıcının web sitesinde gezinmesi ve davranışı
                          hakkında veri toplar. Bu, web sitesi sahibi için
                          istatistiksel raporlar ve ısı haritaları derlemek için
                          kullanılır.
                        </td>
                        <td>Analitik</td>
                        <td>365 gün</td>
                        <td>sigorka.com</td>
                        <td>Birinci taraf</td>
                      </tr>
                      <tr>
                        <td>_ga</td>
                        <td>
                          Ziyaretçinin web sitesini nasıl kullandığına ilişkin
                          istatistiksel veriler oluşturmak için kullanılan
                          benzersiz bir kimlik kaydeder.
                        </td>
                        <td>Analitik</td>
                        <td>1 yıl</td>
                        <td>sigorka.com</td>
                        <td>Birinci taraf</td>
                      </tr>
                      <tr>
                        <td className="rounded-bottom-left">utm_term</td>
                        <td>
                          Çerez, reklam analiz raporu için sitemize geçişin
                          kaynağı ne olursa olsun, utm_term URL parametresinde
                          belirtilen herhangi bir arama motorunda sitemize ve alt
                          alan adlarına ulaşmak için kullanılan anahtar kelime
                          öbeğinin değerini depolamak amacıyla kullanılır.
                        </td>
                        <td>Analitik</td>
                        <td>Oturum</td>
                        <td>sigorka.com</td>
                        <td className="rounded-bottom-right">Birinci taraf</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <h5>4. Reklam / Pazarlama Çerezleri</h5>
                <p>
                  Reklam / Pazarlama Çerezler’i aracılığıyla toplanan kişisel
                  verileriniz, KVKK’nın 5’inci maddesinin 1’inci fıkrası uyarınca
                  bulunması halinde açık rıza kişisel veri işleme şartı (hukuki
                  sebebi) kapsamında işlenmektedir. Çevrim içi platformlarımızda
                  kullanılan reklam / pazarlama Çerezler’ine ilişkin kullanım
                  amaçları da dahil detaylı bilgiye aşağıdaki tabloda yer
                  verilmektedir:
                </p>
                <div className="table-responsive">
                  <table className="table table-bordered text-center">
                    <thead>
                      <tr>
                        <th>Çerez Adı</th>
                        <th>Açıklama</th>
                        <th>Kategori</th>
                        <th>Saklanma Süresi</th>
                        <th>Sağlayıcı</th>
                        <th>Çerez Türü</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>_ttp</td>
                        <td>
                          Bu çerez Tiktok Pixel tarafından reklam
                          kampanyalarınızın performansını ölçmek, iyileştirmek ve
                          kullanıcının TikTok'taki deneyimini (reklamlar dahil)
                          kişiselleştirmek için kullanılır.
                        </td>
                        <td>Pazarlama</td>
                        <td>1 yıl</td>
                        <td>sigorka.com</td>
                        <td>Birinci Taraf</td>
                      </tr>
                      <tr>
                        <td>MUID</td>
                        <td>
                          Bu tanımlama bilgisi, ziyaretçilerin web sitesini
                          kullanımları hakkında yorum bırakmalarına olanak tanır -
                          Bu bilgiler, web sitesini optimize etmek için
                          kullanılır.
                        </td>
                        <td>Pazarlama</td>
                        <td>1 yıl</td>
                        <td>clarity.ms</td>
                        <td>Üçüncü taraf</td>
                      </tr>
                      <tr>
                        <td>MR</td>
                        <td>
                          Bu çerez, web sitelerinde ziyaretçileri izlemek için
                          kullanılır. Amaç, bireysel kullanıcı için alakalı ve
                          ilgi çekici ve dolayısıyla yayıncılar ve üçüncü taraf
                          reklamverenler için daha değerli reklamlar göstermektir.
                        </td>
                        <td>Pazarlama</td>
                        <td>7 gün</td>
                        <td>clarity.ms</td>
                        <td>Üçüncü taraf</td>
                      </tr>
                      <tr>
                        <td>ttcsid_CUIC4TJC77U2U27B1JH0</td>
                        <td>
                          TikTok tarafından oturum bazlı kullanıcı etkileşimlerini
                          izlemek ve reklam performansını analiz etmek amacıyla
                          kullanılır. Bu çerez, ziyaret süresince geçerli olup
                          kullanıcı davranışlarına dair anonim veriler toplar.
                        </td>
                        <td>Pazarlama</td>
                        <td>1 yıl</td>
                        <td>sigorka.com</td>
                        <td>Birinci taraf</td>
                      </tr>
                      <tr>
                        <td>ttcsid</td>
                        <td>
                          TikTok tarafından oturum bazlı kullanıcı etkileşimlerini
                          izlemek ve reklam performansını analiz etmek amacıyla
                          kullanılır. Bu çerez, ziyaret süresince geçerli olup
                          kullanıcı davranışlarına dair anonim veriler toplar.
                        </td>
                        <td>Pazarlama</td>
                        <td>1 yıl</td>
                        <td>sigorka.com</td>
                        <td>Birinci taraf</td>
                      </tr>
                      <tr>
                        <td>IDE</td>
                        <td>
                          DoubleClick tarafından, bir reklamın etkinliğini ölçmek
                          ve kullanıcıya en iyi yeniden hedeflenen reklamları
                          göndermek amacıyla, reklamverenin reklamlarından birini
                          görüntüledikten veya tıkladıktan sonra web sitesi
                          kullanıcısının eylemlerini kaydetmek ve raporlamak için
                          kullanılır.
                        </td>
                        <td>Pazarlama</td>
                        <td>1 yıl</td>
                        <td>doubleclick.net</td>
                        <td>Üçüncü taraf</td>
                      </tr>
                      <tr>
                        <td>ANONCHK</td>
                        <td>
                          Birden çok ziyaret ve birden çok web sitesindeki
                          ziyaretçilerle ilgili verileri kaydeder. Bu bilgiler,
                          web sitelerindeki reklamların etkinliğini ölçmek için
                          kullanılır.
                        </td>
                        <td>Pazarlama</td>
                        <td>4 dakika</td>
                        <td>clarity.ms</td>
                        <td>Üçüncü taraf</td>
                      </tr>
                      <tr>
                        <td>SM</td>
                        <td>
                          Aynı reklam ağını kullanan web siteleri arasında tekrar
                          ziyaretler sırasında kullanıcının cihazını tanımlayan
                          benzersiz bir kimlik kaydeder. Kimlik, hedeflenen
                          reklamlara izin vermek için kullanılır.
                        </td>
                        <td>Pazarlama</td>
                        <td>Oturum</td>
                        <td>clarity.ms</td>
                        <td>Üçüncü taraf</td>
                      </tr>
                      <tr>
                        <td>SRM_B</td>
                        <td>
                          Kullanıcının web sitesinin arama çubuğu işleviyle
                          etkileşimini izler. Bu veriler, kullanıcıya ilgili ürün
                          veya hizmetleri sunmak için kullanılabilir.
                        </td>
                        <td>Pazarlama</td>
                        <td>1 yıl</td>
                        <td>bing.com</td>
                        <td>Üçüncü taraf</td>
                      </tr>
                      <tr>
                        <td>MR</td>
                        <td>
                          Bu çerez, web sitelerinde ziyaretçileri izlemek için
                          kullanılır. Amaç, bireysel kullanıcı için alakalı ve
                          ilgi çekici ve dolayısıyla yayıncılar ve üçüncü taraf
                          reklamverenler için daha değerli reklamlar göstermektir.
                        </td>
                        <td>Pazarlama</td>
                        <td>7 gün</td>
                        <td>bing.com</td>
                        <td>Üçüncü taraf</td>
                      </tr>
                      <tr>
                        <td>MUID</td>
                        <td>
                          Bu tanımlama bilgisi, ziyaretçilerin web sitesini
                          kullanımları hakkında yorum bırakmalarına olanak tanır -
                          Bu bilgiler, web sitesini optimize etmek için
                          kullanılır.
                        </td>
                        <td>Pazarlama</td>
                        <td>1 yıl</td>
                        <td>bing.com</td>
                        <td>Üçüncü taraf</td>
                      </tr>
                      <tr>
                        <td>_tt_enable_cookie</td>
                        <td>
                          Web sitemizdeki davranışlar ve satın almalar hakkında
                          veri toplayan TikTok çerezini kullanarak kendimizi
                          pazarlamak ve reklamlarımızın etkisini ölçmek için bu
                          çerez kullanılır.
                        </td>
                        <td>Pazarlama</td>
                        <td>1 yıl</td>
                        <td>sigorka.com</td>
                        <td>Birinci taraf</td>
                      </tr>
                      <tr>
                        <td>CLID</td>
                        <td>
                          Kullanıcının web sitesinde gezinmesi ve davranışı
                          hakkında veri toplar. Bu, web sitesi sahibi için
                          istatistiksel raporlar ve ısı haritaları derlemek için
                          kullanılır.
                        </td>
                        <td>Pazarlama</td>
                        <td>365 gün</td>
                        <td>clarity.ms</td>
                        <td>Üçüncü taraf</td>
                      </tr>
                      <tr>
                        <td>_ttp</td>
                        <td>
                          Bu çerez Tiktok Pixel tarafından reklam
                          kampanyalarınızın performansını ölçmek, iyileştirmek ve
                          kullanıcının TikTok'taki deneyimini (reklamlar dahil)
                          kişiselleştirmek için kullanılır.
                        </td>
                        <td>Pazarlama</td>
                        <td>1 yıl</td>
                        <td>tiktok.com</td>
                        <td>Üçüncü taraf</td>
                      </tr>
                      <tr>
                        <td>_fbp</td>
                        <td>
                          Facebook tarafından, üçüncü taraf reklamcılardan gerçek
                          zamanlı teklif verme gibi bir dizi reklam ürünü sunmak
                          için kullanılır.
                        </td>
                        <td>Pazarlama</td>
                        <td>90 gün</td>
                        <td>sigorka.com</td>
                        <td>Birinci taraf</td>
                      </tr>
                      <tr>
                        <td className="rounded-bottom-left">_gcl_au</td>
                        <td>Dönüşün oranını ölçen Google Adsense çerezidir.</td>
                        <td>Pazarlama</td>
                        <td>90 gün</td>
                        <td>sigorka.com</td>
                        <td className="rounded-bottom-right">Birinci taraf</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  Bu kapsamda üçüncü taraf iş ortaklarımızın, kendi ağları
                  dahilinde kullanıma dayalı kişisel verilerinizin işlenmesi
                  hakkında detaylı bilgi için lütfen doğrudan ilgili iş
                  ortağımızla irtibata geçiniz yahut bunların gizlilik / çerez
                  politikalarını inceleyiniz. Bazı üçüncü taraf iş ortaklarımızın
                  işbu Aydınlatma Metni yayımı tarihinde ulaşım sağlanan gizlilik
                  / çerez politikalarına aşağıdaki bağlantı sayfaları üzerinden
                  erişim sağlayabilirsiniz. Bununla birlikte ilgili bağlantı
                  sayfaları yalnızca erişim kolaylığı sağlamak adına sizlere
                  sunulmuş olup, Şirket ilgili sayfaların güncelliği ve doğruluğu
                  hakkında herhangi bir sorumluluk kabul etmemektedir:
                </p>
                <h4>
                  E. İşlenen Kişisel Veri Kategorileriniz ile Kişisel
                  Verilerinizin İşlenme Amaçları ve Hukuki Sebepleri
                </h4>
                <h5>
                  1. İşlem Güvenliği (IP adresi bilgileri, internet sitesi giriş
                  çıkış bilgileri, şifre ve parola bilgileri gibi)
                </h5>
                <p>
                  Bu kategorideki kişisel verileriniz, KVKK’nın 5’inci maddesinin
                  2’nci fıkrasının (b) Fiili imkânsızlık nedeniyle rızasını
                  açıklayamayacak durumda bulunan veya rızasına hukuki geçerlilik
                  tanınmayan kişinin kendisinin ya da bir başkasının hayatı veya
                  beden bütünlüğünün korunması için zorunlu olması, (e) bendi
                  uyarınca bir hakkın tesisi, kullanılması veya korunması için
                  veri işlemenin zorunlu olması ve (f) bendi uyarınca ilgili
                  kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla,
                  veri sorumlusunun meşru menfaatleri için veri işlenmesinin
                  zorunlu olması kişisel veri işleme şartları (hukuki sebepleri)
                  kapsamında, bu kapsama girmeyen hallerde açık rızanıza dayalı
                  olarak aşağıdaki amaçlarla işlenmektedir;
                </p>
                <ul>
                  <li>Pazarlama Analiz Çalışmalarının Yürütülmesi</li>
                  <li>Reklam / Kampanya / Promosyon Süreçlerinin Yürütülmesi</li>
                  <li>Ürün / Hizmetlerin Pazarlama Süreçlerinin Yürütülmesi</li>
                  <li>Yetkili Kişi, Kurum Ve Kuruluşlara Bilgi Verilmesi</li>
                </ul>
                <h5>
                  2. Pazarlama (alışveriş geçmişi bilgileri, anket, çerez
                  kayıtları, kampanya çalışmasıyla elde edilen bilgiler)
                </h5>
                <p>
                  Bu kategorideki kişisel verileriniz, KVKK’nın 5’inci maddesinin
                  2’nci fıkrasının (b) Fiili imkânsızlık nedeniyle rızasını
                  açıklayamayacak durumda bulunan veya rızasına hukuki geçerlilik
                  tanınmayan kişinin kendisinin ya da bir başkasının hayatı veya
                  beden bütünlüğünün korunması için zorunlu olması, (e) bendi
                  uyarınca bir hakkın tesisi, kullanılması veya korunması için
                  veri işlemenin zorunlu olması ve (f) bendi uyarınca ilgili
                  kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla,
                  veri sorumlusunun meşru menfaatleri için veri işlenmesinin
                  zorunlu olması kişisel veri işleme şartları (hukuki sebepleri)
                  kapsamında, bu kapsama girmeyen hallerde açık rızanıza dayalı
                  olarak aşağıdaki amaçlarla işlenmektedir;
                </p>
                <ul>
                  <li>Pazarlama Analiz Çalışmalarının Yürütülmesi</li>
                  <li>Reklam / Kampanya / Promosyon Süreçlerinin Yürütülmesi</li>
                  <li>Ürün / Hizmetlerin Pazarlama Süreçlerinin Yürütülmesi</li>
                  <li>Yetkili Kişi, Kurum Ve Kuruluşlara Bilgi Verilmesi</li>
                </ul>
                <h4>F. Çerezler’e İlişkin Tercihlerin Yönetimi</h4>
                <p>
                  Çevrim içi platformlarımıza giriş yaptığınızda yalnızca yukarıda
                  belirtilen zorunlu Çerezler herhangi bir onayınız olmaksızın
                  kullanılmaktadır. Bu kapsamda, çevrim içi platformlarımıza ilk
                  girişiniz esnasında ve gerekmesi halinde takip eden
                  girişlerinizde karşınıza çıkartılan ‘Çerez ve Tanımlama
                  Teknolojileri Yönetim Paneli’ üzerinden çevrim içi
                  platformlarımızda kullanılmakta olan Çerez türlerini görebilir
                  ve zorunlu Çerezler dışında kalan diğer Çerez türleri için
                  ‘açık/aktif’ veya ‘kapalı/pasif’ seçenekleri ile ‘Tüm Çerezleri
                  Kabul Et, ‘Tüm Çerezleri Reddet’ veya ‘Tercihlerimi Onayla’
                  butonundan aktif veya pasif hale getirerek tercihlerinizi her
                  zaman belirleyebilirsiniz. Yine bu panel üzerinden
                  tercihlerinizi her zaman değiştirebilirsiniz.
                </p>
                <p>
                  Ayrıca, çoğu tarayıcı Şirketimizin kontrolü ve müdahalesi
                  olmaksızın kendi Çerezler’ini otomatik olarak kullanmakta ve
                  ancak bu tarayıcılar Çerezler’i reddetme veya kayıt öncesinde
                  uyarı görüntüleme seçeneği de sunabilmektedir. Çoğu internet
                  tarayıcısının menü listesinde bulunan yardım işlevi,
                  tarayıcınızın yeni Çerezler’i kabul etmemesi için nasıl talimat
                  verebileceğinizi, yeni bir Çerez gönderildiğinde tarayıcınızın
                  size ne şekilde bilgi verebileceğini veya Çerezler’in nasıl
                  devre dışı bırakılacağını açıklayabilmektedir. Lütfen bu konuda
                  daha detaylı bilgi için ilgili tarayıcı hizmet sağlayıcı ile
                  doğrudan irtibata geçiniz yahut bunların gizlilik / çerez
                  politikalarını inceleyiniz. Söz konusu devre dışı bırakma işlemi
                  bilgisayarınızdaki, akıllı telefonunuzdaki veya tabletinizdeki,
                  ret işleminin gerçekleştirildiği tarayıcınızda bulunan bir Çerez
                  vasıtasıyla kaydedilecek ve müşteri hesabınızla
                  ilişkilendirilmeyecektir. Bu nedenle devre dışı bırakma işlemi,
                  cihazlarınızın her biri ve de her bir tarayıcı için ayrı ayrı
                  gerçekleştirilmelidir. Tarayıcınız, tarayıcıyı kapatmanızı
                  takiben Çerezler’i kendiliğinden siliyorsa, caymaya ilişkin
                  Çerezler’in (devre dışı bırakma işlevi) de silineceğini
                  hatırlatmak isteriz. Sık kullanılan tarayıcılarda Çerezler’in
                  yönetimine ilişkin bilgilere aşağıdaki bağlantılar aracılığıyla
                  erişebilirsiniz:
                </p>
                <ul>
                  <li>
                    <Link href="https://support.google.com/accounts/answer/61416" target="_blank" rel="noopener noreferrer">Google Chrome</Link>
                  </li>
                  <li>
                    <Link href="https://support.mozilla.org/en-US/kb/enhanced-trackingprotection-firefox-desktop?redirectslug=enable-and-disable-cookies-websitepreferences&redirectlocale=en-US"
                      target="_blank" rel="noopener noreferrer">Mozilla Firefox</Link>
                  </li>
                  <li>
                    <Link href="https://support.microsoft.com/en-gb/windows/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64d"
                      target="_blank" rel="noopener noreferrer">Microsoft Internet Explorer</Link>
                  </li>
                  <li>
                    <Link href="https://help.apple.com/safari/mac/9.0/#/sfri40732" target="_blank" rel="noopener noreferrer">Safari</Link>
                  </li>
                  <li>
                    <Link href="https://help.opera.com/en/latest/web-preferences" target="_blank" rel="noopener noreferrer">Opera</Link>
                  </li>
                </ul>
                <p>
                  Çevrim içi platformlarımızda takip piksellerini engellemek için
                  ayrıca Ghostery, Webwasher, Bug-Nosys veya AdBlock gibi araçları
                  da kullanabilirsiniz.
                </p>
                <p>
                  Ancak çevrim içi hizmetlerimizin tüm işlevlerini kullanabilmeniz
                  için tüm Çerezler’i aktif hale getirmenizi veya tümüne onay
                  vermenizi önermekteyiz. Çerezler uç cihazınızda herhangi bir
                  hasara neden olmamakta veya herhangi bir virüs içermemektedir.
                </p>
                <h4>G. Anlık Bildirimler (Push Notifications)</h4>
                <p>
                  İnternet sitemizi kullanmanız sırasında ayrıca onay vermediğiniz
                  sürece size ‘anlık bildirim’ yapılmamaktadır. Bu özelliği aktif
                  hale getirmeniz halinde ise, anlık bildirimlerin yapılması için
                  gerekli olan işlem güvenliği bilgileriniz yalnızca hedefleme,
                  yeniden hedefleme, veri zenginleştirme, çapraz satış da dahil
                  olmak üzere ve bunlarla sınırlı olmaksızın her türlü kitlesel
                  ve/veya kişiye özel pazarlama ile bu kapsamda bilgilendirme
                  yapılması ve reklam / kampanya / tanıtım çalışmalarının
                  performansının izlenmesi, analiz edilmesi ve ölçülmesi
                  amaçlarıyla işlenir. Anlık bildirim özelliğini aktif hale
                  getirmeniz halinde, her zaman internet tarayıcınızın
                  ayarlarından değişiklik yaparak ilgili özelliği
                  kapatabilirsiniz. Ancak bu durumda, anlık bildirim
                  hizmetlerimizden yararlanmanız mümkün olmayacaktır.
                </p>
                <h4>
                  H. Kişisel Verilerinizin Yurt İçinde ve/veya Yurt Dışında
                  Yerleşik Üçüncü Kişilere Aktarılması
                </h4>
                <p>
                  Şirketimiz bünyesinde kişisel ve özel nitelikli kişisel
                  verileriniz açık rızanızın varlığı halinde aşağıda belirtilen
                  yurtiçi ve yurtdışı alıcılara aktarılmaktadır.
                </p>
                <p>
                  Şirketimizce, açık rızanız dahilinde kişisel ve özel nitelikli
                  kişisel verileriniz yurt dışına aktarılırken; bu verileriniz
                  yanlışlıkla veya hukuka aykırı olarak yok edilmesi,
                  kaybedilmesi, değiştirilmesi, izinsiz olarak açıklanması veya
                  erişilmesi gibi işleme, aktarım veya depolama faaliyetlerinin
                  yol açtığı riskler göz önünde bulundurularak bu risklerin önüne
                  geçebilmesi için gerekli teknik ve idari tedbirler alınmaktadır.
                </p>
                <p>
                  İşbu aydınlatma metninin C kısmında her bir veri kategorisi için
                  belirtilen kişisel veri işleme amaçları ve hukuki sebepleri aynı
                  zamanda kişisel verilerin aktarılmasında da aktarım amaç ve
                  hukuki sebebini oluşturmaktadır.
                </p>
                <p>
                  Açık rızanızın olmaması halinde ancak işbu aydınlatma metninde
                  her bir veri kategorisinde belirtilen amaçlarla KVKK’nın 5’inci
                  maddesinin ikinci fıkrasında veya yeterli önlemler alınmak
                  kaydıyla KVKK’nın 6’ncı maddesinin üçüncü fıkrasında belirtilen
                  şartların birinin bulunması halinde KVKK’nın 8’inci ve 9’uncu
                  maddesinde belirtilen şartlara uygun olarak ilgili veri
                  kategorisi için yukarıda belirtilen kişisel veri işleme
                  şartlarının (hukuki sebeplerinin) aktarım amaçları bakımından da
                  ayrıca mevcut olması halinde aşağıdaki alıcı gruplarına
                  aktarılabilecektir.
                </p>
                <h4>İ. Kişisel Verilerinizin İşlenme Süresi</h4>
                <p>
                  Şirket faaliyetlerimiz sırasında elde edilen kişisel
                  verileriniz, başta Anayasa olmak üzere KVKK, Kişisel Verilerin
                  Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Hakkında
                  Yönetmelik ve diğer ilgili mevzuat hükümlerine uygun şekilde
                  hazırlanan Şirketimizin saklama ve imhaya ilişkin politika ve
                  prosedürlerinde belirtilen genel prensipler ve düzenlemelere
                  uygun şekilde saklanmakta ve imha edilmektedir.
                </p>
                <p>
                  Bu kapsamda kişisel verileriniz, yukarıda yer alan kişisel veri
                  işleme şartlarının tamamının ortadan kalkması halinde imha
                  edilecektir. Kişisel verileriniz bu doğrultuda yasal zaman aşım
                  süreleri boyunca işlenmeye devam edecektir. Açık rıza kişisel
                  veri işleme şartına dayalı olarak işlenen kişisel verileriniz
                  ise, açık rızanızı geri çekmeniz halinde ilk imha periyodunda
                  imha edilecektir.
                </p>
                <h4>J. KVKK Kapsamında Haklarınız</h4>
                <p>
                  Kişisel veri sahibi olarak KVKK’nın 11’inci maddesi uyarınca
                  aşağıdaki haklara sahip olduğunuzu bildiririz:
                </p>
                <ul>
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
                  <li>
                    Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,
                  </li>
                  <li>
                    Kişisel verilerinizin işlenme amacını ve bunların amacına
                    uygun kullanılıp kullanılmadığını öğrenme,
                  </li>
                  <li>
                    Yurt içinde veya yurt dışında kişisel verilerinizin
                    aktarıldığı üçüncü kişileri bilme,
                  </li>
                  <li>
                    Kişisel verilerinizin eksik veya yanlış işlenmiş olması
                    halinde bunların düzeltilmesini isteme ve bu kapsamda yapılan
                    işlemin kişisel verilerinizin aktarıldığı üçüncü kişilere
                    bildirilmesini isteme,
                  </li>
                  <li>
                    KVKK ve ilgili diğer kanun hükümlerine uygun olarak işlenmiş
                    olmasına rağmen, işlenmesini gerektiren sebeplerin ortadan
                    kalkması halinde kişisel verilerinizin silinmesini veya yok
                    edilmesini isteme ve bu kapsamda ve kişisel verilerinizin
                    eksik veya yanlış işlenmiş olması halinde yapılan işlemlerin
                    kişisel verilerinizin aktarıldığı üçüncü kişilere
                    bildirilmesini isteme,
                  </li>
                  <li>
                    İşlenen verilerinizin münhasıran otomatik sistemler
                    vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine
                    bir sonucun ortaya çıkmasına itiraz etme
                  </li>
                  <li>
                    Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle
                    zarara uğraması halinde zararın giderilmesini talep etme
                  </li>
                </ul>
                <p>
                  Yukarıda belirtilen haklarınızı kullanmak için, kimliğinizi
                  tespit etmeye yarayan gerekli bilgiler ile Kanun’un 11.
                  maddesinde belirtilen haklardan kullanmak istediğiniz hakkınıza
                  yönelik açıklamalarınızı içeren talebinizi Şirketimiz
                  <Link href="/Ilgili_Kisi_Basvuru_Formu.pdf" target="_blank" rel="noreferrer nofollow noopener">
                    https://sigorka.com/Ilgili_Kisi_Basvuru_Formu.pdf
                  </Link>
                  alan adlı internet sitesinde yayınlanan veya yayınlanacak olan
                  &quot;KVVK İlgili Kişi Başvuru Formu&quot;nu tam ve eksiksiz bir
                  şekilde doldurarak, formun ıslak imzalı bir nüshasını
                  &quot;Sahrayıcedit Mah. Batman Sk. No:30/42 Kadıköy /
                  İstanbul&quot; adresine bizzat elden teslim edebilir veya formu
                  noter kanalıyla gönderebilir veya
                  <Link href="mailto:armorkatilimsigorta@hs03.kep.tr">
                    armorkatilimsigorta@hs03.kep.tr
                  </Link>
                  adlı kep adresine yollayabilirsiniz
                </p>
                <p>
                  Başvurunuzda yer alan talepleriniz, talebin niteliğine göre en
                  kısa sürede ve tebliğ tarihinden itibaren en geç otuz gün içinde
                  Şirketimiz tarafından ücretsiz olarak sonuçlandırılacaktır.
                  Ancak, işlemin Şirketimiz için ayrıca bir maliyet gerektirmesi
                  hâlinde, Kişisel Verileri Koruma Kurulu tarafından belirlenen
                  tarifedeki ücret alınacaktır. (10.03.2018 tarih ve 30356 sayılı
                  Resmî Gazete ’de yayınlanan &quot;Veri Sorumlusuna Başvuru Usul
                  ve Esasları Hakkında Tebliğ&quot; uyarınca, veri sahiplerinin
                  başvurusuna yazılı olarak cevap verilecekse, on sayfaya kadar
                  ücret alınmaz. On sayfanın üzerindeki her sayfa için 1 Türk
                  lirası işlem ücreti alınabilir. Başvuruya cevabın CD, flash
                  bellek gibi bir kayıt ortamında verilmesi halinde Şirketimiz
                  tarafından talep edilebilecek ücret kayıt ortamının maliyetini
                  geçemez) (&quot;Veri Sorumlusuna Başvuru Usul ve Esasları
                  Hakkında Tebliğ&quot; uyarınca ücret değişikliği yapılması
                  halinde güncel ücret talep edilir.)
                </p>
                <div className="mb-3 text-center">Veri Sorumlusu</div>
                <div className="mb-3 text-center">
                  &quot;Armor Katılım Sigorta ve Reasürans Brokerliği A.Ş.&quot;
                </div>
                <p>
                  6698 sayılı Kişisel Verilerin Korunması Kanunu’nun “Veri
                  Sorumlusunun Aydınlatma Yükümlülüğü” başlıklı 10. maddesi
                  gereğince veri sorumlusunun kimliği, Kişisel verilerimin hangi
                  amaçlarla işleneceği, işlenen kişisel verilerimin kimlere ve
                  hangi amaçla aktarılabileceği, açık rızama dayalı olarak
                  yurtdışına kişisel verilerimin aktarımı halinde
                  karşılaşabileceğim olası riskler, kişisel veri toplamanın
                  yöntemi ile hukuki sebebi ve Kanun’un 11. maddesinde yer alan
                  haklarım konusunda hazırlanan işbu Aydınlatma Metnini okudum,
                  anladım ve veri sorumlusu sıfatına sahip Şirketiniz tarafından
                  bu konuda detaylı olarak bilgilendirildim.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 