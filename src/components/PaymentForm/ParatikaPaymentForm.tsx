"use client";

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { validateCardHolderIdentityNumber } from '@/utils/validators';
import { getClientIP, createSessionViaAPI } from '@/services/paratika';
import { useAuthStore } from '@/store/useAuthStore';
import { customerApi } from '@/services/api';
import { useRouter } from 'next/navigation';
import { completePaymentAfter3D } from '@/services/insurupApi';


interface ParatikaPaymentFormProps {
  amount: number;
  proposalId: string;
  productId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const validationSchema = Yup.object({
  cardNumber: Yup.string()
    .required('Kart numarası gereklidir')
    .test('card-number', 'Geçerli bir kart numarası giriniz', (value) => {
      if (!value) return false;
      const cleanValue = value.replace(/\s/g, '');
      return cleanValue.length >= 15 && cleanValue.length <= 19;
    }),
  cardHolder: Yup.string()
    .required('Kart sahibi adı gereklidir')
    .min(2, 'En az 2 karakter olmalıdır'),
  expiryDate: Yup.string()
    .required('Son kullanma tarihi gereklidir')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'MM/YY formatında olmalıdır'),
  cvv: Yup.string()
    .required('CVV gereklidir')
    .min(3, 'En az 3 karakter olmalıdır')
    .max(4, 'En fazla 4 karakter olmalıdır'),
  cardHolderTckn: Yup.string().when([], {
    is: () => false, // Bu alan şu anda zorunlu değil, checkbox ile kontrol ediliyor
    then: (schema) => schema.required('Kart sahibi TCKN gereklidir').test('identity-validation', 'Geçersiz kimlik numarası', function(value) {
      if (!value) return false;
      const result = validateCardHolderIdentityNumber(value);
      return result.isValid;
    }),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export default function ParatikaPaymentForm({
  amount,
  proposalId,
  productId,
  onSuccess,
  onError,
}: ParatikaPaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [use3DSecure, setUse3DSecure] = useState(true);
  
  // Kart sahibi TCKN kontrolü için yeni state'ler
  const [isCardHolderSameAsInsured, setIsCardHolderSameAsInsured] = useState(true);
  const [cardHolderTckn, setCardHolderTckn] = useState('');

  const { accessToken } = useAuthStore();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
      cardHolderTckn: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      await handlePayment(values);
    },
  });

  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\s/g, '');
    const formattedValue = cleanValue.replace(/(.{4})/g, '$1 ').trim();
    return formattedValue;
  };

  const formatExpiryDate = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length >= 2) {
      return cleanValue.substring(0, 2) + '/' + cleanValue.substring(2, 4);
    }
    return cleanValue;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    if (formattedValue.replace(/\s/g, '').length <= 19) {
      formik.setFieldValue('cardNumber', formattedValue);
    }
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatExpiryDate(e.target.value);
    if (formattedValue.length <= 5) {
      formik.setFieldValue('expiryDate', formattedValue);
    }
  };

  // 🔥 YENİ: InsurUp API ile satın alma işlemini tamamla
  const completeInsurUpPurchase = async (merchantPaymentId: string) => {
    try {
      
      // Kullanıcıya bilgi ver
      setErrorMessage('3D doğrulama başarılı! Sigorta poliçeniz oluşturuluyor...');
      
      const [expiryMonth, expiryYear] = formik.values.expiryDate.split('/');
      
      // Sigortalının TCKN'sini al
      const customerProfile = await customerApi.getProfile();
      const identityNumber = isCardHolderSameAsInsured 
        ? customerProfile.identityNumber.toString()
        : cardHolderTckn;
      
      const purchaseResult = await completePaymentAfter3D(
        proposalId,
        productId,
        {
          installmentNumber: 1, 
          merchantPaymentId: merchantPaymentId,
          paratikaTransactionResult: { success: true }, // Mock data, gerçek transaction result burada olmalı
          cardInfo: {
            identityNumber: identityNumber,
            number: formik.values.cardNumber.replace(/\s/g, ''),
            cvc: formik.values.cvv,
            expiryMonth: expiryMonth.padStart(2, '0'),
            expiryYear: (2000 + parseInt(expiryYear)).toString(),
            holderName: formik.values.cardHolder
          } as any
        },
        accessToken || ''
      );

      if (purchaseResult.success) {
        
        // Başarı mesajı göster
        setErrorMessage('Tebrikler! Sigorta poliçeniz başarıyla oluşturuldu.');
        
        // onSuccess callback'ini çağır (modal kapanması için)
        onSuccess?.();
        
        // Kısa bir gecikme sonrası yönlendir
        setTimeout(() => {
          window.location.href = '/dashboard/policies?status=success&message=Sigorta poliçeniz başarıyla satın alındı';
        }, 2000);
        
      } else {
        throw new Error(purchaseResult.error || 'InsurUp satın alma işlemi başarısız');
      }
    } catch (insurupError) {
      setErrorMessage('3D doğrulama başarılı ancak poliçe oluşturulamadı: ' + (insurupError instanceof Error ? insurupError.message : 'Bilinmeyen hata'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async (values: typeof formik.values) => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      // Müşteri bilgilerini al
      const customerProfile = await customerApi.getProfile();
      
      // IP adresini al
      const clientIP = await getClientIP();
      
      // User agent bilgisini al
      const userAgent = navigator.userAgent;

      // Merchant payment ID oluştur
      const merchantPaymentId = `${productId.toUpperCase()}-${proposalId}-${Date.now()}`;

      // Session token oluştur
      const sessionData = {
        amount: amount,
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
            productCode: productId,
            name: 'Sigorta Poliçesi',
            description: `${proposalId} numaralı teklif için sigorta poliçesi`,
            quantity: 1,
            amount: amount,
          },
        ],
      };

      
      const sessionResponse = await createSessionViaAPI(sessionData);
      
      if (sessionResponse.responseCode !== '00') {
        throw new Error(sessionResponse.responseMsg || 'Session oluşturulamadı');
      }


      if (use3DSecure) {
        // 3D güvenli ödeme
        const [expiryMonth, expiryYear] = values.expiryDate.split('/');
        const fullYear = '20' + expiryYear;
        
        // Güvenli callback URL oluştur
        let callbackUrl;
        try {
          // SSR kontrolü ekle
          if (typeof window !== 'undefined') {
            const origin = window.location.origin;
            callbackUrl = `${origin}/api/paratika/callback`;
            // URL'i test et
            new URL(callbackUrl);
          } else {
            // Server-side fallback
            callbackUrl = 'https://sigorka.com/api/paratika/callback';
          }
        } catch (error) {
          callbackUrl = 'https://sigorka.com/api/paratika/callback';
        }

        const cardInfo = {
          pan: values.cardNumber.replace(/\s/g, ''),
          cardOwner: values.cardHolder,
          expiryMonth: expiryMonth,
          expiryYear: fullYear,
          cvv: values.cvv,
          callbackUrl: callbackUrl,
        };

        
        // Backend API üzerinden 3D işlemi başlat
        try {
          
          const threeDResponse = await fetch('/api/paratika/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionToken: sessionResponse.sessionToken,
              cardInfo: cardInfo
            })
          });

          if (!threeDResponse.ok) {
            const errorData = await threeDResponse.json();
            throw new Error(errorData.error || 'Backend API hatası');
          }

          const threeDResult = await threeDResponse.json();
          

          if (!threeDResult.success) {
            throw new Error(threeDResult.error || '3D işlemi başlatılamadı');
          }

          // HTML content yoksa hata fırlat
          if (!threeDResult.html) {
            throw new Error('3D doğrulama formu alınamadı');
          }

          // Gerekli verileri localStorage'a kaydet
          localStorage.setItem('paratika3dHtmlContent', threeDResult.html);
          
          localStorage.setItem('paratika_merchantPaymentId', merchantPaymentId);
          
          localStorage.setItem('current_order_data', JSON.stringify({
            proposalId,
            productId,
            productType: productId,
            quoteId: proposalId,
            customerInfo: sessionData.customerInfo,
            amount: amount
          }));

          // İsRedirect ise direct URL olarak kaydet
          if (threeDResult.isRedirect && threeDResult.html.includes('http')) {
            // HTML içinden URL'i çıkar
            const urlMatch = threeDResult.html.match(/https?:\/\/[^\s"'<>]+/);
            if (urlMatch) {
              localStorage.setItem('paratika_3d_url', urlMatch[0]);
            }
          }


        } catch (backendError) {
          throw backendError;
        }

        // 3D sayfasını yeni sekmede aç
        const newTab = window.open('/odeme/paratika-3d-tab', '_blank');
        
        if (!newTab) {
          throw new Error('Popup engelleyici tarafından engellendi. Lütfen popup engelleyiciyi devre dışı bırakın ve tekrar deneyin.');
        }

        setErrorMessage('3D doğrulama sayfası yeni sekmede açıldı. Doğrulama tamamlandıktan sonra bu sayfaya geri dönün.');
        
        // 🔥 YENİ: Modal mesajlarını dinle
        const handleMessage = (event: MessageEvent) => {
          
          if (event.data.type === 'PARATIKA_3D_SUCCESS') {
            
            // 3D doğrulama başarılı, şimdi InsurUp API'sine geç
            completeInsurUpPurchase(event.data.merchantPaymentId);
            
          } else if (event.data.type === 'PARATIKA_ERROR') {
            setErrorMessage('Ödeme işlemi iptal edildi: ' + event.data.message);
            setIsProcessing(false);
          }
        };
        
        // Event listener ekle
        window.addEventListener('message', handleMessage);
        
        // Cleanup için setTimeout ile kaldır
        setTimeout(() => {
          window.removeEventListener('message', handleMessage);
        }, 300000); // 5 dakika
        
        const checkCallback = async () => {
          try {
            const response = await fetch(`/api/paratika/check-callback?merchantPaymentId=${merchantPaymentId}`);
            const result = await response.json();
            
            if (result.success && result.data) {
              
              if (result.data.success) {
                try {
                  
                  const [expiryMonth, expiryYear] = values.expiryDate.split('/');
                  
                  const purchaseResult = await completePaymentAfter3D(
                    proposalId,
                    productId,
                    {
                      installmentNumber: 1, 
                      merchantPaymentId: merchantPaymentId,
                      paratikaTransactionResult: result.data,
                      cardInfo: {
                        number: values.cardNumber.replace(/\s/g, ''),
                        cvc: values.cvv,
                        expiryMonth: expiryMonth.padStart(2, '0'),
                        expiryYear: (2000 + parseInt(expiryYear)).toString(),
                        holderName: values.cardHolder
                      }
                    },
                                         accessToken || ''
                  );

                  if (purchaseResult.success) {
                    
                    // 🎯 ÖNEMLİ: Modal'ı kapatmak için önce onSuccess çağır
                    onSuccess?.();
                    
                    // Kısa bir gecikme sonrası yönlendir (modal kapanması için)
                    setTimeout(() => {
                      window.location.href = '/dashboard/policies?status=success&message=Sigorta poliçeniz başarıyla satın alındı';
                    }, 500);
                    
                    return true;
                  } else {
                    throw new Error(purchaseResult.error || 'InsurUp satın alma işlemi başarısız');
                  }
                } catch (insurupError) {
                  setErrorMessage('Paratika ödemesi başarılı ancak poliçe oluşturulamadı: ' + (insurupError instanceof Error ? insurupError.message : 'Bilinmeyen hata'));
                return true;
                }
              } else {
                // Paratika başarısız
                setErrorMessage('Ödeme başarısız oldu: ' + (result.data.responseMsg || 'Bilinmeyen hata'));
                return true;
              }
            }
            return false;
          } catch (error) {
            return false;
          }
        };

        // İlk kontrol 5 saniye sonra, sonrasında her 3 saniyede bir
        let checkCount = 0;
        const maxChecks = 100; // 5 dakika boyunca kontrol et
        
        const checkInterval = setInterval(async () => {
          checkCount++;
          
          const completed = await checkCallback();
          
          if (completed || checkCount >= maxChecks) {
            clearInterval(checkInterval);
            
            if (checkCount >= maxChecks) {
              setErrorMessage('Ödeme kontrolü zaman aşımına uğradı. Lütfen sayfayı yenileyip tekrar deneyin.');
            }
          }
        }, 3000);
        
      } else {
        // Normal ödeme (3D olmadan)
        throw new Error('Normal ödeme henüz desteklenmiyor. 3D güvenli ödemeyi kullanınız.');
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Ödeme sırasında bir hata oluştu';
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };



  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Kredi Kartı Bilgileri
          </Typography>
          
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Box sx={{ '& > *': { mb: 2 } }}>
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
                        formik.setFieldValue('cardHolderTckn', '');
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
                    name="cardHolderTckn"
                    placeholder="TCKN (11 hane) veya VKN (10 hane)"
                    value={cardHolderTckn}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 11) {
                        setCardHolderTckn(value);
                        formik.setFieldValue('cardHolderTckn', value);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    inputProps={{
                      maxLength: 11,
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                    }}
                    error={formik.touched.cardHolderTckn && Boolean(formik.errors.cardHolderTckn)}
                    helperText={formik.touched.cardHolderTckn && formik.errors.cardHolderTckn}
                    sx={{ mt: 2 }}
                  />
                )}
              </Box>

                <TextField
                  fullWidth
                  label="Kart Numarası"
                  name="cardNumber"
                  value={formik.values.cardNumber}
                  onChange={handleCardNumberChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.cardNumber && Boolean(formik.errors.cardNumber)}
                  helperText={formik.touched.cardNumber && formik.errors.cardNumber}
                  placeholder="1234 5678 9012 3456"
                  inputProps={{ maxLength: 23 }}
                />
              
                <TextField
                  fullWidth
                  label="Kart Sahibi"
                  name="cardHolder"
                  value={formik.values.cardHolder}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.cardHolder && Boolean(formik.errors.cardHolder)}
                  helperText={formik.touched.cardHolder && formik.errors.cardHolder}
                  placeholder="AHMET YILMAZ"
                  style={{ textTransform: 'uppercase' }}
                />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Son Kullanma Tarihi"
                  name="expiryDate"
                  value={formik.values.expiryDate}
                  onChange={handleExpiryDateChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                  helperText={formik.touched.expiryDate && formik.errors.expiryDate}
                  placeholder="MM/YY"
                  inputProps={{ maxLength: 5 }}
                  sx={{ flex: 1 }}
                />
              
                <TextField
                  label="CVV"
                  name="cvv"
                  type="password"
                  value={formik.values.cvv}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.cvv && Boolean(formik.errors.cvv)}
                  helperText={formik.touched.cvv && formik.errors.cvv}
                  placeholder="123"
                  inputProps={{ maxLength: 4 }}
                  sx={{ flex: 1 }}
                />
              </Box>

              
                <FormControlLabel
                  control={
                    <Switch
                      checked={use3DSecure}
                      onChange={(e) => setUse3DSecure(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="3D Güvenli Ödeme (Önerilen)"
                />
            </Box>

            {errorMessage && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" color="primary">
                Toplam: ₺{amount.toFixed(2)}
              </Typography>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isProcessing || !formik.isValid}
                startIcon={isProcessing ? <CircularProgress size={20} /> : null}
                size="large"
              >
                {isProcessing ? 'İşleniyor...' : 'Ödeme Yap'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>


    </>
  );
} 