"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../../store/useAuthStore';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { API_BASE_URL } from '@/config/api';
import { useRouter } from 'next/navigation';
import { createSessionViaAPI, validate3DCard } from '../../../../services/paratika';
import { customerApi } from '@/services/api';
import SimpleIframe3D from '../../../PaymentFlow/SimpleIframe3D';
import {
  validateCardNumber,
  validateCardHolder,
  validateExpiryDate,
  validateCvv,
  validateCardHolderIdentityNumber,
} from '../../../../utils/validators';
import { ValidationResult } from '@/components/common/Input/types';

// DataLayer helper functions



// import Paratika3DIframeModal from '../../../PaymentModals/Paratika3DIframeModal'; // Artık kullanılmıyor

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

interface InsuranceCompany {
  id: number;
  name: string;
  proposalProductId: string;
}

interface SelectedQuoteData {
  id: string;
  company?: string;
  coverage?: number;
  features?: string[];
  premiums: PremiumData[];
  selectedInstallmentNumber: number;
  insuranceCompanyId?: number;
  insuranceCompany?: InsuranceCompany;
  productId: string;
  proposalProductId: string;
  proposalId: string;
}

interface PurchaseStepProps {
  onNext: () => void;
}

export default function PurchaseStep({ onNext }: PurchaseStepProps) {
  const router = useRouter();
  const token = useAuthStore((state) => state.accessToken);
  const [selectedQuoteData, setSelectedQuoteData] = useState<SelectedQuoteData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSendingPreInfoForm, setIsSendingPreInfoForm] = useState(false);
  const [offerDetailsAccepted, setOfferDetailsAccepted] = useState(false);
  const [preInfoFormAccepted, setPreInfoFormAccepted] = useState(false);
  const [currentPremium, setCurrentPremium] = useState<PremiumData | null | undefined>(null);


  
  // Kredi kartı bilgileri
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Kart sahibi TCKN kontrolü için yeni state'ler
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
  const [isFormValid, setIsFormValid] = useState(false);

  // Canvas 3D Payment state'leri
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasHtmlContent, setCanvasHtmlContent] = useState<string>('');

  useEffect(() => {
    const storedQuote = localStorage.getItem('selectedQuoteForPurchase');
    if (storedQuote) {
      try {
        const parsedQuote = JSON.parse(storedQuote) as SelectedQuoteData;
        if (parsedQuote) {
        }
        setSelectedQuoteData(parsedQuote);
      } catch (error) {
        setErrorMessage('Seçili teklif bilgisi alınamadı. Lütfen tekrar deneyin.');
      }
    } else {
      setErrorMessage('Seçili teklif bulunamadı. Lütfen önceki sayfaya dönüp tekrar deneyin.');
    }
  }, []);

  useEffect(() => {
    if (selectedQuoteData) {
      const premiumDetails = getCurrentPremiumDetails();
      setCurrentPremium(premiumDetails);
    }
  }, [selectedQuoteData]);

  useEffect(() => {
    const validateForm = () => {
      const isCardNumberValid = validateCardNumber(cardNumber.replace(/\s/g, '')).isValid;
      const isCardHolderValid = validateCardHolder(cardHolder).isValid;
      const isExpiryDateValid = validateExpiryDate(expiryDate).isValid;
      const isCvvValid = validateCvv(cvv).isValid;
      const isTcknValid = isCardHolderSameAsInsured || validateCardHolderIdentityNumber(cardHolderTckn).isValid;
      const allCheckboxesAccepted = offerDetailsAccepted && preInfoFormAccepted;

      setIsFormValid(isCardNumberValid && isCardHolderValid && isExpiryDateValid && isCvvValid && isTcknValid && allCheckboxesAccepted);
    };

    validateForm();
  }, [cardNumber, cardHolder, expiryDate, cvv, cardHolderTckn, isCardHolderSameAsInsured, offerDetailsAccepted, preInfoFormAccepted]);

  // 3D doğrulama sonuçlarını kontrol et
  useEffect(() => {
    const check3DResult = () => {
      // Birden fazla localStorage key'ini kontrol et
      const result1 = localStorage.getItem('paratika3dResult');
      const result2 = localStorage.getItem('paratika_3d_result');
      const status = localStorage.getItem('paratika_3d_status');
      const error = localStorage.getItem('paratika_3d_error');
      
      let parsedResult = null;
      
      // Önce paratika3dResult'u kontrol et
      if (result1) {
        try {
          parsedResult = JSON.parse(result1);
          localStorage.removeItem('paratika3dResult');
        } catch (e) {
        }
      }
      
      // paratika_3d_result varsa ve error status varsa
      if (result2 || status === 'error' || error) {
        
        if (status === 'error' || error) {
          // 3D doğrulama başarısız durumu
          localStorage.removeItem('paratika_3d_result');
          localStorage.removeItem('paratika_3d_error');
          localStorage.removeItem('paratika_3d_status');
          localStorage.removeItem('paratika3dHtmlContent');
          localStorage.removeItem('paratika_merchantPaymentId');
          localStorage.removeItem('paratikaSessionToken');
          localStorage.removeItem('paratika_3d_url');
          localStorage.removeItem('paratika_3d_params');
          setErrorMessage('Kart doğrulaması başarısız oldu. Lütfen kart bilgilerinizi kontrol edip işlemi tekrar deneyin.');
          return;
        }
        
        if (result2) {
          try {
            const parsed = JSON.parse(result2);
            if (parsed.success) {
              localStorage.removeItem('paratika_3d_result');
              router.push('/odeme/paratika-callback?type=kasko&action=validate');
              return;
            }
          } catch (e) {
          }
        }
      }

      // Eski format (paratika3dResult) için kontrol
      if (parsedResult) {
        if (parsedResult.success) {
          router.push('/odeme/paratika-callback?type=kasko&action=validate');
        } else {
          // 3D doğrulama başarısız - localStorage temizle
          localStorage.removeItem('paratika_3d_result');
          localStorage.removeItem('paratika_3d_error');
          localStorage.removeItem('paratika_3d_status');
          localStorage.removeItem('paratika3dHtmlContent');
          localStorage.removeItem('paratika_merchantPaymentId');
          localStorage.removeItem('paratikaSessionToken');
          localStorage.removeItem('paratika_3d_url');
          localStorage.removeItem('paratika_3d_params');
          setErrorMessage(parsedResult.message || '3D doğrulama başarısız');
        }
      }
    };

    // Sayfa odaklandığında kontrol et
    window.addEventListener('focus', check3DResult);
    
    return () => {
      window.removeEventListener('focus', check3DResult);
    };
  }, [router]);

  const getCurrentPremiumDetails = (): PremiumData | null | undefined => {
    if (!selectedQuoteData) return null;
    return selectedQuoteData.premiums.find(
      (p) => p.installmentNumber === selectedQuoteData.selectedInstallmentNumber
    );
  };

  // 🧹 Satın alma ve Paratika süreciyle ilgili tüm localStorage verilerini temizle
  const cleanupLocalStorage = () => {
    
    // Paratika ile ilgili veriler
    localStorage.removeItem('paratika_3d_result');
    localStorage.removeItem('paratika_3d_status');
    localStorage.removeItem('paratika_3d_error');
    localStorage.removeItem('paratika3dHtmlContent');
    localStorage.removeItem('paratika_merchantPaymentId');
    localStorage.removeItem('paratikaSessionToken');
    localStorage.removeItem('paratika_3d_url');
    localStorage.removeItem('paratika_3d_params');
    
    // Purchase süreci ile ilgili veriler
    localStorage.removeItem('pendingPaymentData');
    localStorage.removeItem('purchaseReturnUrl');
    localStorage.removeItem('paratika_purchase_status');
    localStorage.removeItem('paratika_purchase_result');
    localStorage.removeItem('paratika_purchase_error');
    localStorage.removeItem('current_order_data');
    
    // Quote ve teklif verileri
    localStorage.removeItem('proposalIdForKasko');
    localStorage.removeItem('currentProposalId');
    localStorage.removeItem('selectedQuoteInfo');
    localStorage.removeItem('kaskoQuoteFlow');
    localStorage.removeItem('selectedProductId');
    localStorage.removeItem('paymentAmount');
    localStorage.removeItem('paymentBranch');
    localStorage.removeItem('selectedInstallmentNumber');
    
  };

  const renderPaymentForm = () => {
    const handleValidation = (validator: (value: string) => ValidationResult, field: keyof typeof formErrors, value: string) => {
      const validationResult = validator(value);
      setFormErrors(prev => ({ ...prev, [field]: validationResult.isValid ? '' : validationResult.message }));
    };

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Kredi Kartı Bilgileri
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Güvenli ödeme için kredi kartı bilgilerinizi girin. Ödeme 3D güvenli altyapı ile gerçekleştirilecektir.
        </Typography>
        
        <Box sx={{ display: 'grid', gap: 3 }}>
                      {/* Kart sahibi kontrolü */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                  Kart sahibi sigortalı ile aynı
                </Typography>
                
                {/* Switch benzeri toggle */}
                <Box
                  onClick={() => {
                    setIsCardHolderSameAsInsured(!isCardHolderSameAsInsured);
                    if (!isCardHolderSameAsInsured) {
                      setCardHolderTckn('');
                      setFormErrors(prev => ({ ...prev, cardHolderTckn: '' }));
                    }
                  }}
                  sx={{
                    position: 'relative',
                    display: 'inline-flex',
                    width: '28px',
                    height: '16px',
                    alignItems: 'center',
                    borderRadius: '8px',
                    backgroundColor: isCardHolderSameAsInsured ? '#ff8c00' : '#d1d5db',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      backgroundColor: isCardHolderSameAsInsured ? '#e67c00' : '#9ca3af',
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      transform: isCardHolderSameAsInsured ? 'translateX(14px)' : 'translateX(2px)',
                      transition: 'transform 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: isCardHolderSameAsInsured ? '#ff8c00' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                >
                  {isCardHolderSameAsInsured ? 'Evet' : 'Hayır'}
                </Typography>
              </Box>
            
            {/* TCKN alanı */}
            {!isCardHolderSameAsInsured && (
              <TextField
                fullWidth
                                  label="Kart Sahibi Kimlik No"
                  placeholder="TCKN (11 hane) veya VKN (10 hane)"
                value={cardHolderTckn}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 11) {
                    setCardHolderTckn(value);
                    handleValidation(validateCardHolderIdentityNumber, 'cardHolderTckn', value);
                  }
                }}
                inputProps={{
                  maxLength: 11,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
                error={!!formErrors.cardHolderTckn}
                helperText={formErrors.cardHolderTckn}
                sx={{ 
                  mt: 2,
                  '& .MuiOutlinedInput-root': { backgroundColor: 'white', borderRadius: '6px' }
                }}
              />
            )}
          </Box>
          
          <TextField
            fullWidth
            label="Kart Numarası"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, '');
              const truncatedDigits = digitsOnly.slice(0, 16);
              const formattedValue = truncatedDigits.replace(/(.{4})/g, '$1 ').trim();

              setCardNumber(formattedValue);
              handleValidation(validateCardNumber, 'cardNumber', truncatedDigits);
            }}
            error={!!formErrors.cardNumber}
            helperText={formErrors.cardNumber}
            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white', borderRadius: '6px' } }}
          />
          
          <TextField
            fullWidth
            label="Ad Soyad"
            placeholder="Kart üzerindeki ad soyad"
            value={cardHolder}
            onChange={(e) => {
              const filteredValue = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '');
              const upperValue = filteredValue.toLocaleUpperCase('tr-TR');
              setCardHolder(upperValue);
              handleValidation(validateCardHolder, 'cardHolder', upperValue);
            }}
            inputProps={{
              style: { textTransform: 'uppercase' }
            }}
            error={!!formErrors.cardHolder}
            helperText={formErrors.cardHolder}
            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white', borderRadius: '6px' } }}
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
                fullWidth
                label="Son Kullanma Tarihi"
                placeholder="AA/YY"
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
                  
                  setExpiryDate(value.slice(0, 5));
                  handleValidation(validateExpiryDate, 'expiryDate', value);
                }}
                error={!!formErrors.expiryDate}
                helperText={formErrors.expiryDate}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white', borderRadius: '6px' } }}
            />
            <TextField
                fullWidth
                label="CVV"
                placeholder="123"
                value={cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 3) {
                    setCvv(value);
                    handleValidation(validateCvv, 'cvv', value);
                  }
                }}
                inputProps={{
                  maxLength: 3,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
                error={!!formErrors.cvv}
                helperText={formErrors.cvv}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white', borderRadius: '6px' } }}
            />
          </Box>
        </Box>
      </Box>
    );
  };

  const renderOrderSummary = () => (
    <Card 
      variant="outlined" 
      sx={{ 
        backgroundColor: '#F4F6FA',
        borderRadius: '6px',
        height: '100%',
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sipariş Özeti
        </Typography>
        {selectedQuoteData && currentPremium ? (
          <>
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle1" color="primary">
                {selectedQuoteData.company || 'Bilinmeyen Şirket'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Kasko Sigortası (
                {currentPremium.installmentNumber === 1
                  ? 'Peşin'
                  : `${currentPremium.installmentNumber} Taksit`}
                )
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" color="primary">
                Toplam:{' '}
                {currentPremium.formattedGrossPremium ??
                  currentPremium.grossPremium.toLocaleString('tr-TR')}{' '}
                ₺
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentPremium.installmentNumber === 1
                  ? 'Yıllık Prim (Peşin)'
                  : `Taksitli Toplam (${currentPremium.installmentNumber} Taksit)`}
              </Typography>
            </Box>
          </>
        ) : (
          <Box sx={{ my: 2, textAlign: 'center' }}>
            {!selectedQuoteData && <CircularProgress size={20} sx={{ mr: 1 }} />}
            <Typography variant="body2" color="text.secondary">
              {selectedQuoteData ? 'Prim bilgisi yükleniyor...' : 'Teklif detayları yükleniyor...'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const handlePayment = async () => {
    if (!selectedQuoteData || !currentPremium) {
      setErrorMessage('Ödeme için gerekli teklif veya prim bilgileri eksik.');
      return;
    }
    if (!offerDetailsAccepted || !preInfoFormAccepted) {
      setErrorMessage('Lütfen bilgilendirme formlarını onaylayın.');
      return;
    }
    if (!token) {
        setErrorMessage('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
        setIsProcessing(false);
        return;
    }

    // 🔗 Purchase sayfası URL'ini localStorage'a kaydet (3D sonrası dönüş için)
    localStorage.setItem('purchaseReturnUrl', window.location.href);

    
    // DataLayer event for purchase button click
   

    setIsProcessing(true);
    setErrorMessage(null);

    // 🔍 DEBUG: Mevcut selectedQuoteData'yı logla

    let proposalIdFromStorage = localStorage.getItem('proposalIdForKasko');
    if (!proposalIdFromStorage) {
        proposalIdFromStorage = selectedQuoteData.proposalId;
    }
    
    // 🔧 Fallback: selectedQuoteForPurchase'den proposalId al
    if (!proposalIdFromStorage) {
      try {
        const selectedQuoteForPurchase = localStorage.getItem('selectedQuoteForPurchase');
        if (selectedQuoteForPurchase) {
          const purchaseData = JSON.parse(selectedQuoteForPurchase);
          if (purchaseData && purchaseData.proposalId) {
            proposalIdFromStorage = purchaseData.proposalId;
          }
        }
      } catch (error) {
      }
    }
    
    // 🔧 Final Fallback: URL'den proposalId al (/purchase/{proposalId} pattern)
    if (!proposalIdFromStorage) {
      const currentUrl = window.location.pathname;
      const purchaseMatch = currentUrl.match(/\/purchase\/([^\/]+)/);
      if (purchaseMatch && purchaseMatch[1]) {
        proposalIdFromStorage = purchaseMatch[1];
      }
    }
    
    if (!proposalIdFromStorage) {
        setErrorMessage("Ana Teklif ID (proposalId) bulunamadı, ödeme yapılamıyor. Console'u kontrol edin.");
        setIsProcessing(false);
        return;
    }

    const proposalProductApiId = selectedQuoteData.id;
    if (!proposalProductApiId) {
        setErrorMessage("Detaylı Ürün ID (selectedQuoteData.id) bulunamadı. Seçili teklif verisi eksik.");
        setIsProcessing(false);
        return;
    }


    try {
      // Müşteri bilgilerini al
      const customerProfile = await customerApi.getProfile();
      
      // IP adresini ayarla
      const clientIP = '127.0.0.1';
      
      // User agent bilgisini al
      const userAgent = navigator.userAgent;

      // Session token oluştur
      const merchantPaymentId = `KASKO-${proposalIdFromStorage}-${Date.now()}`;
      
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
            name: 'Kasko Sigortası',
            description: `${proposalIdFromStorage} numaralı kasko sigorta teklifi`,
            quantity: 1,
            amount: currentPremium.grossPremium,
          },
        ],
      };

      
      const sessionResponse = await createSessionViaAPI(sessionData);
      
      if (sessionResponse.responseCode !== '00') {
        throw new Error(sessionResponse.responseMsg || 'Paratika session oluşturulamadı');
      }


      // 🔐 GÜVENLI POPUP WINDOW YÖNTEMİ - Kart bilgilerini API'ye göndererek 3D açtır
      const expiryParts = expiryDate.split('/');
      
      // Sadış ödeme verilerini localStorage'a kaydet (kart bilgileri değil!)
      localStorage.setItem('pendingPaymentData', JSON.stringify({
        type: 'kasko',
        proposalId: proposalIdFromStorage,
        proposalProductId: proposalProductApiId,
        installmentNumber: currentPremium.installmentNumber,
        merchantPaymentId: merchantPaymentId,
        sessionToken: sessionResponse.sessionToken,
        timestamp: Date.now()
      }));

      // 🎯 YENİ POPUP YÖNTEMİ: Direkt banka sayfası açılacak
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

      
      // API'ye 3D başlatma isteği gönder
      const threeDResponse = await fetch('/api/paratika/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData)
      });

      if (!threeDResponse.ok) {
        const errorData = await threeDResponse.json();
        throw new Error(errorData.error || '3D doğrulama başlatılamadı');
      }

      const threeDResult = await threeDResponse.json();

      if (!threeDResult.success || !threeDResult.html) {
        throw new Error('3D doğrulama sayfası alınamadı');
      }

      
      if (!threeDResult.html || threeDResult.html.trim() === '') {
        throw new Error('3D HTML içeriği boş! Banka sayfası oluşturulamadı.');
      }

             // 🎨 SimpleIframe Modal ile 3D ödeme
       setCanvasHtmlContent(threeDResult.html);
       setShowCanvas(true);
       setErrorMessage('🎨 3D güvenlik doğrulaması açıldı. SMS kodunu girin.');

    } catch (error: any) {
      setErrorMessage(error.message || 'Ödeme işlemi başlatılamadı');
      setIsProcessing(false);
    }
  };

    // 💳 3D doğrulama başarılı olduğunda çağrılır - InsurUp API çağrısı yapar
  const proceedWithPurchase = async (threeDResult: any) => {
    try {
      
      // Modal'ı kapat
      setShowCanvas(false);
      setCanvasHtmlContent('');
      
      // Loading durumuna geç
      setErrorMessage('Satın alma işleminiz devam ediyor...');
      
      if (!selectedQuoteData || !currentPremium) {
        throw new Error('Seçili teklif veya prim bilgisi bulunamadı');
      }

      // Kredi kartı bilgilerini al (localStorage'dan değil, form'dan)
      const expiryParts = expiryDate.split('/');
      
      // localStorage'dan proposalId al
      const proposalId = localStorage.getItem('currentProposalId');
      
      // Sigortalının TCKN'sini al
      const customerProfile = await customerApi.getProfile();
      const identityNumber = isCardHolderSameAsInsured 
        ? customerProfile.identityNumber.toString()
        : cardHolderTckn;
      
      // InsurUp API çağrısı
      const purchaseData = {
        proposalId: proposalId,
        proposalProductId: selectedQuoteData.id,
        installmentNumber: currentPremium.installmentNumber,
        card: {
          identityNumber: identityNumber,
          number: cardNumber.replace(/\s/g, ''),
          cvc: cvv,
          expiryMonth: expiryParts[0].padStart(2, '0'),
          expiryYear: expiryParts[1].padStart(2, '0'), // 2 haneli format (26 için '26')
          holderName: cardHolder
        }
      };


      // proposalId kontrolü
      if (!purchaseData.proposalId || !purchaseData.proposalProductId) {
        throw new Error('Teklif ID bilgileri eksik. Lütfen sayfayı yenileyin.');
      }


      const response = await fetchWithAuth(
        API_ENDPOINTS.PROPOSAL_PRODUCT_PURCHASE_SYNC(purchaseData.proposalId, purchaseData.proposalProductId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            $type: 'credit-card',
            ...purchaseData
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Satın alma işlemi başarısız');
      }

      const result = await response.json();
      
      // 🧹 Tüm localStorage verilerini temizle
      cleanupLocalStorage();
      
      // Başarılı sonuç sayfasına yönlendir
      router.push(`/odeme-sonuc?type=Kasko&success=true&policyId=${result.policyId || ''}`);

    } catch (error: any) {
      setErrorMessage(`Satın alma başarısız: ${error.message}`);
      setIsProcessing(false);
      
      // 🧹 Tüm localStorage verilerini temizle
      cleanupLocalStorage();
      
      // Başarısız sonuç sayfasına yönlendir
      router.push(`/odeme-sonuc?type=Kasko&success=false`);
    }
  };

  const handleViewPreInfoForm = async () => {
    if (!selectedQuoteData) {
        setErrorMessage('Teklif bilgisi bulunamadı.'); 
        return;
    }
    const proposalId = localStorage.getItem('currentProposalId');
    const proposalProductId = selectedQuoteData.id;

    if(!proposalId || !proposalProductId){
        setErrorMessage('Ön bilgilendirme formu için gerekli ID bilgileri (proposalId veya ürün ID) eksik.');
        return;
    }

    setIsSendingPreInfoForm(true);
    setErrorMessage(null);

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.PROPOSAL_PREINFO_FORM(proposalId, proposalProductId), {
        method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
      });
      if (!(response as any).ok) {
        throw new Error('Ön bilgilendirme formu görüntülenemedi');
      }
      // JSON response'u al ve URL'yi çıkar
      const data = await (response as any).json();
      if (data.url) {
        // Direkt URL'yi yeni sekmede aç
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

  const sendPreInfoForm = async () => {
    if (!selectedQuoteData) {
        setErrorMessage('Teklif bilgisi bulunamadı.');
        return;
    }
    const proposalId = localStorage.getItem('currentProposalId');
    const proposalProductId = selectedQuoteData.id;

    if(!proposalId || !proposalProductId){
        setErrorMessage('Ön bilgilendirme formu göndermek için gerekli ID bilgileri (proposalId veya ürün ID) eksik.');
        return;
    }

    setIsSendingPreInfoForm(true);
    setErrorMessage(null);
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.PROPOSAL_SEND_PREINFO_FORM(proposalId, proposalProductId), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
      });
      if (!(response as any).ok) {
        const errorData = await (response as any).json().catch(() => ({message: 'Form gönderilemedi'}));
        throw new Error(errorData.message || 'Ön bilgilendirme formu gönderilemedi');
      }
      alert('Ön bilgilendirme formu e-posta adresinize gönderilmiştir.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Form gönderilirken bir hata oluştu.');
    } finally {
      setIsSendingPreInfoForm(false);
    }
  };

  // Component unmount olduğunda canvas state'lerini temizle
  useEffect(() => {
    return () => {
      if (showCanvas) {
        setShowCanvas(false);
        setCanvasHtmlContent('');
      }
    };
  }, []);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: {xs:0,sm:3} }}>
      <Typography variant="h5" component="h1" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
        Ödeme Bilgileri
        </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
        <Box>
          <Paper 
            elevation={0} 
            variant="outlined" 
            sx={{ 
              p: 4,
              borderRadius: '6px',
              backgroundColor: '#F4F6FA',
            }}
          >
            {renderPaymentForm()}
            
            <Box sx={{ mt: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={offerDetailsAccepted}
                    onChange={(e: any) => setOfferDetailsAccepted(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    Teklif detaylarını okudum, kabul ediyorum.
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={preInfoFormAccepted}
                    onChange={(e: any) => setPreInfoFormAccepted(e.target.checked)}
                    color="primary"
                    disabled={isSendingPreInfoForm}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2">
                      <Link
                        href="#"
                        target="_blank"
                        sx={{ color: '#0057FF' }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleViewPreInfoForm();
                        }}
                      >
                        Ön Bilgilendirme Formu
                      </Link>
                      'nu okudum, kabul ediyorum.
                    </Typography>
                    {isSendingPreInfoForm && (
                      <CircularProgress size={20} sx={{ ml: 1 }} />
                    )}
                  </Box>
                }
              />
            </Box>
          </Paper>
        </Box>

        <Box>
          {renderOrderSummary()}
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handlePayment}
          disabled={isProcessing || !isFormValid}
          sx={{ py: 2, fontSize: { xs: '16px', sm: '1.2rem' } }}
        >
          {isProcessing ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'GÜVENLİ ÖDEMEYE GİT'
          )}
        </Button>
      </Box>

              {/* 🎨 Simple Iframe 3D Payment Modal */}
        {showCanvas && canvasHtmlContent && (
          <SimpleIframe3D
            htmlContent={canvasHtmlContent}
            onSuccess={(result: any) => {
              setShowCanvas(false);
              setCanvasHtmlContent('');
              proceedWithPurchase(result);
            }}
            onError={(error: string) => {
              
              // localStorage temizle
              cleanupLocalStorage();
              
              // State'leri güncelle
              setShowCanvas(false);
              setCanvasHtmlContent('');
              setErrorMessage(`3D doğrulama başarısız: ${error}`);
              setIsProcessing(false);
            }}
            onClose={() => {
              
              // localStorage temizle
              cleanupLocalStorage();
              
              // State'leri güncelle
              setShowCanvas(false);
              setCanvasHtmlContent('');
              setErrorMessage('3D doğrulama iptal edildi.');
              setIsProcessing(false);
            }}
          />
      )}
    </Box>
  );
}
