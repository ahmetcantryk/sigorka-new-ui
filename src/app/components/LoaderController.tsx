'use client';

import { useEffect } from 'react';

export default function LoaderController() {
  useEffect(() => {
    const hideLoader = () => {
      const loader = document.querySelector('.overlay-loader') as HTMLElement;
      if (loader) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => {
          loader.style.display = 'none';
        }, 300);
      }
    };

    // Sayfa tamamen yüklendiğinde loader'ı gizle
    if (document.readyState === 'complete') {
      hideLoader();
    } else {
      window.addEventListener('load', hideLoader);
    }

    // Next.js route değişikliklerinde loader'ı kontrol et
    const handleRouteChange = () => {
      setTimeout(hideLoader, 100);
    };

    // Navigation event'lerini dinle
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('load', hideLoader);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return null;
}