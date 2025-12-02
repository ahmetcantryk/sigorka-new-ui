/**
 * ImmFlow - İMM Sigortası Akışı
 * 
 * Ana bileşenler, tipler, konfigürasyon, utils ve hooks export'ları
 */

// ==================== MAIN COMPONENTS ====================
export { default as ImmProductForm } from './ImmProductForm';
export { default as ImmProductQuote } from './ImmProductQuote';

// ==================== TYPES ====================
export type {
  ImmFormProps,
  ImmQuoteViewProps,
  ImmQuote,
  ImmCoverage,
  CoverageValue,
  ProcessedImmQuote,
  UseImmQuotesResult,
  ImmQuoteCardProps,
  ImmQuoteListProps,
  ImmStepperProps,
  ImmPurchaseData,
  // Re-exported from KaskoFlow
  Premium,
  Guarantee,
  InsuranceCompany,
  VehicleFormData,
} from './types';

// ==================== CONFIG ====================
export {
  IMM_FORM_DEFAULTS,
  IMM_STORAGE_KEYS,
  IMM_POLLING_CONFIG,
  IMM_STEPS,
  IMM_LIMIT_LABELS,
  IMM_PACKAGE_COVERAGES,
  IMM_DEFAULT_COVERAGES,
  IMM_MAIN_COVERAGE_LABELS,
  getImmPackageCoverages,
} from './config/immConstants';

export type { ImmPackageCoverage } from './config/immConstants';

export {
  personalInfoValidationSchema,
  vehicleValidationSchema,
} from './config/immValidation';

// ==================== UTILS ====================
export {
  processImmQuotesData,
  getImmLimit,
  formatImmLimit,
  sortImmQuotesByPrice,
  filterActiveImmQuotes,
  prepareImmPurchaseData,
  saveImmPurchaseDataToStorage,
  getSelectedImmPremium,
} from './utils/quoteUtils';

export {
  pushImmStep1Complete,
  pushImmStep2Complete,
  pushImmQuoteSuccess,
  pushImmQuoteFailed,
  pushImmPurchaseClick,
  pushImmPaymentSuccess,
  pushImmPaymentFailed,
} from './utils/dataLayerUtils';

// ==================== HOOKS ====================
export { useImmQuotes } from './hooks/useImmQuotes';
export { useImmVehicle } from './hooks/useImmVehicle';

// ==================== COMPONENTS ====================
export { ImmStepper, TramerErrorPopup } from './components/common';
export { ImmQuoteCard, ImmQuoteList } from './components/quote';
export { PersonalInfoStep, VehicleSelectionStep, AdditionalInfoStep } from './components/steps';
export { ImmPurchaseStep } from './components/purchase';

