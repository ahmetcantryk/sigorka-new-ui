"use client";
import React from 'react';

interface YGLoadingProgressProps {
  percentage: number;
  message?: string;
}

export default function YGLoadingProgress({ percentage, message = 'Teklifler yükleniyor' }: YGLoadingProgressProps) {
  // Ondalık değeri tam sayıya çevir
  const wholePercentage = Math.floor(percentage);
  
  // Conic gradient için açı hesapla (yüzde * 360 / 100)
  const angle = (wholePercentage * 360) / 100;
  
  return (
    <div className="yg-loading-progress-container">
      <div className="yg-spinner-wrapper">
        <div 
          className="yg-spinner-circle"
          style={{ 
            background: `conic-gradient(from 0deg, #D9AE5F 0%, #D9AE5F ${angle}deg, #e0e0e0 ${angle}deg, #e0e0e0 100%)` 
          }}
        >
          <div className="yg-spinner-progress">
            <span className="yg-spinner-percentage">{wholePercentage}%</span>
          </div>
        </div>
      </div>
      <div className="yg-loading-progress-text">
        {message}
      </div>
      <div className="yg-loading-progress-subtext">
        Sigorta şirketlerinden gelen fırsatları senin için özenle bir araya getiriyoruz.
      </div>
    </div>
  );
}

