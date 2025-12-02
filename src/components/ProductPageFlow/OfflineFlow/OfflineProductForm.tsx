/**
 * OfflineProductForm
 * 
 * Ürün detay sayfası için Offline talep formu
 * Kasko/TSS ProductForm ile aynı yapıda
 */

'use client';

import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useAuthStore } from '@/store/useAuthStore';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';
import { performLogin, verifyOTP, CustomerType, updateCustomerProfile } from '@/utils/authHelper';
import { fetchWithAuth, CustomerProfile } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';

// Components
import { OfflineStepper } from './components/common';
import { PersonalInfoStep, AdditionalInfoStep, RequestStep, CorporateNotAllowedStep } from './components/steps';
import VerificationCodeModal from '../shared/VerificationCodeModal';
import PhoneNotMatchModal from '@/components/common/PhoneNotMatchModal';

// Config
import { 
  OFFLINE_FORM_DEFAULTS, 
  getStorageKeys,
  OfflineBranchConfig,
} from './config/offlineConstants';
import { getPersonalInfoValidationSchema } from './config/offlineValidation';

// Utils
import { pushOfflineStep1Complete, pushOfflineRequestCreated, pushOfflineRequestFailed } from './utils/dataLayerUtils';

// Types
import { OfflineFormData, Job, CustomerType as CustomerTypeEnum } from './types';

interface OfflineProductFormProps {
  branchConfig: OfflineBranchConfig;
  onRequestCreated?: () => void;
  onBack?: () => void;
}

// Yaş hesaplama helper'ı (offlineValidation ile aynı mantık)
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const OfflineProductForm = ({ branchConfig, onRequestCreated, onBack }: OfflineProductFormProps) => {
  const { accessToken, user, setUser, customerId, setCustomerId, setTokens } = useAuthStore();
  const agencyConfig = useAgencyConfig();
  const agentId = agencyConfig?.agency?.id;

  const storageKeys = getStorageKeys(branchConfig.storageKeyPrefix);

  // Banner ID for scroll
  const bannerId = `${branchConfig.id}-form-banner`;

  // Scroll to banner top function
  const scrollToBannerTop = () => {
    setTimeout(() => {
      const bannerElement = document.getElementById(bannerId);
      if (bannerElement) {
        const offset = 120; // Header height offset
        const elementPosition = bannerElement.offsetTop - offset;
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    }, 100); // Small delay to ensure DOM is updated
  };

  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step değiştiğinde sayfayı en üste scroll et
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStep]);

  // Consent
  const [kvkkConsent, setKvkkConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [kvkkError, setKvkkError] = useState<string | null>(null);

  // Auth & Modals
  const [showVerification, setShowVerification] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPhoneNotMatchModal, setShowPhoneNotMatchModal] = useState(false);
  
  // Step 1 event'inin tekrar tetiklenmesini önlemek için flag
  const [step1EventFired, setStep1EventFired] = useState(false);

  // Request state
  const [requestResult, setRequestResult] = useState<'idle' | 'success' | 'error' | 'existing'>('idle');

  // Corporate customer not allowed
  const [isCorporateCustomer, setIsCorporateCustomer] = useState(false);
  // Seyahat Sağlık için 18 yaş durumu (2. step uyarısı için)
  const [isUnderAge, setIsUnderAge] = useState(false);

  // Cities & Districts
  const [cities, setCities] = useState<Array<{ value: string; text: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ value: string; text: string }>>([]);

  const initialValues: OfflineFormData = {
    customerType: CustomerTypeEnum.Individual,
    identityNumber: '',
    email: '',
    phoneNumber: '',
    birthDate: '',
    job: Job.Unknown,
    fullName: '',
    city: '',
    district: '',
  };

  // Branş ID'ye göre dinamik validasyon şeması (seyahat sağlık için 18 yaş sınırı)
  const personalInfoValidationSchema = getPersonalInfoValidationSchema(branchConfig.id);

  const formik = useFormik({
    initialValues,
    validationSchema: activeStep === 0 ? personalInfoValidationSchema : null,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      if (activeStep === 0) {
        handleStep1Submit(values);
      }
    },
  });

  // Auto-advance if logged in (sadece sayfa yüklendiğinde zaten giriş yapmışsa)
  // OTP sonrası handleVerificationComplete içinde checkProfileAndProceed çağrılıyor
  useEffect(() => {
    // Eğer showVerification açıksa veya tempToken varsa, OTP akışındayız demektir
    // Bu durumda useEffect'in checkProfileAndProceed çağırmasını engelle
    if (accessToken && activeStep === 0 && !showVerification && !tempToken) {
      checkProfileAndProceed();
    }
  }, [accessToken]);

  // Fetch cities on mount
  useEffect(() => {
    fetchCities();
  }, []);

  // AdditionalInfoStep açıldığında mevcut profil bilgilerini form'a yükle
  useEffect(() => {
    if (showAdditionalInfo && accessToken) {
      const loadProfileData = async () => {
        try {
          const response = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
          if (response.ok) {
            const profile = await response.json();
            const customerType = (profile as any).taxNumber || (profile as any).type === 'company' 
              ? CustomerType.Company 
              : CustomerType.Individual;
            
            const cityValue = typeof profile.city === 'object' && profile.city ? profile.city.value : profile.city;
            const districtValue = typeof profile.district === 'object' && profile.district ? profile.district.value : profile.district;
            
            formik.setValues(prev => ({
              ...prev,
              fullName: customerType === CustomerType.Company 
                ? ((profile as any).title || profile.fullName || '')
                : (profile.fullName || ''),
              city: cityValue || prev.city || '',
              district: districtValue || prev.district || '',
            }));
            
            // İl seçildiyse ilçeleri yükle
            if (cityValue) {
              await fetchDistricts(cityValue);
            }
          }
        } catch (error) {
          console.warn('Profil bilgileri yüklenemedi:', error);
        }
      };
      loadProfileData();
    }
  }, [showAdditionalInfo, accessToken]);

  const fetchCities = async () => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_CITIES);
      if (response.ok) {
        const data = await response.json();
        setCities(data);
      }
    } catch (error) {
      console.error('Şehirler yüklenemedi:', error);
    }
  };

  const fetchDistricts = async (cityValue: string) => {
    try {
      setDistricts([]);
      const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_DISTRICTS(cityValue));
      if (response.ok) {
        const data = await response.json();
        setDistricts(data);
      }
    } catch (error) {
      console.error('İlçeler yüklenemedi:', error);
    }
  };

  const checkProfileAndProceed = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
      if (response.ok) {
        const profile: CustomerProfile = await response.json();

        // Seyahat Sağlık için 18 yaş bilgisini sadece state'e yaz (uyarı için)
        if (branchConfig.id === 'seyahat-saglik') {
          const birthDateStr = (profile as any).birthDate as string | undefined;
          if (birthDateStr) {
            const age = calculateAge(birthDateStr);
            setIsUnderAge(age < 18);
          } else {
            setIsUnderAge(false);
          }
        } else {
          setIsUnderAge(false);
        }

        // Kurumsal müşteri kontrolü - Offline talep oluşturamazlar
        const isCompany = (profile as any).$type === 'company' || 
                          (profile as any).type === 'COMPANY' || 
                          (profile as any).taxNumber;
        
        if (isCompany) {
          setIsCorporateCustomer(true);
          setIsLoading(false);
          return;
        }

        // E-posta güncellemesi gerekebilir
        const userEnteredEmail = formik.values.email?.trim();
        if (userEnteredEmail && userEnteredEmail !== profile.primaryEmail && profile.id) {
          try {
            const customerType = (profile as any).taxNumber || (profile as any).type === 'company' 
              ? CustomerType.Company 
              : CustomerType.Individual;
            
            const updatePayload: Record<string, any> = {
              primaryPhoneNumber: profile.primaryPhoneNumber,
              primaryEmail: userEnteredEmail,
              fullName: profile.fullName,
            };
            
            if (customerType === CustomerType.Individual) {
              if (profile.identityNumber) updatePayload.identityNumber = profile.identityNumber;
              if (profile.birthDate) updatePayload.birthDate = profile.birthDate;
            } else {
              if ((profile as any).taxNumber) updatePayload.taxNumber = (profile as any).taxNumber;
              updatePayload.title = (profile as any)?.title || profile.fullName || '';
            }
            
            if (profile.job) updatePayload.job = profile.job;
            
            if (profile.city) {
              const cityValue = typeof profile.city === 'object' && profile.city ? profile.city.value : profile.city;
              if (cityValue) updatePayload.cityReference = cityValue;
            }
            
            if (profile.district) {
              const districtValue = typeof profile.district === 'object' && profile.district ? profile.district.value : profile.district;
              if (districtValue) updatePayload.districtReference = districtValue;
            }
            
            await updateCustomerProfile(updatePayload, profile.id, customerType);
            profile.primaryEmail = userEnteredEmail;
          } catch (error) {
            console.warn('Email update hatası:', error);
          }
        }

        // Check if profile is complete
        const customerType = (profile as any).taxNumber || (profile as any).type === 'company' 
          ? CustomerType.Company 
          : CustomerType.Individual;
        const cityValue = typeof profile.city === 'object' && profile.city ? profile.city.value : profile.city;
        const districtValue = typeof profile.district === 'object' && profile.district ? profile.district.value : profile.district;
        const nameField = customerType === CustomerType.Company 
          ? ((profile as any).title || profile.fullName)
          : profile.fullName;
        const isComplete = !!(nameField && cityValue && districtValue);

        if (isComplete) {
          // Profile complete, go to step 2
          setCustomerId(profile.id);
          setUser({
            id: profile.id,
            name: customerType === CustomerType.Company 
              ? ((profile as any).title || profile.fullName || '')
              : (profile.fullName || ''),
            email: profile.primaryEmail || '',
            phone: profile.primaryPhoneNumber?.number || '',
          });

          if (!step1EventFired) {
            pushOfflineStep1Complete(branchConfig.dataLayerEventPrefix);
            setStep1EventFired(true);
          }
          setActiveStep(1);
          scrollToBannerTop();
        } else {
          // Profile incomplete, show additional info form
          formik.setValues({
            ...formik.values,
            identityNumber: profile.identityNumber?.toString() || '',
            email: profile.primaryEmail || '',
            phoneNumber: profile.primaryPhoneNumber?.number || '',
            birthDate: profile.birthDate || '',
            fullName: customerType === CustomerType.Company 
              ? ((profile as any).title || profile.fullName || '')
              : (profile.fullName || ''),
            city: cityValue || '',
            district: districtValue || '',
          });

          if (cityValue) {
            await fetchDistricts(cityValue);
          }

          setShowAdditionalInfo(true);
        }
      }
    } catch (error) {
      console.error('Profil kontrol hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep1Submit = async (values: OfflineFormData) => {
    // Touched fields
    formik.setTouched({
      identityNumber: true,
      email: true,
      phoneNumber: true,
      birthDate: true,
    });

    // KVKK kontrolü
    if (!kvkkConsent) {
      setKvkkError('Aydınlatma ve Açık Rıza metnini okuyup onaylayınız');
      return;
    }

    setKvkkError(null);
    setIsLoading(true);
    setError(null);

    try {
      // Seyahat Sağlık için ek 18 yaş kontrolü (2. step uyarısı için sadece state güncelle)
      if (branchConfig.id === 'seyahat-saglik' && values.birthDate) {
        const age = calculateAge(values.birthDate);
        setIsUnderAge(age < 18);
      } else if (branchConfig.id === 'seyahat-saglik') {
        setIsUnderAge(false);
      }

      // Validate
      await personalInfoValidationSchema.validate({
        identityNumber: values.identityNumber,
        email: values.email,
        phoneNumber: values.phoneNumber,
        birthDate: values.birthDate,
      }, { abortEarly: false });
    } catch (err: any) {
      if (err.errors?.length > 0) {
        setError(err.errors[0]);
        setIsLoading(false);
        return;
      }
    }

    try {
      // Store initial values
      localStorage.setItem(storageKeys.INITIAL_EMAIL, values.email);
      localStorage.setItem(storageKeys.INITIAL_JOB, values.job.toString());

      if (!accessToken) {
        // Need to login
        const cleanPhone = values.phoneNumber.replace(/\D/g, '');
        
        // VKN kontrolü: 10 haneli ise Company, 11 haneli ise Individual
        const isVKN = values.identityNumber.length === 10;
        const customerType = isVKN ? CustomerType.Company : CustomerType.Individual;
        const identityOrTaxNumber = isVKN ? values.identityNumber : parseInt(values.identityNumber);
        
        const loginData = await performLogin(
          identityOrTaxNumber,
          isVKN ? undefined : values.birthDate,
          cleanPhone,
          agentId,
          customerType
        );

        if (loginData.token) {
          setTempToken(loginData.token);
          setShowVerification(true);
        }
      } else {
        // Already logged in, check profile
        await checkProfileAndProceed();
      }
    } catch (error: any) {
      if (error?.status === 404 || error?.codes?.includes('RESOURCE_NOT_FOUND_DATABASE')) {
        setShowPhoneNotMatchModal(true);
      } else {
        setError(error instanceof Error ? error.message : 'Bir hata oluştu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = async (code: string) => {
    if (!tempToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const verifyData = await verifyOTP(tempToken, code);

      if (!verifyData.accessToken) {
        setError('Doğrulama başarısız oldu.');
        setIsLoading(false);
        return;
      }

      setTokens(verifyData.accessToken, verifyData.refreshToken);
      setShowVerification(false);

      // Scroll to banner after modal closes
      scrollToBannerTop();

      // Check profile after verification
      setTimeout(() => {
        checkProfileAndProceed();
      }, 500);
    } catch (error) {
      setError('Doğrulama kodu hatalı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const cleanPhone = formik.values.phoneNumber.replace(/\D/g, '');
      
      const isVKN = formik.values.identityNumber.length === 10;
      const customerType = isVKN ? CustomerType.Company : CustomerType.Individual;
      const identityOrTaxNumber = isVKN ? formik.values.identityNumber : parseInt(formik.values.identityNumber);
      
      const loginData = await performLogin(
        identityOrTaxNumber,
        isVKN ? undefined : formik.values.birthDate,
        cleanPhone,
        agentId,
        customerType
      );
      if (loginData.token) {
        setTempToken(loginData.token);
      }
    } catch (error: any) {
      if (error?.status === 404 || error?.codes?.includes('RESOURCE_NOT_FOUND_DATABASE')) {
        setShowPhoneNotMatchModal(true);
      } else {
        console.error('Kod tekrar gönderilirken hata:', error);
      }
    }
  };

  const handleAdditionalInfoSubmit = async () => {
    const values = formik.values;

    // Validate
    const errors: Record<string, string> = {};
    if (!values.fullName?.trim()) errors.fullName = 'Ad Soyad gereklidir';
    if (!values.city?.trim()) errors.city = 'İl seçimi gereklidir';
    if (!values.district?.trim()) errors.district = 'İlçe seçimi gereklidir';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    setFieldErrors({});
    setError(null);

    try {
      // Get stored values
      const storedEmail = localStorage.getItem(storageKeys.INITIAL_EMAIL);
      const storedJob = localStorage.getItem(storageKeys.INITIAL_JOB);

      // Get current customer ID and profile
      const meResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
      const currentMeData = await meResponse.json();
      const currentCustomerId = customerId || currentMeData.id;

      // CustomerType belirleme
      const customerType = currentMeData.taxNumber || currentMeData.type === 'company' 
        ? CustomerType.Company 
        : CustomerType.Individual;

      // Build update payload
      const updatePayload: Record<string, any> = {
        primaryPhoneNumber: currentMeData.primaryPhoneNumber,
        cityReference: values.city,
        districtReference: values.district,
      };

      if (customerType === CustomerType.Individual) {
        updatePayload.fullName = values.fullName;
        if (currentMeData.identityNumber) {
          updatePayload.identityNumber = currentMeData.identityNumber;
        }
        if (currentMeData.birthDate) {
          updatePayload.birthDate = currentMeData.birthDate;
        }
      } else {
        if (currentMeData.taxNumber) {
          updatePayload.taxNumber = currentMeData.taxNumber;
        }
        updatePayload.title = values.fullName.trim() || (currentMeData as any).title || '';
      }

      if (storedEmail) updatePayload.primaryEmail = storedEmail;
      if (storedJob) {
        const jobNames = ['UNKNOWN', 'BANKER', 'CORPORATE_EMPLOYEE', 'LTD_EMPLOYEE', 'POLICE', 'MILITARY_PERSONNEL',
          'RETIRED_SPOUSE', 'TEACHER', 'DOCTOR', 'PHARMACIST', 'NURSE', 'HEALTHCARE_WORKER',
          'LAWYER', 'JUDGE', 'PROSECUTOR', 'FREELANCER', 'FARMER', 'INSTRUCTOR',
          'RELIGIOUS_OFFICIAL', 'ASSOCIATION_MANAGER', 'OFFICER', 'RETIRED', 'HOUSEWIFE'];
        updatePayload.job = jobNames[parseInt(storedJob)] || 'UNKNOWN';
      }

      // Update profile
      const updatedProfile = await updateCustomerProfile(updatePayload, currentCustomerId, customerType);

      setCustomerId(currentCustomerId);
      setUser({
        id: currentCustomerId,
        name: updatedProfile.fullName || '',
        email: updatedProfile.primaryEmail || '',
        phone: updatedProfile.primaryPhoneNumber?.number || '',
      });

      setShowAdditionalInfo(false);
      if (!step1EventFired) {
        pushOfflineStep1Complete(branchConfig.dataLayerEventPrefix);
        setStep1EventFired(true);
      }
      setActiveStep(1);
      scrollToBannerTop();
    } catch (error) {
      setError('Bilgiler güncellenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    // Seyahat Sağlık'ta 18 yaş altı için talep oluşturmayı engelle
    if (branchConfig.id === 'seyahat-saglik' && isUnderAge) {
      setError('Seyahat Sağlık Sigortası için 18 yaşından büyük olmanız gerekmektedir.');
      setRequestResult('error');
      return;
    }
    if (!customerId) {
      setError('Müşteri bilgisi bulunamadı. Lütfen sayfayı yenileyin.');
      setRequestResult('error');
      return;
    }

    if (!accessToken) {
      setError('Oturum bilgisi bulunamadı. Lütfen sayfayı yenileyin.');
      setRequestResult('error');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRequestResult('idle');

    try {
      const requestPayload = {
        customerId: customerId,
        customerAssetReference: null,
        productBranch: branchConfig.productBranch,
        channel: "OFFLINE_PROPOSAL_FORM"
      };

      const response = await fetchWithAuth(API_ENDPOINTS.CASES_NEW_SALE_OPPORTUNITY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        let errorMessage = `Talep oluşturulamadı: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          
          // 409 hatası ve CASE_OPEN_NEW_SALE_CASE_EXISTS kodu kontrolü
          if (response.status === 409 || 
              errorData.codes?.includes('CASE_OPEN_NEW_SALE_CASE_EXISTS') ||
              errorData.codes?.includes('RESOURCE_DUPLICATE_WITH_ERROR') ||
              errorData.detail?.includes('zaten açık bir yeni satış fırsatı talebi bulunmaktadır')) {
            setRequestResult('existing');
            setIsLoading(false);
            scrollToBannerTop();
            return;
          }
          
          // Diğer hata mesajları
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
            errorMessage = errorData.errors[0];
          } else if (errorData.title) {
            errorMessage = errorData.title;
          }
        } catch (parseError) {
          // JSON parse hatası
        }
        
        if (response.status === 401) {
          errorMessage = 'Oturum süreniz dolmuş. Lütfen sayfayı yenileyin ve tekrar deneyin.';
        } else if (response.status === 400) {
          errorMessage = 'Geçersiz talep bilgileri. Lütfen bilgilerinizi kontrol edin.';
        }
        
        setRequestResult('error');
        throw new Error(errorMessage);
      }

      // Analytics event
      pushOfflineRequestCreated(branchConfig.dataLayerEventPrefix);
      
      setRequestResult('success');
      scrollToBannerTop();
      
      if (onRequestCreated) {
        onRequestCreated();
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Talep oluşturulurken bir hata oluştu';
      setError(errorMessage);
      if (requestResult !== 'existing') {
        setRequestResult('error');
        scrollToBannerTop();
      }
      pushOfflineRequestFailed(branchConfig.dataLayerEventPrefix);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  // Kurumsal müşteri - talep oluşturamaz
  if (isCorporateCustomer) {
    return (
      <div className="product-page-flow-container pp-offline-page-flow">
        <OfflineStepper branchConfig={branchConfig} activeStep={0} />
        <CorporateNotAllowedStep branchConfig={branchConfig} />
      </div>
    );
  }

  // Render Additional Info Form
  if (showAdditionalInfo) {
    return (
      <div className="product-page-flow-container pp-offline-page-flow">
        <OfflineStepper branchConfig={branchConfig} activeStep={0} />
        <AdditionalInfoStep
          branchConfig={branchConfig}
          formik={formik}
          isLoading={isLoading}
          error={error}
          cities={cities}
          districts={districts}
          onCityChange={fetchDistricts}
          onSubmit={handleAdditionalInfoSubmit}
          fieldErrors={fieldErrors}
        />
      </div>
    );
  }

  return (
    <div className="product-page-flow-container pp-offline-page-flow">
      <OfflineStepper branchConfig={branchConfig} activeStep={activeStep} />

      <form onSubmit={formik.handleSubmit}>
        {activeStep === 0 && (
          <PersonalInfoStep
            branchConfig={branchConfig}
            formik={formik}
            isLoading={isLoading}
            error={error}
            kvkkConsent={kvkkConsent}
            marketingConsent={marketingConsent}
            kvkkError={kvkkError}
            accessToken={accessToken}
            onKvkkChange={(value) => {
              setKvkkConsent(value);
              if (kvkkError) setKvkkError(null);
              if (error) setError(null);
            }}
            onMarketingChange={setMarketingConsent}
            onSubmit={() => handleStep1Submit(formik.values)}
          />
        )}

        {activeStep === 1 && (
          <RequestStep
            branchConfig={branchConfig}
            isLoading={isLoading}
            requestResult={requestResult}
            error={error}
            isUnderAge={isUnderAge}
            onCreateRequest={handleCreateRequest}
            onGoHome={handleGoHome}
          />
        )}
      </form>

      {/* Verification Modal */}
      <VerificationCodeModal
        isOpen={showVerification}
        phoneNumber={formik.values.phoneNumber}
        onVerify={handleVerificationComplete}
        onResend={handleResendOTP}
        onCancel={() => setShowVerification(false)}
      />

      {/* Phone Not Match Modal */}
      <PhoneNotMatchModal
        isOpen={showPhoneNotMatchModal}
        onClose={() => setShowPhoneNotMatchModal(false)}
      />
    </div>
  );
};

export default OfflineProductForm;

