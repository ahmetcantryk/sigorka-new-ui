'use client';

import { Shield, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Header = () => {
  const router = useRouter();

  // Menüyü kapatma fonksiyonu
  const closeMenu = () => {
    // .navbar__collapse'dan show class'ını kaldır
    const navbarCollapse = document.querySelector('.navbar__collapse');
    if (navbarCollapse) {
      navbarCollapse.classList.remove('show');
    }
    
    // body'den menu-open class'ını kaldır
    document.body.classList.remove('menu-open');
  };

  // Link tıklama işleyicisi
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Menüyü kapat
    closeMenu();
    
    // Eğer href bir URL ise (tel: gibi) normal davranışı koru
    const href = e.currentTarget.getAttribute('href');
    if (href && (href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('http'))) {
      return;
    }
    
    // Diğer durumlarda varsayılan davranışı engelle ve router ile yönlendir
    e.preventDefault();
    if (href) {
      router.push(href);
    }
  };

  return (
    <header className="backdrop-blur-xs shadow-xs fixed z-50 w-full bg-white/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">SigortaPlus</span>
          </div>

          <nav className="hidden space-x-8 md:flex">
            <a 
              href="#products" 
              className="text-gray-700 transition-colors hover:text-blue-600"
              onClick={handleLinkClick}
            >
              Sigorta Ürünleri
            </a>
            <a 
              href="#how-it-works" 
              className="text-gray-700 transition-colors hover:text-blue-600"
              onClick={handleLinkClick}
            >
              Nasıl Çalışır
            </a>
            <a 
              href="#advantages" 
              className="text-gray-700 transition-colors hover:text-blue-600"
              onClick={handleLinkClick}
            >
              Avantajlar
            </a>
            <a 
              href="tel:+902121234567" 
              className="font-medium text-blue-600"
              onClick={handleLinkClick}
            >
              0212 123 45 67
            </a>
            <button 
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              onClick={closeMenu}
            >
              Giriş Yap
            </button>
          </nav>

          <button className="md:hidden" onClick={closeMenu}>
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 