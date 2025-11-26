'use client';

import Link from 'next/link';

export default function Promo() {
  return (
    <section className="promo">
      <div className="promo__video-wrapper promo__video-wrapper--desktop">
        <video className="promo__video promo__video--desktop" autoPlay muted loop playsInline>
          <source src="/videos/_videos_promo-desktop.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="container promo__container">
        <div className="promo__head">
          <h1 className="promo__title">İlk ve Tek Katılım Sigorta Pazaryeri!</h1>
          <h2 className="promo__subtitle">Seçin, Karşılaştırın, Anında Satın Alın.</h2>
        </div>
        <div className="promo-products">
          <div className="row">
            <div className="col-md-4 col-6 mb-4">
              <Link href="/zorunlu-trafik-sigortasi" className="promo-product-box">
                <span className="promo-product-box__icon icon-zorunlu-trafik" aria-hidden="true"></span>
                <h3 className="promo-product-box__title">Zorunlu Trafik</h3>
              </Link>
            </div>
            <div className="col-md-4 col-6 mb-4">
              <Link href="/kasko-sigortasi" className="promo-product-box">
                <span className="promo-product-box__icon icon-kasko" aria-hidden="true"></span>
                <h3 className="promo-product-box__title">Kasko</h3>
                <div className="promo-product-box__popper">
                  1.000 TL yakıt çeki hediye!
                </div>
              </Link>
            </div>
            <div className="col-md-4 col-6 mb-4">
              <Link href="/tamamlayici-saglik-sigortasi" className="promo-product-box">
                <span className="promo-product-box__icon icon-tamamlayici-saglik" aria-hidden="true"></span>
                <h3 className="promo-product-box__title">Tamamlayıcı Sağlık</h3>
                <div className="promo-product-box__popper">
                  Ayda 229 TL&apos;den başlayan fiyatlar
                </div>
              </Link>
            </div>
            <div className="col-md-3 col-6 mb-4">
              <Link href="/dask" className="promo-product-box">
                <span className="promo-product-box__icon icon-dask" aria-hidden="true"></span>
                <h3 className="promo-product-box__title">DASK</h3>
                <div className="promo-product-box__popper">
                  6 <br/>taksit <br/>fırsatı!
                </div>
              </Link>
            </div>
            <div className="col-md-3 col-6 mb-4">
              <Link href="/konut-sigortasi" className="promo-product-box">
                <span className="promo-product-box__icon icon-konut" aria-hidden="true"></span>
                <h3 className="promo-product-box__title">Konut</h3>
                <div className="promo-product-box__popper">
                  1.000 TL market çeki hediye!
                </div>
              </Link>
            </div>
            <div className="col-md-3 col-6 mb-4">
              <Link href="/imm" className="promo-product-box">
                <span className="promo-product-box__icon icon-imm" aria-hidden="true"></span>
                <h3 className="promo-product-box__title">İMM</h3>
              </Link>
            </div>
            <div className="col-md-3 col-6 mb-4 d-md-block d-none">
              <Link href="/seyahat-saglik-sigortasi" className="promo-product-box">
                <span className="promo-product-box__icon icon-seyahat-saglik" aria-hidden="true"></span>
                <h3 className="promo-product-box__title">Seyahat Sağlık</h3>
              </Link>
            </div>
          </div>
          <div className="d-flex justify-content-center mt-3">
            <Link className="promo-products__link" href="/urunlerimiz">
              Tüm Ürünler <span className="icon-arrow-right"></span>
            </Link>
          </div>
        </div>
      </div>
      <div className="promo__video-wrapper promo__video-wrapper--mobile">
        <video className="promo__video promo__video--mobile" autoPlay muted loop playsInline>
          <source src="/videos/_videos_promo-mobile.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
