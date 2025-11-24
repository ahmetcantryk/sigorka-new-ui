'use client';

import { useState, useEffect } from 'react';

export default function GoToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isProductDetailPage, setIsProductDetailPage] = useState(false);

  useEffect(() => {
    // Product detail page kontrolü
    const checkProductDetailPage = () => {
      setIsProductDetailPage(document.body.classList.contains('product-detail-page'));
    };

    checkProductDetailPage();

    // MutationObserver ile body class değişikliklerini izle
    const observer = new MutationObserver(checkProductDetailPage);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    // Initial check
    toggleVisibility();

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      observer.disconnect();
    };
  }, []);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Product detail sayfalarında butonu gösterme (çünkü sticky-navbar'da zaten scroll-up var)
 

  return (
    <a
      href="#"
      className={`btn-go-to-top ${isVisible ? 'visible' : ''}`}
      onClick={scrollToTop}
      style={{ display: isVisible ? 'flex' : 'none' }}
    >
      <span className="icon-arrow-up"></span>
    </a>
  );
}

