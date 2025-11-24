"use client";
import React from 'react';
import YGButton from './YGButton';

interface YGErrorStateProps {
  title?: string;
  subtitle?: string;
  onAction?: () => void;
  actionText?: string;
  onSecondaryAction?: () => void;
  secondaryActionText?: string;
}

export default function YGErrorState({ 
  title = 'Uygun Teklif Bulunamadı',
  subtitle = 'Konut bilgilerinize göre uygun teklif bulunamadı. Bilgilerinizi kontrol edip tekrar deneyebilirsiniz veya müşteri iletişim merkezi numaramızdan bize ulaşabilirsiniz.',
  onAction,
  actionText = 'Poliçe Detaylarını Gör',
  onSecondaryAction,
  secondaryActionText = 'Anasayfaya Dön'
}: YGErrorStateProps) {
  return (
    <div className="yg-error-state-container">
      <div className="yg-error-state-icon">
        <img 
          src="/images/landing/error-state.svg" 
          alt="Error" 
          width={100} 
          height={100}
          style={{ display: 'block' }}
        />
      </div>
      <span className="yg-error-state-title">{title}</span>
      {subtitle && <p className="yg-error-state-subtitle">{subtitle}</p>}
      <div className="yg-error-state-actions">
        {onAction && (
          <YGButton onClick={onAction}>{actionText}</YGButton>
        )}
        {onSecondaryAction && (
          <YGButton variant="primary" onClick={onSecondaryAction}>{secondaryActionText}</YGButton>
        )}
      </div>
    </div>
  );
}

