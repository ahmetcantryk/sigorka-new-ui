"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth, CustomerProfile } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { validateBirthDate, validateTCKNFull, validateTurkishPhoneStrict } from '@/utils/validators';
import { performLogin, verifyOTP, updateCustomerProfile, CustomerType } from '@/utils/authHelper';
import YGInput from '../common/YGInput';
import YGSelect from '../common/YGSelect';
import YGButton from '../common/YGButton';
import YGCheckbox from '../common/YGCheckbox';
import YGModal from '../common/YGModal';
import YGOTPInput from '../common/YGOTPInput';
import YGLegalTextModal from '../common/YGLegalTextModal';
import LegalTextLinks from '../common/LegalTextLinks';
import { KVKK_TEXT, ACIK_RIZA_TEXT, ELEKTRONIK_ILETI_TEXT } from '../common/legalTexts';
import CloseIcon from '@mui/icons-material/Close';

// Hardcoded agent ID for standalone YuvamGuvende page
const AGENT_ID = '019639c4-0fcc-78c7-9ed7-864e96b86e4c';

interface LocationOption {
  value: string;
  text: string;
}

interface YGPersonalInfoStepProps {
  onNext: () => void;
}

// Validation schema
const validationSchema = yup.object({
  identityNumber: yup
    .string()
    .required('TC Kimlik No gereklidir')
    .test('tckn-validation', '', function (value) {
      if (!value) return true;
      const validation = validateTCKNFull(value);
      if (!validation.isValid) {
        return this.createError({ message: validation.message });
      }
      return true;
    }),
  birthDate: yup
    .string()
    .required('Doğum tarihi gereklidir')
    .test('birth-date-validation', '', function (value) {
      if (!value) return true;
      const validation = validateBirthDate(value);
      if (!validation.isValid) {
        return this.createError({ message: validation.message });
      }
      return true;
    }),
  phoneNumber: yup
    .string()
    .required('Telefon numarası gereklidir')
    .test('phone-validation', '', function (value) {
      if (!value) return true;
      const validation = validateTurkishPhoneStrict(value, true);
      if (!validation.isValid) {
        return this.createError({ message: validation.message });
      }
      return true;
    }),
  email: yup.string().email('Geçerli bir e-posta giriniz').required('E-posta gereklidir'),
  acceptTerms: yup
    .boolean()
    .oneOf([true], "Devam etmek için onaylamanız gerekmektedir"),
  acceptCommercial: yup.boolean(),
});

// Additional info validation schema
const additionalInfoSchema = yup.object({
  fullName: yup.string().required('Ad Soyad gereklidir'),
  birthDate: yup
    .string()
    .required('Doğum tarihi gereklidir')
    .test('birth-date-validation', '', function (value) {
      if (!value) return true;
      const validation = validateBirthDate(value);
      if (!validation.isValid) {
        return this.createError({ message: validation.message });
      }
      return true;
    }),
  city: yup.string().required('İl seçimi gereklidir'),
  district: yup.string().required('İlçe seçimi gereklidir'),
});

export default function YGPersonalInfoStep({ onNext }: YGPersonalInfoStepProps) {
  const { accessToken, setTokens, setUser, customerId, setCustomerId } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [tempToken, setTempToken] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [autoVerifyEnabled, setAutoVerifyEnabled] = useState(true); // İlk doğrulama için true
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'kvkk' | 'acik-riza' | 'elektronik-ileti' | null }>({
    isOpen: false,
    type: null,
  });
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [meDataForAdditionalInfo, setMeDataForAdditionalInfo] = useState<CustomerProfile | null>(null);
  const [customerIdForAdditionalInfo, setCustomerIdForAdditionalInfo] = useState<string | null>(null);
  const hasCheckedOnLoadRef = useRef(false);

  // Timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showVerification && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showVerification, timeLeft]);

  const formik = useFormik({
    initialValues: {
      identityNumber: '',
      birthDate: '',
      phoneNumber: '',
      email: '',
      acceptTerms: false,
      acceptCommercial: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      if (isSubmittingForm) return; // Çift tıklama engeli
      
      setIsSubmittingForm(true);
      setIsLoading(true);
      setError(null);

      try {
        if (!accessToken) {
          // Login flow
          const cleanPhoneNumber = values.phoneNumber.replace(/\D/g, '');
          const loginData = await performLogin(
            parseInt(values.identityNumber),
            values.birthDate,
            cleanPhoneNumber,
            AGENT_ID,
            CustomerType.Individual
          );

          if (loginData.token) {
            setTempToken(loginData.token);
            setShowVerification(true);
            setTimeLeft(60);
          } else {
            setError('Giriş işlemi sırasında bir sorun oluştu.');
          }
          setIsLoading(false);
          setIsSubmittingForm(false);
          return;
        }

        // If already logged in, proceed
        localStorage.setItem('proposalIdForKonut', customerId || '');
        localStorage.setItem('konutPersonalInfoCompleted', 'true');
        onNext();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Bir hata oluştu');
        setIsSubmittingForm(false);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleVerifyOTP = useCallback(async (isAutoVerify: boolean = false) => {
    if (isVerifying || verificationCode.length !== 6) return;

    setIsVerifying(true);
    setIsLoading(true);
    setError(null);

    // Spinner gösterimi için kısa bir gecikme
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const verifyData = await verifyOTP(tempToken, verificationCode);

      if (!verifyData.accessToken) {
        setError("Kimlik doğrulama başarısız oldu.");
        setAutoVerifyEnabled(false); // Hata sonrası otomatik doğrulamayı kapat
        setIsLoading(false);
        setIsVerifying(false);
        return;
      }

      setTokens(verifyData.accessToken, verifyData.refreshToken);

      // Önce verifyData'dan customerId al, yoksa /me'den alacağız
      let customerIdToUse = verifyData.customerId;

      // Fetch user profile - /me API'sinden id'yi al (öncelikli)
      const meResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
      if (meResponse.ok) {
        const meData: CustomerProfile = await meResponse.json();
        
        // /me'den gelen id'yi öncelikli olarak kullan
        if (meData.id) {
          customerIdToUse = meData.id;
        }
        
        // customerId'yi set et
        if (customerIdToUse) {
          setCustomerId(customerIdToUse);
          localStorage.setItem('proposalIdForKonut', customerIdToUse);
        }
        
        setUser({
          id: customerIdToUse || '',
          name: meData.fullName || '',
          email: meData.primaryEmail || formik.values.email,
          phone: meData.primaryPhoneNumber?.number || formik.values.phoneNumber,
        });

        // Check for missing information (fullName, birthDate, city, district)
        const cityValue = typeof meData.city === 'object' && meData.city ? meData.city.value : meData.city;
        const districtValue = typeof meData.district === 'object' && meData.district ? meData.district.value : meData.district;
        
        const hasMissingInfo = !meData.fullName || !meData.birthDate || !cityValue || !districtValue;

        if (hasMissingInfo) {
          // Show additional info form
          setMeDataForAdditionalInfo(meData);
          setCustomerIdForAdditionalInfo(customerIdToUse || null);
          setShowVerification(false);
          setShowAdditionalInfo(true);
          setIsVerifying(false);
          setIsLoading(false);
          return;
        }

        // Update profile with all non-null information from /me
        const updatePayload: Record<string, any> = {};
        
        // FullName
        if (meData.fullName) {
          updatePayload.fullName = meData.fullName;
        }
        
        // identityNumber
        if (meData.identityNumber) {
          updatePayload.identityNumber = meData.identityNumber;
        }
        
        // birthDate
        if (meData.birthDate) {
          updatePayload.birthDate = meData.birthDate;
        }
        
        // gender
        if (meData.gender) {
          updatePayload.gender = meData.gender;
        }
        
        // job
        if (meData.job) {
          updatePayload.job = meData.job;
        }
        
        // educationStatus
        if (meData.educationStatus) {
          updatePayload.educationStatus = meData.educationStatus;
        }
        
        // nationality
        if (meData.nationality) {
          updatePayload.nationality = meData.nationality;
        }
        
        // maritalStatus
        if (meData.maritalStatus) {
          updatePayload.maritalStatus = meData.maritalStatus;
        }
        
        // primaryPhoneNumber - /me'den gelen bilgiyi kullan
        if (meData.primaryPhoneNumber) {
          updatePayload.primaryPhoneNumber = meData.primaryPhoneNumber;
        }
        
        // primaryEmail - form'dan gelen veya /me'den
        if (formik.values.email || meData.primaryEmail) {
          updatePayload.primaryEmail = formik.values.email || meData.primaryEmail;
        }

        // cityReference ve districtReference
        if (cityValue) {
          updatePayload.cityReference = cityValue;
        }
        if (districtValue) {
          updatePayload.districtReference = districtValue;
        }
        
        // representedBy
        if (meData.representedBy) {
          updatePayload.representedBy = meData.representedBy;
        }
        
        // Eğer en az bir alan varsa güncelle
        if (Object.keys(updatePayload).length > 0 && customerIdToUse) {
          await updateCustomerProfile(
            updatePayload,
            customerIdToUse,
            CustomerType.Individual
          );
        }
      } else {
        // Eğer /me başarısız olursa verifyData'dan kullan
        if (customerIdToUse) {
          setCustomerId(customerIdToUse);
          localStorage.setItem('proposalIdForKonut', customerIdToUse);
        }
      }

      localStorage.setItem('konutPersonalInfoCompleted', 'true');
      setShowVerification(false);
      setIsVerifying(false);
      onNext();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'OTP doğrulama sırasında bir hata oluştu.');
      setAutoVerifyEnabled(false); // Hata sonrası otomatik doğrulamayı kapat
      setIsVerifying(false);
    } finally {
      setIsLoading(false);
    }
  }, [isVerifying, verificationCode, tempToken, formik.values.email, setTokens, setCustomerId, setUser, onNext]);

  const handleResendCode = async () => {
    setResendLoading(true);
    setTimeLeft(60);
    setVerificationCode('');
    setError(null);
    setAutoVerifyEnabled(false); // Resend sonrası otomatik doğrulamayı kapat

    try {
      const cleanPhoneNumber = formik.values.phoneNumber.replace(/\D/g, '');
      const loginData = await performLogin(
        parseInt(formik.values.identityNumber),
        formik.values.birthDate,
        cleanPhoneNumber,
        AGENT_ID,
        CustomerType.Individual
      );

      if (loginData.token) {
        setTempToken(loginData.token);
      }
    } catch (error) {
      console.warn('Resend error:', error);
    } finally {
      setResendLoading(false);
    }
  };

  // Otomatik doğrulama: 6 hane dolduğunda ve ilk doğrulamadaysa
  useEffect(() => {
    if (
      showVerification &&
      verificationCode.length === 6 &&
      autoVerifyEnabled &&
      !isVerifying &&
      !isLoading &&
      tempToken
    ) {
      handleVerifyOTP(true);
    }
  }, [verificationCode, showVerification, autoVerifyEnabled, isVerifying, isLoading, tempToken, handleVerifyOTP]);

  // Modal açıldığında autoVerifyEnabled'ı true yap
  useEffect(() => {
    if (showVerification) {
      setAutoVerifyEnabled(true);
    }
  }, [showVerification]);

  // Helper function to sort location options
  const sortLocationOptions = (options: LocationOption[]): LocationOption[] => {
    const alphabetic = options.filter(opt => isNaN(Number(opt.text.charAt(0))));
    const numeric = options.filter(opt => !isNaN(Number(opt.text.charAt(0))));
    const sortedAlphabetic = alphabetic.sort((a, b) => a.text.localeCompare(b.text, 'tr-TR'));
    const sortedNumeric = numeric.sort((a, b) => a.text.localeCompare(b.text, 'tr-TR'));
    return [...sortedAlphabetic, ...sortedNumeric];
  };

  // Fetch cities
  const fetchCities = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_CITIES, {
        method: 'GET',
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const sortedCities = sortLocationOptions(data as LocationOption[]);
          setCities(sortedCities);
        }
      }
    } catch (e) {
      setError('İller yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch districts
  const fetchDistricts = async (cityValue: string) => {
    if (!cityValue) {
      setDistricts([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_DISTRICTS(cityValue), {
        method: 'GET',
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const sortedData = sortLocationOptions(data as LocationOption[]);
          setDistricts(sortedData);
        }
      }
    } catch (e) {
      setError('İlçeler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load cities when additional info form is shown
  useEffect(() => {
    if (showAdditionalInfo && cities.length === 0) {
      fetchCities();
    }
  }, [showAdditionalInfo]);

  // Check for missing info when user is already logged in - only run once on mount
  useEffect(() => {
    let isMounted = true;

    // Don't run if already checked
    if (hasCheckedOnLoadRef.current) {
      return;
    }

    const checkUserDataOnLoad = async () => {
      hasCheckedOnLoadRef.current = true;

      // Check for accessToken from store or localStorage
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

      const hasAccessToken = accessToken || getAccessTokenFromStorage();
      
      if (!hasAccessToken) {
        return;
      }

      try {
        setIsLoading(true);
        const meResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
        
        if (!isMounted) return;

        if (meResponse.ok) {
          const meData: CustomerProfile = await meResponse.json();
          
          // Check for missing information (fullName, birthDate, city, district)
          const cityValue = typeof meData.city === 'object' && meData.city ? meData.city.value : meData.city;
          const districtValue = typeof meData.district === 'object' && meData.district ? meData.district.value : meData.district;
          
          const hasMissingInfo = !meData.fullName || !meData.birthDate || !cityValue || !districtValue;

          if (hasMissingInfo && isMounted) {
            // Show additional info form
            setMeDataForAdditionalInfo(meData);
            if (meData.id) {
              setCustomerId(meData.id);
              setCustomerIdForAdditionalInfo(meData.id);
            }
            setShowAdditionalInfo(true);
          } else if (isMounted) {
            // Kullanıcı login olmuş ve tüm bilgileri tam - direkt PropertyInfo'ya geç
            if (meData.id) {
              setCustomerId(meData.id);
            }
            // Kısa bir gecikme ile onNext çağır (UI render için)
            setTimeout(() => {
              if (isMounted) {
                onNext();
              }
            }, 300);
          }
        }
      } catch (error) {
        console.warn('Error checking user data:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkUserDataOnLoad();

    return () => {
      isMounted = false;
    };
  }, []); // Run only once on mount

  // Additional info formik
  const additionalInfoFormik = useFormik({
    initialValues: {
      fullName: '',
      birthDate: '',
      city: '',
      district: '',
    },
    validationSchema: additionalInfoSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!customerIdForAdditionalInfo || !meDataForAdditionalInfo) {
          setError('Kullanıcı bilgisi bulunamadı.');
          setIsLoading(false);
          return;
        }

        // Update profile with additional info + all existing data from /me
        const updatePayload: Record<string, any> = {
          // Always include data from /me to prevent overwriting with empty values
          fullName: meDataForAdditionalInfo.fullName,
          identityNumber: meDataForAdditionalInfo.identityNumber,
          birthDate: meDataForAdditionalInfo.birthDate,
          gender: meDataForAdditionalInfo.gender,
          job: meDataForAdditionalInfo.job,
          educationStatus: meDataForAdditionalInfo.educationStatus,
          nationality: meDataForAdditionalInfo.nationality,
          maritalStatus: meDataForAdditionalInfo.maritalStatus,
          primaryPhoneNumber: meDataForAdditionalInfo.primaryPhoneNumber,
          primaryEmail: meDataForAdditionalInfo.primaryEmail,
          representedBy: meDataForAdditionalInfo.representedBy,
        };
        
        // Override with form values where applicable
        if (values.fullName && values.fullName.trim()) {
          updatePayload.fullName = values.fullName.trim().toUpperCase();
        }
        
        if (values.birthDate && values.birthDate.trim()) {
          updatePayload.birthDate = values.birthDate;
        }
        
        if (values.city && values.city.trim()) {
          updatePayload.cityReference = values.city;
        }
        
        if (values.district && values.district.trim()) {
          updatePayload.districtReference = values.district;
        }

        await updateCustomerProfile(
          updatePayload,
          customerIdForAdditionalInfo,
          CustomerType.Individual
        );

        // After update, proceed to next step
        localStorage.setItem('konutPersonalInfoCompleted', 'true');
        setShowAdditionalInfo(false);
        onNext();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Bilgiler güncellenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Render additional info form if needed
  if (showAdditionalInfo) {
    return (
      <div className="yg-form-content">
        <span className="yg-form-title">Eksik Bilgilerinizi Tamamlayın</span>
        <p className="yg-form-subtitle">
          Konut Sigortası teklifiniz için eksik bilgilerinizi doldurunuz.
        </p>

        <div className="yg-form-separator"></div>

        {error && (
          <p style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: '20px' }}>{error}</p>
        )}

        <form onSubmit={additionalInfoFormik.handleSubmit}>
          <div className="yg-form-grid">
            <YGInput
              name="fullName"
              value={additionalInfoFormik.values.fullName}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '').toUpperCase();
                additionalInfoFormik.setFieldValue('fullName', value);
              }}
              onBlur={additionalInfoFormik.handleBlur}
              placeholder="Ad Soyad*"
              error={additionalInfoFormik.touched.fullName && additionalInfoFormik.errors.fullName ? String(additionalInfoFormik.errors.fullName) : undefined}
              maxLength={100}
            />

            <YGInput
              name="birthDate"
              value={additionalInfoFormik.values.birthDate}
              onChange={additionalInfoFormik.handleChange}
              onBlur={additionalInfoFormik.handleBlur}
              placeholder="Doğum Tarihi*"
              type="date"
              error={additionalInfoFormik.touched.birthDate && additionalInfoFormik.errors.birthDate ? String(additionalInfoFormik.errors.birthDate) : undefined}
            />

            <YGSelect
              name="city"
              value={additionalInfoFormik.values.city}
              onChange={(e) => {
                additionalInfoFormik.setFieldValue('city', e.target.value);
                additionalInfoFormik.setFieldValue('district', '');
                setDistricts([]);
                if (e.target.value) {
                  fetchDistricts(e.target.value);
                }
              }}
              onBlur={additionalInfoFormik.handleBlur}
              options={cities.map(opt => ({ value: opt.value, label: opt.text }))}
              placeholder="İl Seçiniz*"
              error={additionalInfoFormik.touched.city && additionalInfoFormik.errors.city ? String(additionalInfoFormik.errors.city) : undefined}
              disabled={isLoading || cities.length === 0}
            />

            <YGSelect
              name="district"
              value={additionalInfoFormik.values.district}
              onChange={additionalInfoFormik.handleChange}
              onBlur={additionalInfoFormik.handleBlur}
              options={districts.map(opt => ({ value: opt.value, label: opt.text }))}
              placeholder="İlçe Seçiniz*"
              error={additionalInfoFormik.touched.district && additionalInfoFormik.errors.district ? String(additionalInfoFormik.errors.district) : undefined}
              disabled={!additionalInfoFormik.values.city || isLoading || districts.length === 0}
            />
          </div>

          <div className="yg-button-container">
            <YGButton type="submit" disabled={isLoading || additionalInfoFormik.isSubmitting}>
              {isLoading || additionalInfoFormik.isSubmitting ? 'Teklif Alınıyor...' : 'Teklif Al'}
            </YGButton>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      <YGModal 
        isOpen={showVerification} 
        onClose={() => {}} 
        allowBackdropClose={false}
      >
        <button 
          className="yg-modal-close" 
          onClick={() => setShowVerification(false)}
          aria-label="Kapat"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="yg-modal-title">Telefonuna bir doğrulama kodu gönderdik!</span>
        <p className="yg-modal-subtitle">
          0{formik.values.phoneNumber} numaralı cep telefonuna gelen doğrulama kodunu girebilir misin?
        </p>

        <YGOTPInput
          value={verificationCode}
          onChange={(value) => setVerificationCode(value)}
          length={6}
          disabled={isLoading || isVerifying}
          isLoading={isVerifying}
        />

        {error && (
          <p style={{ color: '#ff6b6b', textAlign: 'center', marginTop: '16px', marginBottom: '16px' }}>{error}</p>
        )}

        <div style={{ textAlign: 'center', margin: '20px 0', color: '#fff', fontSize: '14px' }}>
          {timeLeft > 0 ? (
            <span>Süre dolduktan sonra kod yeniden gönderilebilir <br/> (00:{timeLeft.toString().padStart(2, '0')})</span>
          ) : (
            <button 
              type="button"
              className="yg-resend-link"
              onClick={handleResendCode}
              disabled={resendLoading}
            >
              {resendLoading ? 'Gönderiliyor...' : 'Tekrar Kod Gönder'}
            </button>
          )}
        </div>

        <div className="yg-button-container" style={{ justifyContent: 'center' }}>
          <YGButton
            onClick={handleVerifyOTP}
            disabled={verificationCode.length !== 6 || isLoading}
          >
            {isLoading ? 'Doğrulanıyor...' : 'Onayla'}
          </YGButton>
        </div>
      </YGModal>

      <div className="yg-form-content">
        <span className="yg-form-title">Yuvam Güvende ile Evinizi Koruma Altına Alın</span>
        <p className="yg-form-subtitle">
          Sadece birkaç adımda, eşyalarınıza özel güvence sağlayan poliçenizi oluşturun. <strong>Başlayalım mı?</strong>
        </p>

        <div className="yg-form-separator"></div>

        {error && (
          <p style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: '20px' }}>{error}</p>
        )}

        <form onSubmit={formik.handleSubmit}>
        <div className="yg-form-grid">
          <YGInput
            name="identityNumber"
            value={formik.values.identityNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              formik.setFieldValue('identityNumber', value);
            }}
            onBlur={formik.handleBlur}
            placeholder="TCKN*"
            error={formik.touched.identityNumber && formik.errors.identityNumber ? String(formik.errors.identityNumber) : undefined}
            maxLength={11}
            disabled={!!accessToken}
          />

          <YGInput
            name="birthDate"
            value={formik.values.birthDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Doğum Tarihi*"
            type="date"
            error={formik.touched.birthDate && formik.errors.birthDate ? String(formik.errors.birthDate) : undefined}
            disabled={!!accessToken}
          />

          <YGInput
            name="phoneNumber"
            value={formik.values.phoneNumber}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.length > 0 && value[0] !== '5') {
                value = '5' + value.slice(1);
              }
              formik.setFieldValue('phoneNumber', value.slice(0, 10));
            }}
            onBlur={formik.handleBlur}
            placeholder="Telefon Numarası*"
            error={formik.touched.phoneNumber && formik.errors.phoneNumber ? String(formik.errors.phoneNumber) : undefined}
            maxLength={10}
            disabled={!!accessToken}
          />

          <YGInput
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="E-Posta Adresi*"
            type="email"
            error={formik.touched.email && formik.errors.email ? String(formik.errors.email) : undefined}
          />
        </div>

        <div className="yg-checkbox-group">
          <YGCheckbox
            name="acceptTerms"
            checked={formik.values.acceptTerms}
            onChange={formik.handleChange}
            label={
              <LegalTextLinks
                onKVKKClick={() => setLegalModal({ isOpen: true, type: 'kvkk' })}
                onAcikRizaClick={() => setLegalModal({ isOpen: true, type: 'acik-riza' })}
              />
            }
            error={formik.touched.acceptTerms && formik.errors.acceptTerms ? String(formik.errors.acceptTerms) : undefined}
          />

          <YGCheckbox
            name="acceptCommercial"
            checked={formik.values.acceptCommercial}
            onChange={formik.handleChange}
            label={
              <LegalTextLinks
                onElektronikIletiClick={() => setLegalModal({ isOpen: true, type: 'elektronik-ileti' })}
                showOnlyElektronik={true}
              />
            }
          />
        </div>

        <p className="yg-form-disclaimer">
          *Bilgileriniz yalnızca teklif oluşturma amacıyla kullanılacaktır.
        </p>

        <div className="yg-button-container" style={{ justifyContent: 'flex-end' }}>
          <YGButton 
            type="submit" 
            disabled={isSubmittingForm || isLoading || !formik.values.acceptTerms}
          >
            {isSubmittingForm || isLoading ? 'İşleniyor...' : 'Adrese Geç'}
          </YGButton>
        </div>
      </form>

      {/* Legal Text Modals */}
      {legalModal.type === 'kvkk' && (
        <YGLegalTextModal
          isOpen={legalModal.isOpen}
          onClose={() => setLegalModal({ isOpen: false, type: null })}
          title="Kişisel Verilerin Korunması Hakkında Aydınlatma Metni"
          content={KVKK_TEXT}
        />
      )}
      {legalModal.type === 'acik-riza' && (
        <YGLegalTextModal
          isOpen={legalModal.isOpen}
          onClose={() => setLegalModal({ isOpen: false, type: null })}
          title="Açık Rıza Metni"
          content={ACIK_RIZA_TEXT}
        />
      )}
      {legalModal.type === 'elektronik-ileti' && (
        <YGLegalTextModal
          isOpen={legalModal.isOpen}
          onClose={() => setLegalModal({ isOpen: false, type: null })}
          title="Elektronik İleti Onayı"
          content={ELEKTRONIK_ILETI_TEXT}
        />
      )}
    </div>
    </>
  );
}

