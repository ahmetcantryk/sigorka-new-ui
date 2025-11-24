'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
// import OverlayLoader from './OverlayLoader';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const pathname = usePathname(); // Mevcut sayfa yolunu al

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  //   setLoading(true);
  //   const handleLoad = () => setLoading(false);
  //   if (document.readyState === 'complete') {
  //     setTimeout(() => setLoading(false), 200);
  //   } else {
  //     window.addEventListener('load', handleLoad);
  //   }
  //   return () => {
  //     window.removeEventListener('load', handleLoad);
  //   };
  // }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackToTop = () => {
    // Anasayfadaysak Categories bileşenine, aksi takdirde sayfanın en üstüne git
    if (pathname === '/' ) {
      const categoriesElement = document.querySelector('.categories');
      if (categoriesElement) {
        const categoriesPosition = categoriesElement.getBoundingClientRect().top + window.scrollY;
        const offset = categoriesPosition - window.innerHeight / 4; // Categories'i ekranın üst kısmında göster
        window.scrollTo({ top: offset, behavior: 'smooth' });
      } else {
        // Categories bulunamazsa en üste git
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Diğer sayfalarda en üste git
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* <OverlayLoader visible={loading} /> */}
      {children}
     
    </>
  );
} 