"use client";

import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Link,
  Modal,
  Backdrop,
  Autocomplete,
  Card,
} from '@mui/material';
import { useFormik, FormikValues } from 'formik';
import * as yup from 'yup';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Timer } from 'lucide-react';
import CustomSelect from '../../../common/Input/CustomSelect';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { CustomerProfile } from '@/services/fetchWithAuth';
import { useAgencyConfig } from '../../../../context/AgencyConfigProvider';
import { validateBirthDate, validateTCKNFull, validateTurkishPhoneStrict } from '../../../../utils/validators';
import { performLogin, verifyOTP, updateCustomerProfile } from '../../../../utils/authHelper';
import PhoneNotMatchModal from '../../../common/PhoneNotMatchModal';

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

// Helper function for TCKN validation
const isValidTCKN = (tckn: string): boolean => {
  if (!/^[1-9]\d{10}$/.test(tckn)) {
    return false; // Must be 11 digits, all numeric, first digit not 0
  }

  const digits = tckn.split('').map(Number);
  const sumOdd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const sumEven = digits[1] + digits[3] + digits[5] + digits[7];

  const calculatedChecksum10 = (sumOdd * 7 - sumEven + 100) % 10;
  if (calculatedChecksum10 !== digits[9]) {
    return false;
  }

  const sumTotal = digits.slice(0, 10).reduce((acc, digit) => acc + digit, 0);
  const checksum11 = sumTotal % 10;

  return checksum11 === digits[10];
};

// Helper function to check for repetitive phone numbers
const isRepetitivePhoneNumber = (phone: string): boolean => {
  if (!phone || phone.length !== 10) return false; // Basic check
  // Check if all digits are the same
  const firstDigit = phone[0];
  if (phone.split('').every((digit) => digit === firstDigit)) {
    return true;
  }
  // Add more checks for sequences if needed, e.g., '5123456789'
  return false;
};

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

function validateIdentityNumber(number: string): boolean {
  if (!/^\d{11}$/.test(number)) return false;
  const digits = number.split('').map((d) => parseInt(d, 10));
  if (digits[0] === 0) return false;
  const sumOdd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const sumEven = digits[1] + digits[3] + digits[5] + digits[7];
  const check10 = ((sumOdd * 7) - sumEven) % 10;
  if (check10 !== digits[9]) return false;
  const sumAll = digits.slice(0, 10).reduce((acc, val) => acc + val, 0);
  const check11 = sumAll % 10;
  if (check11 !== digits[10]) return false;
  return true;
}

const loginValidationSchema = yup.object({
  identityNumber: yup
    .string()
    .required('TC Kimlik No gereklidir')
    .test('tckn-validation', '', function(value) {
      if (!value) return true; // required zaten kontrol ediyor
      const validation = validateTCKNFull(value);
      if (!validation.isValid) {
        return this.createError({ message: validation.message });
      }
      return true;
    }),
  email: yup.string().email('Geçerli bir e-posta giriniz').required('E-posta gereklidir'),
  phoneNumber: yup
    .string()
    .required('Telefon numarası gereklidir')
    .test('phone-validation', '', function(value) {
      if (!value) return true; // required zaten kontrol ediyor
      const validation = validateTurkishPhoneStrict(value, true);
      if (!validation.isValid) {
        return this.createError({ message: validation.message });
      }
      return true;
    }),
  birthDate: yup
    .string()
    .required('Doğum tarihi gereklidir')
    .test('birth-date-validation', '', function(value) {
      if (!value) return true; // required zaten kontrol ediyor
      const validation = validateBirthDate(value);
      if (!validation.isValid) {
        return this.createError({ message: validation.message });
      }
      return true;
    }),
  job: yup.number(),
  acceptTerms: yup
    .boolean()
    .oneOf(
      [true],
      "Devam etmek için Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni'ni ve Açık Rıza Metni'ni onaylamanız gerekmektedir"
    ),
  acceptCommercial: yup.boolean(),
});

const additionalInfoValidationSchema = yup.object({
  fullName: yup.string().required('Ad Soyad zorunludur'),
  city: yup.string().required('İl seçimi zorunludur'),
  district: yup.string().required('İlçe seçimi zorunludur'),
});

interface PersonalInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const getJobFromString = (job: string): Job => {
  switch (job) {
    case 'BANKER':
      return Job.Banker;
    case 'CORPORATE_EMPLOYEE':
      return Job.CorporateEmployee;
    case 'LTD_EMPLOYEE':
      return Job.LtdEmployee;
    case 'POLICE':
      return Job.Police;
    case 'MILITARY_PERSONNEL':
      return Job.MilitaryPersonnel;
    case 'RETIRED_SPOUSE':
      return Job.RetiredSpouse;
    case 'TEACHER':
      return Job.Teacher;
    case 'DOCTOR':
      return Job.Doctor;
    case 'PHARMACIST':
      return Job.Pharmacist;
    case 'NURSE':
      return Job.Nurse;
    case 'HEALTHCARE_WORKER':
      return Job.HealthcareWorker;
    case 'LAWYER':
      return Job.Lawyer;
    case 'JUDGE':
      return Job.Judge;
    case 'PROSECUTOR':
      return Job.Prosecutor;
    case 'FREELANCER':
      return Job.Freelancer;
    case 'FARMER':
      return Job.Farmer;
    case 'INSTRUCTOR':
      return Job.Instructor;
    case 'RELIGIOUS_OFFICIAL':
      return Job.ReligiousOfficial;
    case 'ASSOCIATION_MANAGER':
      return Job.AssociationManager;
    case 'OFFICER':
      return Job.Officer;
    case 'RETIRED':
      return Job.Retired;
    case 'HOUSEWIFE':
      return Job.Housewife;
    default:
      return Job.Unknown;
  }
};

const PersonalInfoStep = ({ onNext, onBack, isFirstStep, isLastStep }: PersonalInfoStepProps) => {
  const { accessToken, setTokens, setUser, customerId, setCustomerId } = useAuthStore();
  const { agency: { id: agentId } } = useAgencyConfig();
  const router = useRouter();
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<Array<{ value: string; text: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ value: string; text: string }>>([]);
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [cityError, setCityError] = useState<string | null>(null);
  const [districtError, setDistrictError] = useState<string | null>(null);
  const [userData, setUserData] = useState<Partial<Omit<CustomerProfile, 'job' | 'city' | 'district'> & { tcNo?: string; phone?: string; firstName?: string; lastName?: string; cityReference?: string; districtReference?: string; job?: Job; city?: { value: string; text: string; } | string | null; district?: { value: string; text: string; } | string | null; }>>({
    id: '',
    identityNumber: undefined,
    tcNo: '',
    birthDate: '',
    primaryPhoneNumber: undefined,
    phone: '',
    primaryEmail: '',
    fullName: '',
    firstName: '',
    lastName: '',
    city: null,
    cityReference: '',
    district: null,
    districtReference: '',
    job: Job.Unknown,
  });
  const [showVerification, setShowVerification] = useState(false);
  const [tempToken, setTempToken] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPhoneNotMatchModal, setShowPhoneNotMatchModal] = useState(false);
  const [showCorporateDialog, setShowCorporateDialog] = useState(false);

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

  useEffect(() => {
    if (showVerification) {
      setTimeLeft(60);
    }
  }, [showVerification]);

  useEffect(() => {
    let isMounted = true;
    // Sadece showAdditionalInfo true ise ve accessToken varsa cities çek
    if (showAdditionalInfo && cities.length === 0 && isMounted && accessToken) {
      fetchWithAuthCities(isMounted);
    }
    return () => {
      isMounted = false;
    };
  }, [showAdditionalInfo, cities.length, accessToken]);

  useEffect(() => {
    let isMounted = true;
    const fetchUserDataAndProceed = async () => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const rawResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
        if (!rawResponse.ok) {
          setIsLoading(false);
          return;
        }
        const responseData = await rawResponse.json();
        if (!responseData || !responseData.id) {
          setIsLoading(false);
          return;
        }
        if (!isMounted) return;
        // $type kontrolü (case-insensitive)
        if (typeof responseData.$type === 'string' && responseData.$type.toLowerCase() === 'company') {
          setShowCorporateDialog(true);
        }
        // Customer ID'yi auth-storage'a set et
        if (responseData.id && !customerId) {
          setCustomerId(responseData.id);
        }
        
        // Auth-storage'daki kullanıcı bilgilerini güncelle
        setUser({
          id: responseData.id || '',
          name: responseData.fullName || '',
          email: responseData.primaryEmail || '',
          phone: responseData.primaryPhoneNumber?.number || '',
        });

        const [firstNameFromFile, ...lastNamePartsFromFile] = (responseData.fullName || '').split(' ');

        setUserData(prev => ({
          ...prev,
          ...responseData,
          primaryEmail: responseData.primaryEmail || prev.primaryEmail,
          tcNo: responseData.identityNumber?.toString() || prev.tcNo || '',
          phone: responseData.primaryPhoneNumber?.number || prev.phone || '',
          firstName: firstNameFromFile || prev.firstName || '',
          lastName: lastNamePartsFromFile.join(' ') || prev.lastName || '',
          cityReference: (typeof responseData.city === 'object' && responseData.city ? responseData.city.value : responseData.city) || prev.cityReference || '',
          districtReference: (typeof responseData.district === 'object' && responseData.district ? responseData.district.value : responseData.district) || prev.districtReference || '',
          job: getJobFromString(responseData.job ?? (typeof prev.job === 'number' ? Job[prev.job] : '')),
        }));

        formik.setValues(prevValues => ({
          ...prevValues,
          identityNumber: responseData.identityNumber?.toString() || '',
          email: responseData.primaryEmail ? responseData.primaryEmail : (prevValues.email || ''),
          phoneNumber: responseData.primaryPhoneNumber?.number || '',
          birthDate: responseData.birthDate || '',
          job: getJobFromString(responseData.job ?? ''),
          fullName: responseData.fullName || '',
          city: typeof responseData.city === 'object' && responseData.city ? responseData.city.value : responseData.city || '',
          district: typeof responseData.district === 'object' && responseData.district ? responseData.district.value : responseData.district || '',
        }), false);

        if (responseData.city) {
          await fetchWithAuthCities(isMounted); // ensure cities are loaded
          const cityValueForDistricts = typeof responseData.city === 'object' && responseData.city ? responseData.city.value : responseData.city;
          if (cityValueForDistricts && responseData.district) { // ensure cityValue is a string and district exists
            await fetchWithAuthDistricts(cityValueForDistricts, isMounted);
          }
        }
        // Kullanıcı verilerini forma doldur, ancak otomatik step geçişi yapma
        const { fullName, city, district } = responseData;
        if (!fullName || !city || !district) {
            setShowAdditionalInfo(true);
        } else {
          // Eksik bilgi kontrolü ve otomatik step geçişi (DASK'taki gibi)
          const cityValue = typeof responseData.city === 'object' && responseData.city ? responseData.city.value : responseData.city;
          const districtValue = typeof responseData.district === 'object' && responseData.district ? responseData.district.value : responseData.district;
          const isCoreDataComplete = responseData.fullName && cityValue && districtValue;
          
          if (isCoreDataComplete) {
            const currentCustId = getCustomerIdFromAuthStorage();
            if (currentCustId) {
              localStorage.setItem('ferdiKazaProposalId', currentCustId);
            }
            // Otomatik step geçişi - analytics step event
            pushToDataLayer({
              event: "ferdikaza_formsubmit",
              form_name: "ferdikaza_step1"
            });
            onNext();
          } else {
            setShowAdditionalInfo(true);
          }
        }
        // onNext() çağrısı kaldırıldı - çift step geçişi önlendi

      } catch (error) {
        // Cities will be fetched when user logs in and showAdditionalInfo becomes true
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUserDataAndProceed();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Sadece mount'ta çalışsın

  const fetchWithAuthCities = async (isMountedParam?: boolean) => {
    const canUpdateState = isMountedParam === undefined ? true : isMountedParam;
    if (canUpdateState) setIsLoading(true);
    if (canUpdateState) setCityError(null);
    try {
      const rawResponse = await fetchWithAuth(API_ENDPOINTS.ADDRESS_CITIES);
      if (!rawResponse.ok) {
        const errorText = await rawResponse.text();
        if (canUpdateState) setCityError('Şehirler yüklenemedi. Lütfen tekrar deneyin.');
        throw new Error(`Şehirler alınamadı (Kasko): ${rawResponse.status}`);
      }
      const responseData = await rawResponse.json() as Array<{ value: string; text: string }>;
      if (canUpdateState) setCities(responseData);
    } catch (error) {
      if (canUpdateState && !cityError) setCityError('Şehirler yüklenirken bir sorun oluştu.');
    } finally {
      if (canUpdateState) setIsLoading(false);
    }
  };

  const fetchWithAuthDistricts = async (cityValue: string, isMountedParam?: boolean) => {
    const canUpdateState = isMountedParam === undefined ? true : isMountedParam;
    if (canUpdateState) setIsLoading(true);
    if (canUpdateState) setDistrictError(null);
    if (canUpdateState) setDistricts([]); 
    try {
      const rawResponse = await fetchWithAuth(API_ENDPOINTS.ADDRESS_DISTRICTS(cityValue));
      if (!rawResponse.ok) {
        const errorText = await rawResponse.text();
        if (canUpdateState) setDistrictError('İlçeler yüklenemedi. Lütfen tekrar deneyin.');
        throw new Error(`İlçeler yüklenemedi (Kasko): ${rawResponse.status}`);
      }
      const data = await rawResponse.json() as Array<{ value: string; text: string }>;
      if (canUpdateState) setDistricts(data);
    } catch (error) {
      if (canUpdateState && !districtError) setDistrictError('İlçeler yüklenirken bir sorun oluştu.');
    } finally {
      if (canUpdateState) setIsLoading(false);
    }
  };

  const formik = useFormik<FormikValues>({
    initialValues: {
      identityNumber: userData.tcNo || '',
      email: userData.primaryEmail || '',
      phoneNumber: userData.phone || '',
      birthDate: userData.birthDate || '',
      job: userData.job || Job.Unknown,
      acceptTerms: false,
      acceptCommercial: false,
      fullName: userData.fullName || '',
      city: userData.cityReference || (typeof userData.city === 'object' && userData.city ? userData.city.value : userData.city || ''),
      district: userData.districtReference || (typeof userData.district === 'object' && userData.district ? userData.district.value : userData.district || ''),
    },
    enableReinitialize: true,
    validationSchema: showAdditionalInfo ? additionalInfoValidationSchema : loginValidationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      
      // İlk stepte girilen email ve job değerlerini localStorage'a kaydet
      if (!showAdditionalInfo && values.email && values.job !== Job.Unknown) {
        localStorage.setItem('ferdiKazaInitialEmail', values.email);
        localStorage.setItem('ferdiKazaInitialJob', values.job.toString());
      }
      
      try {
        const tokenToUse = accessToken;
        let currentCustomerId = getCustomerIdFromAuthStorage();
        
        if (!tokenToUse) {
          try {
            const cleanPhoneNumber = values.phoneNumber.replace(/\D/g, '');
            const loginData = await performLogin(
              parseInt(values.identityNumber as string),
              values.birthDate,
              cleanPhoneNumber,
              agentId
            );

            if (loginData.customerId) {
              // setCustomerId(loginData.customerId); // Store will be updated by auth-storage if it uses it
              // localStorage.setItem('customerId', loginData.customerId); // Avoid direct write to 'customerId'
              currentCustomerId = loginData.customerId; // Use this for proposalId logic
              // The auth-storage should be set by the login process itself, then use getCustomerIdFromAuthStorage()
            }
            
            if (loginData.token) {
                setTempToken(loginData.token);
                setShowVerification(true);
            } else {
                setError('Giriş işlemi sırasında bir sorun oluştu, token alınamadı.');
            }
            setIsLoading(false);
            return;
          } catch (error: any) {
            // 404 hatası ve RESOURCE_NOT_FOUND_DATABASE kodu kontrolü
            if (error?.status === 404 || error?.codes?.includes('RESOURCE_NOT_FOUND_DATABASE')) {
              setShowPhoneNotMatchModal(true);
            } else {
              setError(error instanceof Error ? error.message : 'Bir hata oluştu');
            }
            setIsLoading(false);
            return;
          }
        }

        // If tokenToUse exists, proceed with profile update
        currentCustomerId = getCustomerIdFromAuthStorage(); // Ensure we have the latest from auth-storage
        if (!currentCustomerId) {
            setError("Kimlik bilgisi bulunamadı, lütfen tekrar giriş yapmayı deneyin.");
            setIsLoading(false);
            return;
        }

        const updatePayload: Record<string, any> = {};
        if (values.fullName?.trim()) updatePayload.fullName = values.fullName.trim();
        if (values.birthDate) updatePayload.birthDate = values.birthDate;
        
        // Email ve job'u localStorage'dan al (ilk stepte kaydedilmiş)
        const emailFromLocalStorage = localStorage.getItem('ferdiKazaInitialEmail');
        if (emailFromLocalStorage) {
          updatePayload.primaryEmail = emailFromLocalStorage;
        }
        
        // Job'u localStorage'dan al ve Unknown değilse gönder
        const jobFromLocalStorage = localStorage.getItem('ferdiKazaInitialJob');
        if (jobFromLocalStorage && parseInt(jobFromLocalStorage) !== Job.Unknown) {
          updatePayload.job = parseInt(jobFromLocalStorage);
        }

        // Debug: localStorage vs formik values karşılaştırması

        if (values.phoneNumber?.trim()) updatePayload.primaryPhoneNumber = { number: values.phoneNumber.trim().replace(/\D/g, ''), countryCode: 90 };
        if (values.city?.trim()) updatePayload.cityReference = values.city.trim();
        if (values.district?.trim()) updatePayload.districtReference = values.district.trim();

        const updatedProfile = await updateCustomerProfile(updatePayload, currentCustomerId);
        
        // Email'i localStorage'dan da al ve useAuthStore'u güncelle
        const finalEmail = updatedProfile.primaryEmail || emailFromLocalStorage || '';
        setUser({ 
          id: updatedProfile.id, 
          name: updatedProfile.fullName || '', 
          email: finalEmail, 
          phone: updatedProfile.primaryPhoneNumber?.number || '' 
        });

        // Set proposalIdForKasko using the customerId from auth-storage (which is currentCustomerId)
        if (currentCustomerId) {
            localStorage.setItem('ferdiKazaProposalId', currentCustomerId);
        } else {
        }

        // Step geçişi - analytics step event
        pushToDataLayer({
          event: "ferdikaza_formsubmit",
          form_name: "ferdikaza_step1"
        });
        onNext();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Yeni senkron güncelleme fonksiyonu
  const updateUserProfileWithCurrentData = async (email: string, job: number): Promise<void> => {
    try {
      // Önce güncel profil bilgilerini al
      const currentProfileResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
      if (!currentProfileResponse.ok) {
        throw new Error('Güncel profil bilgileri alınamadı');
      }
      
      const currentProfile = await currentProfileResponse.json() as CustomerProfile;
      
      // Mevcut verileri koru, sadece email ve job ekle/güncelle
      const updatePayload: any = {
        ...currentProfile,
        primaryEmail: email,
        job: job !== Job.Unknown ? job : undefined
      };
      
      // Gereksiz alanları temizle
      delete updatePayload.id;
      delete updatePayload.createdAt;
      if (updatePayload.updatedAt) delete updatePayload.updatedAt;
      
      // Profili güncelle
      await updateCustomerProfile(updatePayload, currentProfile.id);
      
    } catch (error) {
      throw error;
    }
  };

  const handleVerifyOTP = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const verifyData = await verifyOTP(tempToken, verificationCode);

      // setTokens and setCustomerId will update the authStore.
      setTokens(verifyData.accessToken, verifyData.refreshToken);
      
      // customerId'yi öncelikle verifyData'dan almayı dene
      let customerIdToUse = verifyData.customerId;

      if (customerIdToUse) {
        setCustomerId(customerIdToUse);
      } else {
      }

      // Güncel profil bilgilerini direkt /me endpoint'inden al
      let meData: CustomerProfile | null = null;
      
      try {
        const rawMeResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
        if (rawMeResponse.ok) {
          meData = await rawMeResponse.json() as CustomerProfile;
        }
      } catch (error) {
      }

      if (meData) {
        // customerId kontrolü
          if (!customerIdToUse) {
            customerIdToUse = meData.id;
            setCustomerId(customerIdToUse);
          } else if (customerIdToUse !== meData.id) {
            customerIdToUse = meData.id;
            setCustomerId(customerIdToUse);
          }
          
          // setUser çağrısında customerIdToUse kullan ve email'i localStorage'dan da al
          const storedEmail = localStorage.getItem('ferdiKazaInitialEmail');
        const storedJob = localStorage.getItem('ferdiKazaInitialJob');
          const finalEmailForUser = meData.primaryEmail || storedEmail || '';
          setUser({
            id: customerIdToUse, 
            name: meData.fullName || '', 
            email: finalEmailForUser, 
            phone: meData.primaryPhoneNumber?.number || ''
          });
          
          // Eksik bilgi kontrolü
          const cityValue = typeof meData.city === 'object' && meData.city ? meData.city.value : meData.city;
          const districtValue = typeof meData.district === 'object' && meData.district ? meData.district.value : meData.district;
          const isCoreDataMissing = !meData.fullName || !cityValue || !districtValue;
        

          if (isCoreDataMissing) {
              // Eksik bilgileri forma set et
              formik.setValues(prev => ({
                  ...prev,
                  identityNumber: meData.identityNumber?.toString() || '',
                  email: meData.primaryEmail || prev.email || '',
                  phoneNumber: meData.primaryPhoneNumber?.number || '',
                  birthDate: meData.birthDate || '',
                  job: getJobFromString(meData.job ?? '') || prev.job || Job.Unknown,
                  fullName: meData.fullName || '',
                  city: cityValue || '',
                  district: districtValue || '',
                  acceptTerms: prev.acceptTerms,
                  acceptCommercial: prev.acceptCommercial
              }), false);
          
              // Districts will be fetched if cityValue exists when showAdditionalInfo becomes true
              if (cityValue) await fetchWithAuthDistricts(cityValue, true);
              setShowAdditionalInfo(true);
          } else {
          // Profil bilgileri tam, önce senkron güncelleme yap
          
          if (storedEmail || (storedJob && parseInt(storedJob) !== Job.Unknown)) {
            try {
              await updateUserProfileWithCurrentData(
                storedEmail || meData.primaryEmail || '',
                storedJob ? parseInt(storedJob) : Job.Unknown
              );
            } catch (syncError) {
            }
          }
          
          onNext();

          // Otomatik talep oluştur
              await handleCreateRequestInPersonalInfo(verifyData.accessToken);
              return; // Early return to prevent further processing
          }
      } else {
          setShowAdditionalInfo(true); 
      }

      setShowVerification(false);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'OTP doğrulama sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8)}`;
  };

  const handleUpdateAdditionalInfo = async (values: FormikValues) => {
    setFullNameError(null);
    setCityError(null);
    setDistrictError(null);
    setError(null);
    setIsLoading(true);

    let isValid = true;
    if (!values.fullName?.trim()) {
      setFullNameError('Ad Soyad gereklidir.');
      isValid = false;
    }
    if (!values.city?.trim()) {
      setCityError('İl seçimi gereklidir.');
      isValid = false;
    }
    if (!values.district?.trim()) {
      setDistrictError('İlçe seçimi gereklidir.');
      isValid = false;
    }

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
      // Senkron güncelleme yaklaşımı: önce mevcut profili al, sonra güncelle
      const currentProfileResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
      if (!currentProfileResponse.ok) {
        throw new Error('Güncel profil bilgileri alınamadı');
      }
      
      const currentProfile = await currentProfileResponse.json() as CustomerProfile;
      
      // Email ve job'u localStorage'dan al (ilk stepte kaydedilmiş)
      const emailFromLocalStorage = localStorage.getItem('ferdiKazaInitialEmail');
      const jobFromLocalStorage = localStorage.getItem('ferdiKazaInitialJob');
      
      // Mevcut profil verilerini koru ve sadece gerekli alanları güncelle
      const updatePayload: any = {
        ...currentProfile,
        fullName: values.fullName?.trim(),
        cityReference: values.city?.trim(),
        districtReference: values.district?.trim(),
        primaryEmail: emailFromLocalStorage || currentProfile.primaryEmail,
        job: (jobFromLocalStorage && parseInt(jobFromLocalStorage) !== Job.Unknown) 
          ? parseInt(jobFromLocalStorage) 
          : currentProfile.job
      };
      
      // Gereksiz alanları temizle
      delete updatePayload.id;
      delete updatePayload.createdAt;
      if (updatePayload.updatedAt) delete updatePayload.updatedAt;

      const currentCustomerId = getCustomerIdFromAuthStorage();
      if (!currentCustomerId) {
        throw new Error('Müşteri ID bulunamadı');
      }

      const finalUpdatedProfile = await updateCustomerProfile(updatePayload, currentCustomerId);
      
      const customerIdForProposal = getCustomerIdFromAuthStorage() || finalUpdatedProfile.id; 
      if (customerIdForProposal) {
        localStorage.setItem('ferdiKazaProposalId', customerIdForProposal);
      } else {
      }
      
      const currentId = customerIdForProposal;

      setUserData(prev => ({
        ...prev,
        id: currentId, 
        firstName: finalUpdatedProfile.fullName?.split(' ')[0] || '',
        lastName: finalUpdatedProfile.fullName?.split(' ').slice(1).join(' ') || '',
        cityReference: (typeof finalUpdatedProfile.city === 'object' && finalUpdatedProfile.city ? finalUpdatedProfile.city.value : finalUpdatedProfile.city) || '',
        districtReference: (typeof finalUpdatedProfile.district === 'object' && finalUpdatedProfile.district ? finalUpdatedProfile.district.value : finalUpdatedProfile.district) || '',
        birthDate: finalUpdatedProfile.birthDate || prev.birthDate,
        phone: finalUpdatedProfile.primaryPhoneNumber?.number || prev.phone,
        primaryEmail: finalUpdatedProfile.primaryEmail || emailFromLocalStorage || prev.primaryEmail,
        job: getJobFromString(finalUpdatedProfile.job ?? '') || prev.job,
        city: (typeof finalUpdatedProfile.city === 'object' && finalUpdatedProfile.city ? finalUpdatedProfile.city.value : finalUpdatedProfile.city) || '',
        district: (typeof finalUpdatedProfile.district === 'object' && finalUpdatedProfile.district ? finalUpdatedProfile.district.value : finalUpdatedProfile.district) || '',
      }));

      // useAuthStore'daki user bilgilerini güncellerken email'i de dahil et
      setUser({ 
        id: currentId, 
        name: finalUpdatedProfile.fullName || '',
        email: finalUpdatedProfile.primaryEmail || emailFromLocalStorage || userData.primaryEmail || '',
        phone: finalUpdatedProfile.primaryPhoneNumber?.number || userData.phone || '',
      });
      
      // Müşteri bilgileri güncellendikten sonra talep oluştur
      // Step geçişi - analytics step event (manuel form doldurma)
      pushToDataLayer({
        event: "ferdikaza_formsubmit",
        form_name: "ferdikaza_step1"
      });
      
      await handleCreateRequestInPersonalInfo(accessToken || undefined);
      
    } catch (error) {
      setError('Bilgiler güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsLoading(false);
    }
  };

  // Yeni fonksiyon: PersonalInfoStep içinde talep oluşturma
  const handleCreateRequestInPersonalInfo = async (tokenToUse?: string) => {
    try {
      const currentCustomerId = getCustomerIdFromAuthStorage();
      if (!currentCustomerId) {
        // Hata durumunu localStorage'a kaydet ve RequestStep'te göster
        localStorage.setItem('ferdiKazaRequestError', 'Müşteri bilgisi bulunamadı. Lütfen önceki adımları kontrol edin.');
        onNext();
        return;
      }

      // Token'ı parametre olarak al veya mevcut accessToken'ı kullan
      const currentToken = tokenToUse || accessToken;
      if (!currentToken) {
        // Hata durumunu localStorage'a kaydet ve RequestStep'te göster
        localStorage.setItem('ferdiKazaRequestError', 'Kimlik doğrulama sorunu. Lütfen sayfayı yenileyin.');
        onNext();
        return;
      }

      const requestPayload = {
        customerId: currentCustomerId,
        customerAssetReference: null,
        productBranch: "FERDI_KAZA",
        channel: "OFFLINE_PROPOSAL_FORM"
      };


      const response = await fetchWithAuth(API_ENDPOINTS.CASES_NEW_SALE_OPPORTUNITY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // API'den gelen hata mesajını parse et
        let errorMessage = `Talep oluşturulamadı: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
            const apiError = errorData.errors[0];
            
            // Özel hata mesajlarını kontrol et
            if (apiError.includes('zaten açık bir yeni satış fırsatı talebi bulunmaktadır')) {
              errorMessage = 'Bu müşteri için zaten açık bir Ferdi Kaza Sigortası talebi bulunmaktadır. Mevcut talebin sonuçlanmasını bekleyiniz.';
            } else {
              errorMessage = apiError;
            }
          }
        } catch (parseError) {
        }
        
        if (response.status === 401) {
          errorMessage = 'Oturum süreniz dolmuş. Lütfen sayfayı yenileyin ve tekrar deneyin.';
        } else if (response.status === 400 && !errorMessage.includes('zaten açık')) {
          errorMessage = 'Geçersiz talep bilgileri. Lütfen bilgilerinizi kontrol edin.';
        }
        
        // Hata durumunu localStorage'a kaydet ve RequestStep'te göster
        localStorage.setItem('ferdiKazaRequestError', errorMessage);
        onNext();
        return;
      }

      const responseData = await response.json();
      
      // Başarı durumunu localStorage'a kaydet
      localStorage.setItem('ferdiKazaRequestSuccess', 'true');
      localStorage.removeItem('ferdiKazaRequestError');
      
      // Otomatik talep oluşturma - analytics talep event
      pushToDataLayer({
        event: "ferdikaza_formsubmit",
        form_name: "ferdikaza_talep"
      });
      
      onNext();
      
    } catch (error) {
      // Hata durumunu localStorage'a kaydet ve RequestStep'te göster
      localStorage.setItem('ferdiKazaRequestError', error instanceof Error ? error.message : 'Talep oluşturulurken bir hata oluştu');
      onNext();
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code handler  
  const handleResendCode = async () => {
    setResendLoading(true);
    setError(null);
    
    try {
      const cleanPhoneNumber = formik.values.phoneNumber.replace(/\D/g, '');
      const loginData = await performLogin(
        parseInt(formik.values.identityNumber as string, 10),
        formik.values.birthDate,
        cleanPhoneNumber,
        agentId
      );

      // Yeni token'ı her durumda güncelle (customerId olsun veya olmasın)
      if (loginData.token) {
        setTempToken(loginData.token);
      }
    } catch (error: any) {
      // 404 hatası ve RESOURCE_NOT_FOUND_DATABASE kodu kontrolü
      if (error?.status === 404 || error?.codes?.includes('RESOURCE_NOT_FOUND_DATABASE')) {
        setShowPhoneNotMatchModal(true);
      } else {
        // Diğer hatalar için sessizce devam et
        console.warn('Resend hatası (kullanıcıya gösterilmiyor):', error);
      }
    }
    
    // Timer'ı her durumda başlat
    setTimeLeft(60);
    setVerificationCode('');
    setResendLoading(false);
  };

  const renderMainForm = () => (
    <Box >
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Kişisel Bilgiler
      </Typography>
      {error && <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>{error}</Typography>}

      {!showVerification && (
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* TC Kimlik No ve E-posta */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '250px' }}>
                <TextField
                  fullWidth
                  margin="none"
                  id="identityNumber"
                  name="identityNumber"
                  label="TC Kimlik No"
                  value={formik.values.identityNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    formik.setFieldValue('identityNumber', value);
                  }}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    // TCKN validasyonunu blur'da çalıştır
                    if (e.target.value) {
                      const validation = validateTCKNFull(e.target.value);
                      if (!validation.isValid) {
                        formik.setFieldError('identityNumber', validation.message);
                      }
                    }
                  }}
                  error={formik.touched.identityNumber && Boolean(formik.errors.identityNumber)}
                  helperText={formik.touched.identityNumber && formik.errors.identityNumber ? String(formik.errors.identityNumber) : ' '}
                  placeholder="TC Kimlik No giriniz"
                  disabled={!!accessToken}
                  inputProps={{ maxLength: 11 }}
                  FormHelperTextProps={{
                    sx: { minHeight: '20px', mt: 0.5, mb: 0.5 }
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: '250px' }}>
                <TextField
                  fullWidth
                  margin="none"
                  id="email"
                  name="email"
                  label="E-posta"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email ? String(formik.errors.email) : ' '}
                  placeholder="E-posta adresinizi giriniz"
                  FormHelperTextProps={{
                    sx: { minHeight: '20px', mt: 0.5, mb: 0.5 }
                  }}
                />
              </Box>
            </Box>

            {/* Telefon ve Doğum Tarihi */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '250px' }}>
                <TextField
                  fullWidth
                  margin="none"
                  id="phoneNumber"
                  name="phoneNumber"
                  label="Telefon"
                  value={formik.values.phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    
                    // İlk karakter her zaman 5 olmalı
                    if (value.length === 0) {
                      formik.setFieldValue('phoneNumber', '');
                    } else if (value.length === 1) {
                      if (value[0] === '5') {
                        formik.setFieldValue('phoneNumber', value);
                      } else {
                        // 5 değilse 5 ile başlat
                        formik.setFieldValue('phoneNumber', '5');
                      }
                    } else if (value.length > 1) {
                      // İlk karakter 5 değilse 5 ile başlat
                      if (value[0] !== '5') {
                        formik.setFieldValue('phoneNumber', '5' + value.slice(1));
                      } else {
                        formik.setFieldValue('phoneNumber', value);
                      }
                    }
                    
                    // Anlık validation
                    setTimeout(() => formik.validateField('phoneNumber'), 0);
                  }}
                  onBlur={() => {
                    formik.setFieldTouched('phoneNumber', true);
                    formik.validateField('phoneNumber');
                  }}
                  error={Boolean(formik.errors.phoneNumber)}
                  helperText={formik.errors.phoneNumber ? String(formik.errors.phoneNumber) : ' '}
                  placeholder="5xxxxxxxxx (10 haneli)"
                  disabled={!!accessToken}
                  inputProps={{ maxLength: 10 }}
                  FormHelperTextProps={{
                    sx: { minHeight: '20px', mt: 0.5, mb: 0.5 }
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: '250px' }}>
                <TextField
                  fullWidth
                  margin="none"
                  id="birthDate"
                  name="birthDate"
                  label="Doğum Tarihi"
                  type="date"
                  value={formik.values.birthDate}
                  onChange={formik.handleChange}
                  error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
                  helperText={formik.touched.birthDate && formik.errors.birthDate ? String(formik.errors.birthDate) : ' '}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: '1900-01-01',
                    max: new Date().toISOString().split('T')[0],
                  }}
                  FormHelperTextProps={{
                    sx: { minHeight: '20px', mt: 0.5, mb: 0.5 }
                  }}
                />
              </Box>
            </Box>

            {/* Meslek */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '250px' }}>
                <Autocomplete
                  options={jobOptions.sort((a, b) => a.label.localeCompare(b.label, 'tr'))}
                  getOptionLabel={(option) => option.label}
                  value={jobOptions.find((job) => job.value === formik.values.job) || null}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('job', newValue?.value || Job.Unknown);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      margin="none"
                      label="Meslek"
                      error={formik.touched.job && Boolean(formik.errors.job)}
                      helperText={formik.touched.job && formik.errors.job ? String(formik.errors.job) : ' '}
                      placeholder="Meslek seçiniz veya arama yapınız"
                      FormHelperTextProps={{
                        sx: { minHeight: '20px', mt: 0.5, mb: 0.5 }
                      }}
                    />
                  )}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: '250px' }} />
            </Box>

            {/* KVKK ve Ticari İleti Onayları */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              <FormControlLabel
                sx={{ mb: 0 }}
                control={
                  <Checkbox
                    checked={formik.values.acceptTerms}
                    onChange={formik.handleChange}
                    name="acceptTerms"
                    color="primary"
                  />
                }
                label={
                  <Typography>
                    <Link
                      href="/kvkk"
                      target="_blank"
                      underline="always"
                      sx={{ color: 'primary.main' }}
                    >
                      Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni
                    </Link>
                    {'\'ni ve '}
                    <Link
                      href="/acik-riza-metni"
                      target="_blank"
                      underline="always"
                      sx={{ color: 'primary.main' }}
                    >
                      Açık Rıza Metni
                    </Link>
                    {'\'ni okudum, onaylıyorum.'}
                  </Typography>
                }
              />
              {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                <FormHelperText error sx={{ ml: 4 }}>
                  {formik.errors.acceptTerms as string}
                </FormHelperText>
              )}

              <FormControlLabel
                sx={{ mb: 0 }}
                control={
                  <Checkbox
                    checked={formik.values.acceptCommercial}
                    onChange={formik.handleChange}
                    name="acceptCommercial"
                    color="primary"
                  />
                }
                label={
                  <Typography>
                    <Link
                      href="/elektronik-ileti-onayi"
                      target="_blank"
                      underline="always"
                      sx={{ color: 'primary.main' }}
                    >
                      Ticari Elektronik İleti Metni
                    </Link>
                    {'\'ni okudum, onaylıyorum.'}
                  </Typography>
                }
              />
              {formik.touched.acceptCommercial && formik.errors.acceptCommercial && (
                <FormHelperText error sx={{ ml: 4 }}>
                  {formik.errors.acceptCommercial as string}
                </FormHelperText>
              )}
            </Box>

            {/* Devam Et Butonu */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                disabled={isLoading} 
                sx={{ 
                  minWidth: 200,
                  height: 48,
                  borderRadius: 2,
                  ml: 'auto',
                  textTransform: 'none',
                }}
              >
                Devam et
              </Button>
            </Box>
          </Box>
        </form>
      )}
    </Box>
  );

  const renderVerificationModal = () => (
    <Modal
      open={showVerification}
      onClose={(event, reason) => {
        if (reason === 'backdropClick' && timeLeft > 0) {
          return;
        }
        setShowVerification(false);
      }}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Telefonuna bir doğrulama kodu gönderdik!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          <span className="font-medium">0{formik.values.phoneNumber.replace(/\D/g, '')}</span> numaralı cep
          telefonuna gelen doğrulama kodunu girebilir misin?
        </Typography>

        <TextField
          fullWidth
          label="Doğrulama Kodu"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputProps={{ maxLength: 6, inputMode: 'numeric' }}
          sx={{ mb: 2 }}
        />

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box /> {/* Sol tarafta boş alan */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {timeLeft > 0 ? (
              <>
                <Timer size={16} style={{ marginRight: 8 }} />
            <Typography variant="body2" color="text.secondary">
              00:{timeLeft.toString().padStart(2, '0')}
            </Typography>
              </>
          ) : (
            <Button 
              onClick={handleResendCode}
              disabled={resendLoading}
              size="small"
            >
              {resendLoading ? 'Gönderiliyor...' : 'Tekrar Kod Gönder'}
            </Button>
          )}
          </Box>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={handleVerifyOTP}
          disabled={verificationCode.length !== 6}
        >
          Onayla
        </Button>
      </Box>
    </Modal>
  );

  const renderCorporateDialog = () => (
    showCorporateDialog ? (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(2px)',
          transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
        }}
      >
        <Card
          sx={{
            minWidth: 320,
            maxWidth: 400,
            borderRadius: 3,
            boxShadow: 6,
            p: 3,
            textAlign: 'center',
            animation: 'fadeInScale 0.3s',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Ferdi Kaza Sigortası
          </Typography>
          <Typography sx={{ mb: 3, fontSize: '1rem', color: 'text.secondary' }}>
            Kurumsal müşterilerimize Ferdi Kaza sigortası hizmeti verememekteyiz.<br />
            <Box component="span" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
            <span> 
                <Link href="/kasko-sigortasi" sx={{ fontWeight: 700, color: '#111', textDecoration: 'underline', mx: 0.5 }} target="_blank">Kasko,</Link>
                <Link href="/trafik-sigortasi" sx={{ fontWeight: 700, color: '#111', textDecoration: 'underline', mx: 0.5 }} target="_blank">Trafik,</Link>
                <Link href="/imm" sx={{ fontWeight: 700, color: '#111', textDecoration: 'underline', mx: 0.5 }} target="_blank">İMM,</Link>
                <Link href="/dask" sx={{ fontWeight: 700, color: '#111', textDecoration: 'underline', mx: 0.5 }} target="_blank">DASK,</Link>
                <Link href="/konut-sigortasi" sx={{ fontWeight: 700, color: '#111', textDecoration: 'underline', mx: 0.5 }} target="_blank">Konut</Link>
                <br />
                ürünlerimizden teklif alabilirsiniz.
              </span>
            </Box>
          </Typography>
          <Button
            onClick={() => router.push('/')}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              minWidth: 120,
              fontWeight: 500,
              textTransform: 'none',
              mx: 'auto',
              display: 'block',
            }}
          >
            Anasayfaya Dön
          </Button>
        </Card>
        <style>{`
          @keyframes fadeInScale {
            0% { opacity: 0; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </Box>
    ) : null
  );

  return (
    <Box sx={{ position: 'relative' }}>
      {renderMainForm()}
      {renderVerificationModal()}
      {renderCorporateDialog()}
      
      {/* Phone Not Match Modal */}
      <PhoneNotMatchModal 
        isOpen={showPhoneNotMatchModal}
        onClose={() => setShowPhoneNotMatchModal(false)}
      />
    </Box>
  );
};

export default PersonalInfoStep;
