"use client";
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { createSessionViaAPI } from '@/services/paratika';
import { customerApi } from '@/services/api';
import SimpleIframe3D from '@/components/PaymentFlow/SimpleIframe3D';
import {
  validateCardNumber,
  validateCardHolder,
  validateExpiryDate,
  validateCvv,
  validateCardHolderIdentityNumber,
} from '@/utils/validators';
import YGInput from '../common/YGInput';
import YGButton from '../common/YGButton';
import YGCheckbox from '../common/YGCheckbox';
import YGLegalTextModal from '../common/YGLegalTextModal';
import LegalTextLinks from '../common/LegalTextLinks';

interface YGPurchaseStepProps {
  onBack: () => void;
  onSuccess: (policyId?: string) => void;
  onError: (errorMessage?: string) => void;
}

interface PremiumData {
  installmentNumber: number;
  netPremium: number;
  grossPremium: number;
  commission: number;
  exchangeRate: number;
  currency: string;
  insuranceCompanyProposalNumber: string;
  formattedNetPremium?: string;
  formattedGrossPremium?: string;
}

interface SelectedQuoteData {
  id: string;
  company?: string;
  coverage?: number;
  features?: string[];
  premiums: PremiumData[];
  selectedInstallmentNumber: number;
  insuranceCompanyId?: number;
  productId: string;
  proposalProductId: string;
  proposalId: string;
}

export default function YGPurchaseStep({ onBack, onSuccess, onError }: YGPurchaseStepProps) {
  const { accessToken } = useAuthStore();
  
  // Quote data
  const [selectedQuoteData, setSelectedQuoteData] = useState<SelectedQuoteData | null>(null);
  const [currentPremium, setCurrentPremium] = useState<PremiumData | null>(null);
  
  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isCardHolderSameAsInsured, setIsCardHolderSameAsInsured] = useState(true);
  const [cardHolderTckn, setCardHolderTckn] = useState('');
  
  // Validation states
  const [formErrors, setFormErrors] = useState({
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
    cardHolderTckn: '',
  });
  
  // Checkbox states
  const [offerDetailsAccepted, setOfferDetailsAccepted] = useState(false);
  const [preInfoFormAccepted, setPreInfoFormAccepted] = useState(false);
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSendingPreInfoForm, setIsSendingPreInfoForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  
  // 3D Payment states
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasHtmlContent, setCanvasHtmlContent] = useState<string>('');

  // Load selected quote
  useEffect(() => {
    const storedQuote = localStorage.getItem('selectedQuoteForPurchase');
    if (storedQuote) {
      try {
        const parsedQuote = JSON.parse(storedQuote) as SelectedQuoteData;
        setSelectedQuoteData(parsedQuote);
      } catch (error) {
        setErrorMessage('Seçili teklif bilgisi alınamadı. Lütfen tekrar deneyin.');
      }
    } else {
      setErrorMessage('Seçili teklif bulunamadı. Lütfen önceki sayfaya dönüp tekrar deneyin.');
    }
  }, []);

  // Set current premium
  useEffect(() => {
    if (selectedQuoteData) {
      const premium = selectedQuoteData.premiums.find(
        (p) => p.installmentNumber === selectedQuoteData.selectedInstallmentNumber
      );
      setCurrentPremium(premium || null);
    }
  }, [selectedQuoteData]);

  // Form validation
  useEffect(() => {
    const isCardNumberValid = validateCardNumber(cardNumber.replace(/\s/g, '')).isValid;
    const isCardHolderValid = validateCardHolder(cardHolder).isValid;
    const isExpiryDateValid = validateExpiryDate(expiryDate).isValid;
    const isCvvValid = validateCvv(cvv).isValid;
    const isTcknValid = isCardHolderSameAsInsured || validateCardHolderIdentityNumber(cardHolderTckn).isValid;
    const allCheckboxesAccepted = offerDetailsAccepted && preInfoFormAccepted;

    setIsFormValid(
      isCardNumberValid && 
      isCardHolderValid && 
      isExpiryDateValid && 
      isCvvValid && 
      isTcknValid && 
      allCheckboxesAccepted
    );
  }, [cardNumber, cardHolder, expiryDate, cvv, cardHolderTckn, isCardHolderSameAsInsured, offerDetailsAccepted, preInfoFormAccepted]);

  // Check 3D result
  useEffect(() => {
    const check3DResult = () => {
      const result1 = localStorage.getItem('paratika3dResult');
      const result2 = localStorage.getItem('paratika_3d_result');
      const status = localStorage.getItem('paratika_3d_status');
      const error = localStorage.getItem('paratika_3d_error');
      
      let parsedResult = null;
      
      if (result1) {
        try {
          parsedResult = JSON.parse(result1);
          localStorage.removeItem('paratika3dResult');
        } catch (e) {}
      }
      
      if (result2 || status === 'error' || error) {
        if (status === 'error' || error) {
          cleanupLocalStorage();
          setErrorMessage('Kart doğrulaması başarısız oldu. Lütfen kart bilgilerinizi kontrol edip işlemi tekrar deneyin.');
          setShowCanvas(false);
          return;
        }
        
        if (result2) {
          try {
            const parsed = JSON.parse(result2);
            if (parsed.success) {
              localStorage.removeItem('paratika_3d_result');
              // 3D başarılı - satın alma devam edecek
              return;
            }
          } catch (e) {}
        }
      }

      if (parsedResult) {
        if (parsedResult.success) {
          // 3D başarılı - satın alma devam edecek
        } else {
          cleanupLocalStorage();
          setErrorMessage(parsedResult.message || '3D doğrulama başarısız');
          setShowCanvas(false);
        }
      }
    };

    window.addEventListener('focus', check3DResult);
    return () => {
      window.removeEventListener('focus', check3DResult);
    };
  }, []);

  const cleanupLocalStorage = () => {
    localStorage.removeItem('paratika_3d_result');
    localStorage.removeItem('paratika_3d_status');
    localStorage.removeItem('paratika_3d_error');
    localStorage.removeItem('paratika3dHtmlContent');
    localStorage.removeItem('paratika_merchantPaymentId');
    localStorage.removeItem('paratikaSessionToken');
    localStorage.removeItem('paratika_3d_url');
    localStorage.removeItem('paratika_3d_params');
    localStorage.removeItem('pendingPaymentData');
    localStorage.removeItem('purchaseReturnUrl');
    localStorage.removeItem('paratika_purchase_status');
    localStorage.removeItem('paratika_purchase_result');
    localStorage.removeItem('paratika_purchase_error');
    localStorage.removeItem('current_order_data');
    localStorage.removeItem('yuvamGuvendeProposalId');
    localStorage.removeItem('selectedQuoteForPurchase');
    localStorage.removeItem('selectedInstallmentForPurchase');
  };

  const handleValidation = (validator: (value: string) => { isValid: boolean; message?: string }, field: keyof typeof formErrors, value: string) => {
    const validationResult = validator(value);
    setFormErrors(prev => ({ ...prev, [field]: validationResult.isValid ? '' : (validationResult.message || 'Geçersiz değer') }));
  };

  const handleViewPreInfoForm = async () => {
    if (!selectedQuoteData) {
      setErrorMessage('Teklif bilgisi bulunamadı.');
      return;
    }
    
    const proposalId = localStorage.getItem('yuvamGuvendeProposalId') || selectedQuoteData.proposalId;
    const proposalProductId = selectedQuoteData.id;

    if (!proposalId || !proposalProductId) {
      setErrorMessage('Ön bilgilendirme formu için gerekli ID bilgileri eksik.');
      return;
    }

    setIsSendingPreInfoForm(true);
    setErrorMessage(null);

    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.PROPOSAL_PREINFO_FORM(proposalId, proposalProductId),
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Ön bilgilendirme formu görüntülenemedi');
      }
      
      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error("Döküman URL'si bulunamadı");
      }
      } catch (error) {
      setErrorMessage('Ön bilgilendirme formu görüntülenirken bir hata oluştu.');
      } finally {
      setIsSendingPreInfoForm(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedQuoteData || !currentPremium) {
      setErrorMessage('Ödeme için gerekli teklif veya prim bilgileri eksik.');
      return;
    }
    
    if (!offerDetailsAccepted || !preInfoFormAccepted) {
      setErrorMessage('Lütfen bilgilendirme formlarını onaylayın.');
      return;
    }
    
    if (!accessToken) {
      setErrorMessage('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }

    localStorage.setItem('purchaseReturnUrl', window.location.href);

    setIsProcessing(true);
    setErrorMessage(null);

    const proposalIdFromStorage = localStorage.getItem('yuvamGuvendeProposalId') || selectedQuoteData.proposalId;

    if (!proposalIdFromStorage) {
      setErrorMessage("Ana Teklif ID (proposalId) bulunamadı.");
      setIsProcessing(false);
      return;
    }

    const proposalProductApiId = selectedQuoteData.id;
    if (!proposalProductApiId) {
      setErrorMessage("Ürün ID bulunamadı.");
      setIsProcessing(false);
      return;
    }

    try {
      const customerProfile = await customerApi.getProfile();
      const clientIP = '127.0.0.1';
      const userAgent = navigator.userAgent;
      const merchantPaymentId = `Konut-${proposalIdFromStorage}-${Date.now()}`;

      const sessionData = {
        amount: currentPremium.grossPremium,
        orderId: merchantPaymentId,
        customerInfo: {
          id: customerProfile.id,
          name: customerProfile.fullName,
          email: customerProfile.primaryEmail,
          phone: customerProfile.primaryPhoneNumber.number,
          ip: clientIP,
          userAgent: userAgent,
        },
        billingAddress: {
          addressLine: customerProfile.city?.text || 'İstanbul',
          city: customerProfile.city?.text || 'İstanbul',
          postalCode: '34000',
        },
        shippingAddress: {
          addressLine: customerProfile.city?.text || 'İstanbul',
          city: customerProfile.city?.text || 'İstanbul',
          postalCode: '34000',
        },
        orderItems: [
          {
            productCode: proposalProductApiId,
            name: 'Konut Sigortası',
            description: `${proposalIdFromStorage} numaralı Konut sigorta teklifi`,
            quantity: 1,
            amount: currentPremium.grossPremium,
          },
        ],
      };

      const sessionResponse = await createSessionViaAPI(sessionData);

      if (sessionResponse.responseCode !== '00') {
        const errorMsg = (sessionResponse as any).errorMsg || sessionResponse.responseMsg || 'Ödeme işlemi başlatılamadı. Lütfen daha sonra tekrar deneyin.';
        throw new Error(errorMsg);
      }

      localStorage.setItem('pendingPaymentData', JSON.stringify({
        type: 'Konut',
        proposalId: proposalIdFromStorage,
        proposalProductId: proposalProductApiId,
        installmentNumber: currentPremium.installmentNumber,
        merchantPaymentId: merchantPaymentId,
        sessionToken: sessionResponse.sessionToken,
        timestamp: Date.now()
      }));

      const expiryParts = expiryDate.split('/');
      const cardData = {
        sessionToken: sessionResponse.sessionToken,
        cardInfo: {
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardHolder: cardHolder,
          expiryMonth: expiryParts[0].padStart(2, '0'),
          expiryYear: parseInt(expiryParts[1], 10),
          cvv: cvv,
        }
      };

      const threeDResponse = await fetch('/api/paratika/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData)
      });

      if (!threeDResponse.ok) {
        const errorData = await threeDResponse.json();
        const errorMsg = errorData.errorMsg || errorData.error || 'Kart doğrulama işlemi başlatılamadı. Lütfen kart bilgilerinizi kontrol edin.';
        throw new Error(errorMsg);
      }

      const threeDResult = await threeDResponse.json();

      if (!threeDResult.success || !threeDResult.html) {
        const errorMsg = threeDResult.errorMsg || threeDResult.responseMsg || 'Kart doğrulama sayfası alınamadı. Lütfen tekrar deneyin.';
        throw new Error(errorMsg);
      }

      if (!threeDResult.html || threeDResult.html.trim() === '') {
        throw new Error('Banka doğrulama sayfası oluşturulamadı. Lütfen daha sonra tekrar deneyin.');
      }

      setCanvasHtmlContent(threeDResult.html);
      setShowCanvas(true);

    } catch (error: any) {
      // Hata mesajını kullanıcı dostu hale getir
      let userFriendlyError = error.message || 'Ödeme işlemi başlatılamadı';
      
      // Teknik hataları kullanıcı dostu mesajlara çevir
      if (userFriendlyError.includes('Geçersiz kullanıcı bilgileri') || 
          userFriendlyError.includes('MERCHANTUSER') ||
          userFriendlyError.includes('Declined')) {
        userFriendlyError = 'Kart bilgileri geçersiz. Lütfen doğru kart bilgileri ile tekrar deneyin.';
      }
      
      setErrorMessage(userFriendlyError);
      setIsProcessing(false);
    }
  };

  const proceedWithPurchase = async (threeDResult: any) => {
    try {
      setShowCanvas(false);
      setCanvasHtmlContent('');
      setErrorMessage('Satın alma işleminiz devam ediyor...');

      if (!selectedQuoteData || !currentPremium) {
        throw new Error('Seçili teklif veya prim bilgisi bulunamadı');
      }

      const expiryParts = expiryDate.split('/');
      const proposalId = localStorage.getItem('yuvamGuvendeProposalId');
      
      const customerProfile = await customerApi.getProfile();
      const identityNumber = isCardHolderSameAsInsured 
        ? customerProfile.identityNumber.toString()
        : cardHolderTckn;
      
      const purchaseData = {
        proposalId: proposalId,
        proposalProductId: selectedQuoteData.id,
        installmentNumber: currentPremium.installmentNumber,
        card: {
          identityNumber: identityNumber,
          number: cardNumber.replace(/\s/g, ''),
          cvc: cvv,
          expiryMonth: expiryParts[0].padStart(2, '0'),
          expiryYear: expiryParts[1].padStart(2, '0'),
          holderName: cardHolder
        }
      };

      const response = await fetchWithAuth(
        API_ENDPOINTS.PROPOSAL_PRODUCT_PURCHASE_SYNC(purchaseData.proposalId!, purchaseData.proposalProductId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            $type: 'credit-card',
            ...purchaseData
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.errorMsg || errorData.message || errorData.responseMsg || 'Satın alma işlemi başarısız oldu. Lütfen tekrar deneyin.';
        throw new Error(errorMsg);
      }

      const result = await response.json();
      cleanupLocalStorage();
      
      // Callback ile result göster - URL değişmeden
      if (onSuccess) {
        onSuccess(result.policyId);
      }

    } catch (error: any) {
      const errorMsg = error.message || 'Satın alma işlemi başarısız oldu';
      setErrorMessage(`Satın alma başarısız: ${errorMsg}`);
      setIsProcessing(false);
      cleanupLocalStorage();
      
      // Callback ile result göster - URL değişmeden
      if (onError) {
        onError(errorMsg);
      }
    }
  };

  return (
    <div className="yg-form-content">
      <span className="yg-form-title">Güvenli Ödeme Adımı</span>
      <p className="yg-form-subtitle">
      Kart bilgilerinizi güvenli bir şekilde girerek poliçenizi hemen başlatabilirsiniz.
      </p>

      {errorMessage && (
        <div className="yg-error-alert">{errorMessage}</div>
      )}

      {/* Sipariş Özeti */}
      {selectedQuoteData && currentPremium && (
        <div className="yg-order-summary">
          <div className="yg-order-summary-left">
            <div className="yg-order-summary-company">{selectedQuoteData.company || 'Sigorta Şirketi'}</div>
            {(selectedQuoteData as any).coverageGroupName && (
              <div className="yg-order-summary-badge">
                {(selectedQuoteData as any).coverageGroupName}
              </div>
            )}
          </div>
          <div className="yg-order-summary-right">
            <div className="yg-order-summary-total-price">
              {currentPremium.formattedGrossPremium || currentPremium.grossPremium.toLocaleString('tr-TR')} ₺
            </div>
            <div className="yg-order-summary-installment">
              {currentPremium.installmentNumber === 1
                ? 'Peşin Ödeme'
                : `${currentPremium.installmentNumber} Taksit`}
            </div>
          </div>
        </div>
      )}

      {/* Kart Sahibi Toggle */}
      <div className="yg-card-holder-toggle">
        <div className="yg-card-holder-toggle-label">
          Kart sahibi sigortalı ile aynı
        </div>
        <div 
          className={`yg-toggle ${isCardHolderSameAsInsured ? 'yg-toggle-active' : ''}`}
          onClick={() => {
            setIsCardHolderSameAsInsured(!isCardHolderSameAsInsured);
            if (!isCardHolderSameAsInsured) {
              setCardHolderTckn('');
              setFormErrors(prev => ({ ...prev, cardHolderTckn: '' }));
            }
          }}
        >
          <div className="yg-toggle-slider"></div>
        </div>
        <div className="yg-card-holder-toggle-status">
          {isCardHolderSameAsInsured ? 'Evet' : 'Hayır'}
        </div>
      </div>

      {/* TCKN Input */}
      {!isCardHolderSameAsInsured && (
        <div className="yg-form-grid" style={{ gridTemplateColumns: '1fr', marginTop: '20px' }}>
          <YGInput
            name="cardHolderTckn"
            value={cardHolderTckn}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 11) {
                setCardHolderTckn(value);
                handleValidation(validateCardHolderIdentityNumber, 'cardHolderTckn', value);
              }
            }}
            placeholder="Kart Sahibi Kimlik No (TCKN)*"
            error={formErrors.cardHolderTckn}
            maxLength={11}
          />
        </div>
      )}

      {/* Kart Bilgileri */}
        <div className="yg-form-grid">
          <YGInput
            name="cardNumber"
          value={cardNumber}
            onChange={(e) => {
            const digitsOnly = e.target.value.replace(/\D/g, '');
            const truncatedDigits = digitsOnly.slice(0, 16);
            const formattedValue = truncatedDigits.replace(/(.{4})/g, '$1 ').trim();
            setCardNumber(formattedValue);
            handleValidation(validateCardNumber, 'cardNumber', truncatedDigits);
          }}
            placeholder="Kart Numarası*"
          error={formErrors.cardNumber}
          maxLength={19}
          />

          <YGInput
            name="cardHolder"
          value={cardHolder}
            onChange={(e) => {
            const filteredValue = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '');
            const upperValue = filteredValue.toLocaleUpperCase('tr-TR');
            setCardHolder(upperValue);
            handleValidation(validateCardHolder, 'cardHolder', upperValue);
          }}
            placeholder="Kart Üzerindeki İsim*"
          error={formErrors.cardHolder}
          />

          <YGInput
            name="expiryDate"
          value={expiryDate}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
              if (!['0', '1'].includes(value[0])) {
                value = '';
              }
            }
            
            if (value.length > 1) {
              const month = parseInt(value.substring(0, 2), 10);
              if (month > 12) {
                value = value[0];
              }
            }

            if (value.length > 2) {
              value = value.slice(0, 2) + '/' + value.slice(2);
            }
            
            const finalValue = value.slice(0, 5);
            setExpiryDate(finalValue);
            handleValidation(validateExpiryDate, 'expiryDate', finalValue);
          }}
            placeholder="AA/YY*"
          error={formErrors.expiryDate}
            maxLength={5}
          />

          <YGInput
            name="cvv"
          value={cvv}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
            if (value.length <= 3) {
              setCvv(value);
              handleValidation(validateCvv, 'cvv', value);
            }
            }}
            placeholder="CVV*"
            type="password"
          error={formErrors.cvv}
            maxLength={3}
          />
        </div>

  

      {/* Checkboxes */}
      <div className="yg-checkbox-group">
        <YGCheckbox
          name="offerDetailsAccepted"
          checked={offerDetailsAccepted}
          onChange={(e) => setOfferDetailsAccepted(e.target.checked)}
          label="Teklif detaylarını okudum, kabul ediyorum."
        />

        <YGCheckbox
          name="preInfoFormAccepted"
          checked={preInfoFormAccepted}
          onChange={(e) => setPreInfoFormAccepted(e.target.checked)}
          label={
            <>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handleViewPreInfoForm();
                }}
                style={{ color: '#D9AE5F', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Ön Bilgilendirme Formu
              </a>
              'nu okudum, kabul ediyorum.
              {isSendingPreInfoForm && (
                <span className="yg-inline-spinner" style={{ marginLeft: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="7" cy="7" r="5" stroke="#D9AE5F" strokeWidth="2" fill="none" strokeDasharray="20 10" />
                  </svg>
                </span>
              )}
            </>
          }
        />
      </div>
    {/* Security Disclaimer */}
    <div className="yg-payment-security-disclaimer">
      <span>
        *Ödeme işlemleri 256-bit SSL sertifikasıyla korunmaktadır. Kart bilgileriniz güvenli ödeme sistemleri aracılığıyla işlenir.
        </span></div>
      {/* Buttons */}
      <div className="yg-button-container" style={{ justifyContent: 'space-between', gap: '10px' }}>
        <YGButton 
          type="button" 
          onClick={onBack}
          disabled={isProcessing}
        >
          Geri Dön
        </YGButton>
        
        <YGButton 
          type="button" 
          onClick={handlePayment}
          disabled={isProcessing || !isFormValid}
        >
          {isProcessing ? 'İşleniyor...' : 'Güvenli Ödemeye Git'}
        </YGButton>
      </div>

      {/* 3D Payment Modal */}
      {showCanvas && canvasHtmlContent && (
        <SimpleIframe3D
          htmlContent={canvasHtmlContent}
          orderId=""
          onSuccess={(result: any) => {
            setShowCanvas(false);
            setCanvasHtmlContent('');
            proceedWithPurchase(result);
          }}
          onError={(error: string) => {
            cleanupLocalStorage();
            setShowCanvas(false);
            setCanvasHtmlContent('');
            setErrorMessage(`3D doğrulama başarısız: ${error}`);
            setIsProcessing(false);
          }}
          onClose={() => {
            cleanupLocalStorage();
            setShowCanvas(false);
            setCanvasHtmlContent('');
            setErrorMessage('3D doğrulama iptal edildi.');
            setIsProcessing(false);
          }}
        />
      )}
    </div>
  );
}
