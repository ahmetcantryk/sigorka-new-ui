'use client';

import Link from 'next/link';
import '../../styles/subpage.min.css';

const products = [
  {
    id: 1,
    icon: 'icon-zorunlu-trafik',
    title: 'Zorunlu Trafik',
    href: '/trafik-teklif'
  },
  {
    id: 2,
    icon: 'icon-kasko',
    title: 'Kasko',
    href: '/kasko-teklif'
  },
  {
    id: 3,
    icon: 'icon-tamamlayici-saglik',
    title: 'Tamamlayıcı Sağlık',
    href: '/tss-teklif'
  },
  {
    id: 4,
    icon: 'icon-dask',
    title: 'DASK',
    href: '/dask-teklif'
  },
  {
    id: 5,
    icon: 'icon-konut',
    title: 'Konut',
    href: '/konut-teklif'
  },
  {
    id: 6,
    icon: 'icon-imm',
    title: 'İMM',
    href: '/imm-teklif'
  },
  {
    id: 7,
    icon: 'icon-yabanci-saglik',
    title: 'Yabancı Sağlık',
    href: '/yabanci-saglik-teklif'
  },
  {
    id: 8,
    icon: 'icon-seyahat-saglik',
    title: 'Seyahat Sağlık',
    href: '/seyahat-saglik-teklif'
  },
  {
    id: 9,
    icon: 'icon-ozel-saglik',
    title: 'Özel Sağlık',
    href: '/ozel-saglik-teklif'
  },
  {
    id: 10,
    icon: 'icon-ferdi-kaza',
    title: 'Ferdi Kaza',
    href: '/ferdi-kaza-teklif'
  }
  // {
  //   id: 11,
  //   icon: 'icon-tamamlayici-saglik',
  //   title: 'Doktorum Benimle',
  //   href: '/acil-saglik-teklif'
  // }
];

export default function UrunlerimizClient() {
  return (
    <>
      <section className="cover">
        <div className="container cover__container">
          <h1 className="cover__title-1">Teklif Al</h1>
          <h2 className="cover__title-2">Teklif Alabileceğiniz Ürünlerimiz</h2>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/">Ana Sayfa</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Teklif Al</li>
            </ol>
          </nav>
          <div className="product-list">
            <div className="row row-cols-xl-5 row-cols-lg-4 row-cols-md-3 row-cols-2 justify-content-center">
              {products.map((product) => (
                <div key={product.id} className="col mb-4">
                  <Link href={product.href} className="product-item">
                    <div className="product-item__icon">
                      <span className={product.icon} aria-hidden="true"></span>
                    </div>
                    <h4 className="product-item__title">{product.title}</h4>
                    <span className="product-item__link">
                      Hemen Teklif Al <span className="icon-arrow-right"></span>
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

