/**
 * TssFlow Types
 * 
 * TSS (Tamamlayıcı Sağlık Sigortası) için tip tanımlamaları
 */

// Customer Types
export enum CustomerType {
    Individual = 1,
    Company = 2,
}

// Job Enum
export enum Job {
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

// Form Data
export interface TssFormData {
    // Step 1 - Personal Info
    customerType: CustomerType;
    identityNumber: string;
    email: string;
    phoneNumber: string;
    birthDate: string;
    job: Job;
    fullName: string;
    city: string;
    district: string;

    // Step 2 - Health Info
    height: string;
    weight: string;
}

// Form Props
export interface TssFormProps {
    onProposalCreated: (proposalId: string) => void;
    onBack?: () => void;
}

export interface TssQuoteViewProps {
    proposalId: string;
    onPurchaseClick: (productId: string) => void;
    onBack?: () => void;
}

// Premium
export interface Premium {
    installmentNumber: number;
    netPremium: number;
    grossPremium: number;
    commission: number;
    exchangeRate: number;
    currency: string;
    insuranceCompanyProposalNumber: string;
    formattedNetPremium?: string;
    formattedGrossPremium?: string;
}

// Guarantee
export interface Guarantee {
    insuranceGuaranteeId: string;
    label: string;
    valueText: string | null;
    amount: number;
    isIncluded?: boolean; // Teminatın dahil olup olmadığı
}

// Insurance Company
export interface InsuranceCompany {
    id: number;
    name: string;
    logo: string | null;
    enabled: boolean;
}

// Coverage Value Types - API'den gelen değer yapıları
export interface CoverageValueUndefined {
    $type: 'UNDEFINED';
}

export interface CoverageValueLimitless {
    $type: 'LIMITLESS' | 'UNLIMITED';
}

export interface CoverageValueLimited {
    $type: 'LIMITED';
    limit?: number;
}

export interface CoverageValueCount {
    $type: 'COUNT';
    count?: number;
}

export type CoverageValue = 
    | CoverageValueUndefined 
    | CoverageValueLimitless 
    | CoverageValueLimited 
    | CoverageValueCount
    | number
    | string
    | boolean;

// Sağlık Paketi
export interface SaglikPaketi {
    undefined?: boolean;
    tedaviSekli?: 'YATARAK' | 'AYAKTA' | 'YATARAK_AYAKTA';
    ayaktaYillikTedaviSayisi?: number;
}

// TSS Coverage - API Response yapısına göre
export interface TssCoverage {
    $type?: 'tss';
    productBranch?: 'TSS';
    
    // Hastane Ağı
    hastaneAgi?: string; // 'STANDART_KAPSAM' | 'GENIS_KAPSAM' | 'DAR_KAPSAM'
    
    // Sağlık Paketi (nested object)
    saglikPaketi?: SaglikPaketi;
    
    // Ana teminatlar (kartta gösterilecek)
    yatarakTedavi?: CoverageValue;
    ayaktaTedavi?: CoverageValue;
    doktorMuayene?: CoverageValue;
    
    // Detay teminatlar (modal'da gösterilecek)
    disPaketi?: CoverageValue;
    diyetisyenHizmeti?: CoverageValue;
    yogunBakim?: CoverageValue;
    checkUpHizmeti?: CoverageValue;
    psikolojikDanismanlik?: CoverageValue;
    fizikTedavi?: CoverageValue;
    suniUzuv?: CoverageValue;
    ambulans?: CoverageValue;
    ameliyat?: CoverageValue;
    ameliyatMalzeme?: CoverageValue;
    kemoterapi?: CoverageValue;
    radyoterapi?: CoverageValue;
    diyaliz?: CoverageValue;
    evdeBakim?: CoverageValue;
    yediGun24SaatTibbiDanismanlik?: CoverageValue;
    dogum?: CoverageValue;
    kucukMudahale?: CoverageValue;
    gozPaketi?: CoverageValue;
    
    // Dinamik alanlar için
    [key: string]: any;
}

// Quote
export interface Quote {
    id: string;
    insuranceCompanyId: number;
    productId: number;
    premiums: Premium[];
    initialCoverage: TssCoverage | null;
    insuranceServiceProviderCoverage: TssCoverage | null;
    pdfCoverage: TssCoverage | null;
    optimalCoverage: TssCoverage | null;  // API'den gelen ana coverage kaynağı
    state: 'WAITING' | 'ACTIVE' | 'FAILED';
    needsInvestigationByCompany: boolean;
    hasVocationalDiscount: boolean;
    hasUndamagedDiscount: boolean;
    revised: boolean;
    errorMessage: string | null;
    policyId: string | null;
    coverageGroupName?: string;
    discountModels?: Record<string, unknown>[];
    company?: string;
    price?: number;
    logo?: string;
    insuranceCompanyGuarantees?: Guarantee[];
}

export interface ProcessedQuote extends Quote {
    selectedInstallmentNumber: number;
    productBranch?: string;
    optimalCoverage: TssCoverage | null;  // ProcessedQuote'da da olmalı
}

// Step Props
export interface TssStep1Props {
    formik: any;
    isLoading: boolean;
    kvkkConsent: boolean;
    marketingConsent: boolean;
    kvkkError: string | null;
    error: string | null;
    accessToken: string | null;
    onKvkkChange: (checked: boolean) => void;
    onMarketingChange: (checked: boolean) => void;
    onSubmit: () => void;
}

export interface TssStep2Props {
    formik: any;
    isLoading: boolean;
    error: string | null;
    onSubmit: () => void;
    onBack: () => void;
}

export interface AdditionalInfoStepProps {
    formik: any;
    cities: Array<{ value: string; text: string }>;
    districts: Array<{ value: string; text: string }>;
    isLoading: boolean;
    error: string | null;
    fieldErrors: Record<string, string>;
    onCityChange: (cityValue: string) => void;
    onSubmit: () => void;
}

// Quote Card Props
export interface TssQuoteCardProps {
    quote: ProcessedQuote;
    proposalId: string;
    onInstallmentChange: (quoteId: string, installmentNumber: number) => void;
    onPurchase: (quoteId: string) => void;
    onOpenModal: (quote: ProcessedQuote) => void;
    onViewDocument: (proposalId: string, productId: string) => void;
    isLoadingDocument?: boolean;
}

// Quote List Props
export interface TssQuoteListProps {
    quotes: ProcessedQuote[];
    proposalId: string;
    onInstallmentChange: (quoteId: string, installmentNumber: number) => void;
    onPurchase: (quoteId: string) => void;
    onOpenModal: (quote: ProcessedQuote) => void;
    onViewDocument: (proposalId: string, productId: string) => void;
    onOpenComparisonModal?: () => void;
    loadingDocumentQuoteId?: string | null;
}

