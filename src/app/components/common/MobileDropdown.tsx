'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface MobileDropdownProps {
  title: string;
  isActive: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  navBox?: {
    href: string;
    title: string;
    desc: string;
    image: string;
    alt: string;
  };
  onLinkClick?: () => void;
}

const MobileDropdown: React.FC<MobileDropdownProps> = ({ title, isActive, onToggle, children, navBox, onLinkClick }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    if (isActive) {
      // Açılma animasyonu
      element.style.display = 'block';
      element.style.height = '0px';
      element.style.overflow = 'hidden';
      element.style.transition = 'height 0.3s ease-in-out';
      
      // Force reflow
      element.offsetHeight;
      
      const scrollHeight = element.scrollHeight;
      element.style.height = `${scrollHeight}px`;
    } else {
      // Kapanma animasyonu
      element.style.height = `${element.scrollHeight}px`;
      element.style.overflow = 'hidden';
      element.style.transition = 'height 0.3s ease-in-out';
      
      // Force reflow
      element.offsetHeight;
      
      element.style.height = '0px';
      
      setTimeout(() => {
        element.style.display = 'none';
        element.style.height = '';
        element.style.overflow = '';
        element.style.transition = '';
      }, 300);
    }
  }, [isActive]);

  return (
    <li className={`main-nav__item main-nav__item--dropdown${isActive ? ' active' : ''}`}>
      <a 
        className={`main-nav__link${title === 'Aracım' || title === 'Sağlığım' || title === 'Yuvam' ? ' main-nav__link--primary' : ''}`}
        href="#" 
        onClick={(e) => {
          e.preventDefault();
          onToggle();
        }}
      >
        {title} <span className="icon-angle-down"></span>
      </a>
      <div 
        ref={contentRef}
        className="sub-nav sub-nav--sm"
        style={{
          display: 'none',
          height: '0px',
          overflow: 'hidden'
        }}
      >
        {navBox && (
          <Link href={navBox.href} className="nav-box" onClick={onLinkClick}>
            <div className="nav-box__title-group">
              <h4 className="nav-box__title">{navBox.title}</h4>
              <p className="nav-box__desc">{navBox.desc}</p>
            </div>
            <div className="nav-box__img">
              <Image src={navBox.image} alt={navBox.alt} width={100} height={114} />
            </div>
          </Link>
        )}
        <div onClick={onLinkClick}>
          {children}
        </div>
      </div>
    </li>
  );
};

export default MobileDropdown;

