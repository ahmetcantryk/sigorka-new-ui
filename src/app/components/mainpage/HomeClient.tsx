"use client";

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Promo from './Promo';
import '../../../styles/mainpage.css'; 
import BannerArea from './BannerArea';
import WhyUs from './WhyUs';
import Campaigns from './Campaigns';
import Blog from './Blog';
import Partners from './Partners';
import Testimonials from './Testimonials';
import Products from './Products';
import FAQ from './FAQ';

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

export default function HomeClient() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add('home');
    
    return () => {
      document.body.classList.remove('home');
    };
  }, []);

  useEffect(() => {
    // Client-side'da kampanya verilerini çek
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/kampanyalar.json');
        const data = await response.json();
        setCampaigns(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <>
      <Head>
        {/* Promo video preload - Desktop */}
        <link
          rel="preload"
          as="video"
          href="/videos/_videos_promo-desktop.mp4"
          media="(min-width: 768px)"
          crossOrigin="anonymous"
        />
        {/* Promo video preload - Mobile */}
        <link
          rel="preload"
          as="video"
          href="/videos/_videos_promo-mobile.mp4"
          media="(max-width: 767px)"
          crossOrigin="anonymous"
        />
      </Head>
      <main>
        <Promo />
        {!loading && <Campaigns campaigns={campaigns} />}
        <Partners />
        <Testimonials />
        <WhyUs />
        <BannerArea />
        <FAQ />
      </main>
    </>
  );
} 