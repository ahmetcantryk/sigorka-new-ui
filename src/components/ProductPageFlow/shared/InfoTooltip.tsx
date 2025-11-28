/**
 * InfoTooltip
 * 
 * Bilgilendirme tooltip componenti
 * Product Page Flow için özel tasarım
 */

'use client';

import { useState } from 'react';

interface InfoTooltipProps {
  content: string | React.ReactNode;
  link?: {
    text: string;
    href: string;
  };
  className?: string;
}

const InfoTooltip = ({ content, link, className }: InfoTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div 
      className={`pp-info-tooltip-container ${className || ''}`}
    >
      <button
        type="button"
        className="pp-info-icon"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="Bilgi"
        aria-expanded={isVisible}
      >
        <img src="/images/product-detail/form-info-icon.svg" alt="Info" className="pp-info-icon-img" />
      </button>
      
      {isVisible && (
        <div 
          className={`pp-tooltip-content ${className ? `${className}-content` : ''}`}
          role="tooltip"
        >
          <div className={`pp-tooltip-text ${className ? `${className}-text` : ''}`}>{content}</div>
          {link && (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pp-tooltip-link"
            >
              {link.text}
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;







