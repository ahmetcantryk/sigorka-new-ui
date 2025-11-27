/**
 * Trafik Flow - Sabit Değerler ve Konfigürasyonlar
 * 
 * Form alanları, dropdown seçenekleri, teminat etiketleri gibi
 * sabit değerlerin merkezi yönetimi
 */

import { VehicleUtilizationStyle, VehicleFuelType } from '@/types/enums/vehicleEnums';

// Kasko'dan ortak değerleri import et
export {
  Job,
  JOB_OPTIONS,
  VEHICLE_USAGE_OPTIONS,
  FUEL_TYPE_OPTIONS,
} from '../../KaskoFlow/config/kaskoConstants';

// ==================== TRAFİK TEMİNAT ETİKETLERİ ====================
export const TRAFIK_COVERAGE_LABELS: Record<string, string> = {
  // Ana Teminatlar
  maddiHasarAracBasina: 'Maddi Hasar Araç Başına',
  maddiHasarKazaBasina: 'Maddi Hasar Kaza Başına',
  sakatlanmaVeOlumKisiBasina: 'Sakatlanma ve Ölüm Kişi Başına',
  sakatlanmaVeOlumKazaBasina: 'Sakatlanma ve Ölüm Kaza Başına',
  tedaviSaglikGiderleriKisiBasina: 'Tedavi Sağlık Giderleri Kişi Başına',
  tedaviSaglikGiderleriKazaBasina: 'Tedavi Sağlık Giderleri Kaza Başına',
  
  // Ek Teminatlar
  hukuksalKorumaAracaBagli: 'Hukuksal Koruma',
  hukuksalKorumaSurucuyeBagli: 'Hukuksal Koruma Sürücüye Bağlı',
  immKombine: 'İMM',
  ferdiKaza: 'Ferdi Kaza',
  acilSaglik: 'Acil Sağlık',
  cekiciHizmeti: 'Yol Yardım',
  aracBakimPlani: 'Araç Bakım Planı',
};

// ==================== QUOTE CARD ANA TEMİNATLAR ====================
// Teklif kartında gösterilecek ana teminatlar
export const TRAFIK_MAIN_COVERAGE_KEYS = [
  'hukuksalKorumaAracaBagli',  // Hukuksal Koruma - sayı ile
  'immKombine',                 // İMM - sayı ile
  'cekiciHizmeti',              // Yol Yardım - tik ile
];

// ==================== TEMİNAT GÖRÜNTÜLEME TİPLERİ ====================
// Sayı ile gösterilecek teminatlar
export const TRAFIK_NUMERIC_COVERAGES = [
  'hukuksalKorumaAracaBagli',
  'immKombine',
];

// Tik ile gösterilecek teminatlar  
export const TRAFIK_TICK_COVERAGES = [
  'cekiciHizmeti',
];

// ==================== TEMİNAT DETAY SIRALAMA ====================
// Teminat detayları açıldığında gösterilecek teminatlar (sıralı)
export const TRAFIK_DETAIL_COVERAGE_ORDER = [
  'maddiHasarAracBasina',
  'maddiHasarKazaBasina',
  'sakatlanmaVeOlumKisiBasina',
  'sakatlanmaVeOlumKazaBasina',
  'tedaviSaglikGiderleriKisiBasina',
  'tedaviSaglikGiderleriKazaBasina',
  'hukuksalKorumaAracaBagli',
  'immKombine',
  'ferdiKaza',
  'cekiciHizmeti',
];

// ==================== FORM VARSAYILAN DEĞERLERİ ====================
export const TRAFIK_FORM_DEFAULTS = {
  identityNumber: '',
  email: '',
  phoneNumber: '',
  birthDate: '',
  job: 0, // Job.Unknown
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
  fuelType: VehicleFuelType.Diesel,
  engineNo: '',
  chassisNo: '',
  registrationDate: new Date().toISOString().split('T')[0],
  seatCount: '5',
};

// ==================== STEP KONFIGÜRASYONU ====================
export const TRAFIK_STEPS = [
  { id: 0, label: ['Kişisel', 'Bilgiler'] },
  { id: 1, label: ['Araç', 'Bilgileri'] },
  { id: 2, label: ['Teklif', 'Karşılaştırma'] },
  { id: 3, label: ['Ödeme'] },
];

// ==================== LOCAL STORAGE KEYS ====================
export const TRAFIK_STORAGE_KEYS = {
  PROPOSAL_ID: 'proposalIdForTrafik',
  SELECTED_QUOTE: 'selectedQuoteForPurchaseTrafik',
  CURRENT_PROPOSAL: 'currentProposalIdTrafik',
  SELECTED_PRODUCT: 'selectedProductIdForTrafik',
  INITIAL_EMAIL: 'trafikInitialEmail',
  INITIAL_JOB: 'trafikInitialJob',
  PERSONAL_INFO_COMPLETED: 'trafikPersonalInfoCompleted',
  CASE_CREATED: 'trafikCaseCreated',
};

// ==================== POLLING KONFIGÜRASYONU ====================
export const TRAFIK_POLLING_CONFIG = {
  INTERVAL: 5000,          // 5 saniye
  TIMEOUT: 180000,         // 3 dakika
  INITIAL_PROGRESS: 30,    // Başlangıç progress
  FINISH_DURATION: 30000,  // Active quote sonrası 30 saniye
};

