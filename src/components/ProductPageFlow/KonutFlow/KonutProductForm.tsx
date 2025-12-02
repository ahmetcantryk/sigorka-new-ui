/**
 * Konut Flow - Product Form Component
 * 
 * DASK Flow'dan klonlanmıştır - Teminat Bilgileri alanı eklendi
 */

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
import KonutStep1 from './components/steps/KonutStep1';
import KonutStep2 from './components/steps/KonutStep2';
import AdditionalInfoStep from './components/steps/AdditionalInfoStep';
import VerificationCodeModal from '../shared/VerificationCodeModal';
import UpdatePropertyModal from '../DaskFlow/components/common/UpdatePropertyModal';
import PhoneNotMatchModal from '@/components/common/PhoneNotMatchModal';

// Hooks
import { useKonutProperty } from './hooks/useKonutProperty';

// DataLayer
import { pushKonutStep1Complete, pushKonutStep2Complete } from './utils/dataLayerUtils';

// Types
import {
    KonutFormData,
    CustomerType as CustomerTypeEnum,
    Job,
    PropertyStructure,
    PropertyUtilizationStyle,
    PropertyDamageStatus,
    KonutPropertyFloorCountRange,
    KonutPropertyOwnershipType,
    InflationType
} from './types';
import { validateTCKNFull, validateTurkishPhoneStrict } from '@/utils/validators';

interface KonutProductFormProps {
    onProposalCreated: (proposalId: string) => void;
}

// Enflasyon enum değerinden yüzde değerini çıkaran fonksiyon
const getInflationPercentage = (inflationType: InflationType): number => {
    switch (inflationType) {
        case InflationType.Inflation50: return 50;
        case InflationType.Inflation60: return 60;
        case InflationType.Inflation65: return 65;
        case InflationType.Inflation70: return 70;
        case InflationType.Inflation75: return 75;
        case InflationType.Inflation80: return 80;
        default: return 60;
    }
};

export const KonutProductForm = ({ onProposalCreated }: KonutProductFormProps) => {
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
    const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
    const [showPhoneNotMatchModal, setShowPhoneNotMatchModal] = useState(false);
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
    } = useKonutProperty();

    const [selectionType, setSelectionType] = useState<'existing' | 'new'>('new');

    const initialValues: KonutFormData = {
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
        buildingType: PropertyStructure.Unknown,
        constructionYear: null,
        floorCountRange: KonutPropertyFloorCountRange.Unknown,
        floorNumber: '',
        squareMeters: '',
        usageType: PropertyUtilizationStyle.Unknown,
        buildingMaterial: PropertyStructure.Unknown,
        riskZone: PropertyDamageStatus.Unknown,
        ownershipType: KonutPropertyOwnershipType.Unknown,

        // Teminat Bilgileri - Default değerler
        furniturePrice: '500000',
        electronicDevicePrice: '125000',
        insulationPrice: '25000',
        windowPrice: '100000',
        inflationValue: InflationType.Inflation60,
    };

    const validationSchema = yup.object({
        // Step 1 Validation
        identityNumber: activeStep === 0
            ? yup.string().required('T.C. Kimlik No gereklidir').test('tckn', 'Geçersiz T.C. Kimlik No', (val) => validateTCKNFull(val || '').isValid)
            : yup.string().nullable(),
        phoneNumber: activeStep === 0
            ? yup.string().required('Telefon numarası gereklidir').test('phone', 'Geçersiz telefon numarası', (val) => validateTurkishPhoneStrict(val || '', true).isValid)
            : yup.string().nullable(),
        birthDate: activeStep === 0
            ? yup.string().required('Doğum tarihi gereklidir')
            : yup.string().nullable(),

        // Step 2 Validation (Property Info)
        cityReference: (activeStep === 1 && selectionType === 'new')
            ? yup.string().required('İl seçimi zorunludur')
            : yup.string().nullable(),
        districtReference: (activeStep === 1 && selectionType === 'new')
            ? yup.string().required('İlçe seçimi zorunludur')
            : yup.string().nullable(),
        apartmentReference: (activeStep === 1 && selectionType === 'new')
            ? yup.string().required('Daire seçimi zorunludur')
            : yup.string().nullable(),
        uavtNo: (activeStep === 1 && selectionType === 'new')
            ? yup.string().matches(/^[0-9]{10}$/, "UAVT Adres Kodu tam 10 rakam olmalıdır")
            : yup.string().nullable(),
        buildingType: (activeStep === 1 && selectionType === 'new')
            ? yup.mixed().notOneOf([PropertyStructure.Unknown, 0], 'Bina tipi seçilmelidir').required('Bina tipi zorunludur')
            : yup.mixed().nullable(),
        constructionYear: (activeStep === 1 && selectionType === 'new')
            ? yup.string().required('Yapım yılı zorunludur').matches(/^[0-9]{4}$/, 'Yapım yılı 4 rakam olmalıdır')
                .test('year-range', 'Yapım yılı 1900 ile güncel yıl arasında olmalıdır', (val) => {
                    if (!val) return false;
                    const year = parseInt(val);
                    const currentYear = new Date().getFullYear();
                    return year >= 1900 && year <= currentYear;
                })
            : yup.string().nullable(),
        floorCountRange: (activeStep === 1 && selectionType === 'new')
            ? yup.mixed().notOneOf([KonutPropertyFloorCountRange.Unknown, 0], 'Binanın kat sayısı aralığı seçilmelidir').required('Binanın kat sayısı aralığı zorunludur')
            : yup.mixed().nullable(),
        floorNumber: (activeStep === 1 && selectionType === 'new')
            ? yup.string().required('Bulunduğu kat zorunludur')
            : yup.string().nullable(),
        squareMeters: (activeStep === 1 && selectionType === 'new')
            ? yup.string().required('Metrekare zorunludur').matches(/^[1-9][0-9]*$/, "Geçerli bir metrekare giriniz")
            : yup.string().nullable(),
        usageType: (activeStep === 1 && selectionType === 'new')
            ? yup.mixed().notOneOf([PropertyUtilizationStyle.Unknown, 0], 'Kullanım amacı seçilmelidir').required('Kullanım amacı zorunludur')
            : yup.mixed().nullable(),
        riskZone: (activeStep === 1 && selectionType === 'new')
            ? yup.mixed().notOneOf([PropertyDamageStatus.Unknown, 0], 'Hasar durumu seçilmelidir').required('Hasar durumu zorunludur')
            : yup.mixed().nullable(),
        ownershipType: (activeStep === 1 && selectionType === 'new')
            ? yup.mixed().notOneOf([KonutPropertyOwnershipType.Unknown, 0], 'Mülkiyet tipi seçilmelidir').required('Mülkiyet tipi zorunludur')
            : yup.mixed().nullable(),
        selectedPropertyId: (activeStep === 1 && selectionType === 'existing')
            ? yup.string().required('Lütfen kayıtlı bir konut seçin.')
            : yup.string().nullable(),

        // Teminat Bilgileri Validation (hem existing hem new için)
        furniturePrice: activeStep === 1
            ? yup.string()
                .required('Eşya bedeli zorunludur')
                .matches(/^[0-9]+$/, "Geçerli bir bedel giriniz")
                .test('range', 'Eşya bedeli 0 ile 1,000,000 arasında olmalıdır',
                    value => !value || (parseInt(value) >= 0 && parseInt(value) <= 1000000))
            : yup.string().nullable(),
        electronicDevicePrice: activeStep === 1
            ? yup.string()
                .required('Elektronik cihaz bedeli zorunludur')
                .matches(/^[0-9]+$/, "Geçerli bir bedel giriniz")
                .test('range', 'Elektronik cihaz bedeli 0 ile 500,000 arasında olmalıdır',
                    value => !value || (parseInt(value) >= 0 && parseInt(value) <= 500000))
            : yup.string().nullable(),
        insulationPrice: activeStep === 1
            ? yup.string()
                .required('İzolasyon bedeli zorunludur')
                .matches(/^[0-9]+$/, "Geçerli bir bedel giriniz")
                .test('range', 'İzolasyon bedeli 0 ile 100,000 arasında olmalıdır',
                    value => !value || (parseInt(value) >= 0 && parseInt(value) <= 100000))
            : yup.string().nullable(),
        windowPrice: activeStep === 1
            ? yup.string()
                .required('Cam bedeli zorunludur')
                .matches(/^[0-9]+$/, "Geçerli bir bedel giriniz")
                .test('range', 'Cam bedeli 0 ile 100,000 arasında olmalıdır',
                    value => !value || (parseInt(value) >= 0 && parseInt(value) <= 100000))
            : yup.string().nullable(),
        inflationValue: activeStep === 1
            ? yup.mixed<InflationType>()
                .oneOf(Object.values(InflationType).filter(v => typeof v === 'number') as InflationType[])
                .required('Enflasyon tipi zorunludur')
                .notOneOf([InflationType.Unknown], 'Enflasyon tipi seçilmelidir')
            : yup.mixed().nullable(),
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
            pushKonutStep1Complete();
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

    const handleStep1Submit = async (values: KonutFormData) => {
        if (!kvkkConsent) {
            setKvkkError('Lütfen Aydınlatma Metni ve Açık Rıza Metni\'ni onaylayınız.');
            return;
        }
        setKvkkError(null);

        if (accessToken) {
            // DataLayer push - Step 1 tamamlandı (giriş yapmış kullanıcı)
            if (!step1EventFired) {
                pushKonutStep1Complete();
                setStep1EventFired(true);
            }
            setActiveStep(1);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const cleanPhoneNumber = values.phoneNumber.replace(/\D/g, '');
            const loginResponse = await performLogin(
                parseInt(values.identityNumber),
                values.birthDate,
                cleanPhoneNumber,
                agentId,
                CustomerType.Individual
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
            }

            if (!isDataComplete) {
                if (cityValue) await fetchDistricts(cityValue);
                formik.setValues(prev => ({
                    ...prev,
                    fullName: meData?.fullName || '',
                    city: cityValue || '',
                    district: districtValue || '',
                }), false);
                setShowAdditionalInfo(true);
                setShowVerification(false);
            } else {
                // DataLayer push - Step 1 tamamlandı (yeni kullanıcı)
                if (!step1EventFired) {
                    pushKonutStep1Complete();
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

            const updatePayload = {
                identityNumber: currentMeData.identityNumber,
                birthDate: currentMeData.birthDate,
                primaryPhoneNumber: currentMeData.primaryPhoneNumber,
                fullName: formik.values.fullName.trim(),
                cityReference: formik.values.city,
                districtReference: formik.values.district,
            };

            await updateCustomerProfile(updatePayload, customerIdToUse, CustomerType.Individual);
            // DataLayer push - Step 1 tamamlandı (ek bilgi sonrası)
            if (!step1EventFired) {
                pushKonutStep1Complete();
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

    const handleStep2Submit = async (values: KonutFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!customerId) throw new Error('Müşteri ID bulunamadı');
            let propertyId = values.selectedPropertyId;

            // NEW PROPERTY LOGIC
            if (selectionType === 'new') {
                const propertyPayload = {
                    customerId,
                    number: parseInt(values.apartmentReference || values.uavtNo),
                    squareMeter: parseInt(values.squareMeters),
                    constructionYear: parseInt(values.constructionYear || '0'),
                    lossPayeeClause: null,
                    damageStatus: values.riskZone === PropertyDamageStatus.None ? 'NONE' :
                        values.riskZone === PropertyDamageStatus.SlightlyDamaged ? 'SLIGHTLY_DAMAGED' :
                            values.riskZone === PropertyDamageStatus.ModeratelyDamaged ? 'MODERATELY_DAMAGED' :
                                values.riskZone === PropertyDamageStatus.SeverelyDamaged ? 'SEVERELY_DAMAGED' : 'NONE',
                    floor: {
                        totalFloors: values.floorCountRange === KonutPropertyFloorCountRange.Between1And3 ? { $type: "range", min: 1, max: 3 } :
                            values.floorCountRange === KonutPropertyFloorCountRange.Between4And7 ? { $type: "range", min: 4, max: 7 } :
                                values.floorCountRange === KonutPropertyFloorCountRange.Between8And18 ? { $type: "range", min: 8, max: 18 } :
                                    values.floorCountRange === KonutPropertyFloorCountRange.MoreThan19 ? { $type: "range", min: 19, max: 99 } : null,
                        currentFloor: parseInt(values.floorNumber)
                    },
                    structure: values.buildingType === PropertyStructure.SteelReinforcedConcrete ? 'STEEL_REINFORCED_CONCRETE' : 'OTHER',
                    utilizationStyle: values.usageType === PropertyUtilizationStyle.House ? 'HOUSE' : 'BUSINESS',
                    ownershipType: values.ownershipType === KonutPropertyOwnershipType.Proprietor ? 'PROPRIETOR' : 'TENANT'
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

            // Get coverage group IDs from agency config
            const getCoverageGroupIds = (branch: string): string[] | null => {
                if (!agencyConfig?.coverageGroupIds) return null;
                const coverageIds = agencyConfig.coverageGroupIds[branch as keyof typeof agencyConfig.coverageGroupIds];
                return coverageIds && coverageIds.length > 0 ? coverageIds : null;
            };

            // Teminat bilgilerini form değerlerinden al
            const proposalData = {
                $type: 'konut',
                propertyId: propertyId,
                insurerCustomerId: customerId,
                insuredCustomerId: customerId,
                furniturePrice: parseInt(values.furniturePrice || '250000', 10),
                electronicDevicePrice: parseInt(values.electronicDevicePrice || '10000', 10),
                insulationPrice: parseInt(values.insulationPrice || '10000', 10),
                windowPrice: parseInt(values.windowPrice || '50000', 10),
                constructionCostPerSquareMeter: 25000,
                inflation: getInflationPercentage(values.inflationValue || InflationType.Inflation60),
                coverageGroupIds: getCoverageGroupIds('sigorka-konut'),
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

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errorData.message || `Konut Teklifi oluşturulamadı (HTTP ${response.status})`);
            }
            const result = await response.json();
            
            if (result && result.proposalId) {
                // DataLayer push - Step 2 tamamlandı
                pushKonutStep2Complete();
                onProposalCreated(result.proposalId);
            } else {
                throw new Error('Konut Teklif ID alınamadı.');
            }

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Teklif oluşturulurken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

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
                <KonutStep1
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
                <KonutStep2
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

            {showAdditionalInfo && (
                <div className="pp-modal-overlay">
                    <div className="pp-modal-content">
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
                </div>
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
