
'use client';

import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductPageQuery } from '@/components/ProductPageFlow/shared/hooks/useProductPageQuery';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';
import { performLogin, verifyOTP, CustomerType, updateCustomerProfile } from '@/utils/authHelper';
import { fetchWithAuth, CustomerProfile } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';

// Components
import DaskStep1 from './components/steps/DaskStep1';
import DaskStep2 from './components/steps/DaskStep2';
import AdditionalInfoStep from './components/steps/AdditionalInfoStep';
import VerificationCodeModal from '../shared/VerificationCodeModal';
import UpdatePropertyModal from './components/common/UpdatePropertyModal';
import PhoneNotMatchModal from '@/components/common/PhoneNotMatchModal';

// Hooks
import { useDaskProperty } from './hooks/useDaskProperty';

// DataLayer
import { pushDaskStep1Complete, pushDaskStep2Complete } from './utils/dataLayerUtils';

// Types
import {
    DaskFormData,
    CustomerType as CustomerTypeEnum,
    Job,
    PropertyStructure,
    PropertyUtilizationStyle,
    PropertyDamageStatus,
    DaskPropertyFloorCountRange,
    DaskPropertyOwnershipType
} from './types';
import { validateTCKNFull, validateTaxNumber, validateTurkishPhoneStrict } from '@/utils/validators';

interface DaskProductFormProps {
    onProposalCreated: (proposalId: string) => void;
}

export const DaskProductForm = ({ onProposalCreated }: DaskProductFormProps) => {
    const { accessToken, user, setUser, customerId, setCustomerId, setTokens } = useAuthStore();
    const { navigateToQuote } = useProductPageQuery();
    const agencyConfig = useAgencyConfig();
    const agentId = agencyConfig?.agency?.id;

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
    const [showUpdatePropertyModal, setShowUpdatePropertyModal] = useState(false);
    const [showPhoneNotMatchModal, setShowPhoneNotMatchModal] = useState(false);
    const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
    const [step1EventFired, setStep1EventFired] = useState(false);

    // Property Data Hook
    const {
        properties,
        cities,
        districts,
        towns,
        neighborhoods,
        streets,
        buildings,
        apartments,
        isLoading: isPropertyLoading,
        isAddressLoading,
        fetchDistricts,
        fetchTowns,
        fetchNeighborhoods,
        fetchStreets,
        fetchBuildings,
        fetchApartments,
        refetchProperties,
        queryUavt
    } = useDaskProperty();

    const [selectionType, setSelectionType] = useState<'existing' | 'new' | 'renewal'>('new');

    const initialValues: DaskFormData = {
        customerType: CustomerTypeEnum.Individual,
        identityNumber: '',
        taxNumber: '',
        email: '',
        phoneNumber: '',
        birthDate: '',
        job: Job.Unknown,
        fullName: '',
        title: '',
        city: '',
        district: '',

        selectionType: 'new',
        selectedPropertyId: null,
        cityReference: '',
        districtReference: '',
        townReference: '',
        neighborhoodReference: '',
        streetReference: '',
        buildingReference: '',
        apartmentReference: '',
        uavtNo: '',
        daskOldPolicyNumber: '',
        buildingType: PropertyStructure.Unknown,
        constructionYear: null,
        floorCountRange: DaskPropertyFloorCountRange.Unknown,
        floorNumber: '',
        squareMeters: '',
        usageType: PropertyUtilizationStyle.Unknown,
        buildingMaterial: PropertyStructure.Unknown,
        riskZone: PropertyDamageStatus.Unknown,
        ownershipType: DaskPropertyOwnershipType.Unknown,
    };

    const validationSchema = yup.object({
        // Step 1 Validation
        identityNumber: activeStep === 0
            ? yup.string().required('TC Kimlik No / Vergi Kimlik No gereklidir').test('identity-validation', '', function (val) {
                if (!val) return true;
                // 10 haneli ise VKN, 11 haneli ise TCKN
                if (val.length === 10) {
                    return validateTaxNumber(val).isValid;
                } else if (val.length === 11) {
                    return validateTCKNFull(val).isValid;
                }
                return false;
            })
            : yup.string().nullable(),
        phoneNumber: activeStep === 0
            ? yup.string().required('Telefon numarası gereklidir').test('phone', 'Geçersiz telefon numarası', (val) => validateTurkishPhoneStrict(val || '', true).isValid)
            : yup.string().nullable(),
        birthDate: activeStep === 0
            ? yup.string().test('birth-date-required', 'Doğum tarihi gereklidir', function (val) {
                // VKN (10 haneli) için birthDate zorunlu değil
                const identityNumber = this.parent.identityNumber;
                if (identityNumber && identityNumber.length === 10) {
                    return true; // VKN için birthDate zorunlu değil
                }
                // TCKN (11 haneli) için birthDate zorunlu
                if (!val) return false;
                return true;
            })
            : yup.string().nullable(),

        // Step 2 Validation (Property Info)
        cityReference: (activeStep === 1 && (selectionType === 'new' || selectionType === 'renewal'))
            ? yup.string().required('İl seçimi zorunludur')
            : yup.string().nullable(),
        districtReference: (activeStep === 1 && (selectionType === 'new' || selectionType === 'renewal'))
            ? yup.string().required('İlçe seçimi zorunludur')
            : yup.string().nullable(),
        apartmentReference: (activeStep === 1 && selectionType === 'new')
            ? yup.string().required('Daire seçimi zorunludur')
            : yup.string().nullable(),
        uavtNo: (activeStep === 1 && (selectionType === 'new' || selectionType === 'renewal'))
            ? yup.string().matches(/^[0-9]{10}$/, "UAVT Adres Kodu tam 10 rakam olmalıdır")
            : yup.string().nullable(),
        daskOldPolicyNumber: (activeStep === 1 && selectionType === 'renewal')
            ? yup.string().required('Eski DASK Poliçe Numarası zorunludur').matches(/^[0-9]{8}$/, 'DASK Poliçe Numarası tam 8 rakam olmalıdır')
            : yup.string().nullable(),
        buildingType: (activeStep === 1 && (selectionType === 'new' || selectionType === 'renewal'))
            ? yup.mixed().notOneOf([PropertyStructure.Unknown, 0], 'Bina tipi seçilmelidir').required('Bina tipi zorunludur')
            : yup.mixed().nullable(),
        constructionYear: (activeStep === 1 && (selectionType === 'new' || selectionType === 'renewal'))
            ? yup.string().required('Yapım yılı zorunludur').matches(/^[0-9]{4}$/, 'Yapım yılı 4 rakam olmalıdır')
                .test('year-range', 'Yapım yılı 1900 ile güncel yıl arasında olmalıdır', (val) => {
                    if (!val) return false;
                    const year = parseInt(val);
                    const currentYear = new Date().getFullYear();
                    return year >= 1900 && year <= currentYear;
                })
            : yup.string().nullable(),
        floorCountRange: (activeStep === 1 && (selectionType === 'new' || selectionType === 'renewal'))
            ? yup.mixed().notOneOf([DaskPropertyFloorCountRange.Unknown, 0], 'Binanın kat sayısı aralığı seçilmelidir').required('Binanın kat sayısı aralığı zorunludur')
            : yup.mixed().nullable(),
        floorNumber: (activeStep === 1 && (selectionType === 'new' || selectionType === 'renewal'))
            ? yup.string().required('Bulunduğu kat zorunludur')
            : yup.string().nullable(),
        squareMeters: (activeStep === 1 && (selectionType === 'new' || selectionType === 'renewal'))
            ? yup.string().required('Metrekare zorunludur').matches(/^[1-9][0-9]*$/, "Geçerli bir metrekare giriniz")
            : yup.string().nullable(),
        usageType: (activeStep === 1 && (selectionType === 'new' || selectionType === 'renewal'))
            ? yup.mixed().notOneOf([PropertyUtilizationStyle.Unknown, 0], 'Kullanım amacı seçilmelidir').required('Kullanım amacı zorunludur')
            : yup.mixed().nullable(),
        riskZone: (activeStep === 1 && (selectionType === 'new' || selectionType === 'renewal'))
            ? yup.mixed().notOneOf([PropertyDamageStatus.Unknown, 0], 'Hasar durumu seçilmelidir').required('Hasar durumu zorunludur')
            : yup.mixed().nullable(),
        ownershipType: (activeStep === 1 && (selectionType === 'new' || selectionType === 'renewal'))
            ? yup.mixed().notOneOf([DaskPropertyOwnershipType.Unknown, 0], 'Mülkiyet tipi seçilmelidir').required('Mülkiyet tipi zorunludur')
            : yup.mixed().nullable(),
        selectedPropertyId: (activeStep === 1 && selectionType === 'existing')
            ? yup.string().required('Lütfen kayıtlı bir konut seçin.')
            : yup.string().nullable(),
    });

    const formik = useFormik({
        initialValues,
        validationSchema,
        validateOnMount: false,
        validateOnChange: false,
        validateOnBlur: true,
        onSubmit: async (values) => {
            if (activeStep === 0) {
                handleStep1Submit(values);
            } else {
                handleStep2Submit(values);
            }
        },
    });

    // Auto-advance if logged in
    useEffect(() => {
        if (accessToken && activeStep === 0 && !step1EventFired) {
            // DataLayer push - Step 1 tamamlandı (otomatik geçiş - zaten giriş yapmış kullanıcı)
            pushDaskStep1Complete();
            setStep1EventFired(true);
            setActiveStep(1);
        }
    }, [accessToken, step1EventFired]);

    // Set initial selection type if properties exist
    useEffect(() => {
        if (properties.length > 0) {
            setSelectionType('existing');
            formik.setFieldValue('selectedPropertyId', properties[0].id);
        }
    }, [properties]);

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

    const handleStep1Submit = async (values: DaskFormData) => {
        if (!kvkkConsent) {
            setKvkkError('Lütfen Aydınlatma Metni ve Açık Rıza Metni\'ni onaylayınız.');
            return;
        }
        setKvkkError(null);

        if (accessToken) {
            // E-posta güncellemesi ve eksik bilgi kontrolü
            const userEnteredEmail = values.email?.trim();
            
            try {
                setIsLoading(true);
                
                    // Mevcut profil bilgilerini al
                    let meResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
                    let meData: CustomerProfile | null = null;
                    console.log('🔍 DASK - /api/customers/me response status:', meResponse.status, meResponse.ok);
                    if (meResponse.ok) {
                        meData = await meResponse.json();
                        console.log('✅ DASK - meData alındı:', !!meData, meData ? { id: meData.id, fullName: meData.fullName, city: meData.city, district: meData.district } : null);
                    } else {
                        const errorText = await meResponse.text();
                        console.warn('⚠️ DASK - /api/customers/me hatası:', meResponse.status, errorText);
                    }
                
                if (meData) {
                    // CustomerType belirleme: taxNumber varsa veya type === 'company' ise Company
                    const customerType = (meData as any).taxNumber || (meData as any).type === 'company' 
                        ? CustomerType.Company 
                        : CustomerType.Individual;
                    
                    // E-posta güncellemesi
                    if (userEnteredEmail && customerId && meData.primaryEmail !== userEnteredEmail) {
                        const updatePayload: Record<string, any> = {
                            primaryPhoneNumber: meData.primaryPhoneNumber,
                            primaryEmail: userEnteredEmail,
                            fullName: meData.fullName,
                        };
                        
                        // Individual için identityNumber ve birthDate ekle
                        if (customerType === CustomerType.Individual) {
                            updatePayload.identityNumber = meData.identityNumber;
                            if (meData.birthDate) {
                                updatePayload.birthDate = meData.birthDate;
                            }
                        } else {
                            // Company için taxNumber ve title ekle
                            updatePayload.taxNumber = (meData as any).taxNumber;
                            updatePayload.title = (meData as any)?.title || meData.fullName || '';
                        }
                        
                        if (meData.city) {
                            const cityValue = typeof meData.city === 'object' && meData.city ? (meData.city as any).value : meData.city;
                            if (cityValue) updatePayload.cityReference = cityValue;
                        }
                        
                        if (meData.district) {
                            const districtValue = typeof meData.district === 'object' && meData.district ? (meData.district as any).value : meData.district;
                            if (districtValue) updatePayload.districtReference = districtValue;
                        }
                        
                        await updateCustomerProfile(updatePayload, customerId, customerType);
                    }
                    
                    // Eksik bilgi kontrolü
                    // meResponse.ok false ise veya meData null ise eksik bilgi sayfası göster
                    if (!meResponse.ok || !meData) {
                        console.log('⚠️ DASK - meResponse.ok false veya meData null, AdditionalInfoStep gösteriliyor');
                        setShowAdditionalInfo(true);
                        setIsLoading(false);
                        return;
                    }
                    
                    const cityValue = typeof meData.city === 'object' && meData.city ? (meData.city as any).value : meData.city;
                    const districtValue = typeof meData.district === 'object' && meData.district ? (meData.district as any).value : meData.district;
                    const nameField = customerType === CustomerType.Company 
                        ? ((meData as any)?.title || meData.fullName)
                        : meData.fullName;
                    // Boş string ve null/undefined kontrolü
                    const isDataComplete = !!(nameField && String(nameField).trim() && cityValue && String(cityValue).trim() && districtValue && String(districtValue).trim());
                    
                    console.log('🔍 DASK handleStep1Submit (accessToken) - isDataComplete:', isDataComplete, {
                        nameField,
                        cityValue,
                        districtValue
                    });
                    
                    if (!isDataComplete) {
                        console.log('✅ DASK - Eksik bilgiler var, AdditionalInfoStep gösteriliyor');
                        // Eksik bilgiler var, AdditionalInfoStep göster
                        if (cityValue) await fetchDistricts(cityValue);
                        formik.setValues(prev => ({
                            ...prev,
                            fullName: customerType === CustomerType.Company 
                                ? ((meData as any)?.title || meData.fullName || '')
                                : (meData.fullName || ''),
                            city: cityValue || '',
                            district: districtValue || '',
                        }), false);
                        setShowAdditionalInfo(true);
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (error) {
                console.warn('Email update hatası:', error);
                // Hata olsa bile devam et
            } finally {
                setIsLoading(false);
            }
            
            // DataLayer push - Step 1 tamamlandı (giriş yapmış kullanıcı)
            if (!step1EventFired) {
                pushDaskStep1Complete();
                setStep1EventFired(true);
            }
            setActiveStep(1);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const cleanPhoneNumber = values.phoneNumber.replace(/\D/g, '');
            
            // VKN kontrolü: 10 haneli ise Company, 11 haneli ise Individual
            const isVKN = values.identityNumber.length === 10;
            const customerType = isVKN ? CustomerType.Company : CustomerType.Individual;
            const identityOrTaxNumber = isVKN ? values.identityNumber : parseInt(values.identityNumber);
            
            const loginResponse = await performLogin(
                identityOrTaxNumber,
                isVKN ? undefined : values.birthDate,
                cleanPhoneNumber,
                agentId,
                customerType
            );

            if (loginResponse.token) {
                setTempToken(loginResponse.token);
                setShowVerification(true);
            } else {
                throw new Error('OTP gönderilemedi');
            }
        } catch (err: any) {
            // 404 hatası ve RESOURCE_NOT_FOUND_DATABASE kodu kontrolü
            if (err?.status === 404 || err?.codes?.includes('RESOURCE_NOT_FOUND_DATABASE')) {
                setShowPhoneNotMatchModal(true);
            } else {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (code: string) => {
        if (!tempToken) throw new Error('Token bulunamadı');

        try {
            setIsLoading(true);
            const verifyData = await verifyOTP(tempToken, code);

            if (!verifyData.accessToken) throw new Error('Kimlik doğrulama başarısız oldu');

            setTokens(verifyData.accessToken, verifyData.refreshToken);

            // Fetch customer profile
            let meResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
            let meData: CustomerProfile | null = null;
            console.log('🔍 DASK handleVerifyCode - /api/customers/me response status:', meResponse.status, meResponse.ok);
            if (meResponse.ok) {
                meData = await meResponse.json();
                console.log('✅ DASK handleVerifyCode - meData alındı:', !!meData, meData ? { id: meData.id, fullName: meData.fullName, city: meData.city, district: meData.district } : null);
            } else {
                const errorText = await meResponse.text();
                console.warn('⚠️ DASK handleVerifyCode - /api/customers/me hatası:', meResponse.status, errorText);
            }

            // meResponse.ok false ise veya meData null ise eksik bilgi sayfası göster
            if (!meResponse.ok || !meData) {
                console.log('⚠️ DASK handleVerifyCode - meResponse.ok false veya meData null, AdditionalInfoStep gösteriliyor');
                setShowAdditionalInfo(true);
                setShowVerification(false);
                setIsLoading(false);
                return;
            }

            const cityValue = typeof meData.city === 'object' && meData.city ? (meData.city as any).value : meData.city;
            const districtValue = typeof meData.district === 'object' && meData.district ? (meData.district as any).value : meData.district;
            const customerType = (meData as any)?.taxNumber || (meData as any)?.type === 'company' 
                ? CustomerType.Company 
                : CustomerType.Individual;
            // Company müşterileri için title, Individual müşteriler için fullName kontrol et
            const nameField = customerType === CustomerType.Company 
                ? ((meData as any)?.title || meData?.fullName)
                : meData?.fullName;
            // Boş string ve null/undefined kontrolü
            const isDataComplete = !!(meData && nameField && String(nameField).trim() && cityValue && String(cityValue).trim() && districtValue && String(districtValue).trim());
            console.log('🔍 DASK handleVerifyCode - isDataComplete:', isDataComplete, {
                meData: !!meData,
                nameField,
                cityValue,
                districtValue
            });
            
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
            }

            if (!isDataComplete) {
                console.log('✅ DASK - Eksik bilgiler var, AdditionalInfoStep gösteriliyor');
                if (cityValue) await fetchDistricts(cityValue);
                // customerType zaten yukarıda tanımlı, tekrar tanımlamaya gerek yok
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
            } else {
                console.log('✅ DASK - Veri tamam, step2\'ye geçiliyor');
                // DataLayer push - Step 1 tamamlandı (yeni kullanıcı)
                if (!step1EventFired) {
                    pushDaskStep1Complete();
                    setStep1EventFired(true);
                }
                setShowVerification(false);
                setActiveStep(1);
            }
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Doğrulama başarısız');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdditionalInfoSubmit = async () => {
        if (!formik.values.fullName || !formik.values.city || !formik.values.district) {
            setError('Lütfen tüm alanları doldurunuz');
            return;
        }

        try {
            setIsLoading(true);
            const currentMeResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
            if (!currentMeResponse.ok) throw new Error('Kullanıcı bilgileri alınamadı');

            const currentMeData = await currentMeResponse.json() as CustomerProfile;
            const customerIdToUse = customerId || currentMeData.id;

            // CustomerType belirleme: taxNumber varsa veya type === 'company' ise Company
            const customerType = (currentMeData as any).taxNumber || (currentMeData as any).type === 'company' 
                ? CustomerType.Company 
                : CustomerType.Individual;

            const updatePayload: Record<string, any> = {
                primaryPhoneNumber: currentMeData.primaryPhoneNumber,
                cityReference: formik.values.city,
                districtReference: formik.values.district,
            };

            // Individual için fullName, identityNumber ve birthDate ekle
            if (customerType === CustomerType.Individual) {
                updatePayload.fullName = formik.values.fullName.trim();
                updatePayload.identityNumber = currentMeData.identityNumber;
                if (currentMeData.birthDate) {
                    updatePayload.birthDate = currentMeData.birthDate;
                }
            } else {
                // Company için taxNumber ve title ekle
                updatePayload.taxNumber = (currentMeData as any).taxNumber;
                updatePayload.title = formik.values.fullName.trim() || (currentMeData as any).title || '';
            }

            await updateCustomerProfile(updatePayload, customerIdToUse, customerType);
            // DataLayer push - Step 1 tamamlandı (ek bilgi sonrası)
            if (!step1EventFired) {
                pushDaskStep1Complete();
                setStep1EventFired(true);
            }
            setShowAdditionalInfo(false);
            setActiveStep(1);
        } catch (err) {
            setError('Bilgiler güncellenirken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStep2Submit = async (values: DaskFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!customerId) throw new Error('Müşteri ID bulunamadı');
            let propertyId = values.selectedPropertyId;

            // RENEWAL LOGIC
            if (selectionType === 'renewal') {
                if (!values.daskOldPolicyNumber) throw new Error('Eski DASK poliçe numarası gereklidir');

                // Check if property with this UAVT already exists
                let existingPropertyWithUavt = null;
                try {
                    const propsRes = await fetchWithAuth(`${API_ENDPOINTS.CUSTOMER_PROPERTIES(customerId)}?usage=DASK`);
                    if (propsRes.ok) {
                        const existingProps = await propsRes.json();
                        if (Array.isArray(existingProps)) {
                            existingPropertyWithUavt = existingProps.find((p: any) =>
                                p.uavtAddressCode === values.uavtNo ||
                                (p.number && p.number.toString() === values.uavtNo)
                            );
                        }
                    }
                } catch (e) {
                    console.warn('Existing check failed', e);
                }

                const renewalPayload = {
                    customerId,
                    number: parseInt(values.uavtNo),
                    daskOldPolicyNumber: values.daskOldPolicyNumber,
                    squareMeter: parseInt(values.squareMeters),
                    constructionYear: parseInt(values.constructionYear || '0'),
                    lossPayeeClause: null,
                    damageStatus: values.riskZone === PropertyDamageStatus.None ? 'NONE' :
                        values.riskZone === PropertyDamageStatus.SlightlyDamaged ? 'SLIGHTLY_DAMAGED' :
                            values.riskZone === PropertyDamageStatus.ModeratelyDamaged ? 'MODERATELY_DAMAGED' :
                                values.riskZone === PropertyDamageStatus.SeverelyDamaged ? 'SEVERELY_DAMAGED' : 'NONE',
                    floor: {
                        totalFloors: values.floorCountRange === DaskPropertyFloorCountRange.Between1And3 ? { $type: "range", min: 1, max: 3 } :
                            values.floorCountRange === DaskPropertyFloorCountRange.Between4And7 ? { $type: "range", min: 4, max: 7 } :
                                values.floorCountRange === DaskPropertyFloorCountRange.Between8And18 ? { $type: "range", min: 8, max: 18 } :
                                    values.floorCountRange === DaskPropertyFloorCountRange.MoreThan19 ? { $type: "range", min: 19, max: 99 } : null,
                        currentFloor: parseInt(values.floorNumber)
                    },
                    structure: values.buildingType === PropertyStructure.SteelReinforcedConcrete ? 'STEEL_REINFORCED_CONCRETE' : 'OTHER',
                    utilizationStyle: values.usageType === PropertyUtilizationStyle.House ? 'HOUSE' : 'BUSINESS',
                    ownershipType: values.ownershipType === DaskPropertyOwnershipType.Proprietor ? 'PROPRIETOR' : 'TENANT'
                };

                let propRes;
                if (existingPropertyWithUavt) {
                    propRes = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_PROPERTY_DETAIL(customerId, existingPropertyWithUavt.id), {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                        body: JSON.stringify(renewalPayload)
                    });
                    if (propRes.ok) propertyId = existingPropertyWithUavt.id;
                } else {
                    propRes = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_PROPERTIES(customerId), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                        body: JSON.stringify(renewalPayload)
                    });
                    if (propRes.ok) {
                        const resData = await propRes.json();
                        propertyId = resData.newPropertyId || resData.id;
                    }
                }

                if (!propRes.ok) {
                    const errData = await propRes.json();
                    throw new Error(errData.message || (errData.errors && errData.errors[0]) || 'Yenileme konutu işlenemedi');
                }
            }
            // NEW PROPERTY LOGIC
            else if (selectionType === 'new') {
                const propertyPayload = {
                    customerId,
                    number: parseInt(values.apartmentReference || values.uavtNo), // Use apartment ref as UAVT if selected via address
                    daskOldPolicyNumber: null,
                    squareMeter: parseInt(values.squareMeters),
                    constructionYear: parseInt(values.constructionYear || '0'),
                    lossPayeeClause: null,
                    damageStatus: values.riskZone === PropertyDamageStatus.None ? 'NONE' :
                        values.riskZone === PropertyDamageStatus.SlightlyDamaged ? 'SLIGHTLY_DAMAGED' :
                            values.riskZone === PropertyDamageStatus.ModeratelyDamaged ? 'MODERATELY_DAMAGED' :
                                values.riskZone === PropertyDamageStatus.SeverelyDamaged ? 'SEVERELY_DAMAGED' : 'NONE',
                    floor: {
                        totalFloors: values.floorCountRange === DaskPropertyFloorCountRange.Between1And3 ? { $type: "range", min: 1, max: 3 } :
                            values.floorCountRange === DaskPropertyFloorCountRange.Between4And7 ? { $type: "range", min: 4, max: 7 } :
                                values.floorCountRange === DaskPropertyFloorCountRange.Between8And18 ? { $type: "range", min: 8, max: 18 } :
                                    values.floorCountRange === DaskPropertyFloorCountRange.MoreThan19 ? { $type: "range", min: 19, max: 99 } : null,
                        currentFloor: parseInt(values.floorNumber)
                    },
                    structure: values.buildingType === PropertyStructure.SteelReinforcedConcrete ? 'STEEL_REINFORCED_CONCRETE' : 'OTHER',
                    utilizationStyle: values.usageType === PropertyUtilizationStyle.House ? 'HOUSE' : 'BUSINESS',
                    ownershipType: values.ownershipType === DaskPropertyOwnershipType.Proprietor ? 'PROPRIETOR' : 'TENANT'
                };

                const createPropResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_PROPERTIES(customerId), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(propertyPayload),
                });

                if (!createPropResponse.ok) {
                    const errData = await createPropResponse.json();
                    throw new Error(errData.message || (errData.errors && errData.errors[0]) || 'Konut oluşturulamadı');
                }

                const createdProperty = await createPropResponse.json();
                propertyId = createdProperty.newPropertyId || createdProperty.id;
                refetchProperties();
            }

            if (!propertyId) throw new Error('Konut seçimi yapılamadı');

            const proposalData = {
                $type: 'dask',
                propertyId: propertyId,
                productBranch: 'DASK',
                insurerCustomerId: customerId,
                insuredCustomerId: customerId,
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
            
            // DataLayer push - Step 2 tamamlandı
            pushDaskStep2Complete();
            
            onProposalCreated(result.proposalId || result.id);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Teklif oluşturulurken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    // Additional info render - TSS gibi tam sayfa görünümü
    if (showAdditionalInfo) {
        return (
            <div className="product-page-flow-container">
                <div className="pp-stepper">
                    <div className={`pp-step ${activeStep >= 0 ? 'active' : ''} ${activeStep > 0 ? 'completed' : ''}`}>
                        <div className="pp-step-visual"><span>1</span></div>
                        <div className="pp-step-label"><span>Kişisel</span><span>Bilgiler</span></div>
                    </div>
                    <div className={`pp-step ${activeStep >= 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`}>
                        <div className="pp-step-visual"><span>2</span></div>
                        <div className="pp-step-label"><span>Konut</span><span>Bilgileri</span></div>
                    </div>
                    <div className="pp-step">
                        <div className="pp-step-visual"><span>3</span></div>
                        <div className="pp-step-label"><span>Teklif</span><span>Karşılaştırma</span></div>
                    </div>
                    <div className="pp-step">
                        <div className="pp-step-visual"><span>4</span></div>
                        <div className="pp-step-label"><span>Ödeme</span></div>
                    </div>
                </div>
                <AdditionalInfoStep
                    formik={formik}
                    cities={cities.map(c => ({ value: c.value, text: c.text }))}
                    districts={districts.map(d => ({ value: d.value, text: d.text }))}
                    isLoading={isLoading}
                    error={error}
                    onCityChange={fetchDistricts}
                    onSubmit={handleAdditionalInfoSubmit}
                />
            </div>
        );
    }

    return (
        <div className="product-page-flow-container">
            <div className="pp-stepper">
                <div className={`pp-step ${activeStep >= 0 ? 'active' : ''} ${activeStep > 0 ? 'completed' : ''}`}>
                    <div className="pp-step-visual"><span>1</span></div>
                    <div className="pp-step-label"><span>Kişisel</span><span>Bilgiler</span></div>
                </div>
                <div className={`pp-step ${activeStep >= 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`}>
                    <div className="pp-step-visual"><span>2</span></div>
                    <div className="pp-step-label"><span>Konut</span><span>Bilgileri</span></div>
                </div>
                <div className="pp-step">
                    <div className="pp-step-visual"><span>3</span></div>
                    <div className="pp-step-label"><span>Teklif</span><span>Karşılaştırma</span></div>
                </div>
                <div className="pp-step">
                    <div className="pp-step-visual"><span>4</span></div>
                    <div className="pp-step-label"><span>Ödeme</span></div>
                </div>
            </div>

            {activeStep === 0 && (
                <DaskStep1
                    formik={formik}
                    isLoading={isLoading}
                    error={error}
                    kvkkConsent={kvkkConsent}
                    marketingConsent={marketingConsent}
                    kvkkError={kvkkError}
                    accessToken={accessToken}
                    onKvkkChange={setKvkkConsent}
                    onMarketingChange={setMarketingConsent}
                    onSubmit={() => formik.handleSubmit()}
                />
            )}

            {activeStep === 1 && (
                <DaskStep2
                    formik={formik}
                    isLoading={isLoading}
                    isAddressLoading={isAddressLoading}
                    properties={properties}
                    selectionType={selectionType}
                    cities={cities}
                    districts={districts}
                    towns={towns}
                    neighborhoods={neighborhoods}
                    streets={streets}
                    buildings={buildings}
                    apartments={apartments}
                    onSelectionTypeChange={setSelectionType}
                    onPropertySelect={(id) => formik.setFieldValue('selectedPropertyId', id)}
                    onEditProperty={(id, e) => {
                        e.stopPropagation();
                        setEditingPropertyId(id);
                        setShowUpdatePropertyModal(true);
                    }}
                    fetchDistricts={fetchDistricts}
                    fetchTowns={fetchTowns}
                    fetchNeighborhoods={fetchNeighborhoods}
                    fetchStreets={fetchStreets}
                    fetchBuildings={fetchBuildings}
                    fetchApartments={fetchApartments}
                    queryUavt={queryUavt}
                    onSubmit={() => formik.handleSubmit()}
                    onBack={() => setActiveStep(0)}
                />
            )}

            {showVerification && (
                <VerificationCodeModal
                    isOpen={showVerification}
                    onCancel={() => setShowVerification(false)}
                    onVerify={handleVerifyCode}
                    onResend={async () => {
                        // Resend logic
                    }}
                    phoneNumber={formik.values.phoneNumber}
                />
            )}


            {showUpdatePropertyModal && editingPropertyId && (
                <UpdatePropertyModal
                    propertyId={editingPropertyId}
                    onClose={() => setShowUpdatePropertyModal(false)}
                    onSuccess={() => {
                        setShowUpdatePropertyModal(false);
                        refetchProperties();
                    }}
                />
            )}

            {/* Phone Not Match Modal */}
            <PhoneNotMatchModal
                isOpen={showPhoneNotMatchModal}
                onClose={() => setShowPhoneNotMatchModal(false)}
            />
        </div>
    );
};
