'use client';

import Image from 'next/image';

const services = [
  {
    title: 'Kombi & Klima Bakımı',
    description: 'Yılda 1 kez ücretsiz. Yetkili servis tarafından kombi kontrolü, temizlik ve performans bakımı yapılır. Randevunuzu sigorta hattı üzerinden kolayca oluşturabilirsiniz.',
    icon: '/images/landing/kombi-klima-bakimi.svg',
    width: 65,
    height: 107
  },
  {
    title: 'Koltuk Yıkama',
    description: 'Yılda 1 kez ücretsiz - 1 takım (1 üçlü + 1 ikili + 2 tekli koltuk). Ek koltuk veya özel kumaşlar için indirimli fiyat avantajı sunulur. Profesyonel ekiplerle hijyenik temizlik, evinizde konfor.',
    icon: '/images/landing/koltuk-yikama.svg',
    width: 85,
    height: 85
  },
  {
    title: 'Su Tesisatı Onarımı',
    description: 'Yılda 3 defaya kadar • Olay başı 6.500 ₺ limit. Su kaçağı, patlak boru veya tıkanıklıklarda acil tesisatçı yönlendirilir. Standart malzeme ve işçilik masrafları poliçe kapsamında.',
    icon: '/images/landing/su-tesisati-onarimi.svg',
    width: 85,
    height: 85
  },
  {
    title: 'Elektrik Tesisatı Hizmeti',
    description: 'Yılda 3 defaya kadar • Olay başı 6.500 ₺ limit. Priz, kablo, sigorta veya kısa devre arızalarında uzman elektrikçi desteği. Güvenli müdahale, hızlı çözüm.',
    icon: '/images/landing/elektrik-tesisati-hizmeti.svg',
    width: 85,
    height: 85
  },
  {
    title: 'Çilingir Hizmeti',
    description: 'Yılda 3 kez ücretsiz • 7/24 acil destek. Anahtar kaybolduğunda ya da kapıda kaldığınızda profesyonel ekip yönlendirilir. Hizmet yalnızca poliçe adresinde geçerlidir.',
    icon: '/images/landing/cilingir-hizmeti.svg',
    width: 105,
    height: 85
  },
  {
    title: 'Petek & Klima Temizliği',
    description: 'Petek temizliği yılda 1 kez, klima bakımı yılda 1 kez ücretsiz. Enerji tasarrufu sağlar, cihaz ömrünü uzatır.',
    icon: '/images/landing/petek-klima-temizligi.svg',
    width: 85,
    height: 85
  },
  {
    title: 'Montaj & Onarım Desteği',
    description: 'Yılda 3 defaya kadar ücretsiz. Avize, raf, perde veya TV aparatı gibi küçük montaj işlemleri için profesyonel ekip yönlendirilir. Birden fazla işlem yapılırsa yıllık 3 hizmet hakkınızdan düşülür. Tutar limiti yok; adet bazlı kullanım geçerlidir.',
    icon: '/images/landing/montaj-onarim-destegi.svg',
    width: 85,
    height: 85
  },
  {
    title: '7/24 Destek ve Organizasyon Hattı',
    description: 'Tüm hizmet talepleriniz için 444 27 58 numarasını arayın. Ücretsiz hizmetlerden poliçe süresince 1 kez, indirimli hizmetlerden sınırsız yararlanabilirsiniz. Hizmet süreci tamamen anlaşmalı firmalar üzerinden yürütülür.',
    icon: '/images/landing/destek-ve-organizasyon-hatti.svg',
    width: 85,
    height: 85
  }
];

export default function Services() {
  const scrollToQuote = () => {
    setTimeout(() => {
      document.querySelector('.yg-quote-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <section className="services">
      <div className="servicesContainer">
        <div className="servicesTitleWrapper">
          <h2 className="servicesTitle">Ekstra Güvenlik & Konfor Hizmetleri</h2>
        </div>
        <p className="servicesDescription">
          Yuvam Güvende eşya sigortası poliçeniz, sadece eşyalarınızı değil; evinizdeki yaşam konforunu da korur. Ücretsiz bakım, onarım ve destek hizmetleriyle hayatı kolaylaştırın.
        </p>
        <div className="servicesCards">
          {services.map((service, index) => (
            <div key={index} className="serviceCard">
              <div className="serviceCardInner">
                <div className="serviceCardFront">
                  <h3 className="serviceCardTitle">{service.title}</h3>
                  <div className="serviceCardIcon">
                    <Image
                      src={service.icon}
                      alt={service.title}
                      width={service.width}
                      height={service.height}
                    />
                  </div>
                </div>
                <div className="serviceCardBack">
                  <h4 className="serviceCardBackTitle">{service.title}</h4>
                  <p className="serviceCardBackDescription">{service.description}</p>
                  <button className="serviceCardButton" onClick={scrollToQuote}>Teklif Al</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}





