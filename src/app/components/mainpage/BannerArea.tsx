'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import '../styles/banner-area.css';

const bannerData = [
  {
    id: 1,
    title: "Katılım Sigortalarının En Avantajlı Ürünleri Bir Tık Uzağında",
    description: "Hemen Sigorka.com'a tıklayarak ihtiyacın olan tüm Katılım Sigorta ürünlerine bir tık ile ulaşmak artık mümkün.",
    link: "/aracim",
    buttonText: "Hemen Teklif Al",
    image: "/images/banner-area-phone.png",
    image2x: "/images/banner-area-phone@2x.png"
  },
  {
    id: 2,
    title: "İhtiyacın Olan Katılım Sigorta Ürünlerini Anında Karşılaştır ve Teklif Al.",
    description: "Sigorka.com sadece Katılım Sigorta ürünlerini karşılaştırmalı olarak sunar, anında poliçe tekliflerini sıralar. Artık tüm sigorta ürünleri içinde kaybolmak zorunda değilsin, Katılım Sigortaları arasından sana en uygun olanını anında seçebilirsin.",
    link: "/sagligim",
    buttonText: "Hemen Teklif Al",
    image: "/images/banner-area-phone.png",
    image2x: "/images/banner-area-phone@2x.png"
  },
  {
    id: 3,
    title: "Sigorka.com Canlı Destek Hattımıza Bağlan, Tekliflerini Anında Gönderelim.",
    description: "Sigorka.com'da görüntülediğin tekliflerden sana en uygun olanına karar mı veremedin? Hemen platformun içinden canlı olarak Sigorka.com danışmanımıza bağlan. Anında yazışarak ihtiyaçlarını birlikte belirleyelim. İhtiyaçlarına en uygun ve avantajlı \"kişiye özel poliçe tekliflerini\" anında gönderelim.",
    link: "/yuvam",
    buttonText: "Hemen Teklif Al",
    image: "/images/banner-area-phone.png",
    image2x: "/images/banner-area-phone@2x.png"
  }
];

const BannerArea = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const handleDotClick = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(index);
      setActiveIndex(index);
    }
  };

  return (
    <section className="banner-area">
      <div className="banner-area__container container">
      {/* <div className="banner-area__static-img">
          <Image src="/images/banner-arrow.png" alt="Bir tık uzağında!" className="img-fluid" width={300} height={200} />
        </div> */}
        <h3 className="section-title"><span>Üç Kolay Adımda &quot;Güvenli Geleceğe Katılım&quot;</span></h3>
   
        <div className="banner-area__slider owl-carousel owl-theme">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={true}
            className="banner-area__slider"
            onSwiper={(swiper: SwiperType) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper: SwiperType) => {
              setActiveIndex(swiper.realIndex);
            }}
          >
            {bannerData.map((banner) => (
              <SwiperSlide key={banner.id}>
                <div className="banner-area__item" data-slide-id={banner.id}>
                  <div className="row">
                    <div className="col-xl-6 col-lg-4">
                      <div className="banner-area__item-content">
                        <h3>{banner.title}</h3>
                        <p>{banner.description}</p>
                        <Link href={banner.link} className="btn btn-primary">
                          {banner.buttonText}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div id="customDots" className="owl-dots">
          {bannerData.map((_, index) => (
            <button
              key={index}
              role="button"
              className={`owl-dot ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BannerArea; 