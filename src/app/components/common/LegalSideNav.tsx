'use client';
 
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/acik-riza-metni', label: 'Açık Rıza Metni' },
  { href: '/cerez-politikasi', label: 'Çerez Politikası' },
  { href: '/elektronik-ileti-onayi', label: 'Elektronik İleti Onayı' },
  { href: '/kvkk', label: 'Kişisel Verilerin Korunması Hakkında Aydınlatma Metni' },
  { href: '/kullanici-sozlesmesi', label: 'Kullanıcı Sözleşmesi' },
  { href: '/mesafeli-satis-sozlesmesi', label: 'Mesafeli Satış Sözleşmesi' },
  
];

const LegalSideNav: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (e: React.MouseEvent<HTMLAnchorElement>, isActive: boolean) => {
    // Mobilde aktif item'a tıklanınca toggle yap
    if (isActive && window.innerWidth < 768) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <nav className="side-nav">
      <ul className={`side-nav__nav${isOpen ? ' side-nav__nav--open' : ''}`}>
        {navItems.map((item) => {
          // Aktiflik kontrolü: pathname tam eşleşme veya /xxx ile eşleşme
          const isActive = pathname === item.href ; 
          return (
            <li
              key={item.href}
              className={`side-nav__item${isActive ? ' side-nav__item--active' : ''}`}
            >
              <a 
                href={item.href} 
                target="_self" 
                className="side-nav__link"
                onClick={(e) => handleToggle(e, isActive)}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default LegalSideNav;

