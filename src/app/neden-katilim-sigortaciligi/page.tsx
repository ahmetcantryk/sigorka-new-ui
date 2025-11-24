import Banner from '../components/common/Banner';
import Breadcrumb from '../components/common/Breadcrumb';
import NedenKatilimSigortaciligiClient from './client';
import React from 'react';
import '../../styles/subpage.min.css';

export const metadata = {
  title: "Neden Katılım Sigortacılığı? | Sigorka ile Sigortacılık",
  description: "Faizsiz, paylaşım esaslı ve etik değerlere dayalı katılım sigortacılığı neden tercih edilmeli? Tüm detaylı bilgiler için hemen web sitemizi ziyaret edin.",
  alternates: {
    canonical: "https://sigorka.com/neden-katilim-sigortaciligi"
  },
  openGraph: {
    title: "Neden Katılım Sigortacılığı? | Sigorka ile Sigortacılık",
    description: "Faizsiz, paylaşım esaslı ve etik değerlere dayalı katılım sigortacılığı neden tercih edilmeli? Tüm detaylı bilgiler için hemen web sitemizi ziyaret edin.",
    url: "https://sigorka.com/neden-katilim-sigortaciligi",
    type: "website"
  },
  twitter: {
    title: "Neden Katılım Sigortacılığı? | Sigorka ile Sigortacılık",
    description: "Faizsiz, paylaşım esaslı ve etik değerlere dayalı katılım sigortacılığı neden tercih edilmeli? Tüm detaylı bilgiler için hemen web sitemizi ziyaret edin.",
    card: "summary_large_image"
  }
};

export default function NedenKatilimSigortaciligiPage() {
  return (
    <>
      <NedenKatilimSigortaciligiClient />
      <Banner title1="Hakkımızda" title2="Neden Katılım Sigortacılığı?" size="sm" />
      <section className="page-content">
        <div className="container">
          <Breadcrumb items={[
            { name: "Ana Sayfa", href: "/" },
            { name: "Hakkımızda" },
            { name: "Neden Katılım Sigortacılığı?" }
          ]} />
          <div className="text-content">
            <h3>Katılım sigortacılığında yardımlaşma ve dayanışma esası ağır basar. Sigortalıların sahibi bulundukları fonun faizsiz yollarla işletmesi ile sigorta hizmeti gerçekleşirken, taraflar arasında daha adil ve güvene dayalı bir sözleşme yapılmış olur.</h3>
            <p>Sigorta sektörü gün geçtikçe mali yapı, bilgi teknolojileri ve ürün çeşitliliği bakımından gelişmektedir. Faizsiz yurt dışı reasürans şirketlerinin artması ve 2016 yılından itibaren Kamu&apos;nun yeni katılım bankaları kurması ile birlikte katılım sigortacılığı yıllara göre artan oranda büyümüştür.</p>
            <h4>Sigorta Nedir?</h4>
            <p>Sigorta, insanların sahip oldukları varlıklar ile sağlıklarının ve hayatlarının maruz kaldığı tehditlere engel olunamadığı durumlarda, prim mukabilinde onlara ya da onların belirledikleri kimselere yardım edilmesini sağlayan sözleşmelerdir. Böylece zarar gören tarafın zararı hafifletilmiş olur.</p>
            <h4>Katılım Sigortacılığı nedir?</h4>
            <p>Finansal işlemlerin içerik ve işleyişinde birtakım etik ya da dini kaygılarla hareket edilebilir. Katılım Sigortacılığı sistemi faizsizlik esasına dayanmaktadır ve bu sistemde sigortalıların kendi aralarındaki ilişki ortaklık, yardımlaşma ve dayanışmadır. Katılım kuruluşuyla aralarındaki ilişki ise vekil müvekkil ilişkisidir.</p>
            <h4>Konvansiyonel Sigortacılıkta;</h4>
            <p>Sigortalı ile sigortacı arasındaki sözleşmeye göre, sigortalı sigortacıya primini ödeyecektir. Sigortacı da poliçe teminat ve şartları çerçevesinde riziko gerçekleştiğinde tazminat verecektir. Toplanan primlerin tazminatlara yetmediği durumlarda sigortacı zarar etmiş olacaktır. Buna karşın toplanan primler ödenen tazminatlardan fazla ise sigortacı kâr etmiş sayılacaktır. Sigortalı olunan dönem içerisinde riziko gerçekleşmez ise sigortalı sigortacıya ödediği primler üzerinde hiçbir hak iddia edemez. Bu sistemde sigorta primleri sigortacının mülkiyetine geçer.</p>
            <div className="custom-list custom-list--passive">
              <div className="custom-list__item"><span className="custom-list__number">1</span>
                <div className="custom-list__content">
                  <p>Faizsizlik prensibi bulunmamaktadır. Bu sebeple sigortalıya ödenen tazminatların, faizli yatırım araçlarından elde edilen kazançlardan olmasında sakınca görülmemektedir.</p>
                </div>
              </div>
              <div className="custom-list__item"><span className="custom-list__number">2</span>
                <div className="custom-list__content">
                  <p>Teminatın risk ölçümü ön plandadır. Dinen meşru olmayan konu ve risklerin teminat altına alınmasında herhangi bir sakınca görülmemektedir.</p>
                </div>
              </div>
              <div className="custom-list__item"><span className="custom-list__number">3</span>
                <div className="custom-list__content">
                  <p>Mevzuat denetimlerine ek olarak, Katılım Danışma Komitesi, Katılım Uyum Birimi ve Katılım İç Denetim gibi kontrol ve mekanizmalar bulunmamaktadır.</p>
                </div>
              </div>
            </div>
            <h4>Katılım Sigortacılığında;</h4>
            <p>Katılım Sigorta sisteminde farklı bir yapılanmaya gidilmiştir.</p>
            <div className="custom-list">
              <div className="custom-list__item"><span className="custom-list__number">1</span>
                <div className="custom-list__content">
                  <p>Bu sistemde sigortalı ile sigortacı arasında karşılıklı borç yükleyen bir akit yapılmaktadır. Bilakis sigortalılar arasında meydana gelen bir ortaklık, yani katılım havuzu söz konusudur.</p>
                </div>
              </div>
              <div className="custom-list__item"><span className="custom-list__number">2</span>
                <div className="custom-list__content">
                  <p>Sigorta şirketi sigortalıların sahibi bulunduğu havuzu işleten vekil konumundadır. Dolayısıyla katılım sigortacılığında toplanan primler, sigorta şirketine verilmiş emanet hükmünde olup Katılım kuruluşunun mülkiyetine geçmez.</p>
                  <p>Katılım kuruluşu sigortalılara vekaleten faizsizlik esasına uygun olarak bu fonu işletecektir. Yani faizsiz yatırım araçları üzerinden fonu işleterek katılım havuzunun yönetimi sağlayacaktır.</p>
                </div>
              </div>
              <div className="custom-list__item"><span className="custom-list__number">3</span>
                <div className="custom-list__content">
                  <p>Bu fonun faizsizlik esasına göre işletilmesinden doğan kâr, fona aittir. Katılım Sigorta Şirketi yalnızca sigortalıların ihtiyaç duyduğu sigortacılık işlemlerini yürüttüğü ve fonun işletilmesindeki çabası neticesinde vekalet ücreti alır. Katılım fonu sigortanın gereği olarak hasar gerçekleşmesi halinde mağdur olan poliçe sahibinin mağduriyetini gidermede kullanılır. Böylece katılım fonu yardımlaşma ve dayanışmaya hizmet etmiş olur.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 