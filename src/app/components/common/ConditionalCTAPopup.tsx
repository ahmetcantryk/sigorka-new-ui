'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CTAConfig {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

interface ConditionalCTAPopupProps {
  config: CTAConfig;
  condition: 'blog-scroll' | 'inactivity' | 'scroll-up';
  inactivityDelay?: number; // saniye cinsinden
}

export default function ConditionalCTAPopup({ 
  config, 
  condition,
  inactivityDelay = 15 
}: ConditionalCTAPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Blog Detay - 2. kez scroll (.text-content bazlı)
    if (condition === 'blog-scroll') {
      let scrollCount = 0;
      let lastScrollPosition = 0;
      let hasScrolledToBottom = false;

      const handleScroll = () => {
        const textContent = document.querySelector('.text-content');
        if (!textContent) {
          console.log('[CTA Popup] .text-content bulunamadı');
          return;
        }

        const currentScroll = window.scrollY;
        const windowHeight = window.innerHeight;
        const contentTop = (textContent as HTMLElement).offsetTop;
        const contentHeight = (textContent as HTMLElement).offsetHeight;
        
        // text-content'in başlangıç ve bitiş pozisyonları
        const contentStart = contentTop;
        const contentEnd = contentTop + contentHeight;
        
        // Viewport'un alt kenarı
        const viewportBottom = currentScroll + windowHeight;
        
        // text-content içinde ne kadar ilerlediğimizi hesapla
        // viewport'un alt kenarı content'in neresinde?
        const progressInContent = viewportBottom - contentStart;
        const scrollPercentage = (progressInContent / contentHeight) * 100;

        console.log('[CTA Popup] Scroll Bilgileri:', {
          currentScroll: currentScroll.toFixed(0),
          windowHeight,
          viewportBottom: viewportBottom.toFixed(0),
          contentStart: contentStart.toFixed(0),
          contentEnd: contentEnd.toFixed(0),
          contentHeight: contentHeight.toFixed(0),
          progressInContent: progressInContent.toFixed(0),
          scrollPercentage: scrollPercentage.toFixed(2) + '%',
          scrollCount,
          hasScrolledToBottom
        });

        // %80'e ulaştıysa ve daha önce flag set edilmediyse
        if (scrollPercentage >= 80 && !hasScrolledToBottom && viewportBottom <= contentEnd + 100) {
          hasScrolledToBottom = true;
          scrollCount++;
          console.log('[CTA Popup] ✅ İçeriğin %80\'i okundu! Sayaç:', scrollCount);
          
          // 2. kez scroll edildiğinde popup göster
          if (scrollCount >= 2) {
            console.log('[CTA Popup] 🎉 2. kez %80\'e ulaşıldı - POPUP AÇILIYOR!');
            setIsVisible(true);
          }
        }

        // Yukarı scroll - reset flag (içerik başına yakın dönünce)
        if (scrollPercentage < 60 && hasScrolledToBottom) {
          console.log('[CTA Popup] ⬆️ İçeriğin başına dönüldü (%60\'ın altı) - flag sıfırlandı');
          hasScrolledToBottom = false;
        }

        lastScrollPosition = currentScroll;
      };

      console.log('[CTA Popup] Blog scroll tracking başlatıldı');
      window.addEventListener('scroll', handleScroll);
      return () => {
        console.log('[CTA Popup] Blog scroll tracking durduruldu');
        window.removeEventListener('scroll', handleScroll);
      };
    }

    // Ürün Sayfası - Inactivity
    if (condition === 'inactivity') {
      let inactivityTimer: NodeJS.Timeout;

      const resetTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
          setIsVisible(true);
        }, inactivityDelay * 1000);
      };

      // İlk timer'ı başlat
      resetTimer();

      // User activity events
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, resetTimer);
      });

      return () => {
        clearTimeout(inactivityTimer);
        events.forEach(event => {
          document.removeEventListener(event, resetTimer);
        });
      };
    }

    // Scroll Up - Yukarı scroll
    if (condition === 'scroll-up') {
      let lastScrollY = window.scrollY;
      let hasShownPopup = false;

      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        // Yukarı scroll ve minimum 300px aşağıdaysa
        if (currentScrollY < lastScrollY - 50 && currentScrollY > 300 && !hasShownPopup) {
          setIsVisible(true);
          hasShownPopup = true;
        }

        lastScrollY = currentScrollY;
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [condition, inactivityDelay, isDismissed]);

  const handleClose = () => {
    console.log('[CTA Popup] ❌ Popup kapatıldı');
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (!isVisible || isDismissed) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="cta-popup-overlay"
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          animation: 'fadeIn 0.3s ease-in-out'
        }}
      />

      {/* Popup */}
      <div 
        className="cta-popup"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          maxWidth: '500px',
          width: '90%',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        <div className="offer-banner offer-banner--popup offer-banner--popup-style">
          <div className="offer-banner__content">
            <h3>{config.title}</h3>
            <p>{config.description}</p>
          </div>
          <div className="offer-banner__cta">
            <Link 
              className="btn" 
              href={config.buttonLink}
              onClick={handleClose}
            >
              {config.buttonText}
            </Link>
          </div>
        </div>
        
        {/* Close Button - Kartın dışında alt kısımda */}
        <button
          onClick={handleClose}
          className="cta-popup__close-bottom"
          style={{
            position: 'absolute',
            bottom: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            outline: 'none',
            background: 'transparent',
            border: 'none',
            borderRadius: '0px',
            width: 'auto',
            height: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '19px',
            color: 'rgb(255, 255, 255)',
            fontWeight: 400,
            textAlign: 'center',
            transition: '0.2s',
            zIndex: 10,
            gap: '8px',
            opacity: 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <span>Kapat</span>
          <div 
            style={{
              background: 'transparent',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'white',
              border: '2px solid white',
            }}
          >
            ×
          </div>
        </button>
      </div>

      <style jsx>{`
      
   
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        .offer-banner--popup {
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          margin: 0;
        }

        @media (max-width: 767px) {
          .cta-popup {
            width: 95% !important;
          }
          
          .cta-popup__close-bottom {
            bottom: -45px !important;
           
          }
          
        
        }
      `}</style>
    </>
  );
}

