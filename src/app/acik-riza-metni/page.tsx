import Banner from '../components/common/Banner';
import Breadcrumb from '../components/common/Breadcrumb';
import LegalSideNav from '../components/common/LegalSideNav';
import '../../styles/subpage.min.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Açık Rıza Metni Hakkında - Kişisel Veri Onayı | Sigorka",
  description: "Kişisel verilerinizin işlenmesine dair açık rıza metnini okuyarak onay süreçleri hakkında bilgi sahibi olabilirsiniz. Daha fazlası için sitemizi ziyaret edin.",
  alternates: {
    canonical: "https://sigorka.com/acik-riza-metni"
  },
  openGraph: {
    title: "Açık Rıza Metni Hakkında - Kişisel Veri Onayı | Sigorka",
    description: "Kişisel verilerinizin işlenmesine dair açık rıza metnini okuyarak onay süreçleri hakkında bilgi sahibi olabilirsiniz. Daha fazlası için sitemizi ziyaret edin.",
    url: "https://sigorka.com/acik-riza-metni",
    type: "website"
  },
  twitter: {
    title: "Açık Rıza Metni Hakkında - Kişisel Veri Onayı | Sigorka",
    description: "Kişisel verilerinizin işlenmesine dair açık rıza metnini okuyarak onay süreçleri hakkında bilgi sahibi olabilirsiniz. Daha fazlası için sitemizi ziyaret edin.",
    card: "summary_large_image"
  }
};

export default function AcikRizaMetniPage() {
  return (
    <>
      <Banner title1="Bilgi Merkezi" title2="Açık Rıza Metni" size="sm" />
      <section className="page-content">
        <div className="container">
          <Breadcrumb items={[
            { name: 'Ana Sayfa', href: '/' },
            { name: 'Bilgi Merkezi', href: '#' },
            { name: 'Açık Rıza Metni' }
          ]} />
          <div className="row pt-lg-4">
            <div className="col-lg-4 col-md-3">
              <LegalSideNav />
            </div>
            <div className="col-lg-8 col-md-9">
              <div className="text-content text-content-legal-text">
                <h3>Açık Rıza Metni</h3>
                <p><span>Armor Katılım Sigorta ve Reasü</span><span>rans Brokerlığı A.Ş; (</span><span>&quot;</span><span>Armor Katılım&quot; ya da </span><span>&apos;&apos;Şirket</span><span>&apos;&apos;) tarafından, 6698 Sayılı Kişisel Verilerin Korunması Kanunu</span><span>&apos;nun (</span><span>&quot;KVK Kanunu&quot;) ilgili hükümlerine uygun olarak sunulan Kişisel Verilerin Korunması Kanunu Kapsamında Genel Aydınlatma Metni ve KVKK hakkında şirket politikaları çerçevesinde;</span></p>
                <p><span>Kişisel verilerimin ve </span><span>özel nitelikli kişisel verilerimin veri sorumlusu sı</span><span>fatıyla Armor Katılım veya gerekli güvenlik tedbirlerini aldırmak suretiyle yetkilendirdiği veri işleyenler tarafı</span><span>ndan; Armor Katılım&apos;ın müşterilerine sunmuş olduğu ürün ve hizmetlerini en iyi koşullar altında sağlayabilmesi, ürün veya hizmetlerin güvenilir ve kesintisiz bir şekilde temin edilmesi ve müşteri memnuniyetinin en ü</span><span>st düzeyde tutulması, Poliçe teklif ve yenileme tekliflerinin sunulması, poliçelerin düzenlenmesi, Poliçe teklifine ilişkin iletişim araçları üzerinden bilgilendirme yapılması, sigorka.com üzerinden form ile talep oluşturulması, Poliçe primlerinin hesaplanması ve raporlaması, Poliçe prim bedellerinin kredi kartı ile tahsil edilmesi, Banka </span><span>ödemelerinin gerçekleştirilmesi, yazılım sistemleri üzerinden sigortalıya ait poliçe bilgilerinin sorgulanması, pazarlama ve analiz çalışmalarının yürütülmesi, süreçlerinin iyileştirilmesine y</span><span>önelik </span><span>önerilerin alınması ve değerlendirilmesi süreçlerinin planlanması ve icrası, yetkili kurum kuruluşlara mevzuattan kaynaklı yükümlülüklerin yerine getirilmesi hukuk işlerinin/hukuk taleplerinin takibi, mal, hizmet, üretim ve operasyon süreçlerinin yürütülmesi, tahsilat süreçlerinin yürütülmesi, ürün/ hizmetlerin pazarlama süreçlerinin yürütülmesi, </span><span>eksper ve ekspertiz raporlarının oluşturulup, eksper performans takibinin yapılması, </span><span>yetkili servis, acente, eksper başvuru ve kabul süreçlerinin yürütülmesi,</span><span> t</span><span>edarikçi s</span><span>özleşme süreçlerinin yürütülmesi,</span><span> teklif, risk y</span><span>önetimi, reasürans, hasar inceleme, tespit, tazmin, tazminat, tahsil, transfer, rücu, asistans hizmeti ve benzer süreçlerin yürütülmesi,</span><span> müşteri memnuniyetine y</span><span>önelik aktivitelerin yürütülmesi, müşteri talep ve şikayetlerinin değerlendirilmesi, risk y</span><span>önetimi süreçlerinin yürütülmesi, iç denetim/ soruşturma/ istihbarat faaliyetlerinin yürütülmesi, iş sürekliliğinin sağlanması faaliyetlerinin planlanması ve icrası, bilgi teknolojileri alt yapısının oluşturulması ve y</span><span>önetilmesi, şirket faaliyetlerinin ilgili mevzuata uygun olarak yürütülmesinin temini için gerekli operasyonel faaliyetlerinin planlanması ve icrası, kurumsal iletişim ve müşteri iletişimi kanallarından iletilen taleplerin veya başvuruların yerine getirilmesi, kimlik ve iletişim bilgilerinin güncellenmesi, ürün ve hizmetlerimizin geliştirilmesi amacıyla mobil uygulama geliştirme hizmetlerinin ve web sitesi kullanılabilirlik ve kalite analizinin yapılması, mali işlemlerin doğrulaması ve gerçekleştirilmesi, internet sitesi ve uygulama giriş-çıkış kayıtlarının tutulması, web sitemizi ziyaret edenlerin tespit edilmesi, veri analitiklerinin yapılması ve pazar araştırmalarının yürütülmesi, platforma üye olan müşterilere sağlanan hizmetlerin yürütülmesi, soruların ve şikâyetlerin çözüme kavuşturulması, hesap güvenliğinin sağlanması için müşteriden bilgi/belge talep edilmesi, kvkk hukuki ve teknik hizmetlerinin ve iş sağlığı ve güvenliği bilgi y</span><span>önetim sistemi hizmetlerinin yerine getirilmesi, hizmetlerimize ilişkin haberlere, bilgilere ve güncellemelere, tekliflerimize ve </span><span>özel etkinliklerle ilgili pazarlama iletişimleri ve ilginizi çekebilecek diğer pazarlama iletişimlerinin g</span><span>önderilmesi, hakkınızda topladığımız verilerin üçüncü tarafların web sitelerinde yer alan ürün ve hizmet reklamlarımızda bizlere yardımcı olması amaçlarıyla doğrudan veya dolaylı olarak ilgili olan kimlik bilgilerinin, adres bilgilerinin, e-posta adresi, posta adresi, telefon numarası, banka hesap bilgileri ve diğer finansal bilgileri, lokasyon bilgileri, müşteri işlem bilgileri, risk y</span><span>önetimi bilgileri, internet erişim bilgisi, cihaz bilgisi, eğitim bilgileri, iş</span><span>lem güvenliği bilgileri, </span><span>özel nitelikli kişisel veriler ile toplanacak çerezlerin işleneceği, şirket çalışanlarına, g</span><span>örevlilerine, yurt içi grup şirketlerine (şirket ve/veya iş ortaklarına, hissedarlarına), kanunen yetkili kamu kurum ve kuruluşlarına, faaliyetlerini yürütebilmek amacıyla, hukuki zorunluluklar ve yasal sınırlamalar çerçevesinde yurt içi bağımsız denetim şirketlerine, anket şirketlerine, yurt içi/yurt dışı bilişim teknolojileri desteğ</span><span>i alınan sunucular, hosting şirketleri, program, bulut bilişim gibi elektronik ortamlara, tarafıma verilecek hizmetlerin ve/veya faaliyetlerin yürütülmesi için şirket</span><span>&apos;in hizmet aldığı veya birlikte çalıştığı iş ortaklarına, hizmet sağ</span><span>layıcılarına aktarılabileceği, fiziksel veya elektronik ortamda güvenli bir şekilde depolanabileceğini, aktarılabileceğ</span><span>ini, işlenebileceğini ya da verilerin kullanılmasının engellenebileceğ</span><span>ini; </span><span>özel nitelikle kişisel verilerimden sağlık ve cinsel verilerin açık rızam olmaksızın işlenemeyeceğini bildiğimi; yukarıda belirtilen hususlarla ilgili olarak şirket tarafından bilgilendirildiğimi ve Kişisel Verilerin Korunması Kanunun çerçevesinde açık rızam bulunduğunu kabul ve beyan ederim.</span></p>
                <p><span>Armor Katılım tarafından alınan tüm kişisel verilerimin ve nitelikli kişisel verilerimin, yukarıda belirtilen amaçlarla bağlı kalmak kaydıyla, iş </span><span>geliştirme hizmetlerinin sağlanması, istatiksel ve teknik hizmetlerin temini ve müşteri ilişkilerinin yürütülmesi, teknik ve idari altyapı ile elektronik sistemlerin (web sitenin) kurulması, geliştirilmesi, bakımı ile müş</span><span>teri datalarının tutulması, arşivleme ve depolama amacıyla gerekli güvenlik </span><span>önlemlerinin alınması ile aktarabilecek olup, burada işleme faaliyetine tabi tutulup saklanabileceğ</span><span>ini, Çağrı merkezi süreçlerinin y</span><span>önetilmesine ilişkin hizmetlerin sürdürülebilmesi amacıyla şirket çalışanlarına, g</span><span>örevlilerine, yurt dışı/uluslararası grup şirketlerine (Şirket ve/veya iş ortaklarına, hissedarlarına), kanunen yetkili kamu kurum ve kuruluşlarına, faaliyetlerini yürütebilmek amacıyla, hukuki zorunluluklar ve yasal sınırlamalar çerçevesinde yurt dışı/uluslararası bağımsız denetim şirketlerine, anket şirketlerine, yurt dışı bilişim teknolojileri desteğ</span><span>i alınan sunucu, hosting ve altyapı sağ</span><span>layıcı şirketlere, program, bulut bilişim gibi elektronik ortamlara, tarafıma verilecek hizmetlerin ve/veya faaliyetlerin yürütülmesi için Şirket</span><span>&apos;in hizmet aldığı veya birlikte çalıştığı iş ortaklarına, hizmet sağ</span><span>layıcılarına aktarılabileceğini ve bu kapsamda kişisel verilerimin ve </span><span>özel nitelikli kişisel verilerimin yurt dışına aktarılması</span><span>na da açık rızam olduğunu kabul ve beyan ederim.</span></p>
                <p><span>Ayrı</span><span>ca, Armor Katılım ile paylaşmış olduğum kişisel verilerin doğru ve güncel olduğunu; işbu bilgilerde değişiklik olması halinde değişiklikleri şirkete bildireceğimi kabul ve beyan ederim.</span></p>
                <p><span>Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerimin işlenmesine, ilgili süreç kapsamında açıklanan işlenme amacı ile sınırlı olmak üzere kullanılmasına ve paylaşılmasına, gereken süre zarfında saklanmasına açık rızam olduğunu ve bu hususta tarafıma gerekli aydınlatmanın yapıldığını</span><span>; işbu metni, internet sitesinde yer alan Aydınlatma Metnini okuduğumu ve anladığımı kabul ve beyan ederim.</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 