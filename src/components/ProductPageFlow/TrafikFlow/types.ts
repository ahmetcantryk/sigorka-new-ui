/**
 * Trafik Flow Types
 */

// Ortak type'ları Kasko'dan import et
export type {
  VehicleFormData,
  ExistingVehicle,
  InsuranceCompany,
  Premium,
  Guarantee,
  CoverageValue,
} from '../KaskoFlow/types';

// Trafik'e özel props
export interface TrafikFormProps {
  onProposalCreated: (proposalId: string) => void;
  onBack?: () => void;
}

export interface TrafikQuoteViewProps {
  proposalId: string;
  onPurchaseClick: (productId: string) => void;
  onBack?: () => void;
}

export interface TrafikPurchaseProps {
  proposalId: string;
  productId: string;
  onSuccess: (policyId: string) => void;
  onBack?: () => void;
}

// Trafik Coverage (API response yapısı)
export interface TrafikCoverage {
  $type: 'trafik';
  maddiHasarAracBasina?: CoverageValue;
  maddiHasarKazaBasina?: CoverageValue;
  sakatlanmaVeOlumKisiBasina?: CoverageValue;
  sakatlanmaVeOlumKazaBasina?: CoverageValue;
  tedaviSaglikGiderleriKisiBasina?: CoverageValue;
  tedaviSaglikGiderleriKazaBasina?: CoverageValue;
  hukuksalKorumaAracaBagli?: CoverageValue;
  hukuksalKorumaSurucuyeBagli?: CoverageValue;
  immKombine?: CoverageValue;
  ferdiKaza?: CoverageValue;
  acilSaglik?: CoverageValue;
  cekiciHizmeti?: CoverageValue;
  aracBakimPlani?: CoverageValue;
  productBranch: string;
}

// CoverageValue import edildiği için burada tekrar tanımlamaya gerek yok

// Trafik Quote
import type { Premium, Guarantee, CoverageValue } from '../KaskoFlow/types';

export interface TrafikQuote {
  id: string;
  insuranceCompanyId: number;
  productId: number;
  premiums: Premium[];
  initialCoverage: TrafikCoverage | null;
  optimalCoverage?: TrafikCoverage | null;
  insuranceServiceProviderCoverage?: TrafikCoverage | null;
  pdfCoverage?: TrafikCoverage | null;
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

export interface ProcessedTrafikQuote extends TrafikQuote {
  selectedInstallmentNumber: number;
  productBranch?: string; // Modal'larda doğru branch tooltip'leri için
}

