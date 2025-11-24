'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

const testimonialsData = [
  {
    id: 1,
    name: "Aysenin O.",
    image: "/images/testimonials/customer-1.png",
    rating: 5,
    comment: "İlgili ve profesyonel bir ekip, her soruma hızlıca dönüş yaptılar. Güvenle tercih edebilir."
  },
  {
    id: 2,
    name: "Utku T.",
    image: "/images/testimonials/customer-4.png",
    rating: 5,
    comment: "Herkese tavsiye ederim"
  },
  {
    id: 3,
    name: "Serkan U.",
    image: "/images/testimonials/customer-3.png",
    rating: 5,
    comment: "İlgili ve güzel bir firma."
  },
  {
    id: 4,
    name: "Burçe Ö.",
    image: "/images/testimonials/customer-1.png",
    rating: 5,
    comment: "İlgiliniz ve yönlendirmeleriniz için teşekkür ederim."
  },
  {
    id: 5,
    name: "Beril D.",
    image: "/images/testimonials/customer-2.png",
    rating: 5,
    comment: "Ailece hizmetlerinden çok memnun kaldığımız, hayatımızı kolaylaştıran Sigorka firmasına çok teşekkür ederiz."
  },
  {
    id: 6,
    name: "i20 Hyundai",
    image: "/images/testimonials/customer-3.png",
    rating: 5,
    comment: "İlk Katılım Sigorta Online pazarı"
  },
  {
    id: 7,
    name: "Yusuf İ.",
    image: "/images/testimonials/customer-4.png",
    rating: 5,
    comment: "İlk kez online sigorta aldım. Mükemmel!"
  },
  {
    id: 8,
    name: "Evrim D.",
    image: "/images/testimonials/customer-3.png",
    rating: 5,
    comment: "İşini iyi bilen güçlü ekibe tebrikler 👏🏻👏🏻 Hepsi 5 yıldız !"
  }
];

const Testimonials = () => {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <section className="testimonials">
      <div className="testimonials__container container">
        <h3 className="section-title"><span>Müşteri Yorumları</span></h3>
        <div className="testimonials__slider owl-carousel owl-theme">
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={20}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            navigation={{
              prevEl: '.testimonials__slider .owl-prev',
              nextEl: '.testimonials__slider .owl-next',
            }}
            breakpoints={{
              768: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
            }}
            onSwiper={(swiper: SwiperType) => {
              swiperRef.current = swiper;
            }}
          >
            {testimonialsData.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className="testimonials__item">
                  <div className="testimonials__item-header">
                  
                    <div className="testimonials__item-txt">
                      <h4 className="testimonials__item-title">{testimonial.name}</h4>
                      <div className="testimonials__rating">
                        <Image src="/images/stars.svg" alt={testimonial.rating.toString()} width={100} height={20} />
                      </div>
                    </div>
                  </div>
                  <div className="testimonials__item-content">
                    <p>{testimonial.comment}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="owl-nav">
            <div className="testimonials__nav-buttons">
              <button 
                className="testimonials__nav testimonials__nav-prev owl-prev"
                aria-label="Önceki yorum"
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
              >
                <span className="icon-angle-left"></span>
              </button>
              <button 
                className="testimonials__nav testimonials__nav-next owl-next"
                aria-label="Sonraki yorum"
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
              >
                <span className="icon-angle-right"></span>
              </button>
            </div>
            <a 
              href="https://www.google.com/search?sca_esv=c041460d2f1f94b3&hl=tr&q=sigorka&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E7Peu_d0az_SSyh48nLq7tzDTWDjr5sqscJpSxXWejWCu__ZLfQB7GhpZ0ohhy5R9NP7URg%3D&uds=AOm0WdFdVPVe4CTBQdLJGJpwTFWcJshZBtgJZMzQxWGpLjuU7OfOfnh0Ds4_5bFHMC1kGbtZ6LzA3Azf9GpytaCUO54adW_oJ8u910D6VtRldJAFnrG5rSQ&sa=X&ved=2ahUKEwivi--ey92QAxWTVfEDHQ39DbkQ3PALegQILxAF&biw=1440&bih=731&dpr=2" 
              target="_blank" 
              rel="noopener noreferrer"
              className="testimonials__view-all"
            >
              Tüm Google Yorumlarını Gör
              <span className="icon-arrow-right"></span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

