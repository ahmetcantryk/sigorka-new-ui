'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Anchor {
  id: string;
  label: string;
}

interface StickyProductNavProps {
  anchors: Anchor[];
  offerLink: string;
  enableMobileScrollBasedVisibility?: boolean; // Mobilde scroll tabanlı görünürlük için
  formBannerId?: string; // Form banner ID'si (mobil scroll için)
}

export default function StickyProductNav({ 
  anchors, 
  offerLink,
  enableMobileScrollBasedVisibility = false,
  formBannerId
}: StickyProductNavProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Mobil kontrolü
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Sticky navbar visibility control (subpage.js mantığı)
    const checkStickyNavbarVisibility = () => {
      const offset = 120;
      const isMobileView = window.innerWidth <= 767;
      
      // Mobilde scroll tabanlı görünürlük (sadece enableMobileScrollBasedVisibility true ise)
      if (isMobileView && enableMobileScrollBasedVisibility) {
        // Form banner'ı kontrol et
        if (formBannerId) {
          const formBanner = document.getElementById(formBannerId);
          if (formBanner) {
            const scrollPosition = window.scrollY;
            // Form banner'ın altına scroll edildiğinde göster
            const formBannerBottom = formBanner.offsetTop + formBanner.offsetHeight;
            setIsVisible(scrollPosition >= formBannerBottom - offset);
            return;
          }
        }
        // Form banner yoksa ilk section'a göre kontrol et
        const firstSection = document.getElementById(anchors[0]?.id);
        if (firstSection) {
          const scrollPosition = window.scrollY;
          const contentStartPosition = firstSection.offsetTop - offset - 50;
          setIsVisible(scrollPosition >= contentStartPosition);
          return;
        }
      }
      
      // Mobilde her zaman görünür (varsayılan davranış)
      if (isMobileView) {
        setIsVisible(true);
        return;
      }

      // Desktop'ta ilk section'a göre fade in/out
      const firstSection = document.getElementById(anchors[0]?.id);
      if (firstSection) {
        const scrollPosition = window.scrollY;
        const contentStartPosition = firstSection.offsetTop - offset - 50;
        setIsVisible(scrollPosition >= contentStartPosition);
      }
    };

    // Scroll spy - hangi section'da olduğumuzu bul
    const handleScrollSpy = () => {
      const offset = 120;
      const sections = anchors.map(anchor => document.getElementById(anchor.id));
      const scrollPosition = window.scrollY + offset;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          if (activeAnchor !== anchors[i].id) {
            setActiveAnchor(anchors[i].id);
          }
          break;
        }
      }
    };

    const handleScroll = () => {
      checkStickyNavbarVisibility();
      if (!isAnimating) {
        handleScrollSpy();
      }
    };

    // İlk yüklemede kontrol et
    setTimeout(() => {
      checkStickyNavbarVisibility();
      handleScrollSpy();
    }, 100);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, [anchors, activeAnchor, isAnimating, enableMobileScrollBasedVisibility, formBannerId]);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnchorClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      setIsAnimating(true);
      const offset = isMobile ? 80 : 120;
      const elementPosition = element.offsetTop - offset + 1;
      
      window.scrollTo({ top: elementPosition, behavior: 'smooth' });
      setActiveAnchor(id);
      
      // Animasyon bitince scrollspy'ı tekrar aktif et
      setTimeout(() => {
        setIsAnimating(false);
      }, 700);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value && value !== '') {
      const element = document.getElementById(value);
      if (element) {
        setIsAnimating(true);
        const offset = isMobile ? 80 : 120;
        const elementPosition = element.offsetTop - offset;
        
        window.scrollTo({ top: elementPosition, behavior: 'smooth' });
        setActiveAnchor(value);
        
        // Animasyon bitince scrollspy'ı tekrar aktif et
        setTimeout(() => {
          setIsAnimating(false);
        }, 700);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      id="sticky-navbar" 
      className="sticky-navbar"
      style={{ display: isVisible ? 'block' : 'none' }}
    >
      <a 
        href="#" 
        className="sticky-navbar__scroll-up"
        onClick={scrollToTop}
      >
        <span className="icon-arrow-up"></span>
      </a>
      <div className="container sticky-navbar__container">
        <nav className="sticky-nav">
          {anchors.map((anchor) => (
            <a
              key={anchor.id}
              className={`sticky-nav__item nav-link ${activeAnchor === anchor.id ? 'active' : ''}`}
              href={`#${anchor.id}`}
              onClick={handleAnchorClick(anchor.id)}
            >
              {anchor.label}
            </a>
          ))}
        </nav>
        <div className="sticky-navbar__mobile">
          <select 
            className="sticky-navbar__select"
            onChange={handleSelectChange}
            value={activeAnchor || ''}
          >
            <option value="">Konu Seçin</option>
            {anchors.map((anchor) => (
              <option key={anchor.id} value={anchor.id}>
                {anchor.label}
              </option>
            ))}
          </select>
          <Link href={offerLink} className="btn btn-green">
            Teklif Al
          </Link>
        </div>
      </div>
      <Link href={offerLink} className="btn btn-green sticky-navbar__btn">
        Teklif Al
      </Link>
    </div>
  );
}

