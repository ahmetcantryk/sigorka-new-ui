/**
 * QuoteLoadingScreen - Global Loading Component
 * 
 * Teklif hazırlanırken gösterilen animasyonlu loading ekranı
 * Tüm branşlarda kullanılabilir
 */

'use client';

import { useEffect, useState } from 'react';
import './QuoteLoadingScreen.css';

interface QuoteLoadingScreenProps {
  title?: string;
  subtitle?: string;
  description?: string;
  progress: number; // 0-100 arası
}

function QuoteLoadingScreen({
  title = 'Kasko Sigortası Teklifleri',
  subtitle = 'Size en uygun Kasko Sigortası teklifini seçip hemen satın alabilirsiniz.',
  description = 'Anlaşmalı şirketlerimizden size özel teklifler alınıyor...',
  progress = 0
}: QuoteLoadingScreenProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smooth progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="pp-card">
      <div className="quote-loading-screen">
        {/* Title Section */}
        <h1 className="quote-loading-title">{title}</h1>
        <p className="quote-loading-subtitle">{subtitle}</p>

        {/* Animated Leaf Logo with Fill */}
        <div className="quote-loading-logo-container">
          <svg 
            width="103" 
            height="96" 
            viewBox="0 0 103 96" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="quote-loading-leaf"
          >
            {/* Background Leaf (Navy) */}
            <path 
              d="M0.163817 95.2246C0.163817 95.2246 31.4672 85.3276 58.2609 74.4618C95.7379 59.2853 95.9089 33.13 103 0C63.5481 18.5509 49.1327 23.1038 39.0403 26.6881C-4.73462 42.3005 0.163817 95.2246 0.163817 95.2246Z" 
              fill="#130856"
            />
            
            {/* Animated Fill (Turquoise) */}
            <defs>
              <clipPath id="leafClip">
                <path d="M0.163817 95.2246C0.163817 95.2246 31.4672 85.3276 58.2609 74.4618C95.7379 59.2853 95.9089 33.13 103 0C63.5481 18.5509 49.1327 23.1038 39.0403 26.6881C-4.73462 42.3005 0.163817 95.2246 0.163817 95.2246Z" />
              </clipPath>
            </defs>
            
            <g clipPath="url(#leafClip)">
              <rect
                x="0"
                y="0"
                width="103"
                height="96"
                fill="#00D4A6"
                className="quote-loading-fill"
                style={{
                  transform: `translateY(${100 - displayProgress}%)`,
                  transition: 'transform 0.3s ease-out'
                }}
              />
            </g>
          </svg>

          {/* Percentage Text */}
          <div className="quote-loading-percentage">
            %{Math.round(displayProgress)}
          </div>
        </div>

        {/* Status Text */}
        <h2 className="quote-loading-status">Teklifler Hazırlanıyor</h2>
        <p className="quote-loading-description">{description}</p>
      </div>
    </div>
  );
}

export default QuoteLoadingScreen;

