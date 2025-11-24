'use client';

import Header from './Header';

export default function Hero() {
  const scrollToQuote = () => {
    setTimeout(() => {
      document.querySelector('.yg-quote-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <section className="hero">
      <Header />
      <div className="heroBackground"></div>
      <div className="heroContent">
        <div className="heroContentWrapper">
          <h1 className="heroTitle">
            Görünmeyen Riskleri Görür,<br />
            Evinizi Güvende Tutarız.
          </h1>

          <p className="heroPrice">
            Su sızıntısından yangına, hırsızlıktan elektrik arızasına,<br/>
            Ayda 100 TL'den başlayan fiyatlarla eviniz her an güvende!
          </p>
          <button className="heroButton" onClick={scrollToQuote}>
            Teklif Al
          </button>
        </div>
      </div>
    </section>
  );
}

