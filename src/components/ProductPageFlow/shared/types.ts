/**
 * ProductPageFlow - Ortak TypeScript Tipleri
 * 
 * Bu dosya, ürün detay sayfalarında kullanılan ortak tip tanımlarını içerir.
 */

// URL Query Parameter Tipleri
export type ProductPageMode = 'quote' | 'purchase' | 'default';

export interface ProductPageQuery {
  proposalId?: string;
  purchaseId?: string;
  step?: string;
}

// Form State Tipleri
export interface FormStepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

// Loading State
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}

// Error State
export type ErrorType = 'validation' | 'api' | 'network' | 'auth';

export interface ErrorState {
  hasError: boolean;
  errorMessage?: string;
  errorType?: ErrorType;
}

// Proposal Types
export interface ProposalData {
  proposalId: string;
  productBranch: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

// Purchase Types
export interface PurchaseData {
  purchaseId: string;
  proposalId: string;
  productId: string;
  amount: number;
  status: string;
}

// Generic API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

