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
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Radio,
  RadioGroup,
} from '@mui/material';
import { useFormik, FormikValues } from 'formik';
import * as yup from 'yup';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Timer } from 'lucide-react';
import CustomSelect from '../../../common/Input/CustomSelect';
import { API_ENDPOINTS } from '../../../../config/api';
import { useAgencyConfig } from '../../../../context/AgencyConfigProvider';
import { fetchWithAuth, CustomerProfile } from '../../../../services/fetchWithAuth';
import { validateBirthDate, validateTCKNFull, validateTurkishPhoneStrict, validateTaxNumber } from '../../../../utils/validators';
import { performLogin, verifyOTP, updateCustomerProfile, CustomerType } from '../../../../utils/authHelper';
import PhoneNotMatchModal from '../../../common/PhoneNotMatchModal';
import '../../../../styles/form-style.css';

// DataLayer helper functions
declare global {
  interface Window {
    dataLayer: any[];
  }
}

const pushToDataLayer = (eventData: any) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventData);
  } else {
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

// Dynamic form field configuration
interface FormFieldConfig {
  type: CustomerType;
  fields: {
    [key: string]: {
      required: boolean;
      label: string;
      validation?: any;
    };
  };
}

// Configuration for form fields based on customer type
const FORM_CONFIGS: Record<CustomerType, FormFieldConfig> = {
  [CustomerType.Individual]: {
    type: CustomerType.Individual,
    fields: {
      identityNumber: { required: true, label: 'TC Kimlik No' },
      email: { required: true, label: 'E-posta' },
      phoneNumber: { required: true, label: 'Telefon' },
      birthDate: { required: true, label: 'Doğum Tarihi' },
      job: { required: false, label: 'Meslek' },
      fullName: { required: true, label: 'Ad Soyad' },
      city: { required: true, label: 'İl' },
      district: { required: true, label: 'İlçe' },
    }
  },
  [CustomerType.Company]: {
    type: CustomerType.Company,
    fields: {
      taxNumber: { required: true, label: 'Vergi Kimlik No' },
      email: { required: true, label: 'E-posta' },
      phoneNumber: { required: true, label: 'Telefon' },
      title: { required: true, label: 'Şirket Ünvanı' },
      city: { required: true, label: 'İl' },
      district: { required: true, label: 'İlçe' },
    }
  }
};

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

// Validation helpers
class ValidationHelper {
  static validateCompanyTitle(title: string): { isValid: boolean; message: string } {
    if (!title) return { isValid: false, message: 'Şirket ünvanı gereklidir' };
    if (title.length < 3) return { isValid: false, message: 'Şirket ünvanı en az 3 karakter olmalıdır' };
    return { isValid: true, message: '' };
  }

  static getValidationSchema(customerType: CustomerType) {
    if (customerType === CustomerType.Company) {
      return yup.object({
        taxNumber: yup
          .string()
          .required('Vergi kimlik no gereklidir')
          .test('tax-number-validation', '', function(value) {
            if (!value) return true;
            const validation = validateTaxNumber(value);
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
            if (!value) return true;
            const validation = validateTurkishPhoneStrict(value, true);
            if (!validation.isValid) {
              return this.createError({ message: validation.message });
            }
            return true;
          }),
        acceptTerms: yup
          .boolean()
          .oneOf([true], "Devam etmek için Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni'ni ve Açık Rıza Metni'ni onaylamanız gerekmektedir"),
        acceptCommercial: yup.boolean(),
      });
    }

    // Individual validation schema
    return yup.object({
  identityNumber: yup
    .string()
    .required('TC Kimlik No gereklidir')
    .test('tckn-validation', '', function(value) {
          if (!value) return true;
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
    .test('birth-date-validation', '', function(value) {
          if (!value) return true;
      const validation = validateBirthDate(value);
      if (!validation.isValid) {
        return this.createError({ message: validation.message });
      }
      return true;
    }),
  job: yup.number(),
  acceptTerms: yup
    .boolean()
        .oneOf([true], "Devam etmek için Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni'ni ve Açık Rıza Metni'ni onaylamanız gerekmektedir"),
  acceptCommercial: yup.boolean(),
});
  }

  static getAdditionalInfoSchema(customerType: CustomerType) {
    if (customerType === CustomerType.Company) {
      return yup.object({
        title: yup
          .string()
          .required('Şirket ünvanı zorunludur')
          .test('title-validation', '', function(value) {
            if (!value) return true;
            const validation = ValidationHelper.validateCompanyTitle(value);
            if (!validation.isValid) {
              return this.createError({ message: validation.message });
            }
            return true;
          }),
        city: yup.string().required('İl seçimi zorunludur'),
        district: yup.string().required('İlçe seçimi zorunludur'),
      });
    }

    // Individual additional info schema
    return yup.object({
  fullName: yup.string().required('Ad Soyad zorunludur'),
  city: yup.string().required('İl seçimi zorunludur'),
  district: yup.string().required('İlçe seçimi zorunludur'),
    });
  }
}

// Customer data manager
class CustomerDataManager {
  static isDataComplete(customerType: CustomerType, data: any): boolean {
    if (customerType === CustomerType.Company) {
      const cityValue = typeof data.city === 'object' && data.city ? data.city.value : data.city;
      const districtValue = typeof data.district === 'object' && data.district ? data.district.value : data.district;
      return !!(data.title && data.title.trim() && cityValue && cityValue.trim() && districtValue && districtValue.trim());
    }
    
    // Individual data completeness check
    const cityValue = typeof data.city === 'object' && data.city ? data.city.value : data.city;
    const districtValue = typeof data.district === 'object' && data.district ? data.district.value : data.district;
    return !!(data.fullName && data.fullName.trim() && cityValue && cityValue.trim() && districtValue && districtValue.trim());
  }

  static getCustomerTypeFromProfile(profile: CustomerProfile): CustomerType {
    // Check if profile has company-specific fields or type property
    if (profile.type === 'company' || profile.taxNumber) {
      return CustomerType.Company;
    }
    return CustomerType.Individual;
  }

  static getJobFromString(job: string): Job {
    const jobMapping: Record<string, Job> = {
      'BANKER': Job.Banker,
      'CORPORATE_EMPLOYEE': Job.CorporateEmployee,
      'LTD_EMPLOYEE': Job.LtdEmployee,
      'POLICE': Job.Police,
      'MILITARY_PERSONNEL': Job.MilitaryPersonnel,
      'RETIRED_SPOUSE': Job.RetiredSpouse,
      'TEACHER': Job.Teacher,
      'DOCTOR': Job.Doctor,
      'PHARMACIST': Job.Pharmacist,
      'NURSE': Job.Nurse,
      'HEALTHCARE_WORKER': Job.HealthcareWorker,
      'LAWYER': Job.Lawyer,
      'JUDGE': Job.Judge,
      'PROSECUTOR': Job.Prosecutor,
      'FREELANCER': Job.Freelancer,
      'FARMER': Job.Farmer,
      'INSTRUCTOR': Job.Instructor,
      'RELIGIOUS_OFFICIAL': Job.ReligiousOfficial,
      'ASSOCIATION_MANAGER': Job.AssociationManager,
      'OFFICER': Job.Officer,
      'RETIRED': Job.Retired,
      'HOUSEWIFE': Job.Housewife,
    };
    return jobMapping[job] || Job.Unknown;
  }
}

interface PersonalInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const PersonalInfoStep = ({ onNext, onBack, isFirstStep, isLastStep }: PersonalInfoStepProps) => {
  const { accessToken, setTokens, setUser, customerId, setCustomerId } = useAuthStore();
  const { agency: { id: agentId } } = useAgencyConfig();
  const router = useRouter();
  
  // State management
  const [customerType, setCustomerType] = useState<CustomerType>(CustomerType.Individual);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<Array<{ value: string; text: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ value: string; text: string }>>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showVerification, setShowVerification] = useState(false);
  const [tempToken, setTempToken] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const [kaskoCaseCreationInProgress, setKaskoCaseCreationInProgress] = useState(false);
  const [showPhoneNotMatchModal, setShowPhoneNotMatchModal] = useState(false);

  // Helper functions
  const clearFieldError = (fieldName: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const setFieldError = (fieldName: string, message: string) => {
    setFieldErrors(prev => ({ ...prev, [fieldName]: message }));
  };

  // Timer effects
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

  // Main user data fetching effect
  useEffect(() => {
    let isMounted = true;
    
    // Clear case creation flag when KASKO form starts fresh
    const kaskoCompleted = localStorage.getItem('kaskoPersonalInfoCompleted');
    if (!kaskoCompleted) {
      localStorage.removeItem('kaskoCaseCreated');
      setKaskoCaseCreationInProgress(false);
    }

    const fetchUserDataAndProceed = async () => {
      if (!accessToken) {
        if (isMounted && cities.length === 0 && !showAdditionalInfo) {
          await fetchCities(isMounted);
        }
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const rawResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);

        if (!rawResponse.ok) {
          if (isMounted && cities.length === 0) await fetchCities(isMounted);
          setIsLoading(false);
          return; 
        }

        const responseData = await rawResponse.json() as CustomerProfile;
        
        if (!responseData || !responseData.id) {
          if (isMounted && cities.length === 0) await fetchCities(isMounted);
          setIsLoading(false);
          return;
        }

        if (!isMounted) return;

        // Determine customer type from profile
        const detectedCustomerType = CustomerDataManager.getCustomerTypeFromProfile(responseData);
        setCustomerType(detectedCustomerType);

        // Set customer ID
        if (responseData.id && !customerId) {
          setCustomerId(responseData.id);
        }
        
        // Update auth storage
        setUser({
          id: responseData.id || '',
          name: responseData.fullName || responseData.title || '',
          email: responseData.primaryEmail || '',
          phone: responseData.primaryPhoneNumber?.number || '',
        });

        // Set user data based on customer type
        if (detectedCustomerType === CustomerType.Company) {
          setUserData({
            ...responseData,
            taxNumber: responseData.taxNumber || '',
            title: responseData.title || '',
            primaryEmail: responseData.primaryEmail || '',
            phone: responseData.primaryPhoneNumber?.number || '',
            cityReference: (typeof responseData.city === 'object' && responseData.city ? responseData.city.value : responseData.city) || '',
            districtReference: (typeof responseData.district === 'object' && responseData.district ? responseData.district.value : responseData.district) || '',
          });

          formik.setValues(prevValues => ({
            ...prevValues,
            taxNumber: responseData.taxNumber?.toString() || '',
            email: responseData.primaryEmail || prevValues.email || '',
            phoneNumber: responseData.primaryPhoneNumber?.number || '',
            title: responseData.title || '',
            city: typeof responseData.city === 'object' && responseData.city ? responseData.city.value : responseData.city || '',
            district: typeof responseData.district === 'object' && responseData.district ? responseData.district.value : responseData.district || '',
          }), false);
        } else {
          // Individual customer data handling
          const [firstNameFromFile, ...lastNamePartsFromFile] = (responseData.fullName || '').split(' ');
          setUserData({
          ...responseData,
            primaryEmail: responseData.primaryEmail || '',
            tcNo: responseData.identityNumber?.toString() || '',
            phone: responseData.primaryPhoneNumber?.number || '',
            firstName: firstNameFromFile || '',
            lastName: lastNamePartsFromFile.join(' ') || '',
            cityReference: (typeof responseData.city === 'object' && responseData.city ? responseData.city.value : responseData.city) || '',
            districtReference: (typeof responseData.district === 'object' && responseData.district ? responseData.district.value : responseData.district) || '',
            job: CustomerDataManager.getJobFromString(responseData.job ?? ''),
          });

        formik.setValues(prevValues => ({
          ...prevValues,
          identityNumber: responseData.identityNumber?.toString() || '',
            email: responseData.primaryEmail || prevValues.email || '',
          phoneNumber: responseData.primaryPhoneNumber?.number || '',
          birthDate: responseData.birthDate || '',
            job: CustomerDataManager.getJobFromString(responseData.job ?? ''),
          fullName: responseData.fullName || '',
          city: typeof responseData.city === 'object' && responseData.city ? responseData.city.value : responseData.city || '',
          district: typeof responseData.district === 'object' && responseData.district ? responseData.district.value : responseData.district || '',
        }), false);
        }

        // Load cities and districts if needed
        if (responseData.city) {
          await fetchCities(isMounted);
          const cityValueForDistricts = typeof responseData.city === 'object' && responseData.city ? responseData.city.value : responseData.city;
          if (cityValueForDistricts && responseData.district) {
            await fetchDistricts(cityValueForDistricts, isMounted);
          }
        }
        
        // Check if data is complete and proceed
        if (CustomerDataManager.isDataComplete(detectedCustomerType, responseData)) {
            const currentCustId = getCustomerIdFromAuthStorage();
            if (currentCustId) {
              localStorage.setItem('proposalIdForKasko', currentCustId);
              
              // Create case for complete customer data - only if not already created
              const kaskoCase = localStorage.getItem('kaskoCaseCreated');
              if (!kaskoCase && !kaskoCaseCreationInProgress) {
                setKaskoCaseCreationInProgress(true);
                localStorage.setItem('kaskoCaseCreated', 'true');
                try {
                  await createSaleOpportunityCase(currentCustId);
                } catch (error) {
                  console.warn('Case oluşturma hatası:', error);
                  localStorage.removeItem('kaskoCaseCreated');
                  setKaskoCaseCreationInProgress(false);
                }
              }
            }
          // Set flag to prevent AssetInfoStep from going back
          localStorage.setItem('kaskoPersonalInfoCompleted', 'true');
          
            pushToDataLayer({
              event: "kasko_formsubmit",
              form_name: "kasko_step1",
            });
            onNext();
          } else {
            setShowAdditionalInfo(true);
          }
      } catch (error) {
        // Handle error silently
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUserDataAndProceed();

    return () => {
      isMounted = false;
    };
  }, []);

  // Cities loading effect for additional info
  useEffect(() => {
    let isMounted = true;
    if (showAdditionalInfo && cities.length === 0 && isMounted) {
      fetchCities(isMounted);
    }
    return () => { isMounted = false; }; 
  }, [showAdditionalInfo, cities.length]);

  // API functions
  const fetchCities = async (isMountedParam?: boolean) => {
    const canUpdateState = isMountedParam === undefined ? true : isMountedParam;
    if (canUpdateState) setIsLoading(true);
    if (canUpdateState) clearFieldError('city');
    
    try {
      const rawResponse = await fetchWithAuth(API_ENDPOINTS.ADDRESS_CITIES);
      if (!rawResponse.ok) {
        if (canUpdateState) setFieldError('city', 'Şehirler yüklenemedi. Lütfen tekrar deneyin.');
        throw new Error(`Cities fetch failed: ${rawResponse.status}`);
      }
      const responseData = await rawResponse.json() as Array<{ value: string; text: string }>;
      if (canUpdateState) setCities(responseData);
    } catch (error) {
      if (canUpdateState) setFieldError('city', 'Şehirler yüklenirken bir sorun oluştu.');
    } finally {
      if (canUpdateState) setIsLoading(false);
    }
  };

  const fetchDistricts = async (cityValue: string, isMountedParam?: boolean) => {
    const canUpdateState = isMountedParam === undefined ? true : isMountedParam;
    if (canUpdateState) setIsLoading(true);
    if (canUpdateState) clearFieldError('district');
    if (canUpdateState) setDistricts([]); 
    
    try {
      const rawResponse = await fetchWithAuth(API_ENDPOINTS.ADDRESS_DISTRICTS(cityValue));
      if (!rawResponse.ok) {
        if (canUpdateState) setFieldError('district', 'İlçeler yüklenemedi. Lütfen tekrar deneyin.');
        throw new Error(`Districts fetch failed: ${rawResponse.status}`);
      }
      const data = await rawResponse.json() as Array<{ value: string; text: string }>;
      if (canUpdateState) setDistricts(data);
    } catch (error) {
      if (canUpdateState) setFieldError('district', 'İlçeler yüklenirken bir sorun oluştu.');
    } finally {
      if (canUpdateState) setIsLoading(false);
    }
  };

  // Profile update helper
  const updateUserProfileWithCurrentData = async (
    currentMeData: CustomerProfile,
    userEmail: string | null,
    userJob: Job | number | null,
    customerId: string
  ) => {
    try {
      const updatePayload: Record<string, any> = {
        identityNumber: currentMeData.identityNumber,
        birthDate: currentMeData.birthDate,
        primaryPhoneNumber: currentMeData.primaryPhoneNumber,
      };

      // Only add non-null values to avoid overwriting existing data with nulls
      if (currentMeData.fullName) updatePayload.fullName = currentMeData.fullName;
      if (currentMeData.gender) updatePayload.gender = currentMeData.gender;
      if (currentMeData.educationStatus) updatePayload.educationStatus = currentMeData.educationStatus;
      if (currentMeData.nationality) updatePayload.nationality = currentMeData.nationality;
      if (currentMeData.maritalStatus) updatePayload.maritalStatus = currentMeData.maritalStatus;
      if (currentMeData.representedBy) updatePayload.representedBy = currentMeData.representedBy;
      
      const cityValue = typeof currentMeData.city === 'object' && currentMeData.city ? currentMeData.city.value : currentMeData.city;
      const districtValue = typeof currentMeData.district === 'object' && currentMeData.district ? currentMeData.district.value : currentMeData.district;
      if (cityValue) updatePayload.cityReference = cityValue;
      if (districtValue) updatePayload.districtReference = districtValue;

      if (userEmail && userEmail.trim()) {
        updatePayload.primaryEmail = userEmail.trim();
      } else if (currentMeData.primaryEmail) {
        updatePayload.primaryEmail = currentMeData.primaryEmail;
      }
      
      if (userJob && userJob !== Job.Unknown) {
        updatePayload.job = userJob;
      } else if (currentMeData.job) {
        updatePayload.job = currentMeData.job;
      }
      
      const updatedProfile = await updateCustomerProfile(updatePayload, customerId, CustomerType.Individual);
      setUser({
        id: customerId,
        name: updatedProfile.fullName || currentMeData.fullName || '',
        email: updatedProfile.primaryEmail || updatePayload.primaryEmail || '',
        phone: updatedProfile.primaryPhoneNumber?.number || currentMeData.primaryPhoneNumber?.number || ''
      });
    } catch (updateError) {
      console.warn('Profile update hatası:', updateError);
    }
  };

  // Form configuration
  const getInitialValues = () => {
    if (customerType === CustomerType.Company) {
      return {
        taxNumber: userData.taxNumber || '',
        email: userData.primaryEmail || '',
        phoneNumber: userData.phone || '',
        title: userData.title || '',
        city: userData.cityReference || (typeof userData.city === 'object' && userData.city ? userData.city.value : userData.city || ''),
        district: userData.districtReference || (typeof userData.district === 'object' && userData.district ? userData.district.value : userData.district || ''),
        acceptTerms: false,
        acceptCommercial: false,
      };
    }

    return {
      identityNumber: userData.tcNo || '',
      email: userData.primaryEmail || '',
      phoneNumber: userData.phone || '',
      birthDate: userData.birthDate || '',
      job: userData.job || Job.Unknown,
      fullName: userData.fullName || '',
      city: userData.cityReference || (typeof userData.city === 'object' && userData.city ? userData.city.value : userData.city || ''),
      district: userData.districtReference || (typeof userData.district === 'object' && userData.district ? userData.district.value : userData.district || ''),
      acceptTerms: false,
      acceptCommercial: false,
    };
  };

  const formik = useFormik<FormikValues>({
    initialValues: getInitialValues(),
    enableReinitialize: true,
    validationSchema: showAdditionalInfo 
      ? ValidationHelper.getAdditionalInfoSchema(customerType)
      : ValidationHelper.getValidationSchema(customerType),
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      
      // Store initial values for later use
      if (!showAdditionalInfo) {
        console.log('=== Storing initial values ===');
        console.log('values.email:', values.email);
        console.log('values.job:', values.job, values.job === Job.Unknown ? '(Unknown/Bilinmiyor)' : '');
        console.log('customerType:', customerType);
        console.log('Job.Unknown value:', Job.Unknown);
        
        if (customerType === CustomerType.Individual) {
          if (values.email && values.email.trim()) {
            localStorage.setItem('kaskoInitialEmail', values.email.trim());
            console.log('✅ Saved kaskoInitialEmail:', values.email.trim());
          }
          if (values.job !== undefined && values.job !== null) {
            localStorage.setItem('kaskoInitialJob', values.job.toString());
            console.log('✅ Saved kaskoInitialJob:', values.job.toString(), '(including Unknown/Bilinmiyor)');
          }
        } else {
          if (values.email && values.email.trim()) {
            localStorage.setItem('kaskoInitialEmail', values.email.trim());
            console.log('✅ Saved kaskoInitialEmail (company):', values.email.trim());
          }
        }
      }
      
      try {
        const tokenToUse = accessToken;
        let currentCustomerId = getCustomerIdFromAuthStorage();
        
        if (!tokenToUse) {
          try {
            const cleanPhoneNumber = values.phoneNumber.replace(/\D/g, '');
            const loginData = await performLogin(
              customerType === CustomerType.Individual ? parseInt(values.identityNumber as string) : values.taxNumber,
              customerType === CustomerType.Individual ? values.birthDate : undefined,
              cleanPhoneNumber,
              agentId,
              customerType
            );

            if (loginData.customerId) {
              currentCustomerId = loginData.customerId;
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

        // Profile update logic
        currentCustomerId = getCustomerIdFromAuthStorage();
        if (!currentCustomerId) {
            setError("Kimlik bilgisi bulunamadı, lütfen tekrar giriş yapmayı deneyin.");
            setIsLoading(false);
            return;
        }

        const updatePayload = buildUpdatePayload(values, customerType);
        const updatedProfile = await updateCustomerProfile(updatePayload, currentCustomerId, customerType);
        setUser({ 
          id: updatedProfile.id, 
          name: updatedProfile.fullName || updatedProfile.title || '',
          email: updatedProfile.primaryEmail || '', 
          phone: updatedProfile.primaryPhoneNumber?.number || ''
        });
        
        if (currentCustomerId) {
          localStorage.setItem('proposalIdForKasko', currentCustomerId);
        }
        
        // Set flag to prevent AssetInfoStep from going back
        localStorage.setItem('kaskoPersonalInfoCompleted', 'true');
        
        pushToDataLayer({
          event: "kasko_formsubmit",
          form_name: "kasko_step1",
        });
        onNext();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    },
  });

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
}
        `
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

  // Build update payload based on customer type
  const buildUpdatePayload = (values: FormikValues, customerType: CustomerType): Record<string, any> => {
        const updatePayload: Record<string, any> = {};

    if (customerType === CustomerType.Company) {
      if (values.title?.trim()) updatePayload.title = values.title.trim();
      if (values.email?.trim()) updatePayload.primaryEmail = values.email.trim();
      if (values.phoneNumber?.trim()) updatePayload.primaryPhoneNumber = {
        number: values.phoneNumber.trim().replace(/\D/g, ''),
        countryCode: 90
      };
      if (values.city?.trim()) updatePayload.cityReference = values.city.trim();
      if (values.district?.trim()) updatePayload.districtReference = values.district.trim();
    } else {
        if (values.fullName?.trim()) updatePayload.fullName = values.fullName.trim();
        if (values.birthDate) updatePayload.birthDate = values.birthDate;
        
        const emailFromLocalStorage = localStorage.getItem('kaskoInitialEmail');
        if (emailFromLocalStorage) {
          updatePayload.primaryEmail = emailFromLocalStorage;
        }
        
        const jobFromLocalStorage = localStorage.getItem('kaskoInitialJob');
        if (jobFromLocalStorage && parseInt(jobFromLocalStorage) !== Job.Unknown) {
          updatePayload.job = parseInt(jobFromLocalStorage);
        }

      if (values.phoneNumber?.trim()) updatePayload.primaryPhoneNumber = {
        number: values.phoneNumber.trim().replace(/\D/g, ''),
        countryCode: 90
      };
        if (values.city?.trim()) updatePayload.cityReference = values.city.trim();
        if (values.district?.trim()) updatePayload.districtReference = values.district.trim();
    }

    return updatePayload;
  };

  // OTP verification handler
  const handleVerifyOTP = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('OTP doğrulama - kullanılan token:', tempToken);
      console.log('OTP doğrulama - kullanılan kod:', verificationCode);
      const verifyData = await verifyOTP(tempToken, verificationCode);

      if (!verifyData.accessToken) {
        setError("Kimlik doğrulama başarısız oldu, token alınamadı.");
        setIsLoading(false);
        return;
      }

      setTokens(verifyData.accessToken, verifyData.refreshToken);
      
      const userEnteredEmail = localStorage.getItem('kaskoInitialEmail');
      let userEnteredJob = null;
      
      if (customerType === CustomerType.Individual) {
      const userEnteredJobStr = localStorage.getItem('kaskoInitialJob');
        userEnteredJob = userEnteredJobStr ? parseInt(userEnteredJobStr) : null;
      }

      let meResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
      let meData: CustomerProfile | null = null;
      if (meResponse.ok) {
        meData = await meResponse.json();
      }


      const isDataComplete = meData && CustomerDataManager.isDataComplete(customerType, meData);
      let customerIdToUse = verifyData.customerId || meData?.id;

      if (isDataComplete && meData) {
          if (!customerIdToUse) {
          setError("Kimlik bilgisi alınamadı, lütfen tekrar deneyin.");
          setIsLoading(false);
          return;
          }
          
        setCustomerId(customerIdToUse);
            localStorage.setItem('proposalIdForKasko', customerIdToUse);
        
        if (customerType === CustomerType.Individual) {
          await updateUserProfileWithCurrentData(meData, userEnteredEmail, userEnteredJob, customerIdToUse);
        }
        
        // Case oluşturma sadece eksik bilgileri tamamladıktan sonra yapılacak
        
        // Set flag to prevent AssetInfoStep from going back
        localStorage.setItem('kaskoPersonalInfoCompleted', 'true');
          
            pushToDataLayer({
              event: "kasko_formsubmit",
              form_name: "kasko_step1",
            });
            onNext();
        setShowVerification(false);
        setIsLoading(false);
        return;
      }

      // Load additional data
      meResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
      if (meResponse.ok) {
        meData = await meResponse.json();
              if (!customerIdToUse) {
          customerIdToUse = meData?.id;
        }
              }
              
      if (customerIdToUse) {
        setCustomerId(customerIdToUse);
              setUser({
                id: customerIdToUse, 
          name: meData?.fullName || meData?.title || '',
          email: meData?.primaryEmail || '', 
          phone: meData?.primaryPhoneNumber?.number || ''
              });
        localStorage.setItem('proposalIdForKasko', customerIdToUse);
        
        // Update email and job even if data is not complete
        if (customerType === CustomerType.Individual && (userEnteredEmail || userEnteredJob)) {
          try {
            await updateUserProfileWithCurrentData(meData, userEnteredEmail, userEnteredJob, customerIdToUse);
          } catch (error) {
            console.warn('Email/Job update hatası:', error);
          }
        }
      }

      // Update form values based on customer type
      if (customerType === CustomerType.Company) {
        formik.setValues(prev => ({
          ...prev,
          taxNumber: meData?.taxNumber?.toString() || '',
          email: meData?.primaryEmail || prev.email || '',
          phoneNumber: meData?.primaryPhoneNumber?.number || '',
          title: meData?.title || '',
          city: typeof meData?.city === 'object' && meData?.city ? meData?.city.value : meData?.city || '',
          district: typeof meData?.district === 'object' && meData?.district ? meData?.district.value : meData?.district || '',
          acceptTerms: prev.acceptTerms,
          acceptCommercial: prev.acceptCommercial
        }), false);
      } else {
      const finalCityValue = meData && (typeof meData.city === 'object' && meData.city ? meData.city.value : meData.city);
      const finalDistrictValue = meData && (typeof meData.district === 'object' && meData.district ? meData.district.value : meData.district);
              
              formik.setValues(prev => ({
                  ...prev,
        identityNumber: meData?.identityNumber?.toString() || '',
        email: meData?.primaryEmail || prev.email || '',
        phoneNumber: meData?.primaryPhoneNumber?.number || '',
        birthDate: meData?.birthDate || '',
          job: CustomerDataManager.getJobFromString(meData?.job ?? '') || prev.job || Job.Unknown,
        fullName: meData?.fullName || '',
        city: finalCityValue || '',
        district: finalDistrictValue || '',
                  acceptTerms: prev.acceptTerms,
                  acceptCommercial: prev.acceptCommercial
              }), false);
      }
              
      if (cities.length === 0) await fetchCities(true);
      const cityValue = typeof meData?.city === 'object' && meData?.city ? meData?.city.value : meData?.city;
      if (cityValue) await fetchDistricts(cityValue, true);
          
          setShowAdditionalInfo(true); 
      setShowVerification(false);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'OTP doğrulama sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Additional info update handler
  const handleUpdateAdditionalInfo = async (values: FormikValues) => {
    setFieldErrors({});
    setError(null);
    setIsLoading(true);

    console.log('handleUpdateAdditionalInfo values:', values);
    console.log('customerType:', customerType);

    let isValid = true;
    
    if (customerType === CustomerType.Company) {
      if (!values.title?.trim()) {
        setFieldError('title', 'Şirket ünvanı gereklidir.');
        isValid = false;
      }
    } else {
    if (!values.fullName?.trim()) {
        setFieldError('fullName', 'Ad Soyad gereklidir.');
      isValid = false;
    }
    }

    if (!values.city?.trim()) {
      setFieldError('city', 'İl seçimi gereklidir.');
      isValid = false;
    }
    if (!values.district?.trim()) {
      setFieldError('district', 'İlçe seçimi gereklidir.');
      isValid = false;
    }

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
      const currentMeResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
      if (!currentMeResponse.ok) {
        throw new Error('Güncel kullanıcı bilgileri alınamadı');
      }
      
      const currentMeData = await currentMeResponse.json() as CustomerProfile;
      const updatePayload = buildUpdatePayloadForAdditionalInfo(values, currentMeData, customerType);
      
      const rawUpdateResponse = await updateCustomerProfile(updatePayload, getCustomerIdFromAuthStorage() || '', customerType);
      const finalUpdatedProfile: CustomerProfile = rawUpdateResponse;

      const customerIdForProposal = getCustomerIdFromAuthStorage() || finalUpdatedProfile.id; 
      if (customerIdForProposal) {
        localStorage.setItem('proposalIdForKasko', customerIdForProposal);
        
        // Create case for complete customer data after additional info completion - only if not already created
        const kaskoCase = localStorage.getItem('kaskoCaseCreated');
        if (!kaskoCase && !kaskoCaseCreationInProgress) {
          setKaskoCaseCreationInProgress(true);
          localStorage.setItem('kaskoCaseCreated', 'true');
          try {
            await createSaleOpportunityCase(customerIdForProposal);
          } catch (error) {
            console.warn('Case oluşturma hatası:', error);
            localStorage.removeItem('kaskoCaseCreated');
            setKaskoCaseCreationInProgress(false);
          }
        }
      }
      
      // Update user data and auth store
      setUserData(prev => ({
        ...prev,
        id: customerIdForProposal,
        ...(customerType === CustomerType.Company ? {
          title: finalUpdatedProfile.title || '',
        } : {
        firstName: finalUpdatedProfile.fullName?.split(' ')[0] || '',
        lastName: finalUpdatedProfile.fullName?.split(' ').slice(1).join(' ') || '',
        }),
        cityReference: (typeof finalUpdatedProfile.city === 'object' && finalUpdatedProfile.city ? finalUpdatedProfile.city.value : finalUpdatedProfile.city) || '',
        districtReference: (typeof finalUpdatedProfile.district === 'object' && finalUpdatedProfile.district ? finalUpdatedProfile.district.value : finalUpdatedProfile.district) || '',
        phone: finalUpdatedProfile.primaryPhoneNumber?.number || prev.phone,
        email: finalUpdatedProfile.primaryEmail || prev.primaryEmail,
        city: (typeof finalUpdatedProfile.city === 'object' && finalUpdatedProfile.city ? finalUpdatedProfile.city.value : finalUpdatedProfile.city) || '',
        district: (typeof finalUpdatedProfile.district === 'object' && finalUpdatedProfile.district ? finalUpdatedProfile.district.value : finalUpdatedProfile.district) || '',
      }));

      setUser({ 
        id: customerIdForProposal,
        name: finalUpdatedProfile.fullName || finalUpdatedProfile.title || '',
        email: finalUpdatedProfile.primaryEmail || userData.primaryEmail || '',
        phone: finalUpdatedProfile.primaryPhoneNumber?.number || userData.phone || '',
      });

      // Set flag to prevent AssetInfoStep from going back
      localStorage.setItem('kaskoPersonalInfoCompleted', 'true');
      
      pushToDataLayer({
        event: "kasko_formsubmit",
        form_name: "kasko_step1",
      });
      onNext();
    } catch (error) {
      setError('Bilgiler güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Build update payload for additional info
  const buildUpdatePayloadForAdditionalInfo = (values: FormikValues, currentMeData: CustomerProfile, customerType: CustomerType): Record<string, any> => {
    const userEnteredEmail = values.email || localStorage.getItem('kaskoInitialEmail');
    const userEnteredJobStr = localStorage.getItem('kaskoInitialJob');
    
    console.log('=== buildUpdatePayloadForAdditionalInfo Debug ===');
    console.log('values.email:', values.email);
    console.log('localStorage kaskoInitialEmail:', localStorage.getItem('kaskoInitialEmail'));
    console.log('localStorage kaskoInitialJob:', localStorage.getItem('kaskoInitialJob'));
    console.log('userEnteredEmail (calculated):', userEnteredEmail);
    console.log('userEnteredJobStr:', userEnteredJobStr);
    console.log('currentMeData.primaryEmail:', currentMeData.primaryEmail);
    console.log('currentMeData.job:', currentMeData.job);
    const updatePayload: Record<string, any> = {
      identityNumber: currentMeData.identityNumber,
      primaryPhoneNumber: values.phoneNumber?.trim()
        ? { number: values.phoneNumber.trim().replace(/\D/g, ''), countryCode: 90 }
        : currentMeData.primaryPhoneNumber,
      gender: currentMeData.gender,
      educationStatus: currentMeData.educationStatus,
      nationality: currentMeData.nationality,
      maritalStatus: currentMeData.maritalStatus,
      representedBy: currentMeData.representedBy,
      cityReference: values.city?.trim() || (typeof currentMeData.city === 'object' && currentMeData.city ? currentMeData.city.value : currentMeData.city),
      districtReference: values.district?.trim() || (typeof currentMeData.district === 'object' && currentMeData.district ? currentMeData.district.value : currentMeData.district),
    };

    if (customerType === CustomerType.Company) {
      updatePayload.title = values.title?.trim() || currentMeData.title;
      updatePayload.taxNumber = currentMeData.taxNumber;
    } else {
      updatePayload.fullName = values.fullName?.trim() || currentMeData.fullName;
      updatePayload.birthDate = values.birthDate || currentMeData.birthDate;
    }

    if (userEnteredEmail && userEnteredEmail.trim()) {
      updatePayload.primaryEmail = userEnteredEmail.trim();
    } else if (currentMeData.primaryEmail) {
      updatePayload.primaryEmail = currentMeData.primaryEmail;
    }
    // If both are null/empty, don't include primaryEmail in payload

    if (customerType === CustomerType.Individual) {
      const userEnteredJobStr = localStorage.getItem('kaskoInitialJob');
      const userEnteredJob = userEnteredJobStr ? parseInt(userEnteredJobStr) : values.job;
      if (userEnteredJob !== undefined && userEnteredJob !== null && !isNaN(userEnteredJob)) {
        updatePayload.job = userEnteredJob;
        console.log('✅ Added job to payload:', userEnteredJob, '(including Unknown/Bilinmiyor if 0)');
      } else if (currentMeData.job !== undefined && currentMeData.job !== null) {
        updatePayload.job = currentMeData.job;
        console.log('✅ Added job from currentMeData:', currentMeData.job);
      }
      // If both are null/undefined, don't include job in payload
    }
    
    console.log('Final updatePayload:', updatePayload);

    return updatePayload;
  };

  // Resend code handler
  const handleResendCode = async () => {
    setResendLoading(true);
    setError(null);
    
    try {
      const cleanPhoneNumber = formik.values.phoneNumber.replace(/\D/g, '');
      const loginData = await performLogin(
        customerType === CustomerType.Individual ? parseInt(formik.values.identityNumber as string, 10) : formik.values.taxNumber,
        customerType === CustomerType.Individual ? formik.values.birthDate : undefined,
        cleanPhoneNumber,
        agentId,
        customerType
      );

      // Yeni token'ı her durumda güncelle (customerId olsun veya olmasın)
      if (loginData.token) {
        setTempToken(loginData.token);
        console.log('Yeni token set edildi:', loginData.token);
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

  // Render functions
  const renderCustomerTypeSelection = () => (
    <Box sx={{ mb: 3 }}>
      <RadioGroup
        value={customerType}
        onChange={(e) => {
          const newCustomerType = e.target.value as CustomerType;
          setCustomerType(newCustomerType);
          setError(null);
          setFieldErrors({});
          // Reset form values when customer type changes
          formik.resetForm();
          formik.setValues(getInitialValues());
        }}
        row
      >
        <FormControlLabel
          value={CustomerType.Individual}
          control={<Radio />}
          label="Bireysel Müşteri"
        />
        <FormControlLabel
          value={CustomerType.Company}
          control={<Radio />}
          label="Kurumsal Müşteri"
        />
      </RadioGroup>
    </Box>
  );

  const renderIndividualFields = () => (
    <>
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
    </>
  );

  const renderCompanyFields = () => (
    <>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '250px' }}>
                <TextField
                  fullWidth
                  margin="none"
            id="taxNumber"
            name="taxNumber"
            label="Vergi Kimlik No"
            value={formik.values.taxNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
              formik.setFieldValue('taxNumber', value);
                  }}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    if (e.target.value) {
                const validation = validateTaxNumber(e.target.value);
                      if (!validation.isValid) {
                  formik.setFieldError('taxNumber', validation.message);
                }
              }
            }}
            error={formik.touched.taxNumber && Boolean(formik.errors.taxNumber)}
            helperText={formik.touched.taxNumber && formik.errors.taxNumber ? String(formik.errors.taxNumber) : ' '}
            placeholder="Vergi kimlik numaranızı giriniz"
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
        <Box sx={{ flex: 1, minWidth: '250px' }} />
      </Box>
    </>
  );

  const renderAdditionalInfoForm = () => {
    console.log('renderAdditionalInfoForm - formik.values:', formik.values);
    console.log('renderAdditionalInfoForm - userData:', userData);
    
    return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Typography variant="h5" gutterBottom>
        Eksik Bilgilerinizi Tamamlayın
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Kasko Sigortası teklifiniz için eksik bilgilerinizi doldurunuz
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 3 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* Company Title or Full Name */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: '300px' }}>
                <TextField
                  fullWidth
                  margin="none"
              id={customerType === CustomerType.Company ? "title" : "fullName"}
              name={customerType === CustomerType.Company ? "title" : "fullName"}
              label={customerType === CustomerType.Company ? "Şirket Ünvanı" : "Ad Soyad"}
              value={customerType === CustomerType.Company ? formik.values.title : formik.values.fullName}
              onChange={(e) => {
                const fieldName = customerType === CustomerType.Company ? 'title' : 'fullName';
                let value = e.target.value;
                
                if (customerType === CustomerType.Individual) {
                  value = value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '').toUpperCase();
                }
                
                formik.setFieldValue(fieldName, value);
                clearFieldError(fieldName);
              }}
              error={Boolean(fieldErrors[customerType === CustomerType.Company ? 'title' : 'fullName'])}
              helperText={fieldErrors[customerType === CustomerType.Company ? 'title' : 'fullName'] || ' '}
                  FormHelperTextProps={{
                    sx: { minHeight: '20px', mt: 0.5, mb: 0.5 }
                  }}
                />
              </Box>
            </Box>

        {/* City and District */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '250px' }}>
                <Autocomplete
              options={cities.sort((a, b) => parseInt(a.value) - parseInt(b.value))}
              getOptionLabel={(option) => option.text}
              value={cities.find((city) => city.value === formik.values.city) || null}
                  onChange={(_, newValue) => {
                formik.setFieldValue('city', newValue?.value || '');
                clearFieldError('city');
                clearFieldError('district');
                formik.setFieldValue('district', '');
                if (newValue?.value) {
                  fetchDistricts(newValue.value, true);
                } else {
                  setDistricts([]);
                }
              }}
              loading={isLoading && cities.length === 0}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      margin="none"
                  label="İl"
                  error={Boolean(fieldErrors.city)}
                  helperText={fieldErrors.city || ' '}
                      FormHelperTextProps={{
                        sx: { minHeight: '20px', mt: 0.5, mb: 0.5 }
                      }}
                    />
                  )}
                />
              </Box>
          <Box sx={{ flex: 1, minWidth: '250px' }}>
            <Autocomplete
              options={districts.sort((a, b) => a.text.localeCompare(b.text, 'tr'))}
              getOptionLabel={(option) => option.text}
              value={districts.find((district) => district.value === formik.values.district) || null}
              onChange={(_, newValue) => {
                formik.setFieldValue('district', newValue?.value || '');
                clearFieldError('district');
              }}
              disabled={!formik.values.city || districts.length === 0 || isLoading}
              loading={isLoading && !!formik.values.city && districts.length === 0}
              renderInput={(params) => (
                <TextField
                  {...params}
                  margin="none"
                  label="İlçe"
                  error={Boolean(fieldErrors.district)}
                  helperText={fieldErrors.district || ' '}
                  FormHelperTextProps={{
                    sx: { minHeight: '20px', mt: 0.5, mb: 0.5 }
                  }}
                />
              )}
            />
          </Box>
            </Box>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            onClick={() => handleUpdateAdditionalInfo(formik.values)}
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
    </Box>
  );
  };

  const renderMainForm = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Kişisel Bilgiler
      </Typography>
      {error && <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>{error}</Typography>}

      {!showVerification && (
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* Customer Type Selection */}
            {!accessToken && renderCustomerTypeSelection()}

            {/* Dynamic Fields based on Customer Type */}
            {customerType === CustomerType.Individual ? renderIndividualFields() : renderCompanyFields()}

            {/* Terms and Conditions */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, mt: 2 }}>
              <FormControlLabel sx={{ mb: 0 }}
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

            {/* Submit Button */}
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
          <Box />
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

  // Main render logic
  if (showAdditionalInfo) {
    return renderAdditionalInfoForm();
  }

  return (
    <>
      {renderMainForm()}
      {renderVerificationModal()}
      
      {/* Phone Not Match Modal */}
      <PhoneNotMatchModal 
        isOpen={showPhoneNotMatchModal}
        onClose={() => setShowPhoneNotMatchModal(false)}
      />
    </>
  );
};

export default PersonalInfoStep;
