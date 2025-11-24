"use client";

export default function Plans() {
  const scrollToQuote = () => {
    setTimeout(() => {
      document.querySelector('.yg-quote-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <section className="plans">
      <div className="plansContainer">
        <div className="plansTitleWrapper">
          <h2 className="plansTitle">İhtiyacınıza Uygun Güvence Planları</h2>
        </div>

        <p className="plansDescription">
          Her ev farklı, ama güven duygusu hep aynı. <br /> <strong>Yuvam Güvende,</strong>
          eşyalarınızı farklı teminat kapsamlarıyla koruyan üç özel plan sunar. <br />
          Size en uygun planı seçin, eşyalarınızı bugün güvence altına alın.
        </p>

        <div className="planCards">
          {/* Gümüş */}
          <div className="planCard">
            <div className="planNameBar">Gümüş</div>
            <div className="planBody">
              <div className="planPrice">500.000₺</div>
              <div className="planMonthly">Ayda 100₺'den<br/>Başlayan Fiyatlarla</div>
              <button className="planButton" onClick={scrollToQuote}>Hemen Teklif Al</button>
            </div>
          </div>

          {/* Altın */}
          <div className="planCard">
           
            <div className="planNameBar">Altın</div>
            <div className="planBody">
              <div className="planPrice">750.000₺</div>
              <div className="planMonthly">Ayda 180₺'den<br/>Başlayan Fiyatlarla</div>
              <button className="planButton" onClick={scrollToQuote}>Hemen Teklif Al</button>
            </div>
          </div>

          {/* Platin - Popüler */}
          <div className="planCard planCard--featured">
            <div className="planBadge">Popüler</div>
            <div className="planNameBar">Platin</div>
            <div className="planBody">
              <div className="planPrice">1.000.000₺</div>
              <div className="planMonthly">Ayda 200₺'den<br/>Başlayan Fiyatlarla</div>
              <button className="planButton" onClick={scrollToQuote}>Hemen Teklif Al</button>
            </div>
          </div>
        </div>

        <div className="plansNote">*Tüm planlar 7/24 hasar desteği ve ücretsiz poliçe yönetimi hizmetiyle birlikte gelir.</div>
      </div>
    </section>
  );
}


