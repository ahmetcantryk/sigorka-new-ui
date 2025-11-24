import Banner from '../components/common/Banner';
import Breadcrumb from '../components/common/Breadcrumb';
import LegalSideNav from '../components/common/LegalSideNav';
import '../../styles/subpage.min.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni - Veri Güvenliği Politikası | Sigorka",
  description: "6698 sayılı KVKK kapsamında kişisel verilerinizin korunması, saklanması ve işlenmesine dair tüm bilgiler burada. Daha fazlası için sitemizi ziyaret edin.",
  alternates: {
    canonical: "https://sigorka.com/kvkk"
  },
  openGraph: {
    title: "KVKK Aydınlatma Metni - Veri Güvenliği Politikası | Sigorka",
    description: "6698 sayılı KVKK kapsamında kişisel verilerinizin korunması, saklanması ve işlenmesine dair tüm bilgiler burada. Daha fazlası için sitemizi ziyaret edin.",
    url: "https://sigorka.com/kvkk",
    type: "website"
  },
  twitter: {
    title: "KVKK Aydınlatma Metni - Veri Güvenliği Politikası | Sigorka",
    description: "6698 sayılı KVKK kapsamında kişisel verilerinizin korunması, saklanması ve işlenmesine dair tüm bilgiler burada. Daha fazlası için sitemizi ziyaret edin.",
    card: "summary_large_image"
  }
};

export default function KisiselVerilerinKorunmasiPage() {
  return (
    <>
      <Banner title1="Bilgi Merkezi" title2="Kişisel Verilerin Korunması" size="sm" />
      <section className="page-content">
        <div className="container">
          <Breadcrumb items={[
            { name: 'Ana Sayfa', href: '/' },
            { name: 'Bilgi Merkezi', href: '#' },
            { name: 'Kişisel Verilerin Korunması' }
          ]} />
          <div className="row pt-lg-4">
            <div className="col-lg-4 col-md-3">
              <LegalSideNav />
            </div>
            <div className="col-lg-8 col-md-9">
              <div className="text-content text-content-legal-text">
                <h3>Kişisel Verilerin Korunması Hakkında Aydınlatma Metni</h3>
                <p><span>Sigorta Ettiren/Sigortalı sı</span><span>fatı </span><span>ile Armor Katılım Sigorta ve Reasü</span><span>rans Brokerlığı A.Ş.</span><span> ile kurduğum ilişki nedeniyle paylaştığım kişisel veri,</span> <span>özel nitelikli kişisel veri ve finansal veri teşkil eden bilgilerimin Armor Katılım Sigorta ve Reasü</span><span>rans Brokerlığı A.Ş. tarafından talep ettiğim hizmet kapsamında kullanılması; ürün, hizmet, yenilik ve kampanyaları hakkında bilgilendirilmem, talep ettiğim/edeceğim ürün ve hizmetlere ilişkin tarafımla iletişim kurulabilmesi, ayrıca bu konuda pazarlama faaliyetlerinde kullanılabilmesi ve Armor Katılım Sigorta ve Reasü</span><span>rans Brokerlığı A.Ş. şirketlerinin mevcut veya yeni ürün çalışmaları ve potansiyel müşteri tespiti vb. için toplanmasına, kullanılmasına, açıklanmasına, aktarılmasına ve işlenmesine mevzuat kapsamındaki haklarım saklı kalmak kaydı ile açıkça izin veriyorum. </span></p>
                <p><span>Kişisel verileriniz, sayılanlar ile sınırlı olmamak üzere; genel müdürlük, b</span><span>ö</span><span>lge müdürlükleri, tedarikçilerimiz, iş ortaklarımız, yetkili/resmi kurum kuruluşlar, </span><span>özel ve resmi tüm sağlık kişi, kurum, kuruluşları</span><span>, diğer sigorta şirketleri ve diğer ilgili üçüncü kişi/kurumlardan internet şubesi, çağrı merkezi, kapalı devre kamera sistemi ve diğ</span><span>er tüm fiziki, yazılı, s</span><span>özlü ve elektronik ortamlar/kanallar vasıtasıyla bizzat tarafınızca ve/veya bilginiz dahilinde g</span><span>önderilen/sağlanan/doldurulmuş formlar, belgeler, s</span><span>özlü/yazılı beyanlar, poliçeler, muvafakatnameler, </span><span>özgeçmiş, kimlik belgeniz, elektronik posta, ses/g</span><span>örüntü kayıtlarından elde edilmekte olup, KVKK m. 4/2 hükmünde </span><span>öng</span><span>örülen ilkelere uygun olarak KVKK m.5/2 ve 6/3 hükümlerinde </span><span>öng</span><span>örülen durumların haricinde açık rızanıza istinaden işlenebilmekte ve aktarılabilmektedir.</span></p>
                <p><span>KVKK</span><span>’nın 11. maddesinde Sayılan Hakları</span></p>
                <p><span>Şirketimize başvurarak, kişisel verilerinizin;</span></p>
                <p><span>-</span><span> İşlenip işlenmediğini öğrenme,</span></p>
                <p><span>-</span><span> İşlenmişse buna ilişkin bilgi talep etme</span></p>
                <p><span>-</span><span> İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme,</span></p>
                <p><span>-</span><span> Yurt içinde/yurt dışında aktarıldığı 3. kişileri bilme,</span></p>
                <p><span>-</span><span> Eksik/yanlış işlenmişse düzeltilmesini isteme,</span></p>
                <p><span>-</span><span> KVKK</span><span>’nın md. 7</span><span>’deki şartlar çerçevesinde silinmesini / yok edilmesini / anonimleştirilmesini isteme,</span></p>
                <p><span>-</span><span> Düzeltme, silme/yok etme işlemlerinin verilerin aktarıldığı 3. kişilere bildirilmesini isteme,</span></p>
                <p><span>-</span><span> Mü</span><span>nhasıran otomatik sistemler ile analiz edilmesi nedeniyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</span></p>
                <p><span>-</span><span> Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme haklarına sahip olduğunuzu bildirir, sizlere sunduğumuz tüm ürün ve hizmetlerimizde kişisel veri güvenliğinin </span><span>ön planda olduğu bilinciyle faaliyetlerimize devam ettiğimizi bilgilerinize sunarız.</span></p>
                <p><span>Kişisel Veri Sahibi Başvuru Usulü</span></p>
                <p><span>Yukarıda belirtilen haklarınıza ilişkin taleplerinizi iletmek için bu aydınlatma metninin </span><span>en alt kısmında yer alan linkte bulunan Başvuru Formu&apos;nu kullanabilirsiniz.</span></p>
                <p><span>Taleplerinize ilişkin başvurularınızı;</span></p>
                <p><span>-</span><span> Elden</span></p>
                <p><span>-</span><span> İadeli taahhütlü mektupla</span></p>
                <p><span>-</span><span> Noter aracılığıyla Sahrayıcedit Mah. Batman Sk. No:30/42 Kağıthane/ İstanbul adresine ıslak imzalı kopyası ile veya</span></p>
                <p><span>-</span><span> 5070 sayılı Elektronik İmza Kanunu kapsamında düzenlenen güvenli elektronik imzanız ile imzalayarak armorkatilimsigorta@hs03.kep.tr adresine</span></p>
                <p><span>-</span><span> Kişisel Verileri Koruma Kurulu tarafından </span><span>öng</span><span>örülen başkaca bir y</span><span>öntem ile iletebilirsiniz.</span></p>
                <p><span>Talebiniz mümkün olan en kısa sürede ve her halükarda KVKK</span><span>’da belirtilen sü</span><span>re içerisinde değerlendirilerek sonuçlandırılacaktır. Sizin adınıza 3. kişilerin başvuru talebinde bulunabilmesi için başvuruda bulunacak kiş</span><span>i adına noter kanalıyla düzenlenmiş özel vekaletname bulunmalıdır. Başvurunuzun incelenmesi ve sonuçlandırılmasına ilişkin işlemin bir maliyet gerektirmesi halinde Şirketimizce Kurul tarafından belirlenen tarifedeki ü</span><span>cret alınabilir.</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 