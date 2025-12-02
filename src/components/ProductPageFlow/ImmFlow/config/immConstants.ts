/**
 * Imm Flow - Sabit Değerler ve Konfigürasyonlar
 * 
 * Form alanları, dropdown seçenekleri gibi
 * sabit değerlerin merkezi yönetimi
 */

import { VehicleUtilizationStyle, VehicleFuelType } from '@/types/enums/vehicleEnums';

// Kasko'dan ortak değerleri import et
export {
  VEHICLE_USAGE_OPTIONS,
  FUEL_TYPE_OPTIONS,
} from '../../KaskoFlow/config/kaskoConstants';

// ==================== FORM VARSAYILAN DEĞERLERİ ====================
export const IMM_FORM_DEFAULTS = {
  identityNumber: '',
  email: '',
  phoneNumber: '',
  birthDate: '',
  fullName: '',
  city: '',
  district: '',
  selectionType: 'new' as const,
  vehicleType: 'plated' as const,
  plateCity: '',
  plateCode: '',
  documentSerialCode: '',
  documentSerialNumber: '',
  brandCode: '',
  brand: '',
  modelCode: '',
  model: '',
  year: new Date().getFullYear().toString(),
  usageType: VehicleUtilizationStyle.PrivateCar,
  fuelType: VehicleFuelType.Gasoline,
  engineNo: '',
  chassisNo: '',
  registrationDate: new Date().toISOString().split('T')[0],
  seatCount: '5',
};

// ==================== STEP KONFIGÜRASYONU ====================
export const IMM_STEPS = [
  { id: 0, label: ['Kişisel', 'Bilgiler'] },
  { id: 1, label: ['Araç', 'Bilgileri'] },
  { id: 2, label: ['Teklif', 'Karşılaştırma'] },
  { id: 3, label: ['Ödeme'] },
];

// ==================== LOCAL STORAGE KEYS ====================
export const IMM_STORAGE_KEYS = {
  PROPOSAL_ID: 'proposalIdForImm',
  SELECTED_QUOTE: 'selectedQuoteForPurchaseImm',
  CURRENT_PROPOSAL: 'currentProposalIdImm',
  SELECTED_PRODUCT: 'selectedProductIdForImm',
  INITIAL_EMAIL: 'immInitialEmail',
  PERSONAL_INFO_COMPLETED: 'immPersonalInfoCompleted',
  CASE_CREATED: 'immCaseCreated',
};

// ==================== POLLING KONFIGÜRASYONU ====================
export const IMM_POLLING_CONFIG = {
  INTERVAL: 5000,          // 5 saniye
  TIMEOUT: 180000,         // 3 dakika
  INITIAL_PROGRESS: 30,    // Başlangıç progress
  FINISH_DURATION: 30000,  // Active quote sonrası 30 saniye
  EARLY_FINISH_THRESHOLD: 120000,  // 2 dakika - Bu süreden önce kapanırsa background polling başlar
  BACKGROUND_POLLING_DURATION: 60000,  // 1 dakika - Arka planda ek polling süresi
};

// ==================== İMM PAKET TEMİNATLARI ====================
// InsurUp'daki paketlere göre sabit teminat değerleri

export interface ImmPackageCoverage {
  immLimit: string;
  hukukiKorumaAraca: string;
  hukukiKorumaSurucu: string;
  yetkiliOlmayanCektirme: string;
}

export const IMM_PACKAGE_COVERAGES: Record<string, ImmPackageCoverage> = {
  'Standart': {
    immLimit: '3.000.000 ₺',
    hukukiKorumaAraca: '5.000 ₺',
    hukukiKorumaSurucu: '5.000 ₺',
    yetkiliOlmayanCektirme: '1.500 ₺',
  },
  'Geniş': {
    immLimit: '10.000.000 ₺',
    hukukiKorumaAraca: '5.000 ₺',
    hukukiKorumaSurucu: '5.000 ₺',
    yetkiliOlmayanCektirme: '1.500 ₺',
  },
  'Premium': {
    immLimit: 'Limitsiz',
    hukukiKorumaAraca: '5.000 ₺',
    hukukiKorumaSurucu: '5.000 ₺',
    yetkiliOlmayanCektirme: '1.500 ₺',
  },
};

// Varsayılan teminatlar (paket bulunamazsa)
export const IMM_DEFAULT_COVERAGES: ImmPackageCoverage = {
  immLimit: '-',
  hukukiKorumaAraca: '-',
  hukukiKorumaSurucu: '-',
  yetkiliOlmayanCektirme: '-',
};

// Ana 4 teminat label'ları
export const IMM_MAIN_COVERAGE_LABELS = {
  immLimit: 'İMM Limiti',
  hukukiKorumaAraca: 'Hukuki Koruma (Araca Bağlı)',
  hukukiKorumaSurucu: 'Hukuki Koruma (Sürücüye Bağlı)',
  yetkiliOlmayanCektirme: 'Yetkili Olmayan Kişilere Çektirme',
};

// ==================== İMM LİMİT LABELS ====================
export const IMM_LIMIT_LABELS: Record<string, string> = {
  immLimitiAyrimsiz: 'İMM Limiti',
};

// Paket ismine göre teminatları getir
export const getImmPackageCoverages = (coverageGroupName: string | undefined): ImmPackageCoverage => {
  if (!coverageGroupName) return IMM_DEFAULT_COVERAGES;
  
  // Paket ismi eşleştirme (büyük/küçük harf duyarsız)
  const normalizedName = coverageGroupName.trim();
  
  if (normalizedName.toLowerCase().includes('standart')) {
    return IMM_PACKAGE_COVERAGES['Standart'];
  }
  if (normalizedName.toLowerCase().includes('geniş') || normalizedName.toLowerCase().includes('genis')) {
    return IMM_PACKAGE_COVERAGES['Geniş'];
  }
  if (normalizedName.toLowerCase().includes('premium')) {
    return IMM_PACKAGE_COVERAGES['Premium'];
  }
  
  return IMM_DEFAULT_COVERAGES;
};
