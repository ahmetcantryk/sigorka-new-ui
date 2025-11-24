import Banner from '../components/common/Banner';
import Breadcrumb from '../components/common/Breadcrumb';
import LegalSideNav from '../components/common/LegalSideNav';
import '../../styles/subpage.min.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Elektronik İleti Onayı - Ticari İletişim İzni | Sigorka",
  description: "Bilgilendirme ve kampanya amaçlı elektronik iletilerle ilgili onay sürecinizi bu sayfadan kolayca yönetebilirsiniz. Daha fazlası için sitemizi ziyaret edin.",
  alternates: {
    canonical: "https://sigorka.com/elektronik-ileti-onayi"
  },
  openGraph: {
    title: "Elektronik İleti Onayı - Ticari İletişim İzni | Sigorka",
    description: "Bilgilendirme ve kampanya amaçlı elektronik iletilerle ilgili onay sürecinizi bu sayfadan kolayca yönetebilirsiniz. Daha fazlası için sitemizi ziyaret edin.",
    url: "https://sigorka.com/elektronik-ileti-onayi",
    type: "website"
  },
  twitter: {
    title: "Elektronik İleti Onayı - Ticari İletişim İzni | Sigorka",
    description: "Bilgilendirme ve kampanya amaçlı elektronik iletilerle ilgili onay sürecinizi bu sayfadan kolayca yönetebilirsiniz. Daha fazlası için sitemizi ziyaret edin.",
    card: "summary_large_image"
  }
};

export default function ElektronikIletiOnayiPage() {
  return (
    <>
      <Banner title1="Bilgi Merkezi" title2="Elektronik İleti Onayı" size="sm" />
      <section className="page-content">
        <div className="container">
          <Breadcrumb items={[
            { name: 'Ana Sayfa', href: '/' },
            { name: 'Bilgi Merkezi', href: '#' },
            { name: 'Elektronik İleti Onayı' }
          ]} />
          <div className="row pt-lg-4">
            <div className="col-lg-4 col-md-3">
              <LegalSideNav />
            </div>
            <div className="col-lg-8 col-md-9">
              <div className="text-content text-content-legal-text">
                <h3>Elektronik İleti Onayı</h3>
                <p><span>ARMOR KATILIM SİGORTA VE REAS</span><span>ÜRANS BROKERLİĞİ A.Ş. (Bundan sonra &apos;Şirket&apos; olarak anılacaktır) olarak </span><span>özel hayatın gizliliğine saygı duyuyor ve bu hususta azami hassasiyeti g</span><span>östermeye çaba harcıyoruz. Bu nedenle, sizleri 6698 sayılı Kişisel Verilerin Korunması Kanunu (Bundan sonra </span><span>&apos;KVKK&apos; olarak anılacaktır) ve Elektronik Ticaretin Düzenlenmesi Hakkında Kanun kapsamında bilgilendirmek isteriz.</span></p>
                <p><span>Şirket olarak, onay metninin doldurulması suretiyle elde ettiğimiz kimlik ve iletişim bilgilerinizden oluşan kişisel verileriniz, Kişisel Verilerin Korunması Bilgilendirme ve Aydınlatma Metinleri kapsamında, müşterilerimizin telefon ile aranması, elektronik posta ve SMS g</span><span>önderimi faaliyetimize y</span><span>önelik olarak; poliçe yenileme d</span><span>önemlerinin hatırlatılması, hizmetlerimizin pazarlama süreçlerinin planlanması, icrası </span><span>ve müşteri memnuniyetine y</span><span>önelik çalışmaların yürütülmesi amaçlarıyla, müşteri memnuniyeti anketlerinin g</span><span>önderilmesi, </span><span>özel günlerin kutlanması, bü</span><span>lten g</span><span>önderimi yapılması ve kampanya, promosyon hizmetlerinin sizlerle paylaşımını sağlamak amacıyla KVKK ve Elektronik Ticaretin Düzenlenmesi Hakkında Kanun kapsamında onayınız alınarak işlenecektir. Kişisel verileriniz, bu doğrultuda Telefon; SMS ve E-posta g</span><span>önderiminin gerçekleştirilebilmesi için gerekli güvenlik </span><span>önlemleri alınarak hizmet aldığımız firmalar ile paylaşılacaktır.</span></p>
                <p><span>KVKK</span><span>&apos;nın 11. maddesi kapsamında, ilgili kişi olarak haklarınız bulunmakta olup bu haklarınız ile ilgili taleplerinizi ekte yer alan İlgili Kişi Başvuru Formu</span><span>&apos;nu kullanmak suretiyle işletebilirsiniz.</span></p>
                <p><span>İşbu metni onayladığınız taktirde; yukarıda detaylı olarak açıklamış olduğumuz nedenler ve Aydınlatma Metni</span><span>&apos;nde belirtilen amaçlar ile bağlantılı, sınırlı </span><span>ve </span><span>ölçülü olmak üzere firmamız tarafından telefonla aranmanıza; tarafınıza elektronik ortamdan E-posta ve SMS g</span><span>önderilmesine onay vermektesiniz.</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 