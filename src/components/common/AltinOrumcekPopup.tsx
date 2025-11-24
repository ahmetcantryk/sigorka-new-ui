'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const AltinOrumcekPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  const handleClose = useCallback(() => {
    // SessionStorage'a kaydet - tarayıcı kapanınca otomatik silinir
    sessionStorage.setItem('altin_orumcek_closed', 'true');
    
    setIsVisible(false);
  }, []);

  useEffect(() => {
    // Popup'ın gösterilmeyeceği sayfaları kontrol et
    const isExcludedPage = () => {
      if (!pathname) return false;
      
      // Dashboard sayfaları
      if (pathname.startsWith('/dashboard')) return true;
      
      // Giriş sayfası
      if (pathname.startsWith('/giris-yap')) return true;
      
      // Satın alma ve ödeme sayfaları
      if (pathname.startsWith('/purchase')) return true;
      if (pathname.startsWith('/odeme')) return true;
      if (pathname.startsWith('/satin-al')) return true;
      
      // Teklif sayfaları (path içinde -teklif geçiyorsa)
      if (pathname.includes('-teklif')) return true;
      if (pathname.includes('quote-comparison')) return true;
      

      
      return false;
    };

    // SessionStorage'ı kontrol et
    const checkPopupStatus = () => {
      // Hariç tutulan sayfalarda popup'ı gösterme
      if (isExcludedPage()) {
        return;
      }
      
      const isClosed = sessionStorage.getItem('altin_orumcek_closed');
      
      if (!isClosed) {
        // Bu oturumda henüz gösterilmemiş veya kapatılmamış, popup'ı göster
        setIsVisible(true);
      }
    };

    // Sayfa yüklendikten kısa bir süre sonra popup'ı göster
    setTimeout(() => {
      checkPopupStatus();
    }, 1000);

    // ESC tuşu ile kapatma
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, handleClose, pathname]);

  // Popup açıkken body scroll'u engelle
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  const handleVote = () => {
    // Oy verme sayfasını yeni sekmede aç
    window.open('https://altinorumcek.com/halk-oylamasi-2025/', '_blank');
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay - Arka plan karartması */}
      <div 
        className="altin-orumcek-overlay fixed inset-0 bg-black bg-opacity-50 z-[99998] transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className="altin-orumcek-popup-wrapper fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="altin-orumcek-popup-content relative  animate-fadeIn">
          {/* Kapatma butonu */}
          <button
            onClick={handleClose}
            className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-2xl hover:shadow-3xl transition-shadow z-10 group opacity-100"
            style={{ boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)', opacity: 1 }}
            aria-label="Kapat"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 sm:h-6 sm:w-6 opacity-100" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="rgb(42, 31, 105)"
              strokeWidth={2.5}
              style={{ opacity: 1 }}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>

          {/* Görsel - Tıklanabilir */}
          <div 
            className="relative cursor-pointer rounded-lg overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow"
            onClick={handleVote}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleVote();
              }
            }}
          >
            <Image
              src="/images/altin-orumcek.png"
              alt="23. Altın Örümcek Ödülleri - Sigorka Finalist. Oy vermek için tıklayın."
              width={700}
              height={500}
              className="altin-orumcek-popup-image w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>

      {/* Animasyon stilleri */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default AltinOrumcekPopup;

