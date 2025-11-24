"use client";
import React from 'react';
import YGButton from '../common/YGButton';
import { useRouter } from 'next/navigation';

interface YGSuccessResultProps {
  policyId?: string;
}

export default function YGSuccessResult({ policyId }: YGSuccessResultProps) {
  const router = useRouter();

  const handleDashboard = () => {
    router.push('/dashboard/policies');
  };

  const handleHomepage = () => {
    window.location.href = '/yuvamguvende';
  };

  return (
    <div className="yg-form-content">
      <div className="yg-result-container">
        <div className="yg-success-icon-wrapper">
          <img 
            src="/images/landing/success-state.svg" 
            alt="Başarılı" 
            style={{ width: '100px', height: '100px' }}
          />
        </div>
        
        <h1 className="yg-success-title">
          Tebrikler, Yuvanız Artık Güvende!
        </h1>
        
        <p className="yg-success-description">
          Ödemeniz başarıyla tamamlandı. Artık eşyalarınız Yuvam Güvende güvencesiyle koruma altında.
        </p>

        <div className="yg-success-buttons">
          <YGButton onClick={handleDashboard}>
            Poliçe Detaylarını Gör
          </YGButton>
          <YGButton onClick={handleHomepage}>
            Anasayfaya Dön
          </YGButton>
        </div>
      </div>
    </div>
  );
}

