'use client';

import Image from 'next/image';

const risks = [
  {
    title: 'Yangın',
    icon: '/images/landing/yangin.png',
    width: 134,
    height: 134,
    description: 'Yangın veya patlama sonucu eşyalarınızda oluşan zararları güvence altına alır. Evinizdeki tüm değerli eşyalar sigortanızla koruma altında.'
  },
  {
    title: 'Su Baskını',
    icon: '/images/landing/su-baskini.png',
    width: 124,
    height: 124,
    description: 'Tesisat arızası, su sızıntısı veya taşkın sonucu eşyalarınızda meydana gelen zararlar teminat kapsamındadır. Ani su baskınlarında maddi kayıplarınızı biz üstleniyoruz.'
  },
  {
    title: 'Hırsızlık',
    icon: '/images/landing/hirsizlik.png',
    width: 93,
    height: 117,
    description: 'Hırsızlık veya hırsızlığa teşebbüs durumunda çalınan ya da zarar gören eşyalarınız poliçeniz tarafından karşılanır. Güvenliğiniz Yuvam Güvende ile her zaman önceliğimiz.'
  },
  {
    title: 'Komşuma Vereceğim Zarar',
    icon: '/images/landing/komsu.png',
    width: 123,
    height: 88,
    description: 'Evinizdeki yangın veya su baskını gibi durumlarda komşunuza verebileceğiniz zararları karşılar. Komşuluk ilişkilerinizi de güvence altına alır.'
  },
  {
    title: 'Cam Kırılması',
    icon: '/images/landing/cam.png',
    width: 102,
    height: 129,
    description: 'Pencere, balkon veya kapı camlarınız kırıldığında onarım veya değişim masraflarını karşılar. Olay başına 6.500 ₺ limit dahilindedir.'
  },
  {
    title: 'Elektronik Cihaz Koruması',
    icon: '/images/landing/elektronik-cihaz.png',
    width: 84,
    height: 144,
    description: 'Yangın veya patlama sonucu eşyalarınızda oluşan zararları güvence altına alır. Evinizdeki tüm değerli eşyalar sigortanızla koruma altında.'
  }
];

export default function RiskCoverage() {
  const scrollToQuote = () => {
    setTimeout(() => {
      document.querySelector('.yg-quote-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <section className="riskCoverage">
      <div className="riskCoverageContainer">
        <div className="riskCoverageTitleWrapper">
          <h2 className="riskCoverageTitle">Neleri Koruyoruz?</h2>
        </div>
        <p className="riskCoverageDescription">
          Yuvam Güvende, eşyalarınızı evde karşılaşabileceğiniz beklenmedik risklere karşı korur.
        </p>
        <div className="riskCards">
          {risks.map((risk, index) => (
            <div key={index} className="riskCard">
              <div className="riskCardInner">
                <div className="riskCardFront">
                  <h3 className="riskCardTitle">{risk.title}</h3>
                  <div className="riskCardImage">
                    <Image
                      src={risk.icon}
                      alt={risk.title}
                      width={risk.width}
                      height={risk.height}
                    />
                  </div>
                </div>
                <div className="riskCardBack">
                  <h4 className="riskCardBackTitle">{risk.title}</h4>
                  <p className="riskCardBackDescription">{risk.description}</p>
                  <button className="riskCardButton" onClick={scrollToQuote}>Teklif Al</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}




