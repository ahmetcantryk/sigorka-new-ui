/**
 * TssProductForm
 * 
 * Ürün detay sayfası için TSS formu
 * Kasko ProductForm ile aynı yapıda
 */

'use client';

import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductPageQuery } from '@/components/ProductPageFlow/shared/hooks/useProductPageQuery';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';
import { performLogin, verifyOTP, CustomerType, updateCustomerProfile } from '@/utils/authHelper';
import { updateCustomerHealthInfo } from '@/utils/authHelper';
import { fetchWithAuth, CustomerProfile } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';

// Components
import TssStep1 from './components/steps/TssStep1';
import TssStep2 from './components/steps/TssStep2';
import AdditionalInfoStep from './components/steps/AdditionalInfoStep';
import { TssStepper } from './components/common';
import VerificationCodeModal from '../shared/VerificationCodeModal';
import PhoneNotMatchModal from '@/components/common/PhoneNotMatchModal';

// Config
import { TSS_FORM_DEFAULTS, TSS_STORAGE_KEYS, JOB_OPTIONS } from './config/tssConstants';
import { personalInfoValidationSchema, healthInfoValidationSchema } from './config/tssValidation';

// Utils
import { pushTssStep1Complete, pushTssStep2Complete } from './utils/dataLayerUtils';

// Types
import { TssFormData, TssFormProps, Job, CustomerType as CustomerTypeEnum } from './types';

export const TssProductForm = ({ onProposalCreated, onBack }: TssFormProps) => {
    const { accessToken, user, setUser, customerId, setCustomerId, setTokens } = useAuthStore();
    const { navigateToQuote } = useProductPageQuery();
    const agencyConfig = useAgencyConfig();
    const agentId = agencyConfig?.agency?.id;

    const [activeStep, setActiveStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    // Step değiştiğinde veya ek bilgi formu açıldığında sayfayı en üste scroll et
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeStep, showAdditionalInfo]);

    // Cities & Districts
    const [cities, setCities] = useState<Array<{ value: string; text: string }>>([]);
    const [districts, setDistricts] = useState<Array<{ value: string; text: string }>>([]);

    const initialValues: TssFormData = {
        customerType: CustomerTypeEnum.Individual,
        identityNumber: '',
        email: '',
        phoneNumber: '',
        birthDate: '',
        job: Job.Unknown,
        fullName: '',
        city: '',
        district: '',
        height: '',
        weight: '',
    };

    const getValidationSchema = () => {
        if (activeStep === 0) {
            return personalInfoValidationSchema;
        }
        if (activeStep === 1) {
            return healthInfoValidationSchema;
        }
        return null;
    };

    const formik = useFormik({
        initialValues,
        validationSchema: getValidationSchema(),
        validateOnMount: false,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: async (values) => {
            if (activeStep === 0) {
                handleStep1Submit(values);
            } else if (activeStep === 1) {
                handleStep2Submit(values);
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

                // E-posta güncellemesi gerekebilir
                const userEnteredEmail = formik.values.email?.trim();
                if (userEnteredEmail && userEnteredEmail !== profile.primaryEmail && profile.id) {
                    try {
                        // CustomerType belirleme: taxNumber varsa veya type === 'company' ise Company
                        const customerType = (profile as any).taxNumber || (profile as any).type === 'company' 
                            ? CustomerType.Company 
                            : CustomerType.Individual;
                        
                        const updatePayload: Record<string, any> = {
                            primaryPhoneNumber: profile.primaryPhoneNumber,
                            primaryEmail: userEnteredEmail,
                            fullName: profile.fullName,
                        };
                        
                        // Individual için identityNumber ve birthDate ekle
                        if (customerType === CustomerType.Individual) {
                            if (profile.identityNumber) updatePayload.identityNumber = profile.identityNumber;
                            if (profile.birthDate) updatePayload.birthDate = profile.birthDate;
                            if (profile.gender) updatePayload.gender = profile.gender;
                            if (profile.educationStatus) updatePayload.educationStatus = profile.educationStatus;
                            if (profile.nationality) updatePayload.nationality = profile.nationality;
                            if (profile.maritalStatus) updatePayload.maritalStatus = profile.maritalStatus;
                            if (profile.representedBy) updatePayload.representedBy = profile.representedBy;
                        } else {
                            // Company için taxNumber ve title ekle
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
                        profile.primaryEmail = userEnteredEmail; // Update local profile
                    } catch (error) {
                        console.warn('Email update hatası:', error);
                        // Hata olsa bile devam et
                    }
                }

                // Check if profile is complete
                const customerType = (profile as any).taxNumber || (profile as any).type === 'company' 
                    ? CustomerType.Company 
                    : CustomerType.Individual;
                const cityValue = typeof profile.city === 'object' && profile.city ? profile.city.value : profile.city;
                const districtValue = typeof profile.district === 'object' && profile.district ? profile.district.value : profile.district;
                // Company müşterileri için title, Individual müşteriler için fullName kontrol et
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

                    // Fetch health info
                    try {
                        const healthResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_HEALTH_INFO(profile.id));
                        if (healthResponse.ok) {
                            const healthData = await healthResponse.json();
                            formik.setFieldValue('height', healthData.height?.toString() || '');
                            formik.setFieldValue('weight', healthData.weight?.toString() || '');
                        }
                    } catch (e) {
                        // Health info might not exist yet
                    }

                    // Create case
                    await createSaleOpportunityCase(profile.id);

                    if (!step1EventFired) {
                        pushTssStep1Complete();
                        setStep1EventFired(true);
                    }
                    setActiveStep(1);
                } else {
                    // Profile incomplete, show additional info form
                    const customerType = (profile as any).taxNumber || (profile as any).type === 'company' 
                        ? CustomerType.Company 
                        : CustomerType.Individual;
                    
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

    const createSaleOpportunityCase = async (custId: string) => {
        const caseCreated = localStorage.getItem(TSS_STORAGE_KEYS.CASE_CREATED);
        if (caseCreated) return;

        try {
            // Check existing cases
            const graphqlQuery = {
                query: `query {
                    cases(
                        skip: 0
                        take: 100
                        where: {
                            customerId: { eq: "${custId}" }  
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

            const checkResponse = await fetchWithAuth(API_ENDPOINTS.CASES_GRAPHQL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(graphqlQuery)
            });

            if (checkResponse.ok) {
                const result = await checkResponse.json();
                const existingCase = result?.data?.cases?.items?.find((c: any) =>
                    c.productBranch === 'TSS' && c.type === 'SALE_OPPORTUNITY' && c.status === 'OPEN'
                );

                if (existingCase) {
                    localStorage.setItem(TSS_STORAGE_KEYS.CASE_CREATED, 'true');
                    return;
                }
            }

            // Create new case
            const casePayload = {
                customerId: custId,
                assetType: null,
                assetId: null,
                productBranch: 'TSS',
                channel: 'WEBSITE'
            };

            const response = await fetchWithAuth(API_ENDPOINTS.CASES_NEW_SALE_OPPORTUNITY, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(casePayload)
            });

            if (response.ok) {
                localStorage.setItem(TSS_STORAGE_KEYS.CASE_CREATED, 'true');
            }
        } catch (error) {
            console.warn('Case oluşturma hatası:', error);
        }
    };

    const handleStep1Submit = async (values: TssFormData) => {
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
            localStorage.setItem(TSS_STORAGE_KEYS.INITIAL_EMAIL, values.email);
            localStorage.setItem(TSS_STORAGE_KEYS.INITIAL_JOB, values.job.toString());
            localStorage.setItem(TSS_STORAGE_KEYS.INITIAL_BIRTH_DATE, values.birthDate);

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
            
            // VKN kontrolü: 10 haneli ise Company, 11 haneli ise Individual
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
            // 404 hatası ve RESOURCE_NOT_FOUND_DATABASE kodu kontrolü
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
            const storedEmail = localStorage.getItem(TSS_STORAGE_KEYS.INITIAL_EMAIL);
            const storedJob = localStorage.getItem(TSS_STORAGE_KEYS.INITIAL_JOB);
            const storedBirthDate = localStorage.getItem(TSS_STORAGE_KEYS.INITIAL_BIRTH_DATE);

            // Get current customer ID and profile
            const meResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
            const currentMeData = await meResponse.json();
            const currentCustomerId = customerId || currentMeData.id;

            // CustomerType belirleme: taxNumber varsa veya type === 'company' ise Company
            const customerType = currentMeData.taxNumber || currentMeData.type === 'company' 
                ? CustomerType.Company 
                : CustomerType.Individual;

            // Build update payload
            const updatePayload: Record<string, any> = {
                primaryPhoneNumber: currentMeData.primaryPhoneNumber,
                cityReference: values.city,
                districtReference: values.district,
            };

            // Individual için fullName, identityNumber ve birthDate ekle
            if (customerType === CustomerType.Individual) {
                updatePayload.fullName = values.fullName;
                if (currentMeData.identityNumber) {
                    updatePayload.identityNumber = currentMeData.identityNumber;
                }
                if (storedBirthDate) {
                    updatePayload.birthDate = storedBirthDate;
                }
            } else {
                // Company için taxNumber ve title ekle
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

            // Create case
            await createSaleOpportunityCase(currentCustomerId);

            setShowAdditionalInfo(false);
            if (!step1EventFired) {
                pushTssStep1Complete();
                setStep1EventFired(true);
            }
            setActiveStep(1);
        } catch (error) {
            setError('Bilgiler güncellenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStep2Submit = async (values: TssFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const height = parseFloat(values.height);
            const weight = parseFloat(values.weight);

            if (isNaN(height) || isNaN(weight)) {
                setError('Geçerli boy ve kilo değerleri giriniz.');
                setIsLoading(false);
                return;
            }

            // Update health info
            const currentCustomerId = customerId || (await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME).then(r => r.json()).then(d => d.id));
            await updateCustomerHealthInfo(height, weight, currentCustomerId);

            // Create proposal - Eski TSS akışındaki gibi
            const coverageGroupIds = agencyConfig?.coverageGroupIds?.tss || [];
            
            const proposalPayload = {
                $type: 'tss',
                insurerCustomerId: currentCustomerId,
                insuredCustomerId: currentCustomerId,
                coverageGroupIds: coverageGroupIds.length > 0 ? coverageGroupIds : null,
                coverage: null,
                channel: 'WEBSITE',
            };

            console.log('📤 TSS Proposal payload:', proposalPayload);

            const proposalResponse = await fetchWithAuth(API_ENDPOINTS.PROPOSALS_CREATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(proposalPayload)
            });

            console.log('📥 TSS Proposal response status:', proposalResponse.status);

            if (!proposalResponse.ok) {
                const errorText = await proposalResponse.text();
                console.error('❌ TSS Proposal error:', errorText);
                throw new Error('Teklif oluşturulamadı');
            }

            const proposalData = await proposalResponse.json();
            console.log('📥 TSS Proposal data:', proposalData);
            
            // proposalId veya id olabilir
            const proposalId = proposalData.proposalId || proposalData.id;

            if (!proposalId) {
                console.error('❌ Proposal ID not found in response:', proposalData);
                throw new Error('Teklif ID alınamadı');
            }

            console.log('✅ TSS Proposal ID:', proposalId);

            // Store proposal ID
            localStorage.setItem(TSS_STORAGE_KEYS.PROPOSAL_ID, proposalId);
            localStorage.setItem(TSS_STORAGE_KEYS.CURRENT_PROPOSAL, proposalId);

            pushTssStep2Complete();

            // Navigate to quote view
            onProposalCreated(proposalId);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Teklif oluşturulurken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (activeStep > 0) {
            setActiveStep(activeStep - 1);
        } else if (onBack) {
            onBack();
        }
    };

    // Render Additional Info Form
    if (showAdditionalInfo) {
        return (
            <div className="product-page-flow-container">
                <TssStepper activeStep={0} />
                <AdditionalInfoStep
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
        <div className="product-page-flow-container">
            <TssStepper activeStep={activeStep} />

            <form onSubmit={formik.handleSubmit}>
                {activeStep === 0 && (
                    <TssStep1
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
                    <TssStep2
                        formik={formik}
                        isLoading={isLoading}
                        error={error}
                        onSubmit={() => handleStep2Submit(formik.values)}
                        onBack={handleBack}
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

export default TssProductForm;
