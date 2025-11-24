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
}

const InfoTooltip = ({ content, link }: InfoTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="pp-info-tooltip-container">
      <button
        type="button"
        className="pp-info-icon"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 11V7.5M8 5.5V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      
      {isVisible && (
        <div className="pp-tooltip-content">
          <div className="pp-tooltip-text">{content}</div>
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







