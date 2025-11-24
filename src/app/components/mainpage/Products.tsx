'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Link from 'next/link';
import './products.css';

const Products = () => {
  const swiperRef = useRef<SwiperType | null>(null);

  const products = [
    {
      id: 1,
      title: "Yabancı Sağlık Sigortası",
      image: "/images/product-icons/yabanci-saglik-sigortasi.svg",
      link: "/yabanci-saglik-sigortasi"
    },
    {
      id: 2,
      title: "Zorunlu Trafik Sigortası",
      image: "/images/product-icons/zorunlu-trafik-sigortasi.svg",
      link: "/zorunlu-trafik-sigortasi"
    },
    {
      id: 3,
      title: "Ferdi Kaza Sigortası",
      image: "/images/product-icons/ferdi-kaza-sigortasi.svg",
      link: "/ferdi-kaza-sigortasi"
    },
    {
      id: 4,
      title: "Tamamlayıcı Sağlık Sigortası",
      image: "/images/product-icons/tamamlayici-saglik-sigortasi.svg",
      link: "/tamamlayici-saglik-sigortasi"
    },
    {
      id: 5,
      title: "Zorunlu Deprem Sigortası",
      image: "/images/product-icons/dask.svg",
      link: "/dask"
    },
    {
      id: 6,
      title: "Kasko Sigortası",
      image: "/images/product-icons/kasko-sigortasi.svg",
      link: "/kasko-sigortasi"
    },
    {
      id: 7,
      title: "Seyahat Sağlık Sigortası",
      image: "/images/product-icons/seyahat-saglik-sigortasi.svg",
      link: "/seyahat-saglik-sigortasi"
    },
    {
      id: 8,
      title: "Konut Sigortası",
      image: "/images/product-icons/konut-sigortasi.svg",
      link: "/konut-sigortasi"
    },
    {
      id: 9,
      title: "İMM Sigortası",
      image: "/images/product-icons/imm.svg",
      link: "/imm"
    },
    {
      id: 10,
      title: "Özel Sağlık Sigortası",
      image: "/images/product-icons/ozel-saglik-katilim-sigortasi.svg",
      link: "/ozel-saglik-sigortasi"
    }
  ];

  return (
    <section className="products">
      <div className="products__container container">
        <h2 className="section-title"><span>Ürünler</span></h2>
        <div className="products__slider-wrapper">
          <div className='products__slider-wrapper-inner'>
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={2}
              loop={true}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
              }}
              navigation={{
                prevEl: '.products__nav-prev',
                nextEl: '.products__nav-next',
              }}
              breakpoints={{
                0: {
                  slidesPerView: 2
                },
                576: {
                  slidesPerView: 2
                },
                768: {
                  slidesPerView: 3
                },
                992: {
                  slidesPerView: 4
                }
              }}
              className="products__slider"
              onSwiper={(swiper: SwiperType) => {
                swiperRef.current = swiper;
              }}
            >
              {products.map((product) => (
                <SwiperSlide key={product.id}>
                  <Link href={product.link} className="products__slider-item" target="_self">
                    <div className="products__slider-img">
                      <Image src={product.image} className="img-fluid" alt={product.title} width={80} height={45} />
                    </div>
                    <h3>{product.title}</h3>
                    <span className="products__slider-link">Teklif Al <span className="icon-arrow-right"></span></span>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className="products__dots"></div>
          <button
            className="products__nav products__nav-prev"
            aria-label="Önceki ürün"
            type="button"
          >
            <span className="icon-arrow-long-left"></span>
          </button>
          <button
            className="products__nav products__nav-next"
            aria-label="Sonraki ürün"
            type="button"
          >
            <span className="icon-arrow-long-right"></span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Products; 