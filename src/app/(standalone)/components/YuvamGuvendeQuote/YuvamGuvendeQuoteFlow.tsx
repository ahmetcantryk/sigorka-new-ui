"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import YGStepIndicator from './common/YGStepIndicator';
import YGPersonalInfoStep from './steps/YGPersonalInfoStep';
import YGPropertyInfoStep from './steps/YGPropertyInfoStep';
import YGQuoteComparisonStep from './steps/YGQuoteComparisonStep';
import YGPurchaseStep from './steps/YGPurchaseStep';
import YGSuccessResult from './result/YGSuccessResult';
import YGErrorResult from './result/YGErrorResult';

const steps = [
  { id: 1, name: 'Kişisel Bilgiler' },
  { id: 2, name: 'Konut Bilgileri' },
  { id: 3, name: 'Teklifleri Karşılaştır' },
  { id: 4, name: 'Ödeme Bilgileri' },
];

// Helper function to get accessToken from localStorage synchronously
const getAccessTokenFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const authStorageItem = localStorage.getItem('auth-storage');
    if (authStorageItem) {
      const authState = JSON.parse(authStorageItem).state;
      return authState?.accessToken || null;
    }
  } catch (e) {
    // Ignore
  }
  return null;
};

export default function YuvamGuvendeQuoteFlow() {
  const { accessToken } = useAuthStore();
  const [activeStep, setActiveStep] = useState(() => {
    // Always start at step 0 (PersonalInfoStep) when mounted
    // YGPersonalInfoStep will handle checking for missing info and showing appropriate form
    return 0;
  });
  const hasInitialized = useRef(false);
  
  // Result states - URL değiştirmeden ekranda göster
  const [purchaseResult, setPurchaseResult] = useState<{
    status: 'success' | 'error' | null;
    policyId?: string;
    errorMessage?: string;
  }>({ status: null });

  // useEffect ile tekrar kontrol et (useAuthStore güncellenmiş olabilir)
  useEffect(() => {
    if (hasInitialized.current) return;
    
    // LocalStorage'dan kontrol et (senkron)
    const storedAccessToken = getAccessTokenFromStorage();
    const konutPersonalInfoCompleted = localStorage.getItem('konutPersonalInfoCompleted');
    const proposalIdForKonut = localStorage.getItem('proposalIdForKonut');
    
    // Eğer accessToken varsa (store'dan veya localStorage'dan) ve kişisel bilgiler tamamlanmışsa
    const hasAccessToken = accessToken || storedAccessToken;
    if (hasAccessToken && (konutPersonalInfoCompleted === 'true' || proposalIdForKonut)) {
      setActiveStep(1); // Konut Bilgileri step'inden başlat (step index 1 = PropertyInfoStep)
    }
    
    hasInitialized.current = true;
  }, [accessToken]);

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    // Scroll to top of quote section after step change
    setTimeout(() => {
      document.querySelector('.yg-quote-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    // Scroll to top of quote section after step change
    setTimeout(() => {
      document.querySelector('.yg-quote-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handlePurchaseSuccess = (policyId?: string) => {
    setPurchaseResult({ status: 'success', policyId });
  };

  const handlePurchaseError = (errorMessage?: string) => {
    setPurchaseResult({ status: 'error', errorMessage });
  };

  const handleRetry = () => {
    setPurchaseResult({ status: null });
    // Form'a geri dön ama state'leri koru
  };

  // Result ekranı gösteriyorsak
  if (purchaseResult.status === 'success') {
    return (
      <div className="yg-form-container">
        <YGSuccessResult policyId={purchaseResult.policyId} />
      </div>
    );
  }

  if (purchaseResult.status === 'error') {
    return (
      <div className="yg-form-container">
        <YGErrorResult 
          errorMessage={purchaseResult.errorMessage}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <YGPersonalInfoStep onNext={handleNext} />;
      case 1:
        return <YGPropertyInfoStep onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <YGQuoteComparisonStep onNext={handleNext} onBack={handleBack} />;
      case 3:
        return (
          <YGPurchaseStep 
            onBack={handleBack}
            onSuccess={handlePurchaseSuccess}
            onError={handlePurchaseError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="yg-form-container">
      <YGStepIndicator steps={steps} activeStep={activeStep} />
      {renderStep()}
    </div>
  );
}

