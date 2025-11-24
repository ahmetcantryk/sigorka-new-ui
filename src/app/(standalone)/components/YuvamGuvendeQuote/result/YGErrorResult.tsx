"use client";
import React from 'react';
import YGButton from '../common/YGButton';
import { useRouter } from 'next/navigation';

interface YGErrorResultProps {
  errorMessage?: string;
  onRetry?: () => void;
}

export default function YGErrorResult({ errorMessage, onRetry }: YGErrorResultProps) {
  const router = useRouter();

  const handleHomepage = () => {
    window.location.href = '/yuvamguvende';
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.back();
    }
  };

  return (
    <div className="yg-form-content">
      <div className="yg-result-container">
        <div className="yg-error-icon-wrapper">
          <img 
            src="/images/landing/error-state.svg" 
            alt="Başarısız" 
            style={{ width: '100px', height: '100px' }}
          />
        </div>
        
        <h1 className="yg-error-title">
          Satın Alma Başarısız
        </h1>
        
        <p className="yg-error-description">
          Lütfen bilgilerinizi kontrol ederek tekrar deneyiniz. Sorun devam ederse müşteri hizmetlerimizle iletişime geçebilirsiniz.
        </p>

        <div className="yg-success-buttons">
          <YGButton onClick={handleRetry}>
            Tekrar Dene
          </YGButton>
          <YGButton onClick={handleHomepage}>
            Anasayfaya Dön
          </YGButton>
        </div>

        <div className="yg-result-contact">
          <p>Yardıma mı ihtiyacınız var?</p>
          <a href="tel:08504040404" className="yg-result-phone">
            📞 0 850 404 04 04
          </a>
        </div>
      </div>
    </div>
  );
}

