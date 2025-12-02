"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isMobile, setIsMobile] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<number[]>([]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const toggleDropdown = (index: number, e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      
      const currentTitle = e.currentTarget as HTMLElement;
      const parent = currentTitle.parentElement;
      const group = parent?.querySelector('.footer-nav__group') as HTMLElement;
      
      // Toggle active class
      currentTitle.classList.toggle('footer-nav__title--active');
      
      // slideToggle benzeri
      if (group) {
        if (group.style.display === 'none' || !group.style.display) {
          group.style.display = 'block';
        } else {
          group.style.display = 'none';
        }
      }
      
      setOpenDropdowns(prev => {
        if (prev.includes(index)) {
          return prev.filter(i => i !== index);
        } else {
          return [...prev, index];
        }
      });
    }
  };

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container footer__top-container">
          <Link href="/">
            <Image src="/images/footer-logo.svg" className="footer__logo" alt="Sigorka" width={210} height={58} />
          </Link>
          <Link href="/urunlerimiz" className="btn btn-secondary d-sm-none">Teklif Al</Link>
          <div className="customer-relations">
            <h4 className="customer-relations__title">Müşteri Hizmetleri Merkezi</h4>
            <a href="tel:+908504040404" className="customer-relations__phone">
              <span className="icon-phone"></span> 0850 404 04 04
            </a>
          </div>
        </div>
      </div>
      <div className="footer__middle">
        <div className="container footer__container">
          <div className="row">
            <div className="col-12 col-sm footer-col">
              <div className={`footer-nav footer-nav--dropdown ${openDropdowns.includes(0) ? 'footer-nav--active' : ''}`}>
                <Link 
                  className={`footer-nav__title ${openDropdowns.includes(0) ? 'footer-nav__title--active' : ''}`} 
                  href="/aracim"
                  onClick={(e) => toggleDropdown(0, e)}
                >
                  Aracım
                </Link>
                <div className="footer-nav__group">
                  <Link href="/kasko-sigortasi" className="footer-nav__item">Katılım Kasko Sigortası</Link>
                  <Link href="/zorunlu-trafik-sigortasi" className="footer-nav__item">Katılım Zorunlu Trafik Sigortası</Link>
                  <Link href="/imm" className="footer-nav__item">İMM Sigortası</Link>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm footer-col">
              <div className={`footer-nav footer-nav--dropdown ${openDropdowns.includes(1) ? 'footer-nav--active' : ''}`}>
                <Link 
                  className={`footer-nav__title ${openDropdowns.includes(1) ? 'footer-nav__title--active' : ''}`} 
                  href="/sagligim"
                  onClick={(e) => toggleDropdown(1, e)}
                >
                  Sağlığım
                </Link>
                <div className="footer-nav__group">
                  <Link href="/ozel-saglik-sigortasi" className="footer-nav__item">Özel Sağlık Katılım Sigortası</Link>
                  <Link href="/seyahat-saglik-sigortasi" className="footer-nav__item">Seyahat Sağlık Katılım Sigortası</Link>
                  <Link href="/tamamlayici-saglik-sigortasi" className="footer-nav__item">Tamamlayıcı Sağlık Katılım Sigortası</Link>
                  <Link href="/yabanci-saglik-sigortasi" className="footer-nav__item">Yabancı Sağlık Katılım Sigortası</Link>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm footer-col">
              <div className={`footer-nav footer-nav--dropdown ${openDropdowns.includes(2) ? 'footer-nav--active' : ''}`}>
                <Link 
                  className={`footer-nav__title ${openDropdowns.includes(2) ? 'footer-nav__title--active' : ''}`} 
                  href="/yuvam"
                  onClick={(e) => toggleDropdown(2, e)}
                >
                  Yuvam
                </Link>
                <div className="footer-nav__group">
                  <Link href="/dask" className="footer-nav__item">DASK</Link>
                  <Link href="/konut-sigortasi" className="footer-nav__item">Katılım Konut Sigortası</Link>
                  <Link href="/ferdi-kaza-sigortasi" className="footer-nav__item">Ferdi Kaza Sigortası</Link>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm footer-col">
              <div className={`footer-nav footer-nav--dropdown ${openDropdowns.includes(3) ? 'footer-nav--active' : ''}`}>
                <Link 
                  className={`footer-nav__title ${openDropdowns.includes(3) ? 'footer-nav__title--active' : ''}`} 
                  href="/hakkimizda"
                  onClick={(e) => toggleDropdown(3, e)}
                >
                  Hakkımızda
                </Link>
                <div className="footer-nav__group">
                  <Link href="/biz-kimiz" className="footer-nav__item">Biz Kimiz?</Link>
                  <Link href="/neden-katilim-sigortaciligi" className="footer-nav__item">Neden Katılım Sigortacılığı</Link>
                  <Link href="/anlasmali-sigorta-sirketleri" className="footer-nav__item">Anlaşmalı Sigorta Şirketleri</Link>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm footer-col">
              <div className={`footer-nav footer-nav--dropdown ${openDropdowns.includes(4) ? 'footer-nav--active' : ''}`}>
                <Link 
                  className={`footer-nav__title ${openDropdowns.includes(4) ? 'footer-nav__title--active' : ''}`} 
                  href="/bilgi-merkezi"
                  onClick={(e) => toggleDropdown(4, e)}
                >
                  Bilgi Merkezi
                </Link>
                <div className="footer-nav__group">
                  <Link href="/blog" className="footer-nav__item">Sigorta Blog</Link>
                  <Link href="/sozluk" className="footer-nav__item">Sigorta Sözlük</Link>
                  <Link href="/sikca-sorulan-sorular" className="footer-nav__item">S.S.S</Link>
                </div>
              </div>
            </div>
            <div className="col-6 col-sm footer-col">
              <div className="footer-nav">
                <Link href="/kampanyalar" className="footer-nav__title">Kampanyalar</Link>
              </div>
            </div>
            <div className="col-6 col-sm footer-col">
              <div className="footer-nav">
                <Link className="footer-nav__title" href="/iletisim">İletişim</Link>
              </div>
            </div>
            <div className="col footer-col">
              <div className="footer-nav__contact">
                <div className="footer-nav__contact-group">
                  <h4 className="footer-nav__title mb-0">Sosyal Medya</h4>
                  <div className="footer__social">
                    <a className="footer__social-item" href="https://www.facebook.com/profile.php?id=61562848803157" target="_blank" rel="noreferrer noopener" aria-label="Facebook'ta bizi takip edin">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a className="footer__social-item" href="https://www.instagram.com/sigorkacom/" target="_blank" rel="noreferrer noopener" aria-label="Instagram'da bizi takip edin">
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a className="footer__social-item" href="https://www.linkedin.com/company/sigorkacom/" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn'de bizi takip edin">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </div>
                  <a className="footer__mail-box" href="mailto:info@sigorka.com">
                    <span className="icon-envelope"></span> info@sigorka.com
                  </a>
                </div>
                <Image src="/images/etbis.png" className="footer-nav__contact-img" alt="Etbis'e kayıtlıdır" width={64} height={74} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="footer__bottom-container container">
          <p className="footer__copyright">© Copyright {currentYear} sigorka.com. Tüm hakları saklıdır.</p>
          <div className="legal-menu">
            <Link href="/cerez-politikasi" className="legal-menu__item">Bilgi Toplumu Hizmetleri</Link>
            <Link href="/kvkk" className="legal-menu__item">Kişisel Verilerin Korunması</Link>
          </div>
          <div className="payment-options">
            <div className="payment-options__item">
              <span>3D Secure Güvenli Alışveriş</span>
              <Image src="/images/card-icon.svg" alt="3D Secure" width={30} height={30} />
            </div>
            <div className="payment-options__item">
              <span>SSL</span>
              <Image src="/images/ssl-icon.svg" alt="SSL" width={30} height={30} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
