'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// import './campaigns.css';

interface Campaign {
  slug: string;
  title: string;
  summary: string;
  image: string;
  detailImage: string;
  category: string;
  detailHtml: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  order: number;
}

interface CampaignsProps {
  campaigns: Campaign[];
}

const Campaigns = ({ campaigns }: CampaignsProps) => {
  const swiperRef = useRef<SwiperType | null>(null);

  // Kampanyaları order'a göre sırala
  const sortedCampaigns = campaigns.sort((a, b) => a.order - b.order);

  return (
    <section className="campaigns">
      <div className="campaigns__container container">
        <h3 className="section-title"><span>Kampanyalar</span></h3>
        <div className="campaigns__slider owl-carousel owl-theme">
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={20}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            navigation={{
              prevEl: '.campaigns__slider .owl-prev',
              nextEl: '.campaigns__slider .owl-next',
            }}
            onSwiper={(swiper: SwiperType) => {
              swiperRef.current = swiper;
            }}
          >
            {sortedCampaigns.map((campaign) => (
              <SwiperSlide key={campaign.slug}>
                <div className="campaigns__item">
                  <div className="row">
                    <div className="col-md-5">
                      <Link className="campaigns__item-img h-100" href={`/kampanyalar/${campaign.slug}`}>
                        <Image src={campaign.image} alt={campaign.title} width={792} height={662} />
                        {/* {campaign.badge && (
                          <div className="campaigns__item-popper">
                            {campaign.badge}
                          </div>
                        )} */}
                      </Link>
                    </div>
                    <div className="col-md-7">
                      <div className="campaigns__item-content h-100">
                        <h4 dangerouslySetInnerHTML={{ __html: campaign.title }} />
                        <p>{campaign.summary}</p>
                        <Link href={`/kampanyalar/${campaign.slug}`}>
                          Detaylı Bilgi <span className="icon-arrow-right"></span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="owl-nav">
            <button 
              className="campaigns__nav campaigns__nav-prev owl-prev"
              aria-label="Önceki kampanya"
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
            >
              <span className="icon-angle-left"></span>
            </button>
            <button 
              className="campaigns__nav campaigns__nav-next owl-next"
              aria-label="Sonraki kampanya"
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
            >
              <span className="icon-angle-right"></span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Campaigns; 