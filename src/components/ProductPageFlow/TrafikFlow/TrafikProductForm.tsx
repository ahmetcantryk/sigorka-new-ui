/**
 * TrafikProductForm
 * 
 * Ürün detay sayfası için Trafik formu
 * Kasko form yapısından adapte edildi
 */

'use client';

import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';

// Config
import {
  TRAFIK_FORM_DEFAULTS,
  TRAFIK_STORAGE_KEYS,
} from './config/trafikConstants';
import {
  personalInfoValidationSchema,
  vehicleValidationSchema,
} from './config/trafikValidation';

// Components
import { PersonalInfoStep, VehicleSelectionStep, AdditionalInfoStep } from './components/steps';
import { TrafikStepper, TramerErrorPopup } from './components/common';
import { DuplicateVehiclePopup } from '../common';
import VerificationCodeModal from '../shared/VerificationCodeModal';
import { UpdateVehicleModal } from '../common';
import TrafikProductQuote from './TrafikProductQuote';
import PurchaseStepNew from '../../QuoteFlow/KaskoQuote/steps/PurchaseStepNew';
import PhoneNotMatchModal from '@/components/common/PhoneNotMatchModal';

// Hooks
import { useTrafikVehicle } from './hooks/useTrafikVehicle';

// Utils
import { pushTrafikStep1Complete, pushTrafikStep2Complete } from './utils/dataLayerUtils';

// Auth helpers
import { performLogin, verifyOTP, CustomerType, updateCustomerProfile } from '@/utils/authHelper';
import type { CustomerProfile } from '@/services/fetchWithAuth';

// Types
import type { TrafikFormProps, VehicleFormData } from './types';

const TrafikProductForm = ({ onProposalCreated, onBack }: TrafikFormProps) => {
  const { customerId, accessToken, setTokens, setUser, setCustomerId } = useAuthStore();
  const agencyConfig = useAgencyConfig();
  const agentId = agencyConfig?.agency?.id;

  // URL parametreleri
  const [proposalIdFromUrl, setProposalIdFromUrl] = useState<string | null>(null);
  const [productIdFromUrl, setProductIdFromUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setProposalIdFromUrl(params.get('proposalId'));
      setProductIdFromUrl(params.get('productId'));
    }
  }, []);

  // Step yönetimi
  const getInitialStep = () => {
    if (productIdFromUrl && proposalIdFromUrl) return 3;
    if (accessToken) return 1;
    return 0;
  };

  const [activeStep, setActiveStep] = useState(getInitialStep());

  // Step değiştiğinde sayfayı en üste scroll et
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStep]);

  // Form state'leri
  const [selectionType, setSelectionType] = useState<'existing' | 'new'>('new');
  const [vehicleType, setVehicleType] = useState<'plated' | 'unplated'>('plated');
  const [vehicleDetailsStep, setVehicleDetailsStep] = useState(0);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Consent state'leri
  const [kvkkConsent, setKvkkConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [kvkkError, setKvkkError] = useState<string | null>(null);

  // Modal state'leri
  const [showVerification, setShowVerification] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showTramerErrorPopup, setShowTramerErrorPopup] = useState(false);
  const [showUpdateVehicleModal, setShowUpdateVehicleModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [showDuplicateVehiclePopup, setShowDuplicateVehiclePopup] = useState(false);
  const [duplicatePlateNumber, setDuplicatePlateNumber] = useState<string>('');
  const [showPhoneNotMatchModal, setShowPhoneNotMatchModal] = useState(false);

  // Vehicle hook
  const {
    vehicles,
    vehicleBrands,
    vehicleModels,
    plateCities,
    cities,
    districts,
    isLoading: isVehicleLoading,
    isModelsLoading,
    isTramerLoading,
    modelError,
    fetchModels,
    fetchDistricts,
    queryTramer,
    refetchVehicles,
    setModelError,
  } = useTrafikVehicle();

  // Formik
  const formik = useFormik<VehicleFormData>({
    initialValues: TRAFIK_FORM_DEFAULTS,
    validationSchema: activeStep === 0 ? personalInfoValidationSchema : vehicleValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      await handleFormSubmit(values);
    },
  });

  // Login olduğunda step 1'e geç
  useEffect(() => {
    if (accessToken && activeStep === 0) {
      setActiveStep(1);
    }
  }, [accessToken]);

  // Kayıtlı araç varsa existing tab'ı seç
  useEffect(() => {
    if (vehicles.length > 0) {
      setSelectionType('existing');
      formik.setFieldValue('selectionType', 'existing');
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles]);

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

  // URL güncelleme
  const updateUrlParams = (params: { proposalId?: string; productId?: string }) => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    if (params.proposalId) url.searchParams.set('proposalId', params.proposalId);
    if (params.productId) url.searchParams.set('productId', params.productId);

    window.history.pushState({}, '', url.toString());
    setProposalIdFromUrl(params.proposalId || null);
    setProductIdFromUrl(params.productId || null);
  };

  // Coverage group IDs
  const getCoverageGroupIds = (branch: string): string[] | null => {
    if (!agencyConfig?.coverageGroupIds) return null;
    const coverageIds = agencyConfig.coverageGroupIds[branch as keyof typeof agencyConfig.coverageGroupIds];
    return coverageIds && coverageIds.length > 0 ? coverageIds : null;
  };

  // Handlers
  const handlePurchaseClick = (quoteId: string) => {
    console.log('🛒 Satın Al tıklandı:', quoteId);

    // LocalStorage'a kaydet (PurchaseStepNew için)
    const selectedQuote = localStorage.getItem('selectedQuoteForPurchaseTrafik');
    if (selectedQuote) {
      const quoteData = JSON.parse(selectedQuote);
      localStorage.setItem('selectedQuoteForPurchaseTrafik', JSON.stringify({
        ...quoteData,
        id: quoteId
      }));
    }

    if (proposalIdFromUrl) {
      updateUrlParams({ proposalId: proposalIdFromUrl, productId: quoteId });
    }
    setActiveStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProposalCreated = (proposalId: string) => {
    console.log('✅ Proposal oluşturuldu:', proposalId);
    updateUrlParams({ proposalId });
    setActiveStep(2);
    if (onProposalCreated) onProposalCreated(proposalId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Personal info submit
  const handlePersonalInfoSubmit = async () => {
    console.log('🔵 handlePersonalInfoSubmit called');

    formik.setTouched({
      identityNumber: true,
      email: true,
      phoneNumber: true,
      birthDate: true,
    });

    // KVKK kontrolü
    if (!kvkkConsent) {
      setKvkkError('Aydınlatma ve Açık Rıza metnini okuyup onaylayınız');
    } else {
      setKvkkError(null);
    }

    // Validation
    try {
      await personalInfoValidationSchema.validate({
      identityNumber: formik.values.identityNumber,
      email: formik.values.email,
      phoneNumber: formik.values.phoneNumber,
      birthDate: formik.values.birthDate,
      }, { abortEarly: false });
    } catch (err: any) {
      if (err.errors?.length > 0) {
        setError(err.errors[0]);
      return;
    }
    }

    if (!kvkkConsent) return;

    // Email ve job kaydet
    console.log('=== Storing initial values ===');
    if (formik.values.email?.trim()) {
      localStorage.setItem(TRAFIK_STORAGE_KEYS.INITIAL_EMAIL, formik.values.email.trim());
      console.log('✅ Saved trafikInitialEmail:', formik.values.email.trim());
    }
    if (formik.values.job !== undefined) {
      localStorage.setItem(TRAFIK_STORAGE_KEYS.INITIAL_JOB, formik.values.job.toString());
      console.log('✅ Saved trafikInitialJob:', formik.values.job.toString());
    }

    // Zaten login ise
    if (accessToken) {
      console.log('✅ Already authenticated, checking if email/job needs update');
      
      // E-posta veya meslek güncellemesi gerekebilir
      const userEnteredEmail = formik.values.email?.trim() || localStorage.getItem(TRAFIK_STORAGE_KEYS.INITIAL_EMAIL);
      const userEnteredJob = formik.values.job !== undefined ? formik.values.job : (localStorage.getItem(TRAFIK_STORAGE_KEYS.INITIAL_JOB) ? parseInt(localStorage.getItem(TRAFIK_STORAGE_KEYS.INITIAL_JOB)!) : null);
      
      if (userEnteredEmail || (userEnteredJob !== null && userEnteredJob !== undefined)) {
        try {
          setIsLoading(true);
          
          // Mevcut profil bilgilerini al
          let meResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
          let meData: CustomerProfile | null = null;
          if (meResponse.ok) {
            meData = await meResponse.json();
          }
          
          if (meData && customerId) {
            // E-posta veya meslek güncellemesi yap
            await updateUserProfileWithCurrentData(meData, userEnteredEmail || null, userEnteredJob, customerId);
          }
        } catch (error) {
          console.warn('Email/Job update hatası:', error);
          // Hata olsa bile devam et
        } finally {
          setIsLoading(false);
        }
      }
      
      setActiveStep(1);
      return;
    }

    // OTP gönder
    console.log('📤 Sending OTP...');
    try {
      setIsLoading(true);
      setError(null);

      const cleanPhoneNumber = formik.values.phoneNumber.replace(/\D/g, '');
      
      // VKN kontrolü: 10 haneli ise Company, 11 haneli ise Individual
      const isVKN = formik.values.identityNumber.length === 10;
      const customerType = isVKN ? CustomerType.Company : CustomerType.Individual;
      const identityOrTaxNumber = isVKN ? formik.values.identityNumber : parseInt(formik.values.identityNumber);
      
      console.log('Sending login request with:', {
        identityOrTaxNumber,
        birthDate: isVKN ? undefined : formik.values.birthDate,
        phoneNumber: cleanPhoneNumber,
        agentId: agentId,
        customerType
      });

      const loginResponse = await performLogin(
        identityOrTaxNumber,
        isVKN ? undefined : formik.values.birthDate,
        cleanPhoneNumber,
        agentId,
        customerType
      );

      console.log('Login response:', loginResponse);

      if (loginResponse.token) {
        setTempToken(loginResponse.token);
        setShowVerification(true);
        console.log('✅ OTP sent, opening modal');
      } else {
        throw new Error('OTP gönderilemedi');
      }
    } catch (err: any) {
      // 404 hatası ve RESOURCE_NOT_FOUND_DATABASE kodu kontrolü
      if (err?.status === 404 || err?.codes?.includes('RESOURCE_NOT_FOUND_DATABASE')) {
        setShowPhoneNotMatchModal(true);
      } else {
      setError(err instanceof Error ? err.message : 'Doğrulama kodu gönderilemedi');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verification
  const handleVerifyCode = async (code: string) => {
    if (!tempToken) throw new Error('Token bulunamadı');

    try {
      setIsLoading(true);
      const verifyData = await verifyOTP(tempToken, code);

      if (!verifyData.accessToken) throw new Error('Kimlik doğrulama başarısız oldu');

      setTokens(verifyData.accessToken, verifyData.refreshToken);

      const userEnteredEmail = localStorage.getItem(TRAFIK_STORAGE_KEYS.INITIAL_EMAIL);
      const userEnteredJobStr = localStorage.getItem(TRAFIK_STORAGE_KEYS.INITIAL_JOB);
      const userEnteredJob = userEnteredJobStr ? parseInt(userEnteredJobStr) : null;

      // Fetch customer profile
      let meResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
      let meData: CustomerProfile | null = null;
      if (meResponse.ok) {
        meData = await meResponse.json();
      }

      const cityValue = typeof meData?.city === 'object' && meData?.city ? (meData.city as any).value : meData?.city;
      const districtValue = typeof meData?.district === 'object' && meData?.district ? (meData.district as any).value : meData?.district;
      const customerType = (meData as any)?.taxNumber || (meData as any)?.type === 'company' 
        ? CustomerType.Company 
        : CustomerType.Individual;
      // Company müşterileri için title, Individual müşteriler için fullName kontrol et
      const nameField = customerType === CustomerType.Company 
        ? ((meData as any)?.title || meData?.fullName)
        : meData?.fullName;
      const isDataComplete = meData && nameField && cityValue && districtValue;
      let customerIdToUse = verifyData.customerId || meData?.id;

      if (customerIdToUse) {
        setCustomerId(customerIdToUse);
        setUser({
          id: customerIdToUse,
          name: customerType === CustomerType.Company 
            ? ((meData as any)?.title || meData?.fullName || '')
            : (meData?.fullName || ''),
          email: meData?.primaryEmail || '',
          phone: meData?.primaryPhoneNumber?.number || ''
        });
        localStorage.setItem(TRAFIK_STORAGE_KEYS.PROPOSAL_ID, customerIdToUse);
      }

      // Update email and job
      if (customerIdToUse && (userEnteredEmail || userEnteredJob)) {
        try {
          await updateUserProfileWithCurrentData(meData, userEnteredEmail, userEnteredJob, customerIdToUse);
        } catch (error) {
          console.warn('Email/Job update hatası:', error);
        }
      }

      if (!isDataComplete) {
        if (cityValue) await fetchDistricts(cityValue);
        const customerType = (meData as any)?.taxNumber || (meData as any)?.type === 'company' 
          ? CustomerType.Company 
          : CustomerType.Individual;
        formik.setValues(prev => ({
          ...prev,
          fullName: customerType === CustomerType.Company 
            ? ((meData as any)?.title || meData?.fullName || '')
            : (meData?.fullName || ''),
          city: cityValue || '',
          district: districtValue || '',
        }), false);
        setShowAdditionalInfo(true);
        setShowVerification(false);
        // Sayfa başına scroll
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        // OTP doğrulaması sonrası veri tamamsa step1 event'ini gönder
        pushTrafikStep1Complete();
        setShowVerification(false);
        setActiveStep(1);
        // Sayfa başına scroll
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Doğrulama başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to update user profile
  const updateUserProfileWithCurrentData = async (
    currentMeData: CustomerProfile | null,
    userEmail: string | null,
    userJob: number | null,
    customerIdToUse: string
  ) => {
    try {
      // CustomerType belirleme: taxNumber varsa veya type === 'company' ise Company
      const customerType = currentMeData && ((currentMeData as any).taxNumber || (currentMeData as any).type === 'company')
        ? CustomerType.Company 
        : CustomerType.Individual;

      const updatePayload: Record<string, any> = {
        primaryPhoneNumber: currentMeData?.primaryPhoneNumber,
      };

      // Individual için identityNumber ve birthDate ekle
      if (customerType === CustomerType.Individual) {
        if (currentMeData?.identityNumber) updatePayload.identityNumber = currentMeData.identityNumber;
        if (currentMeData?.birthDate) updatePayload.birthDate = currentMeData.birthDate;
      if (currentMeData?.fullName) updatePayload.fullName = currentMeData.fullName;
      if (currentMeData?.gender) updatePayload.gender = currentMeData.gender;
      if (currentMeData?.educationStatus) updatePayload.educationStatus = currentMeData.educationStatus;
      if (currentMeData?.nationality) updatePayload.nationality = currentMeData.nationality;
      if (currentMeData?.maritalStatus) updatePayload.maritalStatus = currentMeData.maritalStatus;
      if (currentMeData?.representedBy) updatePayload.representedBy = currentMeData.representedBy;
      } else {
        // Company için taxNumber ve title ekle
        if ((currentMeData as any)?.taxNumber) updatePayload.taxNumber = (currentMeData as any).taxNumber;
        updatePayload.title = (currentMeData as any)?.title || currentMeData?.fullName || '';
      }

      const cityValue = typeof currentMeData?.city === 'object' && currentMeData?.city ? (currentMeData.city as any).value : currentMeData?.city;
      const districtValue = typeof currentMeData?.district === 'object' && currentMeData?.district ? (currentMeData.district as any).value : currentMeData?.district;
      if (cityValue) updatePayload.cityReference = cityValue;
      if (districtValue) updatePayload.districtReference = districtValue;

      if (userEmail && userEmail.trim()) {
        updatePayload.primaryEmail = userEmail.trim();
      } else if (currentMeData?.primaryEmail) {
        updatePayload.primaryEmail = currentMeData.primaryEmail;
      }

      if (userJob && userJob !== 0) {
        updatePayload.job = userJob;
      } else if (currentMeData?.job) {
        updatePayload.job = currentMeData.job;
      }

      const updatedProfile = await updateCustomerProfile(updatePayload, customerIdToUse, customerType);
      setUser({
        id: customerIdToUse,
        name: updatedProfile.fullName || currentMeData?.fullName || '',
        email: updatedProfile.primaryEmail || updatePayload.primaryEmail || '',
        phone: updatedProfile.primaryPhoneNumber?.number || currentMeData?.primaryPhoneNumber?.number || ''
      });
    } catch (updateError) {
      console.warn('Profile update hatası:', updateError);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      const cleanPhoneNumber = formik.values.phoneNumber.replace(/\D/g, '');
      
      // VKN kontrolü: 10 haneli ise Company, 11 haneli ise Individual
      const isVKN = formik.values.identityNumber.length === 10;
      const customerType = isVKN ? CustomerType.Company : CustomerType.Individual;
      const identityOrTaxNumber = isVKN ? formik.values.identityNumber : parseInt(formik.values.identityNumber);
      
      const loginResponse = await performLogin(
        identityOrTaxNumber,
        isVKN ? undefined : formik.values.birthDate,
        cleanPhoneNumber,
        agentId,
        customerType
      );

      if (loginResponse.token) {
        setTempToken(loginResponse.token);
      }
    } catch (err: any) {
      // 404 hatası ve RESOURCE_NOT_FOUND_DATABASE kodu kontrolü
      if (err?.status === 404 || err?.codes?.includes('RESOURCE_NOT_FOUND_DATABASE')) {
        setShowPhoneNotMatchModal(true);
      } else {
      throw new Error(err instanceof Error ? err.message : 'Kod gönderilemedi');
      }
    }
  };

  // Additional info submit
  const handleAdditionalInfoSubmit = async () => {
    if (!formik.values.fullName || !formik.values.city || !formik.values.district) {
      setError('Lütfen tüm alanları doldurunuz');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const currentMeResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
      if (!currentMeResponse.ok) {
        throw new Error('Güncel kullanıcı bilgileri alınamadı');
      }

      const currentMeData = await currentMeResponse.json() as CustomerProfile;
      const customerIdToUse = customerId || currentMeData.id;

      if (!customerIdToUse) {
        throw new Error('Müşteri ID bulunamadı');
      }

      // CustomerType belirleme: taxNumber varsa veya type === 'company' ise Company
      const customerType = (currentMeData as any).taxNumber || (currentMeData as any).type === 'company' 
        ? CustomerType.Company 
        : CustomerType.Individual;

      const userEnteredEmail = localStorage.getItem(TRAFIK_STORAGE_KEYS.INITIAL_EMAIL);
      const userEnteredJobStr = localStorage.getItem(TRAFIK_STORAGE_KEYS.INITIAL_JOB);

      const updatePayload: Record<string, any> = {
        primaryPhoneNumber: currentMeData.primaryPhoneNumber,
        cityReference: formik.values.city.trim(),
        districtReference: formik.values.district.trim(),
      };

      // Individual için identityNumber ve birthDate ekle
      if (customerType === CustomerType.Individual) {
        updatePayload.identityNumber = currentMeData.identityNumber;
        if (currentMeData.birthDate) {
          updatePayload.birthDate = currentMeData.birthDate;
        }
        updatePayload.fullName = formik.values.fullName.trim();
        updatePayload.gender = currentMeData.gender;
        updatePayload.educationStatus = currentMeData.educationStatus;
        updatePayload.nationality = currentMeData.nationality;
        updatePayload.maritalStatus = currentMeData.maritalStatus;
        updatePayload.representedBy = currentMeData.representedBy;
      } else {
        // Company için taxNumber ve title ekle
        updatePayload.taxNumber = (currentMeData as any).taxNumber;
        updatePayload.title = formik.values.fullName.trim() || (currentMeData as any).title || '';
      }

      if (userEnteredEmail && userEnteredEmail.trim()) {
        updatePayload.primaryEmail = userEnteredEmail.trim();
      } else if (currentMeData.primaryEmail) {
        updatePayload.primaryEmail = currentMeData.primaryEmail;
      }

      const userEnteredJob = userEnteredJobStr ? parseInt(userEnteredJobStr) : null;
      if (userEnteredJob !== undefined && userEnteredJob !== null && !isNaN(userEnteredJob)) {
        updatePayload.job = userEnteredJob;
      } else if (currentMeData.job !== undefined && currentMeData.job !== null) {
        updatePayload.job = currentMeData.job;
      }

      const updatedProfile = await updateCustomerProfile(updatePayload, customerIdToUse, customerType);

      setUser({
        id: customerIdToUse,
        name: updatedProfile.fullName || formik.values.fullName,
        email: updatedProfile.primaryEmail || userEnteredEmail || '',
        phone: updatedProfile.primaryPhoneNumber?.number || currentMeData.primaryPhoneNumber?.number || '',
      });

      if (customerIdToUse) {
        localStorage.setItem(TRAFIK_STORAGE_KEYS.PROPOSAL_ID, customerIdToUse);
      }

      localStorage.setItem(TRAFIK_STORAGE_KEYS.PERSONAL_INFO_COMPLETED, 'true');

      pushTrafikStep1Complete();
      setShowAdditionalInfo(false);
      setActiveStep(1);
      // Sayfa başına scroll
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (error) {
      setError('Bilgiler güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
     
    } finally {
      setIsLoading(false);
    }
  };

  // Tramer query
  const handleTramerQuery = async () => {
    if (vehicleType === 'unplated') {
      setVehicleDetailsStep(1);
      return;
    }

    if (!formik.values.plateCity || !formik.values.plateCode) {
      setError('Plaka bilgileri eksik');
      return;
    }

    const result = await queryTramer(
      formik.values.plateCity,
      formik.values.plateCode,
      formik.values.documentSerialCode,
      formik.values.documentSerialNumber
    );

    if (result) {
      formik.setValues({
        ...formik.values,
        brandCode: result.model?.brand?.value || '',
        modelCode: result.model?.type?.value || '',
        year: result.model?.year?.toString() || '',
        engineNo: result.engine || '',
        chassisNo: result.chassis || '',
        registrationDate: result.registrationDate || '',
        seatCount: result.seatNumber?.toString() || '',
        usageType: result.usageTypeValue || '',
        fuelType: result.fuelTypeValue || '',
      });

      if (result.model?.brand?.value && result.model?.year) {
        await fetchModels(result.model.brand.value, result.model.year.toString());
        
        // Model listesi yüklendikten sonra model değerini seç
        setTimeout(() => {
          if (result.model?.type?.value) {
            formik.setFieldValue('modelCode', result.model.type.value);
          }
        }, 100);
      }

      setVehicleDetailsStep(1);
    } else {
      setShowTramerErrorPopup(true);
      formik.setValues({
        ...formik.values,
        registrationDate: '',
        seatCount: '',
        usageType: '',
        fuelType: '',
      });
      setVehicleDetailsStep(1);
    }
  };

  // Brand change
  const handleBrandChange = async (brandCode: string) => {
    setModelError(null);
    formik.setFieldValue('brandCode', brandCode);
    const brand = vehicleBrands.find(b => b.value === brandCode);
    if (brand) formik.setFieldValue('brand', brand.text);

    formik.setFieldValue('modelCode', '');
    formik.setFieldValue('model', '');

    if (formik.values.year?.length === 4) {
      const year = parseInt(formik.values.year);
      const currentYear = new Date().getFullYear();
      if (year >= 1900 && year <= currentYear) {
        await fetchModels(brandCode, formik.values.year);
      }
    }
  };

  // Year change
  const handleYearChange = async (year: string) => {
    setModelError(null);
    formik.setFieldValue('year', year);
    formik.setFieldTouched('year', true);
    formik.setFieldValue('modelCode', '');
    formik.setFieldValue('model', '');

    if (formik.values.brandCode && year.length === 4) {
      const yearNum = parseInt(year);
      const currentYear = new Date().getFullYear();
      if (yearNum >= 1900 && yearNum <= currentYear) {
        await fetchModels(formik.values.brandCode, year);
      }
    }
  };

  // Form submit
  const handleFormSubmit = async (values: VehicleFormData) => {
    if (!accessToken || !customerId) {
      setError('Oturum bilgisi bulunamadı');
        return;
      }

    setIsLoading(true);
    setError(null);

    try {
      if (selectionType === 'existing' && selectedVehicleId) {
        const vehicle = vehicles.find(v => v.id === selectedVehicleId);
        if (!vehicle) throw new Error('Seçilen araç bulunamadı');

        const proposalData = {
          $type: 'trafik',
          vehicleId: vehicle.id,
          productBranch: 'TRAFIK',
          insurerCustomerId: customerId,
          insuredCustomerId: customerId,
          coverageGroupIds: getCoverageGroupIds('trafik'),
          channel: 'WEBSITE',
        };

        const response = await fetchWithAuth(API_ENDPOINTS.PROPOSALS_CREATE, {
          method: 'POST',
            headers: {
            'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          body: JSON.stringify(proposalData),
        });

        if (!response.ok) throw new Error('Teklif oluşturulamadı');

        const result = await response.json();
        const proposalId = result.proposalId || result.id;

        if (proposalId) {
          localStorage.setItem(TRAFIK_STORAGE_KEYS.PROPOSAL_ID, proposalId);
          pushTrafikStep2Complete();
          handleProposalCreated(proposalId);
        }
      } else {
        // Yeni araç ekleme
        console.log('🚗 Yeni araç ekleme başladı...');

        const vehicleData = {
          customerId,
        plate: {
            city: parseInt(values.plateCity) || 0,
            code: vehicleType === 'plated' ? values.plateCode : '',
          },
          modelYear: parseInt(values.year),
          brandReference: values.brandCode,
          modelTypeReference: values.modelCode,
          utilizationStyle: parseInt(values.usageType.toString()),
          fuel: {
            type: parseInt(values.fuelType.toString()),
            customLpg: false,
            customLpgPrice: null,
          },
          engine: values.engineNo,
          chassis: values.chassisNo,
          ...(vehicleType === 'plated' && values.documentSerialCode && values.documentSerialNumber && {
          documentSerial: {
              code: values.documentSerialCode,
              number: values.documentSerialNumber,
          },
        }),
          registrationDate: values.registrationDate,
          seatNumber: parseInt(values.seatCount),
          accessories: [],
          kaskoOldPolicy: null,
          trafikOldPolicy: null,
          lossPayeeClause: null,
        };

        console.log('📦 Araç verisi hazırlandı:', vehicleData);

        // 1. ADIM: Araç oluştur
        console.log('📡 Araç kayıt isteği gönderiliyor...');
        const vehicleResponse = await fetchWithAuth(
          API_ENDPOINTS.CUSTOMER_VEHICLES_BY_ID(customerId),
          {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
            body: JSON.stringify(vehicleData),
          }
        );

        console.log('📥 Araç kayıt yanıtı:', vehicleResponse.status);

        if (!vehicleResponse.ok) {
          const errorText = await vehicleResponse.text();
          
          
          // Duplicate araç hatası kontrolü
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.status === 409 && 
                (errorData.codes?.includes('RESOURCE_DUPLICATE_WITH_ERROR') || 
                 errorData.codes?.includes('CUSTOMER_DUPLICATE_VEHICLE_BY_PLATE'))) {
              // Plaka numarasını al
              const plateNumber = `${formik.values.plateCity} ${formik.values.plateCode}`.trim();
              setDuplicatePlateNumber(plateNumber);
              setShowDuplicateVehiclePopup(true);
              setIsLoading(false);
              return;
            }
          } catch (parseError) {
            // JSON parse hatası, normal hata mesajı göster
          }
          
          throw new Error(`Araç kaydı oluşturulamadı: ${errorText || vehicleResponse.statusText}`);
        }

        const vehicleResult = await vehicleResponse.json();
        console.log('✅ Araç kaydedildi:', vehicleResult);

        const vehicleId = vehicleResult.id;

        if (!vehicleId) {
       
          throw new Error('Araç ID alınamadı');
        }

        console.log('🆔 Araç ID:', vehicleId);

        // 2. ADIM: Teklif oluştur
        console.log('📡 Teklif oluşturma isteği gönderiliyor...');
        const proposalData = {
          $type: 'trafik',
          vehicleId: vehicleId,
          productBranch: 'TRAFIK',
          insurerCustomerId: customerId,
          insuredCustomerId: customerId,
          coverageGroupIds: getCoverageGroupIds('trafik'),
          channel: 'WEBSITE',
        };

        console.log('📦 Teklif verisi:', proposalData);

        const proposalResponse = await fetchWithAuth(API_ENDPOINTS.PROPOSALS_CREATE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(proposalData),
        });

        console.log('📥 Teklif yanıtı:', proposalResponse.status);

        if (!proposalResponse.ok) {
          const errorText = await proposalResponse.text();
          
          throw new Error(`Teklif oluşturulamadı: ${errorText || proposalResponse.statusText}`);
        }

        const proposalResult = await proposalResponse.json();
        console.log('✅ Teklif oluşturuldu:', proposalResult);

        const proposalId = proposalResult.proposalId || proposalResult.id;

        if (proposalId) {
          localStorage.setItem(TRAFIK_STORAGE_KEYS.PROPOSAL_ID, proposalId);
          pushTrafikStep2Complete();
          console.log('🎉 İşlem başarılı, yönlendiriliyor:', proposalId);
          handleProposalCreated(proposalId);
        } else {
         
          throw new Error('Teklif ID alınamadı');
        }
      }
    } catch (error) {
  
      const errorMessage = (error as Error).message || 'Bir hata oluştu';
      setError(errorMessage);
      alert(`Hata: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Existing vehicle submit
  const handleExistingVehicleSubmit = async () => {
    if (!selectedVehicleId) return;
    await handleFormSubmit(formik.values);
  };

  // New vehicle submit
  const handleNewVehicleSubmit = () => {
    formik.setTouched({
      brandCode: true,
      year: true,
      modelCode: true,
      usageType: true,
      fuelType: true,
      registrationDate: true,
      engineNo: true,
      chassisNo: true,
      seatCount: true,
    });
    formik.handleSubmit();
  };

  // Edit vehicle
  const handleEditVehicle = (vehicleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVehicleId(vehicleId);
    setShowUpdateVehicleModal(true);
  };

  // Additional info render - TSS gibi tam sayfa görünümü
  if (showAdditionalInfo) {
    return (
      <div className="product-page-flow-container">
        <TrafikStepper activeStep={0} />
      <AdditionalInfoStep
        formik={formik}
        cities={cities}
        districts={districts}
        isLoading={isLoading}
        error={error}
        onCityChange={fetchDistricts}
        onSubmit={handleAdditionalInfoSubmit}
      />
      </div>
    );
  }

  return (
    <>
      <div className="product-page-flow-container">
        <TrafikStepper activeStep={activeStep} />

        <form onSubmit={formik.handleSubmit}>
          {activeStep === 0 && (
            <PersonalInfoStep
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
              onSubmit={handlePersonalInfoSubmit}
            />
          )}

          {activeStep === 1 && (
            <VehicleSelectionStep
              formik={formik}
              selectionType={selectionType}
              vehicleType={vehicleType}
              vehicleDetailsStep={vehicleDetailsStep}
              vehicles={vehicles}
              selectedVehicleId={selectedVehicleId}
              plateCities={plateCities}
              vehicleBrands={vehicleBrands}
              vehicleModels={vehicleModels}
              isLoading={isLoading}
              isTramerLoading={isTramerLoading}
              isModelsLoading={isModelsLoading}
              modelError={modelError}
              onSelectionTypeChange={(type) => {
                setSelectionType(type);
                formik.setFieldValue('selectionType', type);
                if (type === 'new') setVehicleDetailsStep(0);
              }}
              onVehicleTypeChange={(type) => {
                setVehicleType(type);
                formik.setFieldValue('vehicleType', type);
                setVehicleDetailsStep(0);
              }}
              onVehicleSelect={setSelectedVehicleId}
              onEditVehicle={handleEditVehicle}
              onTramerQuery={handleTramerQuery}
              onBrandChange={handleBrandChange}
              onYearChange={handleYearChange}
              onVehicleDetailsStepChange={setVehicleDetailsStep}
              onSubmitExisting={handleExistingVehicleSubmit}
              onSubmitNew={handleNewVehicleSubmit}
            />
          )}
        </form>

        {/* Step 2: Teklif Karşılaştırma */}
        {activeStep === 2 && proposalIdFromUrl && (
          <TrafikProductQuote
            proposalId={proposalIdFromUrl}
            onBack={() => setActiveStep(1)}
            onPurchaseClick={handlePurchaseClick}
          />
        )}

        {/* Step 3: Ödeme */}
        {activeStep === 3 && proposalIdFromUrl && productIdFromUrl && (
          <PurchaseStepNew
            onNext={() => {
              console.log('✅ Ödeme tamamlandı');
            }}
            onBack={() => setActiveStep(2)}
          />
        )}
      </div>

      {/* Verification Modal */}
      <VerificationCodeModal
        isOpen={showVerification}
        phoneNumber={formik.values.phoneNumber}
        onVerify={handleVerifyCode}
        onResend={handleResendOTP}
        onCancel={() => setShowVerification(false)}
      />

      {/* Tramer Error Popup */}
      <TramerErrorPopup
        isOpen={showTramerErrorPopup}
        onClose={() => setShowTramerErrorPopup(false)}
      />

      {/* Duplicate Vehicle Popup */}
      <DuplicateVehiclePopup
        isOpen={showDuplicateVehiclePopup}
        plateNumber={duplicatePlateNumber}
        onClose={() => setShowDuplicateVehiclePopup(false)}
        onUpdateExisting={() => {
          setShowDuplicateVehiclePopup(false);
          // Mevcut araçlar sekmesine geç
          setSelectionType('existing');
          formik.setFieldValue('selectionType', 'existing');
          // Araç listesini yenile
          refetchVehicles();
        }}
      />

      {/* Araç Güncelleme Modal */}
      {showUpdateVehicleModal && editingVehicleId && (
        <UpdateVehicleModal
          vehicleId={editingVehicleId}
          onClose={() => {
            setShowUpdateVehicleModal(false);
            setEditingVehicleId(null);
          }}
          onSuccess={() => {
            refetchVehicles();
            setShowUpdateVehicleModal(false);
            setEditingVehicleId(null);
          }}
        />
      )}

      {/* Phone Not Match Modal */}
      <PhoneNotMatchModal
        isOpen={showPhoneNotMatchModal}
        onClose={() => setShowPhoneNotMatchModal(false)}
      />
    </>
  );
};

export default TrafikProductForm;

