/**
 * Kasko Flow Types
 */

export interface VehicleFormData {
  // Step 0: Kişisel Bilgiler (PersonalInfoStep ile uyumlu)
  identityNumber: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  job?: number;
  fullName?: string;
  city?: string;
  district?: string;

  // Step 1: Plaka ve Belge Bilgileri
  selectionType: 'existing' | 'new';
  vehicleType: 'plated' | 'unplated';
  plateCity: string;
  plateCode: string;
  documentSerialCode: string;
  documentSerialNumber: string;

  // Step 2: Araç Detayları
  brandCode: string;
  brand: string;
  modelCode: string;
  model: string;
  year: string;
  usageType: string;
  fuelType: string;
  engineNo: string;
  chassisNo: string;
  registrationDate: string;
  seatCount: string;
}

export interface ExistingVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  plateCity?: string; // Plaka il kodu
  plateCode?: string; // Plaka kodu
  vehicleType: string;
  utilizationStyle?: number;
  fuelType?: number;
  engineNumber?: string;
  chassisNumber?: string;
  documentSerial?: {
    code: string;
    number: string;
  };
  registrationDate?: string;
  seatNumber?: number;
}

export interface KaskoFormProps {
  onProposalCreated: (proposalId: string) => void;
  onBack?: () => void;
}

export interface QuoteViewProps {
  proposalId: string;
  onPurchaseClick: (productId: string) => void;
  onBack?: () => void;
}

export interface PurchaseProps {
  proposalId: string;
  productId: string;
  onSuccess: (policyId: string) => void;
  onBack?: () => void;
}

// Quote Comparison Types (QuoteComparisonStep.tsx'ten adapte edildi)

export interface InsuranceCompany {
  id: number;
  name: string;
  logo: string | null;
  enabled: boolean;
}

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

export interface CoverageValue {
  $type: 'LIMITLESS' | 'DECIMAL' | 'UNDEFINED' | 'HIGHEST_LIMIT' | 'NOT_INCLUDED' | 'INCLUDED' | 'NONE';
  value?: number;
}

export interface KiralArac {
  undefined: boolean;
  yillikKullanimSayisi: number | null;
  tekSeferlikGunSayisi: number | null;
  aracSegment: string | null;
}

export interface KaskoCoverage {
  $type: 'kasko';
  immLimitiAyrimsiz: CoverageValue;
  ferdiKazaVefat: CoverageValue;
  ferdiKazaSakatlik: CoverageValue;
  ferdiKazaTedaviMasraflari: CoverageValue;
  anahtarKaybi: CoverageValue;
  maneviTazminat: CoverageValue;
  onarimServisTuru: string;
  yedekParcaTuru: string;
  camKirilmaMuafeyeti: CoverageValue;
  kiralikArac: KiralArac;
  hukuksalKorumaAracaBagli?: CoverageValue;
  ozelEsya?: CoverageValue;
  sigaraMaddeZarari?: CoverageValue;
  patlayiciMaddeZarari?: CoverageValue;
  kemirgenZarari?: CoverageValue;
  yukKaymasiZarari?: CoverageValue;
  eskime?: CoverageValue;
  hasarsizlikIndirimKoruma?: CoverageValue;
  yurtdisiKasko?: CoverageValue;
  aracCalinmasi?: CoverageValue;
  anahtarCalinmasi?: CoverageValue;
  hukuksalKorumaSurucuyeBagli?: CoverageValue;
  miniOnarim?: CoverageValue;
  yolYardim?: CoverageValue;
  yanlisAkaryakitDolumu?: CoverageValue;
  yanma?: CoverageValue;
  carpma?: CoverageValue;
  carpisma?: CoverageValue;
  glkhhTeror?: CoverageValue;
  grevLokavt?: CoverageValue;
  dogalAfetler?: CoverageValue;
  hirsizlik?: CoverageValue;
  productBranch: string;
}

export interface Guarantee {
  insuranceGuaranteeId: string;
  label: string;
  valueText: string | null;
  amount: number;
}

export interface Quote {
  id: string;
  insuranceCompanyId: number;
  productId: number;
  premiums: Premium[];
  initialCoverage: KaskoCoverage | null;
  insuranceServiceProviderCoverage: KaskoCoverage | null;
  pdfCoverage: KaskoCoverage | null;
  state: 'WAITING' | 'ACTIVE' | 'FAILED';
  needsInvestigationByCompany: boolean;
  hasVocationalDiscount: boolean;
  hasUndamagedDiscount: boolean;
  revised: boolean;
  errorMessage: string | null;
  policyId: string | null;
  coverageGroupName?: string;

  // Processed fields
  company?: string;
  price?: number;
  coverage?: number;
  features?: string[];
  logo?: string;
  insuranceCompanyGuarantees?: Guarantee[];
}

export interface ProcessedQuote extends Quote {
  selectedInstallmentNumber: number;
}

