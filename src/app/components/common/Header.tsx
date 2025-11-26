'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import MobileDropdown from './MobileDropdown';
import { useAuthStore } from '../../../store/useAuthStore';
import { useDropdownManager } from '../../../hooks/useDropdownManager';

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/images/sigorka-logo-new.svg');
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [isProductDetailPage, setIsProductDetailPage] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const { getManager, destroy } = useDropdownManager({
    fadeDuration: 300,
    hoverDelay: 50,
    leaveDelay: 100
  });

  // B2C form sayfalarını kontrol et (yuvamguvende hariç)
  const isB2CFormPage = () => {
    if (pathname.startsWith('/yuvamguvende')) return false;
    
    return pathname.startsWith('/dashboard') ||
           pathname.startsWith('/giris-yap') ||
           pathname.startsWith('/purchase') ||
           pathname.startsWith('/odeme') ||
           pathname.startsWith('/satin-al') ||
           pathname.includes('-teklif') ||
           pathname.includes('quote-comparison');
  };

  // Check if on product detail page or quote pages
  useEffect(() => {
    // Body'deki product-detail-page class'ını ve teklif sayfalarını kontrol et
    const checkPageType = () => {
      const hasProductDetailClass = document.body.classList.contains('product-detail-page');
      const isQuotePage = window.location.pathname.includes('-teklif') || 
                         window.location.pathname.includes('/teklif-al') ||
                         window.location.pathname.includes('/odeme') ||
                         window.location.pathname.includes('/purchase');
      const isDashboardPage = window.location.pathname.startsWith('/dashboard');
      const isLoginPage = window.location.pathname === '/giris-yap' || window.location.pathname === '/login';
      
      setIsProductDetailPage(hasProductDetailClass);
      
      // Dashboard ve giriş sayfalarında beyaz logo
      if (isDashboardPage || isLoginPage) {
        setIsScrolled(false);
        setLogoSrc('/images/sigorka-logo-new-2.svg');
      }
      // Eğer ürün detay sayfasındaysak, scroll state'ini sıfırla ve normal logo kullan
      else if (hasProductDetailClass) {
        setIsScrolled(false);
        setLogoSrc('/images/sigorka-logo-new.svg');
      }
      // Eğer teklif sayfasındaysak, beyaz logo kullan
      else if (isQuotePage) {
        setIsScrolled(false);
        setLogoSrc('/images/sigorka-logo-new-2.svg');
      }
    };

    // İlk yüklemede kontrol et
    setTimeout(checkPageType, 50);
    
    // Interval ile de kontrol et (ilk 500ms boyunca)
    const interval = setInterval(checkPageType, 100);
    setTimeout(() => clearInterval(interval), 500);
    
    // MutationObserver ile body class değişikliklerini izle
    const observer = new MutationObserver(() => {
      checkPageType();
    });
    
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Auth initialize
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Mobile and touch detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };

    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkMobile();
    checkTouch();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);


  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      // Scroll olduğunda tüm dropdown'ları kapat
      getManager().closeAllDropdowns();

      // Ürün detay sayfası veya teklif sayfalarında navbar sticky olmamalı
      const isQuotePage = window.location.pathname.includes('-teklif') || 
                         window.location.pathname.includes('/teklif-al') ||
                         window.location.pathname.includes('/odeme') ||
                         window.location.pathname.includes('/purchase');
      const isDashboardPage = window.location.pathname.startsWith('/dashboard');
      const isLoginPage = window.location.pathname === '/giris-yap' || window.location.pathname === '/login';
      
      if (isDashboardPage || isLoginPage) {
        // Dashboard ve giriş sayfalarında beyaz logo
        setIsScrolled(false);
        if (!isMenuOpen) {
          setLogoSrc('/images/sigorka-logo-new-2.svg');
        }
        // Menü açıkken footer logo kullan
        if (isMenuOpen) {
          setLogoSrc('/images/footer-logo.svg');
        }
      } else if (!isProductDetailPage && !isQuotePage) {
        const scrollTop = window.scrollY;
        if (scrollTop > 0) {
          setIsScrolled(true);
          if (!isMenuOpen) {
            setLogoSrc('/images/sigorka-logo-new-2.svg');
          }
        } else {
          setIsScrolled(false);
          if (!isMenuOpen) {
            setLogoSrc('/images/sigorka-logo-new.svg');
          }
        }
        // Menü açıkken footer logo kullan
        if (isMenuOpen) {
          setLogoSrc('/images/footer-logo.svg');
        }
      } else if (isQuotePage) {
        // Teklif sayfalarında beyaz logo kullan
        setIsScrolled(false);
        if (!isMenuOpen) {
          setLogoSrc('/images/sigorka-logo-new-2.svg');
        }
        // Menü açıkken footer logo kullan
        if (isMenuOpen) {
          setLogoSrc('/images/footer-logo.svg');
        }
      } else {
        // Ürün detay sayfasında normal logo kullan
        setIsScrolled(false);
        if (!isMenuOpen) {
          setLogoSrc('/images/sigorka-logo-new.svg');
        }
        // Menü açıkken footer logo kullan
        if (isMenuOpen) {
          setLogoSrc('/images/footer-logo.svg');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMenuOpen, isProductDetailPage, getManager]);

  // Dropdown handlers - sadece desktop için
  useEffect(() => {
    if (typeof window === 'undefined' || isMobile) return;

    const dropdownItems = document.querySelectorAll('.main-nav__item--dropdown');
    const manager = getManager();
    const handlers: { element: Element; type: string; handler: EventListener }[] = [];

    dropdownItems.forEach(item => {
      const handleMouseEnter = () => {
        manager.handleMouseEnter(item as HTMLElement);
      };

      const handleMouseLeave = () => {
        manager.handleMouseLeave(item as HTMLElement);
      };

      item.addEventListener('mouseenter', handleMouseEnter);
      item.addEventListener('mouseleave', handleMouseLeave);

      handlers.push({ element: item, type: 'mouseenter', handler: handleMouseEnter as EventListener });
      handlers.push({ element: item, type: 'mouseleave', handler: handleMouseLeave as EventListener });
    });

    // Cleanup
    return () => {
      handlers.forEach(({ element, type, handler }) => {
        element.removeEventListener(type, handler);
      });
    };
  }, [isMobile, getManager]);

  // Cleanup dropdown manager on unmount
  useEffect(() => {
    return () => {
      destroy();
    };
  }, [destroy]);

  // Mobil menüyü kapat
  const closeMobileMenu = () => {
    if (isMenuOpen) {
      const navCollapse = document.querySelector('.navbar__collapse') as HTMLElement;
      
      document.body.classList.remove('menu-open');
      setIsMenuOpen(false);
      setActiveDropdown(null);
      
      if (navCollapse) {
        navCollapse.style.opacity = '0';
        setTimeout(() => {
          navCollapse.style.display = 'none';
        }, 300);
      }
      
      // Logo'yu scroll durumuna göre ayarla
      const isProductDetail = document.body.classList.contains('product-detail-page');
      const isQuotePage = window.location.pathname.includes('-teklif') || 
                         window.location.pathname.includes('/teklif-al') ||
                         window.location.pathname.includes('/odeme') ||
                         window.location.pathname.includes('/purchase');
      const isDashboardPage = window.location.pathname.startsWith('/dashboard');
      const isLoginPage = window.location.pathname === '/giris-yap' || window.location.pathname === '/login';
      
      if (isProductDetail) {
        setLogoSrc('/images/sigorka-logo-new.svg');
      } else if (isQuotePage || isDashboardPage || isLoginPage) {
        setLogoSrc('/images/sigorka-logo-new-2.svg');
      } else {
        setLogoSrc(isScrolled ? '/images/sigorka-logo-new-2.svg' : '/images/sigorka-logo-new.svg');
      }
    }
  };

  // Menu toggle - fadeToggle benzeri
  const toggleMenu = () => {
    const navCollapse = document.querySelector('.navbar__collapse') as HTMLElement;
    
    if (!isMenuOpen) {
      // Menu açılıyor
      document.body.classList.add('menu-open');
      setLogoSrc('/images/footer-logo.svg');
      setIsMenuOpen(true);
      
      if (navCollapse) {
        navCollapse.style.display = 'block';
        setTimeout(() => {
          navCollapse.style.opacity = '1';
        }, 10);
      }
    } else {
      // Menu kapanıyor
      document.body.classList.remove('menu-open');
      setIsMenuOpen(false);
      
      if (navCollapse) {
        navCollapse.style.opacity = '0';
        setTimeout(() => {
          navCollapse.style.display = 'none';
        }, 300);
      }
      
      // Logo'yu scroll durumuna göre ayarla
      const isProductDetail = document.body.classList.contains('product-detail-page');
      const isQuotePage = window.location.pathname.includes('-teklif') || 
                         window.location.pathname.includes('/teklif-al') ||
                         window.location.pathname.includes('/odeme') ||
                         window.location.pathname.includes('/purchase');
      const isDashboardPage = window.location.pathname.startsWith('/dashboard');
      const isLoginPage = window.location.pathname === '/giris-yap' || window.location.pathname === '/login';
      
      if (isDashboardPage || isLoginPage) {
        // Dashboard ve giriş sayfalarında beyaz logo
        setLogoSrc('/images/sigorka-logo-new-2.svg');
      } else if (isQuotePage) {
        // Teklif sayfalarında beyaz logo kullan
        setLogoSrc('/images/sigorka-logo-new-2.svg');
      } else if (window.scrollY > 0 && !isProductDetail) {
        // Normal sayfalarda scroll durumuna göre logo ayarla
        setLogoSrc('/images/sigorka-logo-new-2.svg');
      } else {
        // Ürün detay sayfasında veya scroll yokken normal logo
        setLogoSrc('/images/sigorka-logo-new.svg');
      }
    }
  };

  return (
    <div className={`navbar ${!isProductDetailPage && isScrolled ? 'navbar--reverse' : ''} ${isB2CFormPage() ? 'navbar--b2c-form' : ''}`}>
      <div className="navbar__container container">
        <Link href="/" className="navbar__logo">
          <img ref={logoRef} src={logoSrc} alt="Sigorka Logo" />
        </Link>
        <div className={`navbar__collapse ${isMenuOpen ? 'show' : ''}`}>
          <div className="navbar__mobile">
            <Link className="btn btn-primary" href={isAuthenticated ? "/dashboard/profile" : "/giris-yap"} onClick={closeMobileMenu}>
              {isAuthenticated ? "Hesabım" : "Giriş Yap"}
            </Link>
            <Link className="btn btn-green" href="/urunlerimiz" onClick={closeMobileMenu}>Teklif Al</Link>
          </div>
          <ul className="main-nav">
            {isMobile ? (
              <MobileDropdown
                title="Aracım"
                isActive={activeDropdown === 0}
                onToggle={() => setActiveDropdown(activeDropdown === 0 ? null : 0)}
                onLinkClick={closeMobileMenu}
                navBox={{
                  href: "/aracim",
                  title: "Aracım",
                  desc: "Kaza ve beklenmedik hasarlara karşı aracınızı güvence altına alın.",
                  image: "/images/aracim.png",
                  alt: "Aracım"
                }}
              >
                <ul className="sub-nav__nav">
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/kasko-sigortasi">Katılım Kasko Sigortası</Link>
                  </li>
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/zorunlu-trafik-sigortasi">Katılım Zorunlu Trafik Sigortası</Link>
                  </li>
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/imm">İMM Sigortası</Link>
                  </li>
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/aracim">Araç Sigortaları Hakkında</Link>
                  </li>
                </ul>
              </MobileDropdown>
            ) : (
              <li className="main-nav__item main-nav__item--dropdown">
                <a className="main-nav__link main-nav__link--primary" href="#" onClick={(e) => e.preventDefault()}>
                  Aracım <span className="icon-angle-down"></span>
                </a>
                <div className="sub-nav sub-nav--sm" style={{ display: 'none', opacity: '0', visibility: 'hidden' }}>
                  <Link href="/aracim" className="nav-box">
                    <div className="nav-box__title-group">
                      <h4 className="nav-box__title">Aracım</h4>
                      <p className="nav-box__desc">
                        Kaza ve beklenmedik hasarlara karşı aracınızı güvence altına alın.
                      </p>
                    </div>
                    <div className="nav-box__img">
                      <Image src="/images/aracim.png" alt="Aracım" width={100} height={114} />
                    </div>
                  </Link>
                  <ul className="sub-nav__nav">
                    <li className="sub-nav__item">
                      <Link className="sub-nav__link" href="/kasko-sigortasi">Katılım Kasko Sigortası</Link>
                    </li>
                    <li className="sub-nav__item">
                      <Link className="sub-nav__link" href="/zorunlu-trafik-sigortasi">Katılım Zorunlu Trafik Sigortası</Link>
                    </li>
                    <li className="sub-nav__item">
                      <Link className="sub-nav__link" href="/imm">İMM Sigortası</Link>
                    </li>
                    <li className="sub-nav__item">
                      <Link className="sub-nav__link" href="/aracim">Araç Sigortaları Hakkında</Link>
                    </li>
                  </ul>
                </div>
              </li>
            )}
            {isMobile ? (
              <MobileDropdown
                title="Sağlığım"
                isActive={activeDropdown === 1}
                onToggle={() => setActiveDropdown(activeDropdown === 1 ? null : 1)}
                onLinkClick={closeMobileMenu}
                navBox={{
                  href: "/sagligim",
                  title: "Sağlığım",
                  desc: "Sağlığınızı ve bütçenizi zor zamanlara karşı koruyun.",
                  image: "/images/sagligim.png",
                  alt: "Sağlığım"
                }}
              >
                <ul className="sub-nav__nav">
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/ozel-saglik-sigortasi">Özel Sağlık Katılım Sigortası</Link>
                  </li>
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/seyahat-saglik-sigortasi">Seyahat Sağlık Katılım Sigortası</Link>
                  </li>
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/tamamlayici-saglik-sigortasi">Tamamlayıcı Sağlık Katılım Sigortası</Link>
                  </li>
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/yabanci-saglik-sigortasi">Yabancı Sağlık Katılım Sigortası</Link>
                  </li>
                  {/*<li className="sub-nav__item">*/}
                  {/*  <Link className="sub-nav__link" href="/acil-saglik-sigortasi">Doktorum Benimle</Link>*/}
                  {/*</li>*/}
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/sagligim">Sağlık Sigortaları Hakkında</Link>
                  </li>
                </ul>
              </MobileDropdown>
            ) : (
              <li className="main-nav__item main-nav__item--dropdown">
                <a className="main-nav__link main-nav__link--primary" href="#" onClick={(e) => e.preventDefault()}>
                  Sağlığım <span className="icon-angle-down"></span>
                </a>
                <div className="sub-nav sub-nav--sm" style={{ display: 'none', opacity: '0', visibility: 'hidden' }}>
                  <Link href="/sagligim" className="nav-box">
                    <div className="nav-box__title-group">
                      <h4 className="nav-box__title">Sağlığım</h4>
                      <p className="nav-box__desc">
                        Sağlığınızı ve bütçenizi zor zamanlara karşı koruyun.
                      </p>
                    </div>
                    <div className="nav-box__img">
                      <Image src="/images/sagligim.png" alt="Sağlığım" width={100} height={114} />
                    </div>
                  </Link>
                  <ul className="sub-nav__nav">
                    <li className="sub-nav__item">
                      <Link className="sub-nav__link" href="/ozel-saglik-sigortasi">Özel Sağlık Katılım Sigortası</Link>
                    </li>
                    <li className="sub-nav__item">
                      <Link className="sub-nav__link" href="/seyahat-saglik-sigortasi">Seyahat Sağlık Katılım Sigortası</Link>
                    </li>
                    <li className="sub-nav__item">
                      <Link className="sub-nav__link" href="/tamamlayici-saglik-sigortasi">Tamamlayıcı Sağlık Katılım Sigortası</Link>
                    </li>
                    <li className="sub-nav__item">
                      <Link className="sub-nav__link" href="/yabanci-saglik-sigortasi">Yabancı Sağlık Katılım Sigortası</Link>
                    </li>
                    {/* <li className="sub-nav__item">
                      <Link className="sub-nav__link" href="/acil-saglik-sigortasi">Doktorum Benimle</Link>
                    </li> */}
                    <li className="sub-nav__item">
                      <Link className="sub-nav__link" href="/sagligim">Sağlık Sigortaları Hakkında</Link>
                    </li>
                  </ul>
                </div>
              </li>
            )}
            {isMobile ? (
              <MobileDropdown
                title="Yuvam"
                isActive={activeDropdown === 2}
                onToggle={() => setActiveDropdown(activeDropdown === 2 ? null : 2)}
                onLinkClick={closeMobileMenu}
                navBox={{
                  href: "/yuvam",
                  title: "Yuvam",
                  desc: "Yuvanızı doğal afet ve risklere karşı koruma altına alın.",
                  image: "/images/yuvam.png",
                  alt: "Yuvam"
                }}
              >
                <ul className="sub-nav__nav">
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/dask">DASK</Link>  
                  </li>
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/konut-sigortasi">Katılım Konut Sigortası</Link>
                  </li>
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/ferdi-kaza-sigortasi">Ferdi Kaza Sigortası</Link>
                  </li>
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/yuvam">Konut Sigortaları Hakkında</Link>
                  </li>
                </ul>
              </MobileDropdown>
            ) : (
              <li className="main-nav__item main-nav__item--dropdown">
                <a className="main-nav__link main-nav__link--primary" href="#" onClick={(e) => e.preventDefault()}>
                  Yuvam <span className="icon-angle-down"></span>
                </a>
                <div className="sub-nav sub-nav--sm" style={{ display: 'none', opacity: '0', visibility: 'hidden' }}>
                  <Link href="/yuvam" className="nav-box">
                    <div className="nav-box__title-group">
                      <h4 className="nav-box__title">Yuvam</h4>
                      <p className="nav-box__desc">
                        Yuvanızı doğal afet ve risklere karşı koruma altına alın.
                      </p>
                    </div>
                    <div className="nav-box__img">
                      <Image src="/images/yuvam.png" alt="Yuvam" width={100} height={114} />
                    </div>
                  </Link>
                  <ul className="sub-nav__nav">
                    <li className="sub-nav__item">
                      <Link className="sub-nav__link" href="/dask">DASK</Link>  
                    </li>
                    <li className="sub-nav__item">
                      <Link className="sub-nav__link" href="/konut-sigortasi">Katılım Konut Sigortası</Link>
                    </li>
                    <li className="sub-nav__item">
                      <Link className="sub-nav__link" href="/ferdi-kaza-sigortasi">Ferdi Kaza Sigortası</Link>
                    </li>
                    <li className="sub-nav__item">
                      <Link className="sub-nav__link" href="/yuvam">Konut Sigortaları Hakkında</Link>
                    </li>
                  </ul>
                </div>
              </li>
            )}
            <li className="main-nav__item">
              <Link className="main-nav__link" href="/kampanyalar" onClick={isMobile ? closeMobileMenu : undefined}>Kampanyalar</Link>
            </li>
            {isMobile ? (
              <MobileDropdown
                title="Hakkımızda"
                isActive={activeDropdown === 3}
                onToggle={() => setActiveDropdown(activeDropdown === 3 ? null : 3)}
                onLinkClick={closeMobileMenu}
              >
                <ul className="sub-nav__nav">
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/biz-kimiz">Biz Kimiz?</Link>
                  </li>
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/neden-katilim-sigortaciligi">Neden Katılım Sigortacılığı?</Link>
                  </li>
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/anlasmali-sigorta-sirketleri">Anlaşmalı Sigorta Şirketleri</Link>
                  </li>
                </ul>
              </MobileDropdown>
            ) : (
              <li className="main-nav__item main-nav__item--dropdown">
                <a className="main-nav__link" href="#" onClick={(e) => e.preventDefault()}>
                  Hakkımızda <span className="icon-angle-down"></span>
                </a>
                <div className="sub-nav sub-nav--sm" style={{ display: 'none', opacity: '0', visibility: 'hidden' }}>
                  <ul className="sub-nav__nav">
                    <li className="sub-nav__item">
                      <Link className="sub-nav__link" href="/biz-kimiz">Biz Kimiz?</Link>
                    </li>
                    <li className="sub-nav__item">
                      <Link className="sub-nav__link" href="/neden-katilim-sigortaciligi">Neden Katılım Sigortacılığı?</Link>
                    </li>
                    <li className="sub-nav__item">
                      <Link className="sub-nav__link" href="/anlasmali-sigorta-sirketleri">Anlaşmalı Sigorta Şirketleri</Link>
                    </li>
                  </ul>
                </div>
              </li>
            )}
            {isMobile && (
              <MobileDropdown
                title="Bilgi Merkezi"
                isActive={activeDropdown === 4}
                onToggle={() => setActiveDropdown(activeDropdown === 4 ? null : 4)}
                onLinkClick={closeMobileMenu}
              >
                <ul className="sub-nav__nav">
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/blog">Sigorta Blog</Link>
                  </li>
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/sozluk">Sigorta Sözlük</Link>
                  </li>
                  <li className="sub-nav__item">
                    <Link className="sub-nav__link" href="/sikca-sorulan-sorular">S.S.S</Link>
                  </li>
                </ul>
              </MobileDropdown>
            )}
            <li className="main-nav__item d-lg-none">
              <Link className="main-nav__link" href="/iletisim" onClick={closeMobileMenu}>İletişim</Link>
            </li>
            <li className="main-nav__item d-none d-lg-flex">
              <a href="tel:+908504040404" className="main-nav__link main-nav__link--phone">
                <span className="icon-phone"></span> 0850 404 04 04 
                <span className="main-nav__phone-note">7 Gün 24 Saat</span>
              </a>
            </li>
            <li className="main-nav__item">
              <Link href={isAuthenticated ? "/dashboard/profile" : "/giris-yap"} className="main-nav__link main-nav__link--btn" onClick={isMobile ? closeMobileMenu : undefined}>
                {isAuthenticated ? "Hesabım" : "Giriş Yap"}
              </Link>
            </li>
              <li className="main-nav__item">
              <Link href="/urunlerimiz" className="main-nav__link main-nav__link--btn main-nav__link--btn-primary" onClick={isMobile ? closeMobileMenu : undefined}>Teklif Al</Link>
              </li>
          </ul>
          <div className="navbar__mobile-info d-lg-none">
            <div className="customer-relations">
              <h4 className="customer-relations__title">Müşteri Hizmetleri Merkezi</h4>
              <a href="tel:+908504044444" className="customer-relations__phone">
                <span className="icon-phone"></span> 0850 404 04 04
              </a>
            </div>
            <div className="navbar__social">
              <a className="navbar__social-item" href="https://www.facebook.com/profile.php?id=61562848803157" target="_blank" rel="noreferrer noopener">
                <span className="icon-facebook"></span>
              </a>
              <a className="navbar__social-item" href="https://www.instagram.com/sigorkacom/" target="_blank" rel="noreferrer noopener">
                <span className="icon-instagram"></span>
              </a>
              <a className="navbar__social-item" href="https://www.linkedin.com/company/sigorkacom/" target="_blank" rel="noreferrer noopener">
                <span className="icon-linkedin"></span>
              </a>
              <a className="navbar__social-item" href="https://www.youtube.com/@sigorkacom" target="_blank" rel="noreferrer noopener">
                <span className="icon-youtube"></span>
              </a>
            </div>
          </div>
        </div>
        <div 
          className={`nav-icon ${isMenuOpen ? 'open' : ''}`} 
          role="button" 
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
} 
