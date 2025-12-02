/**
 * ImmFlow Types
 * 
 * İMM akışı için tip tanımlamaları
 * Trafik'ten adapte edildi, teminat ve kampanya tipleri çıkarıldı
 */

// Kasko'dan ortak tipleri import et
export type {
  Premium,
  Guarantee,
  InsuranceCompany,
  VehicleFormData,
} from '../KaskoFlow/types';

// ==================== FORM PROPS ====================

export interface ImmFormProps {
  onProposalCreated: (proposalId: string) => void;
  onBack?: () => void;
}

export interface ImmQuoteViewProps {
  proposalId: string;
  onPurchaseClick: (productId: string) => void;
  onBack?: () => void;
}

// ==================== QUOTE TYPES ====================

// İMM Teklif (API'den gelen)
export interface ImmQuote {
  id: string;
  insuranceCompanyId: number;
  productId: number;
  premiums: import('../KaskoFlow/types').Premium[];
  initialCoverage: ImmCoverage | null;
  state: 'WAITING' | 'ACTIVE' | 'FAILED';
  needsInvestigationByCompany: boolean;
  revised: boolean;
  errorMessage: string | null;
  policyId: string | null;
  coverageGroupName?: string;
}

// İMM Coverage (basitleştirilmiş - sadece limit)
export interface ImmCoverage {
  $type: 'imm';
  immLimitiAyrimsiz?: number | CoverageValue;
  productBranch: string;
}

export interface CoverageValue {
  $type: 'LIMITLESS' | 'LIMITED' | 'NOT_COVERED';
  limit?: number;
}

// İşlenmiş İMM Teklif (UI için)
export interface ProcessedImmQuote extends ImmQuote {
  company?: string;
  logo?: string;
  price?: number;
  selectedInstallmentNumber: number;
  insuranceCompanyGuarantees?: import('../KaskoFlow/types').Guarantee[];
  immLimit?: string;
}

// ==================== HOOK TYPES ====================

export interface UseImmQuotesResult {
  quotes: ProcessedImmQuote[];
  companies: import('../KaskoFlow/types').InsuranceCompany[];
  isLoading: boolean;
  error: string | null;
  progress: number;
  handleInstallmentChange: (quoteId: string, installmentNumber: number) => void;
}

// ==================== COMPONENT PROPS ====================

export interface ImmQuoteCardProps {
  quote: ProcessedImmQuote;
  companies: import('../KaskoFlow/types').InsuranceCompany[];
  onPurchase: (quote: ProcessedImmQuote) => void;
  onShowCoverage: (quote: ProcessedImmQuote) => void;
  onInstallmentChange: (quoteId: string, installmentNumber: number) => void;
  isSelected?: boolean;
  onToggleCompare?: (quoteId: string) => void;
}

export interface ImmQuoteListProps {
  quotes: ProcessedImmQuote[];
  companies: import('../KaskoFlow/types').InsuranceCompany[];
  onPurchase: (quote: ProcessedImmQuote) => void;
  onShowCoverage: (quote: ProcessedImmQuote) => void;
  onInstallmentChange: (quoteId: string, installmentNumber: number) => void;
  selectedForComparison?: string[];
  onToggleCompare?: (quoteId: string) => void;
}

export interface ImmStepperProps {
  activeStep: number;
}

// ==================== PURCHASE TYPES ====================

export interface ImmPurchaseData {
  proposalId: string;
  productId: string;
  quoteId: string;
  installmentNumber: number;
  company: string;
  price: number;
  immLimit?: string;
}

