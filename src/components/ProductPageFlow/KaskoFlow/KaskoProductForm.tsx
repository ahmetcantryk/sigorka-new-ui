/**
 * KaskoProductForm
 * 
 * Ürün detay sayfası için stil-sız Kasko formu
 * Custom CSS ile stillendirilecek, MUI kullanmıyor
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';
import type { KaskoFormProps, VehicleFormData, ExistingVehicle } from './types';
import { VehicleUtilizationStyle, VehicleFuelType } from '@/types/enums/vehicleEnums';
import { validateTCKNFull, validateTurkishPhoneStrict, validateBirthDate } from '@/utils/validators';
import VerificationCodeModal from '../shared/VerificationCodeModal';
import InfoTooltip from '../shared/InfoTooltip';
import { performLogin, verifyOTP, CustomerType, updateCustomerProfile } from '@/utils/authHelper';
import type { CustomerProfile } from '@/services/fetchWithAuth';
import KaskoProductQuote from './KaskoProductQuote';
import PurchaseStepNew from '../../QuoteFlow/KaskoQuote/steps/PurchaseStepNew';
import { UpdateVehicleModal } from '../common';

// DataLayer helper functions
declare global {
  interface Window {
    dataLayer: any[];
  }
}

const pushToDataLayer = (eventData: any) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventData);
  }
};

// Job enum for individual customers
enum Job {
  Unknown = 0,
  Banker = 1,
  CorporateEmployee = 2,
  LtdEmployee = 3,
  Police = 4,
  MilitaryPersonnel = 5,
  RetiredSpouse = 6,
  Teacher = 7,
  Doctor = 8,
  Pharmacist = 9,
  Nurse = 10,
  HealthcareWorker = 11,
  Lawyer = 12,
  Judge = 13,
  Prosecutor = 14,
  Freelancer = 15,
  Farmer = 16,
  Instructor = 17,
  ReligiousOfficial = 18,
  AssociationManager = 19,
  Officer = 20,
  Retired = 21,
  Housewife = 22,
}

const jobOptions = [
  { value: Job.Unknown, label: 'Bilinmiyor' },
  { value: Job.Banker, label: 'Bankacı' },
  { value: Job.CorporateEmployee, label: 'Kurumsal Çalışan' },
  { value: Job.LtdEmployee, label: 'Ltd. Şirket Çalışanı' },
  { value: Job.Police, label: 'Polis' },
  { value: Job.MilitaryPersonnel, label: 'Askeri Personel' },
  { value: Job.RetiredSpouse, label: 'Emekli Eşi' },
  { value: Job.Teacher, label: 'Öğretmen' },
  { value: Job.Doctor, label: 'Doktor' },
  { value: Job.Pharmacist, label: 'Eczacı' },
  { value: Job.Nurse, label: 'Hemşire' },
  { value: Job.HealthcareWorker, label: 'Sağlık Çalışanı' },
  { value: Job.Lawyer, label: 'Avukat' },
  { value: Job.Judge, label: 'Hakim' },
  { value: Job.Prosecutor, label: 'Savcı' },
  { value: Job.Freelancer, label: 'Serbest Meslek' },
  { value: Job.Farmer, label: 'Çiftçi' },
  { value: Job.Instructor, label: 'Eğitmen' },
  { value: Job.ReligiousOfficial, label: 'Din Görevlisi' },
  { value: Job.AssociationManager, label: 'Dernek Yöneticisi' },
  { value: Job.Officer, label: 'Memur' },
  { value: Job.Retired, label: 'Emekli' },
  { value: Job.Housewife, label: 'Ev Hanımı' },
];

// Validation schema - Sadece kişisel bilgiler için
const personalInfoValidationSchema = yup.object({
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
  email: yup
    .string()
    .required('E-posta gereklidir')
    .email('Geçerli bir e-posta giriniz')
    .test('email-format', 'Geçerli bir e-posta adresi giriniz (örn: ornek@eposta.com)', function (value) {
      if (!value) return true;
      // E-posta formatı kontrolü: @ işaretinden sonra en az bir nokta ve domain olmalı
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
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
  job: yup.number(),
});

// Araç bilgileri validation schema
const vehicleValidationSchema = yup.object({
  plateCity: yup.string().required('Plaka il kodu zorunludur'),
  plateCode: yup.string().when('vehicleType', {
    is: 'plated',
    then: (schema) => schema
      .required('Plaka zorunludur')
      .matches(/^([A-Z]{1}[0-9]{4}|[A-Z]{2}[0-9]{3}|[A-Z]{2}[0-9]{4}|[A-Z]{3}[0-9]{2}|[A-Z]{3}[0-9]{3})$/,
        'Plaka formatı geçersiz'),
    otherwise: (schema) => schema.nullable(),
  }),
  documentSerialCode: yup.string().when('vehicleType', {
    is: 'plated',
    then: (schema) => schema
      .required('Belge seri kodu zorunludur')
      .length(2, 'Belge seri kodu 2 harf olmalıdır'),
    otherwise: (schema) => schema.nullable(),
  }),
  documentSerialNumber: yup.string().when('vehicleType', {
    is: 'plated',
    then: (schema) => schema
      .required('Belge seri numarası zorunludur')
      .length(6, 'Belge seri numarası 6 rakam olmalıdır'),
    otherwise: (schema) => schema.nullable(),
  }),
  brandCode: yup.string().required('Marka seçimi zorunludur'),
  modelCode: yup.string().required('Model seçimi zorunludur'),
  year: yup.string()
    .required('Model yılı zorunludur')
    .matches(/^[0-9]{4}$/, 'Model yılı 4 rakam olmalıdır'),
  usageType: yup.string().required('Kullanım şekli zorunludur'),
  fuelType: yup.string().required('Yakıt tipi zorunludur'),
  chassisNo: yup.string()
    .required('Şasi No zorunludur')
    .length(17, 'Şasi No 17 karakter olmalıdır'),
  engineNo: yup.string()
    .required('Motor No zorunludur')
    .min(6, 'Motor No en az 6 karakter olmalıdır'),
  registrationDate: yup.string().required('Tescil tarihi zorunludur'),
  seatCount: yup.string().required('Koltuk adedi zorunludur'),
});

const KaskoProductForm = ({ onProposalCreated, onBack }: KaskoFormProps) => {
  const { customerId, accessToken, isAuthenticated, setTokens, setUser, setCustomerId } = useAuthStore();
  const agencyConfig = useAgencyConfig();
  const agentId = agencyConfig?.agency?.id;

  // URL parametrelerini okuma
  const [urlParams, setUrlParams] = useState<URLSearchParams | null>(null);
  const [proposalIdFromUrl, setProposalIdFromUrl] = useState<string | null>(null);
  const [productIdFromUrl, setProductIdFromUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setUrlParams(params);
      setProposalIdFromUrl(params.get('proposalId'));
      setProductIdFromUrl(params.get('productId'));
    }
  }, []);

  // Kullanıcı login ise direkt araç bilgileri stepinden başla
  // URL'de productId varsa direkt step 3'e (ödeme) geç
  const getInitialStep = () => {
    if (productIdFromUrl && proposalIdFromUrl) return 3; // Ödeme step'i
    if (accessToken) return 1; // Araç bilgileri
    return 0; // Kişisel bilgiler
  };

  const [activeStep, setActiveStep] = useState(getInitialStep());
  const [selectionType, setSelectionType] = useState<'existing' | 'new'>('new');
  const [vehicleType, setVehicleType] = useState<'plated' | 'unplated'>('plated');
  const [vehicleDetailsStep, setVehicleDetailsStep] = useState(0); // 0: plaka bilgileri, 1: araç detayları
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<ExistingVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicleBrands, setVehicleBrands] = useState<Array<{ value: string; text: string }>>([]);
  const [vehicleModels, setVehicleModels] = useState<Array<{ value: string; text: string }>>([]);
  const [plateCities, setPlateCities] = useState<Array<{ value: string; text: string }>>([]);
  const [cities, setCities] = useState<Array<{ value: string; text: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ value: string; text: string }>>([]);
  const [isModelsLoading, setIsModelsLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [kaskoOldPolicy, setKaskoOldPolicy] = useState<any>(null);
  const [trafikOldPolicy, setTrafikOldPolicy] = useState<any>(null);
  const [showTramerErrorPopup, setShowTramerErrorPopup] = useState(false);
  const [isTramerLoading, setIsTramerLoading] = useState(false);
  const [showUpdateVehicleModal, setShowUpdateVehicleModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  // URL parametrelerini güncelleme fonksiyonu
  const updateUrlParams = (params: { proposalId?: string; productId?: string }) => {
    if (typeof window === 'undefined') return;
    
    const url = new URL(window.location.href);
    if (params.proposalId) {
      url.searchParams.set('proposalId', params.proposalId);
    }
    if (params.productId) {
      url.searchParams.set('productId', params.productId);
    }
    
    window.history.pushState({}, '', url.toString());
    setProposalIdFromUrl(params.proposalId || null);
    setProductIdFromUrl(params.productId || null);
  };

  // Satın Al butonuna tıklandığında
  const handlePurchaseClick = (quoteId: string) => {
    console.log('🛒 Satın Al tıklandı:', quoteId);
    
    // LocalStorage'a kaydet (PurchaseStepNew için)
    const selectedQuote = localStorage.getItem('selectedQuoteForPurchase');
    if (selectedQuote) {
      const quoteData = JSON.parse(selectedQuote);
      localStorage.setItem('selectedQuoteForPurchase', JSON.stringify({
        ...quoteData,
        id: quoteId
      }));
    }
    
    // URL parametrelerini güncelle
    if (proposalIdFromUrl) {
      updateUrlParams({
        proposalId: proposalIdFromUrl,
        productId: quoteId
      });
    }
    
    // Step 3'e (ödeme) geç
    setActiveStep(3);
    
    // Sayfayı en üste scroll et
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Proposal oluşturulduğunda
  const handleProposalCreated = (proposalId: string) => {
    console.log('✅ Proposal oluşturuldu:', proposalId);
    
    // URL parametrelerini güncelle
    updateUrlParams({ proposalId });
    
    // Step 2'ye (teklif karşılaştırma) geç
    setActiveStep(2);
    
    // Callback varsa çağır
    if (onProposalCreated) {
      onProposalCreated(proposalId);
    }
    
    // Sayfayı en üste scroll et
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Kullanıcı login olduğunda araç bilgileri stepine geç
  useEffect(() => {
    if (accessToken && activeStep === 0) {
      setActiveStep(1);
    }
  }, [accessToken]);

  // Araç bilgileri stepine geçildiğinde plaka il kodlarının yüklendiğinden emin ol
  useEffect(() => {
    const loadPlateCitiesForVehicleStep = async () => {
      if (activeStep === 1 && plateCities.length === 0) {
        try {
          const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_CITIES);
          if (response.ok) {
            const data = await response.json();
            const sortedCities = data
              .filter((c: any) => !['89', '999'].includes(c.value))
              .sort((a: any, b: any) => parseInt(a.value) - parseInt(b.value));

            setPlateCities(sortedCities);
            setCities(sortedCities);
          }
        } catch (error) {
          console.error('Failed to fetch plate cities:', error);
        }
      }
    };

    loadPlateCitiesForVehicleStep();
  }, [activeStep, plateCities.length]);

  // Helper function to get customerId from auth-storage
  const getCustomerIdFromAuthStorage = (): string | null => {
    const authStorageItem = localStorage.getItem('auth-storage');
    if (authStorageItem) {
      try {
        const authState = JSON.parse(authStorageItem).state;
        return authState?.customerId || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // Get coverage group IDs
  const getCoverageGroupIds = (branch: string): string[] | null => {
    if (!agencyConfig?.coverageGroupIds) {
      return null;
    }

    const coverageIds = agencyConfig.coverageGroupIds[branch as keyof typeof agencyConfig.coverageGroupIds];
    return coverageIds && coverageIds.length > 0 ? coverageIds : null;
  };

  const initialValues: VehicleFormData = {
    // Kişisel Bilgiler (PersonalInfoStep ile uyumlu)
    identityNumber: '',
    email: '',
    phoneNumber: '',
    birthDate: '',
    job: Job.Unknown,
    fullName: '',
    city: '',
    district: '',
    // Araç Bilgileri
    selectionType: 'new',
    vehicleType: 'plated',
    plateCity: '',
    plateCode: '',
    documentSerialCode: '',
    documentSerialNumber: '',
    brandCode: '',
    brand: '',
    modelCode: '',
    model: '',
    year: '2025',
    usageType: VehicleUtilizationStyle.PrivateCar.toString(),
    fuelType: VehicleFuelType.Diesel.toString(),
    engineNo: '',
    chassisNo: '',
    registrationDate: new Date().toISOString().split('T')[0],
    seatCount: '5',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: activeStep === 0 ? personalInfoValidationSchema : vehicleValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      // Form submit logic buraya gelecek
      await handleFormSubmit(values);
    },
  });

  // Auth kontrolü
  useEffect(() => {
    if (!isAuthenticated) {
      setError('Lütfen giriş yapın');
    }
  }, [isAuthenticated]);

  // Fetch vehicle brands
  useEffect(() => {
    const fetchBrands = async () => {
      if (!accessToken) return;

      try {
        const response = await fetchWithAuth(API_ENDPOINTS.VEHICLE_BRANDS, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setVehicleBrands(data.sort((a: any, b: any) =>
            a.text.localeCompare(b.text, 'tr-TR')
          ));
        }
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      }
    };

    fetchBrands();
  }, [accessToken]);

  // Fetch plate cities and cities for additional info
  // accessToken değiştiğinde de yeniden yükle (OTP sonrası için)
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_CITIES);

        if (response.ok) {
          const data = await response.json();
          const sortedCities = data
            .filter((c: any) => !['89', '999'].includes(c.value))
            .sort((a: any, b: any) => parseInt(a.value) - parseInt(b.value));

          setPlateCities(sortedCities);
          setCities(sortedCities); // Eksik bilgiler için de set et
        }
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      }
    };

    // Component mount olduğunda veya accessToken değiştiğinde yükle
    fetchCities();
  }, [accessToken]); // accessToken dependency eklendi

  // Fetch user vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!accessToken || !customerId) return;

      try {
        setIsLoading(true);
        const response = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_VEHICLES, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const vehicleList = data.map((v: any) => {
              const plateCity = v.plate?.city ? String(v.plate.city) : '';
              const plateCode = v.plate?.code || '';
              const plateNumber = plateCity && plateCode
                ? `${plateCity.padStart(2, '0')} ${plateCode}`.trim()
                : '';

              return {
                id: v.id || '',
                brand: v.model?.brand?.text || '',
                model: v.model?.type?.text || '',
                year: v.model?.year || new Date().getFullYear(),
                plateNumber,
                plateCity, // String olarak sakla
                plateCode, // Plaka kodu
                vehicleType: v.type || 'car',
              };
            });

            setVehicles(vehicleList);

            // Eğer kayıtlı araç varsa, default olarak "existing" tab'ı açık getir
            // ve ilk aracı otomatik seç
            if (vehicleList.length > 0) {
              setSelectionType('existing');
              formik.setFieldValue('selectionType', 'existing');
              setSelectedVehicleId(vehicleList[0].id); // İlk aracı seç
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, [accessToken, customerId]);

  // Araç listesini yeniden yükle (güncelleme sonrası)
  const refetchVehicles = async () => {
    if (!accessToken || !customerId) return;

    try {
      setIsLoading(true);
      const response = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_VEHICLES, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const vehicleList = data.map((v: any) => {
            const plateCity = v.plate?.city ? String(v.plate.city) : '';
            const plateCode = v.plate?.code || '';
            const plateNumber = plateCity && plateCode
              ? `${plateCity.padStart(2, '0')} ${plateCode}`.trim()
              : '';

            return {
              id: v.id || '',
              brand: v.model?.brand?.text || '',
              model: v.model?.type?.text || '',
              year: v.model?.year || new Date().getFullYear(),
              plateNumber,
              plateCity,
              plateCode,
              vehicleType: v.type || 'car',
            };
          });

          setVehicles(vehicleList);
        }
      }
    } catch (error) {
      console.error('Failed to refetch vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit icon'a tıklandığında modal'ı aç
  const handleEditVehicle = (vehicleId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Araç kartına tıklama olayını engelle
    setEditingVehicleId(vehicleId);
    setShowUpdateVehicleModal(true);
  };

  // Modal kapandığında
  const handleCloseUpdateModal = () => {
    setShowUpdateVehicleModal(false);
    setEditingVehicleId(null);
  };

  // Güncelleme başarılı olduğunda
  const handleUpdateSuccess = () => {
    refetchVehicles();
    setShowUpdateVehicleModal(false);
    setEditingVehicleId(null);
  };

  // Fetch models when brand and year change
  const fetchModels = useCallback(async (brandCode: string, modelYear: string) => {
    if (!accessToken || !brandCode || !modelYear || modelYear.length !== 4) return;

    try {
      setIsModelsLoading(true);
      setVehicleModels([]); // Önce listeyi temizle
      setModelError(null); // Hata mesajını temizle

      const response = await fetchWithAuth(
        API_ENDPOINTS.VEHICLE_MODELS(brandCode, modelYear),
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.ok) {
        const data = await response.json();

        // Duplicate'ları temizle - value bazında unique yap
        const uniqueModels = data.reduce((acc: any[], curr: any) => {
          if (!acc.find(m => m.value === curr.value)) {
            acc.push(curr);
          }
          return acc;
        }, []);

        // Alfabetik sırala
        const sortedModels = uniqueModels.sort((a: any, b: any) =>
          a.text.localeCompare(b.text, 'tr-TR')
        );

        // Boş model listesi kontrolü
        if (sortedModels.length === 0) {
          const selectedBrand = vehicleBrands.find(brand => brand.value === brandCode);
          const brandName = selectedBrand ? selectedBrand.text : 'Seçilen marka';
          setModelError(`${brandName} markası için ${modelYear} model yılında model bulunamadı.`);
        }

        setVehicleModels(sortedModels);
      } else {
        setModelError('Araç modelleri yüklenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
      setModelError('Araç modelleri yüklenirken bir hata oluştu.');
    } finally {
      setIsModelsLoading(false);
    }
  }, [accessToken, vehicleBrands]);

  // Handle form submission
  const handleFormSubmit = async (values: VehicleFormData) => {
    if (!accessToken || !customerId) {
      setError('Oturum bilgisi bulunamadı');
      return;
    }

    setIsLoading(true); // Sadece buton disabled olsun
    setError(null);

    try {
      // Mevcut araç seçildiyse
      if (selectionType === 'existing' && selectedVehicleId) {
        const vehicle = vehicles.find(v => v.id === selectedVehicleId);
        if (!vehicle) throw new Error('Seçilen araç bulunamadı');

        const proposalData = {
          $type: 'kasko',
          vehicleId: vehicle.id,
          productBranch: 'KASKO',
          insurerCustomerId: customerId,
          insuredCustomerId: customerId,
          coverageGroupIds: getCoverageGroupIds('kasko'),
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
          localStorage.setItem('proposalIdForKasko', proposalId);
          handleProposalCreated(proposalId);
        }
      } else {
        // Yeni araç ekleme - AssetInfoStep.tsx mantığı
        console.log('🚗 Yeni araç ekleme başladı...');

        const vehicleData = {
          customerId: customerId,
          plate: {
            city: parseInt(values.plateCity) || 0,
            code: vehicleType === 'plated' ? values.plateCode : '',
          },
          modelYear: parseInt(values.year),
          brandReference: values.brandCode,
          modelTypeReference: values.modelCode,
          utilizationStyle: parseInt(values.usageType),
          fuel: {
            type: parseInt(values.fuelType),
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
          console.error('❌ Araç kaydı hatası:', errorText);
          throw new Error(`Araç kaydı oluşturulamadı: ${errorText || vehicleResponse.statusText}`);
        }

        const vehicleResult = await vehicleResponse.json();
        console.log('✅ Araç kaydedildi:', vehicleResult);

        const vehicleId = vehicleResult.id;

        if (!vehicleId) {
          console.error('❌ Araç ID bulunamadı:', vehicleResult);
          throw new Error('Araç ID alınamadı');
        }

        console.log('🆔 Araç ID:', vehicleId);

        // 2. ADIM: Teklif oluştur
        console.log('📡 Teklif oluşturma isteği gönderiliyor...');
        const proposalData = {
          $type: 'kasko',
          vehicleId: vehicleId,
          productBranch: 'KASKO',
          insurerCustomerId: customerId,
          insuredCustomerId: customerId,
          coverageGroupIds: getCoverageGroupIds('kasko'),
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
          console.error('❌ Teklif oluşturma hatası:', errorText);
          throw new Error(`Teklif oluşturulamadı: ${errorText || proposalResponse.statusText}`);
        }

        const proposalResult = await proposalResponse.json();
        console.log('✅ Teklif oluşturuldu:', proposalResult);

        const proposalId = proposalResult.proposalId || proposalResult.id;

        if (proposalId) {
          localStorage.setItem('proposalIdForKasko', proposalId);

          // DataLayer push
          pushToDataLayer({
            event: "kasko_formsubmit",
            form_name: "kasko_step2"
          });

          console.log('🎉 İşlem başarılı, yönlendiriliyor:', proposalId);
          handleProposalCreated(proposalId);
        } else {
          console.error('❌ Proposal ID bulunamadı:', proposalResult);
          throw new Error('Teklif ID alınamadı');
        }
      }
    } catch (error) {
      console.error('❌ Form submit hatası:', error);
      const errorMessage = (error as Error).message || 'Bir hata oluştu';
      setError(errorMessage);

      // Kullanıcıya daha detaylı hata göster
      alert(`Hata: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // State for toggles
  const [kvkkConsent, setKvkkConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [kvkkError, setKvkkError] = useState<string | null>(null);

  // Verification modal state
  const [showVerification, setShowVerification] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);

  // Handle personal info step submission
  const handlePersonalInfoSubmit = async () => {
    console.log('🔵 handlePersonalInfoSubmit called');
    console.log('Form values:', {
      identityNumber: formik.values.identityNumber,
      email: formik.values.email,
      phoneNumber: formik.values.phoneNumber,
      birthDate: formik.values.birthDate,
    });
    console.log('KVKK Consent:', kvkkConsent);

    // Tüm alanları touched olarak işaretle (validasyon mesajlarını göstermek için)
    formik.setTouched({
      identityNumber: true,
      email: true,
      phoneNumber: true,
      birthDate: true,
    });

    // KVKK kontrolünü önce yap (validation hatalarından önce)
    if (!kvkkConsent) {
      setKvkkError('Aydınlatma ve Açık Rıza metnini okuyup onaylayınız');
    } else {
      setKvkkError(null);
    }

    // Validate only personal info fields
    const personalInfoErrors = await personalInfoValidationSchema.validate({
      identityNumber: formik.values.identityNumber,
      email: formik.values.email,
      phoneNumber: formik.values.phoneNumber,
      birthDate: formik.values.birthDate,
    }, { abortEarly: false }).catch(err => err);

    console.log('Validation errors:', personalInfoErrors);

    // Validation hataları varsa göster ve return yap
    if (personalInfoErrors.errors && personalInfoErrors.errors.length > 0) {
      setError(personalInfoErrors.errors[0] || 'Lütfen tüm alanları doğru şekilde doldurun');
      return;
    }

    // KVKK kontrolü (validation hataları yoksa)
    if (!kvkkConsent) {
      return;
    }

    // Store initial values for later use (email and job)
    console.log('=== Storing initial values ===');
    console.log('values.email:', formik.values.email);
    console.log('values.job:', formik.values.job, formik.values.job === Job.Unknown ? '(Unknown/Bilinmiyor)' : '');

    if (formik.values.email && formik.values.email.trim()) {
      localStorage.setItem('kaskoInitialEmail', formik.values.email.trim());
      console.log('✅ Saved kaskoInitialEmail:', formik.values.email.trim());
    }
    if (formik.values.job !== undefined && formik.values.job !== null) {
      localStorage.setItem('kaskoInitialJob', formik.values.job.toString());
      console.log('✅ Saved kaskoInitialJob:', formik.values.job.toString(), '(including Unknown/Bilinmiyor)');
    }

    // If already authenticated, skip verification
    if (accessToken) {
      console.log('✅ Already authenticated, skipping to step 1');
      setActiveStep(1);
      return;
    }

    // Send OTP
    console.log('📤 Sending OTP...');
    try {
      setIsLoading(true);
      setError(null);

      const cleanPhoneNumber = formik.values.phoneNumber.replace(/\D/g, '');
      console.log('Sending login request with:', {
        identityNumber: parseInt(formik.values.identityNumber),
        birthDate: formik.values.birthDate,
        phoneNumber: cleanPhoneNumber,
        agentId: agentId,
        customerType: CustomerType.Individual
      });

      const loginResponse = await performLogin(
        parseInt(formik.values.identityNumber),
        formik.values.birthDate,
        cleanPhoneNumber,
        agentId,
        CustomerType.Individual
      );

      console.log('Login response:', loginResponse);

      if (loginResponse.token) {
        setTempToken(loginResponse.token);
        setShowVerification(true);
        console.log('✅ OTP sent, opening modal');
      } else {
        throw new Error('OTP gönderilemedi');
      }
    } catch (err) {
      console.error('❌ OTP Error:', err);
      setError(err instanceof Error ? err.message : 'Doğrulama kodu gönderilemedi');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification
  const handleVerifyCode = async (code: string) => {
    if (!tempToken) {
      throw new Error('Token bulunamadı');
    }

    try {
      setIsLoading(true);
      const verifyData = await verifyOTP(tempToken, code);

      if (!verifyData.accessToken) {
        throw new Error('Kimlik doğrulama başarısız oldu');
      }

      // Set auth data
      setTokens(verifyData.accessToken, verifyData.refreshToken);

      const userEnteredEmail = localStorage.getItem('kaskoInitialEmail');
      const userEnteredJobStr = localStorage.getItem('kaskoInitialJob');
      const userEnteredJob = userEnteredJobStr ? parseInt(userEnteredJobStr) : null;

      // Fetch customer profile
      let meResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
      let meData: CustomerProfile | null = null;
      if (meResponse.ok) {
        meData = await meResponse.json();
      }

      const cityValue = typeof meData?.city === 'object' && meData?.city ? (meData.city as any).value : meData?.city;
      const districtValue = typeof meData?.district === 'object' && meData?.district ? (meData.district as any).value : meData?.district;
      const isDataComplete = meData && meData.fullName && cityValue && districtValue;
      let customerIdToUse = verifyData.customerId || meData?.id;

      if (customerIdToUse) {
        setCustomerId(customerIdToUse);
        setUser({
          id: customerIdToUse,
          name: meData?.fullName || '',
          email: meData?.primaryEmail || '',
          phone: meData?.primaryPhoneNumber?.number || ''
        });
        localStorage.setItem('proposalIdForKasko', customerIdToUse);
      }

      // Update email and job even if data is not complete
      if (customerIdToUse && (userEnteredEmail || userEnteredJob)) {
        try {
          await updateUserProfileWithCurrentData(meData, userEnteredEmail, userEnteredJob, customerIdToUse);
        } catch (error) {
          console.warn('Email/Job update hatası:', error);
        }
      }

      // Fetch cities for both plate cities and additional info
      // Bu her durumda yüklenmeli (araç bilgileri için plaka il kodu gerekli)
      const citiesResponse = await fetchWithAuth(API_ENDPOINTS.ADDRESS_CITIES);
      if (citiesResponse.ok) {
        const citiesData = await citiesResponse.json();
        const sortedCities = citiesData
          .filter((c: any) => !['89', '999'].includes(c.value))
          .sort((a: any, b: any) => parseInt(a.value) - parseInt(b.value));

        setPlateCities(sortedCities); // Plaka il kodu için
        setCities(sortedCities); // Eksik bilgiler için
      }

      // Check if additional info is needed
      if (!isDataComplete) {
        // If city exists, fetch districts
        const cityVal = typeof meData?.city === 'object' && meData?.city ? (meData.city as any).value : meData?.city;
        if (cityVal) {
          const districtsResponse = await fetchWithAuth(API_ENDPOINTS.ADDRESS_DISTRICTS(cityVal));
          if (districtsResponse.ok) {
            const districtsData = await districtsResponse.json();
            setDistricts(districtsData);
          }
        }

        // Update form values with existing data
        const districtVal = typeof meData?.district === 'object' && meData?.district ? (meData.district as any).value : meData?.district;
        formik.setValues(prev => ({
          ...prev,
          fullName: meData?.fullName || '',
          city: cityVal || '',
          district: districtVal || '',
        }), false);

        setShowAdditionalInfo(true);
        setShowVerification(false);
      } else {
        // Data is complete, proceed to vehicle step
        setShowVerification(false);
        setActiveStep(1);
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Doğrulama başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to update user profile with current data
  const updateUserProfileWithCurrentData = async (
    currentMeData: CustomerProfile | null,
    userEmail: string | null,
    userJob: Job | number | null,
    customerId: string
  ) => {
    try {
      const updatePayload: Record<string, any> = {
        identityNumber: currentMeData?.identityNumber,
        birthDate: currentMeData?.birthDate,
        primaryPhoneNumber: currentMeData?.primaryPhoneNumber,
      };

      // Only add non-null values
      if (currentMeData?.fullName) updatePayload.fullName = currentMeData.fullName;
      if (currentMeData?.gender) updatePayload.gender = currentMeData.gender;
      if (currentMeData?.educationStatus) updatePayload.educationStatus = currentMeData.educationStatus;
      if (currentMeData?.nationality) updatePayload.nationality = currentMeData.nationality;
      if (currentMeData?.maritalStatus) updatePayload.maritalStatus = currentMeData.maritalStatus;
      if (currentMeData?.representedBy) updatePayload.representedBy = currentMeData.representedBy;

      const cityValue = typeof currentMeData?.city === 'object' && currentMeData?.city ? (currentMeData.city as any).value : currentMeData?.city;
      const districtValue = typeof currentMeData?.district === 'object' && currentMeData?.district ? (currentMeData.district as any).value : currentMeData?.district;
      if (cityValue) updatePayload.cityReference = cityValue;
      if (districtValue) updatePayload.districtReference = districtValue;

      if (userEmail && userEmail.trim()) {
        updatePayload.primaryEmail = userEmail.trim();
      } else if (currentMeData?.primaryEmail) {
        updatePayload.primaryEmail = currentMeData.primaryEmail;
      }

      if (userJob && userJob !== Job.Unknown) {
        updatePayload.job = userJob;
      } else if (currentMeData?.job) {
        updatePayload.job = currentMeData.job;
      }

      const updatedProfile = await updateCustomerProfile(updatePayload, customerId, CustomerType.Individual);
      setUser({
        id: customerId,
        name: updatedProfile.fullName || currentMeData?.fullName || '',
        email: updatedProfile.primaryEmail || updatePayload.primaryEmail || '',
        phone: updatedProfile.primaryPhoneNumber?.number || currentMeData?.primaryPhoneNumber?.number || ''
      });
    } catch (updateError) {
      console.warn('Profile update hatası:', updateError);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    try {
      const cleanPhoneNumber = formik.values.phoneNumber.replace(/\D/g, '');
      const loginResponse = await performLogin(
        parseInt(formik.values.identityNumber),
        formik.values.birthDate,
        cleanPhoneNumber,
        agentId,
        CustomerType.Individual
      );

      if (loginResponse.token) {
        setTempToken(loginResponse.token);
        setTimeLeft(60);
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Kod gönderilemedi');
    }
  };

  // Render methods
  // Kişisel Bilgiler render fonksiyonu
  const renderPersonalInfoStep = () => (
    <div className="product-page-form">
      <div className="pp-card">
        <span className="pp-title">Kişisel Bilgiler</span>

        <div>
          <div className="pp-form-row">
            <div className={`pp-form-group ${formik.touched.identityNumber && formik.errors.identityNumber ? 'error' : ''}`}>
              <label className="pp-label">T.C. Kimlik Numarası / Vergi Kimlik Numarası</label>
              <input
                type="text"
                className="pp-input"
                id="identityNumber"
                name="identityNumber"
                value={formik.values.identityNumber || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  formik.setFieldValue('identityNumber', value);
                }}
                onBlur={(e) => {
                  formik.handleBlur(e);
                  if (e.target.value) {
                    const validation = validateTCKNFull(e.target.value);
                    if (!validation.isValid) {
                      formik.setFieldError('identityNumber', validation.message);
                    }
                  }
                }}
                placeholder="___________"
                maxLength={11}
                disabled={!!accessToken}
              />
              {formik.touched.identityNumber && formik.errors.identityNumber && (
                <div className="pp-error-message">{String(formik.errors.identityNumber)}</div>
              )}
            </div>

            <div className={`pp-form-group ${formik.touched.email && formik.errors.email ? 'error' : ''}`}>
              <label className="pp-label">E-posta Adresi</label>
              <input
                type="email"
                className="pp-input"
                id="email"
                name="email"
                value={formik.values.email || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="ornek@eposta.com"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="pp-error-message">{String(formik.errors.email)}</div>
              )}
            </div>
          </div>

          <div className="pp-form-row">
            <div className={`pp-form-group ${formik.touched.phoneNumber && formik.errors.phoneNumber ? 'error' : ''}`}>
              <label className="pp-label">Cep Telefonu Numarası</label>
              <input
                type="tel"
                className="pp-input"
                id="phoneNumber"
                name="phoneNumber"
                value={formik.values.phoneNumber || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');

                  if (value.length === 0) {
                    formik.setFieldValue('phoneNumber', '');
                  } else if (value.length === 1) {
                    if (value[0] === '5') {
                      formik.setFieldValue('phoneNumber', value);
                    } else {
                      formik.setFieldValue('phoneNumber', '5');
                    }
                  } else if (value.length > 1) {
                    if (value[0] !== '5') {
                      formik.setFieldValue('phoneNumber', '5' + value.slice(1));
                    } else {
                      formik.setFieldValue('phoneNumber', value);
                    }
                  }
                }}
                onBlur={() => {
                  formik.setFieldTouched('phoneNumber', true);
                  formik.validateField('phoneNumber');
                }}
                placeholder="5__ ___ __ __"
                maxLength={10}
                disabled={!!accessToken}
              />
              {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                <div className="pp-error-message">{String(formik.errors.phoneNumber)}</div>
              )}
            </div>

            <div className={`pp-form-group ${formik.touched.birthDate && formik.errors.birthDate ? 'error' : ''}`}>
              <label className="pp-label">Doğum Tarihi</label>
              <input
                type="date"
                className="pp-input"
                id="birthDate"
                name="birthDate"
                value={formik.values.birthDate || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                min="1900-01-01"
                max={new Date().toISOString().split('T')[0]}
                disabled={!!accessToken}
                placeholder="__ / __ / ____"
              />
              {formik.touched.birthDate && formik.errors.birthDate && (
                <div className="pp-error-message">{String(formik.errors.birthDate)}</div>
              )}
            </div>
          </div>

          <div className="pp-form-row">
            <div className="pp-form-group">
              <label className="pp-label">
                Meslek
                <InfoTooltip
                  content="Mesleğinizi seçin, teklif adımında size özel fırsatları kaçırmayın."
                  className="pp-meslek-tooltip"
                />
              </label>
              <Dropdown
                id="job"
                name="job"
                value={formik.values.job || Job.Unknown}
                options={jobOptions.sort((a, b) => a.label.localeCompare(b.label, 'tr'))}
                onChange={(e: DropdownChangeEvent) => {
                  const value = parseInt(e.value);
                  formik.setFieldValue('job', value);
                  // Meslek bilgisini localStorage'a kaydet
                  localStorage.setItem('kaskoInitialJob', value.toString());
                  console.log('✅ Saved kaskoInitialJob:', value);
                }}
                placeholder="Seçiniz"
                className="pp-dropdown"
                filter
                filterPlaceholder="Ara..."
                emptyFilterMessage="Sonuç bulunamadı"
                showClear={false}
              />
            </div>
          </div>

          <div className="pp-toggles">
            <div className={`pp-toggle-item-wrapper ${kvkkError ? 'error' : ''}`}>
              <div className="pp-toggle-item">
                <div
                  className={`pp-toggle-switch ${kvkkConsent ? 'active' : ''}`}
                  onClick={() => {
                    setKvkkConsent(!kvkkConsent);
                    if (kvkkError) setKvkkError(null);
                    if (error) setError(null);
                  }}
                >
                  <div className="pp-toggle-knob">{kvkkConsent ? '✓' : '✕'}</div>
                </div>
                <p className="pp-toggle-text">
                  Kişisel Verilerin İşlenmesine İlişkin <a href="/kvkk" target="_blank" rel="noopener noreferrer">Aydınlatma Metni</a> 'ni ve <a href="/acik-riza-metni" target="_blank" rel="noopener noreferrer">Açık Rıza Metni</a> 'ni okudum, onaylıyorum.
                </p>
              </div>
              {kvkkError && (
                <div className="pp-error-message">{kvkkError}</div>
              )}
            </div>

            <div className="pp-toggle-item">
              <div
                className={`pp-toggle-switch ${marketingConsent ? 'active' : ''}`}
                onClick={() => setMarketingConsent(!marketingConsent)}
              >
                <div className="pp-toggle-knob">{marketingConsent ? '✓' : '✕'}</div>
              </div>
              <p className="pp-toggle-text">
                <a href="/elektronik-ileti-onayi" target="_blank" rel="noopener noreferrer">Ticari Elektronik İleti Metni</a> 'ni okudum, onaylıyorum.
              </p>
            </div>
          </div>

          {error && (
            <div className="pp-error-banner">
              {error}
            </div>
          )}

          <div className="pp-button-group">
            <button
              type="button"
              className="pp-btn-submit"
              onClick={(e) => {
                e.preventDefault();
                console.log('🔴 Button clicked!');
                handlePersonalInfoSubmit();
              }}
              disabled={isLoading}
            >
              {isLoading ? 'İşleniyor...' : 'Araç Bilgilerine Geç'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVehicleSelection = () => {
    const hasVehicles = vehicles.length > 0;

    return (
      <div className="product-page-form pp-form-wide">
        <div className="pp-card">
          <div className="pp-card-header">
            <span className="pp-title">Araç Bilgileri</span>

            {/* Tab-like Buttons */}
            <div className="pp-vehicle-tabs">
              <button
                type="button"
                className={`pp-tab-button ${selectionType === 'existing' ? 'active' : ''}`}
                onClick={() => {
                  if (hasVehicles) {
                    setSelectionType('existing');
                    formik.setFieldValue('selectionType', 'existing');
                  }
                }}
                disabled={!hasVehicles}
              >
                Kayıtlı Araçlarım
              </button>
              <button
                type="button"
                className={`pp-tab-button ${selectionType === 'new' ? 'active' : ''}`}
                onClick={() => {
                  setSelectionType('new');
                  formik.setFieldValue('selectionType', 'new');
                  setVehicleDetailsStep(0); // Reset to first step
                }}
              >
                Yeni Araç Ekle
              </button>
            </div>
          </div>

          {isTramerLoading ? (
            <div className="pp-loading-container">
              <div className="pp-spinner"></div>
              <p className="pp-loading-text">Araç bilgileri sorgulanıyor...</p>
            </div>
          ) : (
            <div>
              {selectionType === 'existing' ? renderExistingVehicles() : (
                <>
                  {renderNewVehicleForm()}
                  {(vehicleType === 'unplated' || vehicleDetailsStep === 1) && renderVehicleDetails()}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderExistingVehicles = () => (
    <div className="pp-existing-vehicles">
      <div className="pp-vehicles-grid">
        {vehicles.map((vehicle) => {
          // Plaka formatı belirleme
          let displayPlate = '';

          if (vehicle.plateCode && vehicle.plateCode.trim()) {
            // Plakalı araç - normal plaka göster
            displayPlate = vehicle.plateNumber;
          } else if (vehicle.plateCity) {
            // Plakasız araç - "Plakasız - XX" formatında göster
            const cityCode = String(vehicle.plateCity).padStart(2, '0'); // 2 -> 02
            displayPlate = `Plakasız - ${cityCode}`;
          } else {
            // Hiç bilgi yoksa
            displayPlate = 'Plakasız';
          }

          return (
            <div
              key={vehicle.id}
              className={`pp-vehicle-card ${selectedVehicleId === vehicle.id ? 'selected' : ''}`}
              onClick={() => setSelectedVehicleId(vehicle.id)}
            >
              <div className="pp-vehicle-content">
                <h4 className="pp-vehicle-brand">{vehicle.brand}</h4>
                <p className="pp-vehicle-model">{vehicle.model}</p>
                <p className="pp-vehicle-plate">{displayPlate}</p>
              </div>
              <div 
                className="pp-vehicle-edit-icon"
                onClick={(e) => handleEditVehicle(vehicle.id, e)}
              >
                <i className="icon-edit"></i>
              </div>
            </div>
          );
        })}
      </div>

      {selectedVehicleId && (
        <div className="pp-button-group">
          <button
            type="button"
            className="pp-btn-submit"
            onClick={async () => {
              // Kayıtlı araç seçildiğinde direkt teklif oluştur
              try {
                setIsLoading(true);
                const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
                if (!selectedVehicle) {
                  throw new Error('Seçilen araç bulunamadı');
                }

                const proposalData = {
                  $type: 'kasko',
                  vehicleId: selectedVehicle.id,
                  productBranch: 'KASKO',
                  insurerCustomerId: customerId,
                  insuredCustomerId: customerId,
                  coverageGroupIds: getCoverageGroupIds('kasko'),
                  channel: 'WEBSITE',
                };

                const proposalResponse = await fetchWithAuth(API_ENDPOINTS.PROPOSALS_CREATE, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(proposalData),
                });

                if (!proposalResponse.ok) {
                  throw new Error('Kasko teklifi oluşturulurken bir hata oluştu');
                }

                const proposalResult = await proposalResponse.json();
                const proposalId = proposalResult.proposalId || proposalResult.id;

                if (proposalId) {
                  localStorage.setItem('proposalIdForKasko', proposalId);

                  // DataLayer event
                  pushToDataLayer({
                    event: "kasko_formsubmit",
                    form_name: "kasko_step2"
                  });

                  // Teklif karşılaştırma ekranına yönlendir (aynı sayfa içinde)
                  onProposalCreated(proposalId);
                }
              } catch (error) {
                console.error('Teklif oluşturma hatası:', error);
                setError('Teklif oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
                setIsLoading(false);
              }
            }}
          >
            Teklifleri Gör
          </button>
        </div>
      )}
    </div>
  );

  const renderNewVehicleForm = () => (
    <>
      <div className="pp-form-group pp-vehicle-type-section">
        {/* <label className="pp-label">Araç Tipi</label> */}
        <div className="pp-radio-group">
          <label className="pp-radio-label">
            <input
              type="radio"
              name="vehicleType"
              value="plated"
              checked={vehicleType === 'plated'}
              onChange={() => {
                setVehicleType('plated');
                formik.setFieldValue('vehicleType', 'plated');
                setVehicleDetailsStep(0);
              }}
            />
            <span>Plakalı Araç</span>
          </label>
          <label className="pp-radio-label">
            <input
              type="radio"
              name="vehicleType"
              value="unplated"
              checked={vehicleType === 'unplated'}
              onChange={() => {
                setVehicleType('unplated');
                formik.setFieldValue('vehicleType', 'unplated');
                setVehicleDetailsStep(0);
              }}
            />
            <span>Plakasız Araç</span>
          </label>
        </div>
      </div>

      {vehicleType === 'plated' && vehicleDetailsStep === 0 && (
        <div className="pp-form-row">
          <div className={`pp-form-group ${formik.touched.plateCity && formik.errors.plateCity ? 'error' : ''}`}>
            <label className="pp-label">Plaka İl Kodu</label>
            <Dropdown
              id="plateCity"
              name="plateCity"
              value={formik.values.plateCity}
              options={plateCities.map(city => ({
                label: `${parseInt(city.value) < 10 ? `0${city.value}` : city.value} - ${city.text}`,
                value: city.value
              }))}
              onChange={(e: DropdownChangeEvent) => {
                formik.setFieldValue('plateCity', e.value);
                // Plakalı seçimde il değişirse step resetlemeye gerek yok, zaten step 0'dayız
              }}
              onBlur={() => formik.setFieldTouched('plateCity', true)}
              placeholder="Seçiniz"
              className="pp-dropdown"
              filter
              filterPlaceholder="Ara..."
              emptyFilterMessage="Sonuç bulunamadı"
              showClear={false}
            />
            {formik.touched.plateCity && formik.errors.plateCity && (
              <div className="pp-error-message">{formik.errors.plateCity}</div>
            )}
          </div>

          <div className={`pp-form-group ${formik.touched.plateCode && formik.errors.plateCode ? 'error' : ''}`}>
            <label className="pp-label">Plaka</label>
            <input
              type="text"
              className="pp-input"
              id="plateCode"
              name="plateCode"
              value={formik.values.plateCode}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
                formik.setFieldValue('plateCode', value);
              }}
              onBlur={formik.handleBlur}
              placeholder="Örn: AB1234"
              maxLength={6}
            />
            {formik.touched.plateCode && formik.errors.plateCode && (
              <div className="pp-error-message">{formik.errors.plateCode}</div>
            )}
          </div>
        </div>
      )}

      {vehicleType === 'plated' && vehicleDetailsStep === 0 && (
        <div className="pp-form-row">
          <div className={`pp-form-group ${formik.touched.documentSerialCode && formik.errors.documentSerialCode ? 'error' : ''}`}>
            <label className="pp-label">Belge Seri Kodu</label>
            <input
              type="text"
              className="pp-input"
              id="documentSerialCode"
              name="documentSerialCode"
              value={formik.values.documentSerialCode}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
                formik.setFieldValue('documentSerialCode', value);
              }}
              onBlur={formik.handleBlur}
              placeholder="Örn: FP"
              maxLength={2}
            />
            {formik.touched.documentSerialCode && formik.errors.documentSerialCode && (
              <div className="pp-error-message">{formik.errors.documentSerialCode}</div>
            )}
          </div>

          <div className={`pp-form-group ${formik.touched.documentSerialNumber && formik.errors.documentSerialNumber ? 'error' : ''}`}>
            <label className="pp-label">Belge Seri Numarası</label>
            <input
              type="text"
              className="pp-input"
              id="documentSerialNumber"
              name="documentSerialNumber"
              value={formik.values.documentSerialNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                formik.setFieldValue('documentSerialNumber', value);
              }}
              onBlur={formik.handleBlur}
              placeholder="Örn: 373220"
              maxLength={6}
            />
            {formik.touched.documentSerialNumber && formik.errors.documentSerialNumber && (
              <div className="pp-error-message">{formik.errors.documentSerialNumber}</div>
            )}
          </div>
        </div>
      )}

      {vehicleType === 'plated' && vehicleDetailsStep === 0 && (
        <div className="pp-button-group">
          <button
            type="button"
            className="pp-btn-submit"
            onClick={handleTramerQuery}
            disabled={isTramerLoading || !formik.values.plateCity ||
              (vehicleType === 'plated' && (!formik.values.plateCode || !formik.values.documentSerialCode || !formik.values.documentSerialNumber))}
          >
            {isTramerLoading ? 'Sorgulanıyor...' : 'Devam Et'}
          </button>
        </div>
      )}
    </>
  );

  const renderVehicleDetails = () => (
    <>
      <div>
        {/* 1. Satır: Plaka İl Kodu, Marka, Model Yılı */}
        <div className="pp-form-row pp-form-row-3">
          {vehicleType === 'unplated' && (
            <div className={`pp-form-group ${formik.touched.plateCity && formik.errors.plateCity ? 'error' : ''}`}>
              <label className="pp-label">Plaka İl Kodu</label>
              <Dropdown
                id="plateCityDetails"
                name="plateCity"
                value={formik.values.plateCity}
                options={plateCities.map(city => ({
                  label: `${parseInt(city.value) < 10 ? `0${city.value}` : city.value} - ${city.text}`,
                  value: city.value
                }))}
                onChange={(e: DropdownChangeEvent) => {
                  formik.setFieldValue('plateCity', e.value);
                }}
                onBlur={() => formik.setFieldTouched('plateCity', true)}
                placeholder="Seçiniz"
                className="pp-dropdown"
                filter
                filterPlaceholder="Ara..."
                emptyFilterMessage="Sonuç bulunamadı"
                showClear={false}
              />
              {formik.touched.plateCity && formik.errors.plateCity && (
                <div className="pp-error-message">{formik.errors.plateCity}</div>
              )}
            </div>
          )}

          <div className={`pp-form-group ${formik.touched.brandCode && formik.errors.brandCode ? 'error' : ''}`}>
            <label className="pp-label">Marka</label>
            <Dropdown
              id="brandCode"
              name="brandCode"
              value={formik.values.brandCode}
              options={vehicleBrands
                .filter(b => b.text !== 'İŞ MAKİNASI' && b.text !== 'DİĞER')
                .map(brand => ({
                  label: brand.text,
                  value: brand.value
                }))}
              onChange={(e: DropdownChangeEvent) => {
                // Model error'unu temizle
                setModelError(null);

                if (e.value) {
                  formik.setFieldValue('brandCode', e.value);
                  const brand = vehicleBrands.find(b => b.value === e.value);
                  if (brand) formik.setFieldValue('brand', brand.text);

                  // Model seçimini temizle
                  formik.setFieldValue('modelCode', '');
                  formik.setFieldValue('model', '');
                  setVehicleModels([]);

                  // Yıl varsa ve geçerliyse modelleri getir
                  if (formik.values.year && formik.values.year.length === 4) {
                    const year = parseInt(formik.values.year);
                    const currentYear = new Date().getFullYear();
                    if (year >= 1900 && year <= currentYear) {
                      fetchModels(e.value, formik.values.year);
                    }
                  }
                } else {
                  // Clear butonuna basıldığında
                  formik.setFieldValue('brandCode', '');
                  formik.setFieldValue('brand', '');
                  formik.setFieldValue('modelCode', '');
                  formik.setFieldValue('model', '');
                  setVehicleModels([]);
                }

                formik.setFieldTouched('brandCode', true);
              }}
              onBlur={() => formik.setFieldTouched('brandCode', true)}
              placeholder="Seçiniz"
              className="pp-dropdown"
              filter
              filterPlaceholder="Ara..."
              emptyFilterMessage="Sonuç bulunamadı"
              showClear={false}
            />
            {formik.touched.brandCode && formik.errors.brandCode && (
              <div className="pp-error-message">{formik.errors.brandCode}</div>
            )}
          </div>

          <div className={`pp-form-group ${formik.touched.year && formik.errors.year ? 'error' : ''}`}>
            <label className="pp-label">Model Yılı</label>
            <input
              type="text"
              className="pp-input"
              id="year"
              name="year"
              value={formik.values.year}
              onChange={(e) => {
                // Model error'unu temizle
                setModelError(null);

                // Sadece rakamlar, maksimum 4 karakter
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                formik.setFieldValue('year', value);
                formik.setFieldTouched('year', true);

                // Model seçimini temizle
                formik.setFieldValue('modelCode', '');
                formik.setFieldValue('model', '');

                // Model yılı değiştiğinde ve marka seçiliyse modelleri yükle (sadece 4 haneli yıl girildiyse)
                if (formik.values.brandCode && value.length === 4) {
                  const year = parseInt(value);
                  const currentYear = new Date().getFullYear();
                  if (year >= 1900 && year <= currentYear) {
                    fetchModels(formik.values.brandCode, value);
                  }
                }
              }}
              onBlur={formik.handleBlur}
              placeholder="Örn: 2023"
              maxLength={4}
            />
            {formik.touched.year && formik.errors.year && (
              <div className="pp-error-message">{formik.errors.year}</div>
            )}
          </div>
          {/* 2. Satır: Model, Kullanım Şekli, Yakıt Tipi */}
          <div className={`pp-form-group ${(modelError || (formik.touched.modelCode && formik.errors.modelCode)) ? 'error' : ''}`}>
            <label className="pp-label">Model</label>
            <Dropdown
              id="modelCode"
              name="modelCode"
              value={formik.values.modelCode}
              options={vehicleModels.map(model => ({
                label: model.text,
                value: model.value
              }))}
              onChange={(e: DropdownChangeEvent) => {
                if (e.value) {
                  formik.setFieldValue('modelCode', e.value);
                  const model = vehicleModels.find(m => m.value === e.value);
                  if (model) formik.setFieldValue('model', model.text);
                } else {
                  // Clear butonuna basıldığında
                  setModelError(null);
                  formik.setFieldValue('modelCode', '');
                  formik.setFieldValue('model', '');
                }
                formik.setFieldTouched('modelCode', true);
              }}
              onBlur={() => formik.setFieldTouched('modelCode', true)}
              placeholder={isModelsLoading ? 'Yükleniyor...' : 'Seçiniz'}
              className="pp-dropdown"
              filter
              filterPlaceholder="Ara..."
              emptyFilterMessage="Sonuç bulunamadı"
              disabled={isModelsLoading || vehicleModels.length === 0}
              showClear={false}
            />
            {modelError && (
              <div className="pp-error-message">{modelError}</div>
            )}
            {!modelError && formik.touched.modelCode && formik.errors.modelCode && (
              <div className="pp-error-message">{formik.errors.modelCode}</div>
            )}
          </div>

          <div className={`pp-form-group ${formik.touched.usageType && formik.errors.usageType ? 'error' : ''}`}>
            <label className="pp-label">Kullanım Şekli</label>
            <Dropdown
              id="usageType"
              name="usageType"
              value={formik.values.usageType}
              options={[
                { label: 'Özel Otomobil', value: VehicleUtilizationStyle.PrivateCar },
                { label: 'Taksi', value: VehicleUtilizationStyle.Taxi },
                { label: 'Kiralık Araç', value: VehicleUtilizationStyle.RentalCar },
                { label: 'Hat Usulü Minibüs', value: VehicleUtilizationStyle.RouteBasedMinibus },
                { label: 'Orta Boy Otobüs', value: VehicleUtilizationStyle.MediumBus },
                { label: 'Büyük Otobüs', value: VehicleUtilizationStyle.LargeBus },
                { label: 'Kamyonet', value: VehicleUtilizationStyle.PickupTruck },
                { label: 'Kapalı Kasa Kamyonet', value: VehicleUtilizationStyle.ClosedBedPickup },
                { label: 'Kamyon', value: VehicleUtilizationStyle.Truck },
                { label: 'İnşaat Makinası', value: VehicleUtilizationStyle.ConstructionMachinery },
                { label: 'Traktör', value: VehicleUtilizationStyle.Tractor },
                { label: 'Römork', value: VehicleUtilizationStyle.Trailer },
                { label: 'Motosiklet', value: VehicleUtilizationStyle.Motorcycle },
                { label: 'Tanker', value: VehicleUtilizationStyle.Tanker },
                { label: 'Çekici', value: VehicleUtilizationStyle.TowTruck },
                { label: 'Motorlu Karavan', value: VehicleUtilizationStyle.MotorizedCaravan },
                { label: 'Çekilir Karavan', value: VehicleUtilizationStyle.TowableCaravan },
                { label: 'Traktör Hariç Tarım Makinası', value: VehicleUtilizationStyle.AgriculturalMachineExcludingTractor },
                { label: 'Açık Kasa Kamyon', value: VehicleUtilizationStyle.OpenBodyTruck },
                { label: 'Zırhlı Araç', value: VehicleUtilizationStyle.ArmoredVehicle },
                { label: 'Minibüs Dolmuş', value: VehicleUtilizationStyle.MinibusSharedTaxi },
                { label: 'Jeep', value: VehicleUtilizationStyle.Jeep },
                { label: 'Jeep SAV', value: VehicleUtilizationStyle.JeepSAV },
                { label: 'Jeep SUV', value: VehicleUtilizationStyle.JeepSUV },
                { label: 'Jeep Kiralık', value: VehicleUtilizationStyle.JeepRental },
                { label: 'Jeep Taksi', value: VehicleUtilizationStyle.JeepTaxi },
                { label: 'Ambulans', value: VehicleUtilizationStyle.Ambulance },
                { label: 'İtfaiye Aracı', value: VehicleUtilizationStyle.FirefighterCar },
                { label: 'Cenaze Nakil Aracı', value: VehicleUtilizationStyle.Hearse },
                { label: 'Şoförlü Kiralık Araç', value: VehicleUtilizationStyle.ChauffeuredRentalCar },
                { label: 'Operasyonel Kiralama', value: VehicleUtilizationStyle.OperationalRental },
                { label: 'Özel Minibüs', value: VehicleUtilizationStyle.PrivateMinibus },
                { label: 'Hat Minibüsü', value: VehicleUtilizationStyle.RouteMinibus },
                { label: 'Servis Minibüsü', value: VehicleUtilizationStyle.ServiceMinibus },
                { label: 'Şirket Minibüsü', value: VehicleUtilizationStyle.CompanyMinibus },
                { label: 'Kiralık Minibüs', value: VehicleUtilizationStyle.RentalMinibus },
                { label: 'Ambulans Minibüs', value: VehicleUtilizationStyle.AmbulanceMinibus },
                { label: 'Minibüs Yayın Aracı', value: VehicleUtilizationStyle.MinibusBroadcastingVehicle },
                { label: 'Minibüs Zırhlı Nakliye', value: VehicleUtilizationStyle.MinibusArmoredTransport },
                { label: 'Küçük Otobüs (15-35 Kişi)', value: VehicleUtilizationStyle.SmallBus1535Passengers },
                { label: 'Küçük Otobüs Servis', value: VehicleUtilizationStyle.SmallBusService },
                { label: 'Küçük Otobüs Şehir İçi', value: VehicleUtilizationStyle.SmallBusCity },
                { label: 'Küçük Otobüs Hat', value: VehicleUtilizationStyle.SmallBusRoute },
                { label: 'Büyük Otobüs (36+ Kişi)', value: VehicleUtilizationStyle.LargeBus36Plus },
                { label: 'Damperli Kamyon', value: VehicleUtilizationStyle.DumpTruck },
                { label: 'Soğutmalı Kamyon', value: VehicleUtilizationStyle.RefrigeratedTruck },
                { label: 'Beton Mikseri Kamyon', value: VehicleUtilizationStyle.TruckWithConcreteMixer },
                { label: 'Silo Kamyon', value: VehicleUtilizationStyle.SiloTruck },
                { label: 'Beton Pompası Kamyon', value: VehicleUtilizationStyle.TruckWithConcretePump },
                { label: 'Kaya Kamyonu', value: VehicleUtilizationStyle.RockTruck },
                { label: 'Vinçli Kamyon', value: VehicleUtilizationStyle.TruckWithCrane },
                { label: 'Ağır İş Makinası', value: VehicleUtilizationStyle.HeavyMachinery },
                { label: 'Ekskavatör', value: VehicleUtilizationStyle.Excavator },
                { label: 'Yükleyici', value: VehicleUtilizationStyle.Loader },
                { label: 'Buldozer', value: VehicleUtilizationStyle.Bulldozer },
                { label: 'Skreyper', value: VehicleUtilizationStyle.Scraper },
                { label: 'Greyder', value: VehicleUtilizationStyle.Grader },
                { label: 'Yol Silindiri', value: VehicleUtilizationStyle.RoadRoller },
                { label: 'Mobil Vinç', value: VehicleUtilizationStyle.MobileCrane },
                { label: 'İç Mekan Forklift', value: VehicleUtilizationStyle.IndoorForklift },
                { label: 'Dış Mekan Forklift', value: VehicleUtilizationStyle.OutdoorForklift },
                { label: 'Mobil Kompresör', value: VehicleUtilizationStyle.MobileCompressor },
                { label: 'Mobil Pompa', value: VehicleUtilizationStyle.MobilePump },
                { label: 'Mobil Kaynak Makinası', value: VehicleUtilizationStyle.MobileWeldingMachine },
                { label: 'Biçerdöver', value: VehicleUtilizationStyle.CombineHarvester },
                { label: 'Tanker Asit Taşıyıcı', value: VehicleUtilizationStyle.TankerAcidCarrier },
                { label: 'Tanker Su/Yakıt Taşıyıcı', value: VehicleUtilizationStyle.TankerWaterFuelCarrier },
                { label: 'Tanker Patlayıcı/Yanıcı', value: VehicleUtilizationStyle.TankerExplosiveFlammable },
                { label: 'Çekici Traktör', value: VehicleUtilizationStyle.TowTruckTractor },
                { label: 'Çekici Tanker', value: VehicleUtilizationStyle.TowTruckTanker },
                { label: 'Panel/Cam Van Minibüs', value: VehicleUtilizationStyle.PanelGlassVanMinubus }
              ]}
              onChange={(e: DropdownChangeEvent) => formik.setFieldValue('usageType', e.value)}
              onBlur={() => formik.setFieldTouched('usageType', true)}
              placeholder="Seçiniz"
              className="pp-dropdown"
              filter
              filterPlaceholder="Ara..."
              emptyFilterMessage="Sonuç bulunamadı"
              showClear={false}
            />
            {formik.touched.usageType && formik.errors.usageType && (
              <div className="pp-error-message">{formik.errors.usageType}</div>
            )}
          </div>

          <div className={`pp-form-group ${formik.touched.fuelType && formik.errors.fuelType ? 'error' : ''}`}>
            <label className="pp-label">Yakıt Tipi</label>
            <Dropdown
              id="fuelType"
              name="fuelType"
              value={formik.values.fuelType}
              options={[
                { label: 'Dizel', value: VehicleFuelType.Diesel },
                { label: 'Benzin', value: VehicleFuelType.Gasoline },
                { label: 'LPG', value: VehicleFuelType.Lpg },
                { label: 'Elektrik', value: VehicleFuelType.Electric },
                { label: 'LPG + Benzin', value: VehicleFuelType.LpgGasoline }
              ]}
              onChange={(e: DropdownChangeEvent) => formik.setFieldValue('fuelType', e.value)}
              onBlur={() => formik.setFieldTouched('fuelType', true)}
              placeholder="Seçiniz"
              className="pp-dropdown"
              showClear={false}
            />
            {formik.touched.fuelType && formik.errors.fuelType && (
              <div className="pp-error-message">{formik.errors.fuelType}</div>
            )}
          </div>
          {/* 3. Satır: Tescil Tarihi, Motor No, Şasi No */}
          <div className={`pp-form-group ${formik.touched.registrationDate && formik.errors.registrationDate ? 'error' : ''}`}>
            <label className="pp-label">Tescil Tarihi</label>
            <input
              type="date"
              className="pp-input"
              id="registrationDate"
              name="registrationDate"
              value={formik.values.registrationDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.registrationDate && formik.errors.registrationDate && (
              <div className="pp-error-message">{formik.errors.registrationDate}</div>
            )}
          </div>

          <div className={`pp-form-group ${formik.touched.engineNo && formik.errors.engineNo ? 'error' : ''}`}>
            <label className="pp-label">Motor No</label>
            <input
              type="text"
              className="pp-input"
              id="engineNo"
              name="engineNo"
              value={formik.values.engineNo}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9]/g, '')
                  .toLocaleUpperCase('tr-TR')
                  .slice(0, 20);
                formik.setFieldValue('engineNo', value);
              }}
              onBlur={formik.handleBlur}
              placeholder="Motor numarası"
              maxLength={20}
            />
            {formik.touched.engineNo && formik.errors.engineNo && (
              <div className="pp-error-message">{formik.errors.engineNo}</div>
            )}
          </div>

          <div className={`pp-form-group ${formik.touched.chassisNo && formik.errors.chassisNo ? 'error' : ''}`}>
            <label className="pp-label">Şasi No</label>
            <input
              type="text"
              className="pp-input"
              id="chassisNo"
              name="chassisNo"
              value={formik.values.chassisNo}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9]/g, '')
                  .toLocaleUpperCase('tr-TR')
                  .slice(0, 17);
                formik.setFieldValue('chassisNo', value);
              }}
              onBlur={formik.handleBlur}
              placeholder="17 karakter"
              maxLength={17}
            />
            {formik.touched.chassisNo && formik.errors.chassisNo && (
              <div className="pp-error-message">{formik.errors.chassisNo}</div>
            )}
          </div>
          {/* 4. Satır: Koltuk Adedi */}
          <div className="pp-form-group">
            <label className="pp-label">Koltuk Adedi</label>
            <input
              type="number"
              className="pp-input"
              id="seatCount"
              name="seatCount"
              value={formik.values.seatCount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              min="1"
              max="50"
            />
            {formik.touched.seatCount && formik.errors.seatCount && (
              <div className="pp-error-message">{formik.errors.seatCount}</div>
            )}
          </div>
        </div>

        <div className="pp-button-group">
          {/* Geri Dön butonu kaldırıldı - Tek sayfa yapısı */}
          {vehicleType === 'plated' && (
            <button
              type="button"
              className="pp-btn-back"
              onClick={() => setVehicleDetailsStep(0)}
              disabled={isLoading}
            >
              Önceki Adıma Dön
            </button>
          )}
          <button
            type="button"
            className="pp-btn-submit"
            onClick={() => {
              // Tüm alanları touched olarak işaretle
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
            }}
          >
            {isLoading ? 'İşleniyor...' : 'Teklifleri Gör'}
          </button>
        </div>
      </div>
    </>
  );

  // Render Additional Info Form
  const renderAdditionalInfoForm = () => (
    <div className="product-page-form">
      <div className="pp-card">
        <span className="pp-title">Eksik Bilgilerinizi Tamamlayın</span>
        <p className="pp-subtitle">
          Kasko Sigortası teklifiniz için eksik bilgilerinizi doldurunuz
        </p>

      

        <div>
          <div className="pp-form-row">
            <div className="pp-form-group">
              <label className="pp-label">Ad Soyad</label>
              <input
                type="text"
                className="pp-input"
                id="fullName"
                name="fullName"
                value={formik.values.fullName || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '').toUpperCase();
                  formik.setFieldValue('fullName', value);
                }}
                onBlur={formik.handleBlur}
                placeholder="Adınız ve Soyadınız"
              />
            </div>
          </div>

          <div className="pp-form-row">
            <div className="pp-form-group">
              <label className="pp-label">İl</label>
              <Dropdown
                id="city"
                name="city"
                value={formik.values.city || ''}
                options={cities
                  .sort((a, b) => parseInt(a.value) - parseInt(b.value))
                  .map(city => ({
                    label: city.text,
                    value: city.value
                  }))}
                onChange={async (e: DropdownChangeEvent) => {
                  const cityValue = e.value;
                  formik.setFieldValue('city', cityValue);
                  formik.setFieldValue('district', '');
                  setDistricts([]);

                  if (cityValue) {
                    const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_DISTRICTS(cityValue));
                    if (response.ok) {
                      const data = await response.json();
                      setDistricts(data);
                    }
                  }
                }}
                onBlur={() => formik.setFieldTouched('city', true)}
                placeholder="Seçiniz"
                className="pp-dropdown"
                filter
                filterPlaceholder="Ara..."
                emptyFilterMessage="Sonuç bulunamadı"
                showClear={false}
              />
            </div>

            <div className="pp-form-group">
              <label className="pp-label">İlçe</label>
              <Dropdown
                id="district"
                name="district"
                value={formik.values.district || ''}
                options={districts
                  .sort((a, b) => a.text.localeCompare(b.text, 'tr'))
                  .map(district => ({
                    label: district.text,
                    value: district.value
                  }))}
                onChange={(e: DropdownChangeEvent) => formik.setFieldValue('district', e.value)}
                onBlur={() => formik.setFieldTouched('district', true)}
                placeholder="Seçiniz"
                className="pp-dropdown"
                filter
                filterPlaceholder="Ara..."
                emptyFilterMessage="Sonuç bulunamadı"
                disabled={!formik.values.city || districts.length === 0}
                showClear={false}
              />
            </div>
          </div>

          <button
            type="button"
            className="pp-btn-submit"
            onClick={handleUpdateAdditionalInfo}
            disabled={isLoading || !formik.values.fullName || !formik.values.city || !formik.values.district}
          >
            {isLoading ? 'Kaydediliyor...' : 'Devam Et'}
          </button>
        </div>
      </div>
    </div>
  );

  // Handle additional info update
  const handleUpdateAdditionalInfo = async () => {
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

      const userEnteredEmail = localStorage.getItem('kaskoInitialEmail');
      const userEnteredJobStr = localStorage.getItem('kaskoInitialJob');

      const updatePayload: Record<string, any> = {
        identityNumber: currentMeData.identityNumber,
        birthDate: currentMeData.birthDate,
        primaryPhoneNumber: currentMeData.primaryPhoneNumber,
        fullName: formik.values.fullName.trim(),
        cityReference: formik.values.city.trim(),
        districtReference: formik.values.district.trim(),
        gender: currentMeData.gender,
        educationStatus: currentMeData.educationStatus,
        nationality: currentMeData.nationality,
        maritalStatus: currentMeData.maritalStatus,
        representedBy: currentMeData.representedBy,
      };

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

      const updatedProfile = await updateCustomerProfile(updatePayload, customerIdToUse, CustomerType.Individual);

      setUser({
        id: customerIdToUse,
        name: updatedProfile.fullName || formik.values.fullName,
        email: updatedProfile.primaryEmail || userEnteredEmail || '',
        phone: updatedProfile.primaryPhoneNumber?.number || currentMeData.primaryPhoneNumber?.number || '',
      });

      if (customerIdToUse) {
        localStorage.setItem('proposalIdForKasko', customerIdToUse);
      }

      // Set flag to prevent going back
      localStorage.setItem('kaskoPersonalInfoCompleted', 'true');

      // Create case for complete customer data - only if not already created
      const kaskoCase = localStorage.getItem('kaskoCaseCreated');
      if (!kaskoCase && customerIdToUse) {
        localStorage.setItem('kaskoCaseCreated', 'true');
        try {
          await createSaleOpportunityCase(customerIdToUse);
        } catch (error) {
          console.warn('Case oluşturma hatası:', error);
          localStorage.removeItem('kaskoCaseCreated');
        }
      }

      // DataLayer event
      pushToDataLayer({
        event: "kasko_formsubmit",
        form_name: "kasko_step1",
      });

      // Araç bilgileri için plaka il kodlarını yükle
      const citiesResponse = await fetchWithAuth(API_ENDPOINTS.ADDRESS_CITIES);
      if (citiesResponse.ok) {
        const citiesData = await citiesResponse.json();
        const sortedCities = citiesData
          .filter((c: any) => !['89', '999'].includes(c.value))
          .sort((a: any, b: any) => parseInt(a.value) - parseInt(b.value));

        setPlateCities(sortedCities);
      }

      setShowAdditionalInfo(false);
      setActiveStep(1);
    } catch (error) {
      setError('Bilgiler güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Additional info update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch customer cases via GraphQL
  const fetchCases = async (customerId: string) => {
    try {
      const graphqlQuery = {
        query: `query {
          cases(
            skip: 0
            take: 100
            where: {
              customerId: { eq: "${customerId}" }  
              status: { eq: OPEN }
              type: { eq: SALE_OPPORTUNITY }
            }
            order: { createdAt: DESC }
          ) {
            totalCount
            items {
              productBranch
              type
              status
            }
          }
        }`
      };

      const response = await fetchWithAuth(API_ENDPOINTS.CASES_GRAPHQL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphqlQuery),
      });

      if (!response.ok) {
        throw new Error(`GraphQL query failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('=== Customer Cases GraphQL Response ===');
      console.log('customerId:', customerId);
      console.log('totalCount:', data.data?.cases?.totalCount);
      console.log('cases:', data.data?.cases?.items);

      // Check for existing KASKO SALE_OPPORTUNITY with OPEN status
      const kaskoOpenSaleOpportunities = data.data?.cases?.items?.filter((caseItem: any) =>
        caseItem.productBranch === 'KASKO' &&
        caseItem.type === 'SALE_OPPORTUNITY' &&
        caseItem.status === 'OPEN'
      );

      console.log('KASKO SALE_OPPORTUNITY + OPEN cases:', kaskoOpenSaleOpportunities);
      console.log('Found', kaskoOpenSaleOpportunities?.length || 0, 'existing KASKO SALE_OPPORTUNITY + OPEN cases');

      return {
        cases: data.data?.cases,
        hasOpenKaskoSaleOpportunity: kaskoOpenSaleOpportunities && kaskoOpenSaleOpportunities.length > 0
      };
    } catch (error) {
      console.error('GraphQL cases query hatası:', error);
      throw error;
    }
  };

  // Create sale opportunity case with duplicate check
  const createSaleOpportunityCase = async (customerId: string) => {
    try {
      // First check if there's already an open KASKO sale opportunity
      console.log('🔍 Checking for existing KASKO SALE_OPPORTUNITY + OPEN cases...');
      const casesResult = await fetchCases(customerId);

      if (casesResult.hasOpenKaskoSaleOpportunity) {
        console.log('❌ KASKO SALE_OPPORTUNITY + OPEN case already exists. Skipping case creation.');
        return { skipped: true, reason: 'Open KASKO sale opportunity already exists' };
      }

      console.log('✅ No existing KASKO SALE_OPPORTUNITY + OPEN cases found. Creating new case...');

      const casePayload = {
        customerId: customerId,
        assetType: null,
        assetId: null,
        productBranch: "KASKO",
        channel: "WEBSITE"
      };

      const response = await fetchWithAuth(API_ENDPOINTS.CASES_NEW_SALE_OPPORTUNITY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(casePayload),
      });

      if (!response.ok) {
        throw new Error(`Case creation failed: ${response.status}`);
      }

      const caseData = await response.json();
      console.log('✅ Case oluşturuldu:', caseData);
      return caseData;
    } catch (error) {
      console.error('Case oluşturma hatası:', error);
      throw error;
    }
  };

  // Tramer query handler
  const handleTramerQuery = async () => {
    try {
      setIsTramerLoading(true);

      // Plakasız araç için direkt araç detaylarına geç
      if (vehicleType === 'unplated') {
        setVehicleDetailsStep(1);
        setIsTramerLoading(false);
        return;
      }

      // Plakalı araç için gerekli alanların kontrolü
      if (!formik.values.plateCity || !formik.values.plateCode) {
        setError('Plaka bilgileri eksik');
        setIsTramerLoading(false);
        return;
      }

      // customerId kontrolü
      let customerIdForTramer = getCustomerIdFromAuthStorage();

      if (!customerIdForTramer) {
        // Attempt to fetch from /me if not in auth-storage
        try {
          const meResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (meResponse.ok) {
            const meData = await meResponse.json() as { id?: string };
            customerIdForTramer = meData.id || null;
          }
        } catch (error) {
          console.error('ME fetch error:', error);
        }
      }

      if (!customerIdForTramer) {
        setError('Müşteri ID alınamadı, tramer sorgusu yapılamıyor.');
        setIsTramerLoading(false);
        return;
      }

      // Tramer sorgusu için gerekli verileri hazırla
      const tramerData = {
        plate: {
          city: formik.values.plateCity,
          code: formik.values.plateCode,
        },
        ...(formik.values.documentSerialCode && formik.values.documentSerialNumber && {
          documentSerial: {
            code: formik.values.documentSerialCode,
            number: formik.values.documentSerialNumber,
          },
        }),
      };

      try {
        const tramerResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_VEHICLES_QUERY(customerIdForTramer), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(tramerData),
        });

        if (tramerResponse.ok) {
          const tramerResult = await tramerResponse.json();
          if (tramerResult) {
            // Kullanım şekli string değerini enum'a çevir
            let usageTypeValue = '';
            if (tramerResult.utilizationStyle === 'PRIVATE_CAR') {
              usageTypeValue = VehicleUtilizationStyle.PrivateCar.toString();
            } else if (tramerResult.utilizationStyle === 'TAXI') {
              usageTypeValue = VehicleUtilizationStyle.Taxi.toString();
            } else if (tramerResult.utilizationStyle === 'COMMERCIAL') {
              usageTypeValue = VehicleUtilizationStyle.RouteBasedMinibus.toString();
            } else if (tramerResult.utilizationStyle === 'MOTORCYCLE') {
              usageTypeValue = VehicleUtilizationStyle.Motorcycle.toString();
            }

            // Yakıt tipi string değerini enum'a çevir
            let fuelTypeValue = '';
            if (tramerResult.fuelType === 'GASOLINE') {
              fuelTypeValue = VehicleFuelType.Gasoline.toString();
            } else if (tramerResult.fuelType === 'DIESEL') {
              fuelTypeValue = VehicleFuelType.Diesel.toString();
            } else if (tramerResult.fuelType === 'LPG') {
              fuelTypeValue = VehicleFuelType.Lpg.toString();
            } else if (tramerResult.fuelType === 'ELECTRIC') {
              fuelTypeValue = VehicleFuelType.Electric.toString();
            } else if (tramerResult.fuelType === 'LPG_GASOLINE') {
              fuelTypeValue = VehicleFuelType.LpgGasoline.toString();
            }

            // Tramer'den gelen eski poliçe bilgilerini state'e kaydet
            if (tramerResult.kaskoOldPolicy) {
              setKaskoOldPolicy(tramerResult.kaskoOldPolicy);
            }
            if (tramerResult.trafikOldPolicy) {
              setTrafikOldPolicy(tramerResult.trafikOldPolicy);
            }

            // Form değerlerini güncelle
            formik.setValues({
              ...formik.values,
              brandCode: tramerResult.model?.brand?.value || '',
              modelCode: tramerResult.model?.type?.value || '',
              year: tramerResult.model?.year?.toString() || '',
              engineNo: tramerResult.engine || '',
              chassisNo: tramerResult.chassis || '',
              registrationDate: tramerResult.registrationDate || '',
              seatCount: tramerResult.seatNumber?.toString() || '',
              usageType: usageTypeValue,
              fuelType: fuelTypeValue,
            });

            // Marka ve yıl bilgisi varsa model listesini yükle
            if (tramerResult.model?.brand?.value && tramerResult.model?.year) {
              try {
                await fetchModels(
                  tramerResult.model.brand.value,
                  tramerResult.model.year.toString()
                );

                // Model listesi yüklendikten sonra model değerini seç
                setTimeout(() => {
                  if (tramerResult.model?.type?.value) {
                    formik.setFieldValue('modelCode', tramerResult.model.type.value);
                  }
                }, 100);
              } catch (error) {
                console.error('Model fetch error:', error);
              }
            }

            setVehicleDetailsStep(1);
          }
        } else {
          // Tramer sorgusu başarısız - popup göster ve araç detaylarına geç
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
      } catch (error) {
        // Tramer sorgusu hata verdi - popup göster ve araç detaylarına geç
        setShowTramerErrorPopup(true);
        setVehicleDetailsStep(1);
        console.error('Tramer error:', error);
      }
    } catch (error) {
      setError('Bir hata oluştu');
      console.error('Error:', error);
    } finally {
      setIsTramerLoading(false);
    }
  };

  // If showing additional info, render that instead
  if (showAdditionalInfo) {
    return renderAdditionalInfoForm();
  }

  return (
    <>
      <div className="product-page-flow-container">
        {/* Stepper */}
        <div className="pp-stepper">
          <div className={`pp-step ${activeStep === 0 ? 'active' : ''} ${activeStep > 0 ? 'completed' : ''}`}>
            <div className="pp-step-visual">
              <span>1</span>
            </div>
            <div className="pp-step-label">
              <span>Kişisel</span>
              <span>Bilgiler</span>
            </div>
          </div>

          <div className={`pp-step ${activeStep === 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`}>
            <div className="pp-step-visual">
              <span>2</span>
            </div>
            <div className="pp-step-label">
              <span>Araç</span>
              <span>Bilgileri</span>
            </div>
          </div>

          <div className={`pp-step ${activeStep === 2 ? 'active' : ''} ${activeStep > 2 ? 'completed' : ''}`}>
            <div className="pp-step-visual">
              <span>3</span>
            </div>
            <div className="pp-step-label">
              <span>Teklif</span>
              <span>Karşılaştırma</span>
            </div>
          </div>

          <div className={`pp-step ${activeStep === 3 ? 'active' : ''} ${activeStep > 3 ? 'completed' : ''}`}>
            <div className="pp-step-visual">
              <span>4</span>
            </div>
            <div className="pp-step-label">
              <span>Ödeme</span>
            </div>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit}>
          {activeStep === 0 && renderPersonalInfoStep()}
          {activeStep === 1 && renderVehicleSelection()}
        </form>

        {/* Step 2: Teklif Karşılaştırma */}
        {activeStep === 2 && proposalIdFromUrl && (
          <KaskoProductQuote
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
              // Başarılı ödeme sonrası yönlendirme PurchaseStepNew içinde yapılıyor
            }}
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
      {showTramerErrorPopup && (
        <div className="pp-modal-overlay" onClick={() => setShowTramerErrorPopup(false)}>
          <div className="pp-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="pp-modal-title">Bilgilendirme</span>
            <p className="pp-modal-description">
              Araç bilgileri otomatik olarak getirilemedi. Lütfen manuel olarak giriş yapınız.
            </p>
            <button
              type="button"
              className="pp-btn-verify"
              onClick={() => setShowTramerErrorPopup(false)}
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      {/* Araç Güncelleme Modal */}
      {showUpdateVehicleModal && editingVehicleId && (
        <UpdateVehicleModal
          vehicleId={editingVehicleId}
          onClose={handleCloseUpdateModal}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
};

export default KaskoProductForm;

