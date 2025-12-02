/**
 * Offline Flow - Main Exports
 * 
 * Offline talep formları için ProductPageFlow yapısı
 * 
 * Kullanım:
 * 
 * 1. Sayfa bileşeninde (client.tsx):
 * ```tsx
 * import { OfflineProductForm, getBranchConfig } from '@/components/ProductPageFlow/OfflineFlow';
 * 
 * const branchConfig = getBranchConfig('ferdi-kaza');
 * if (!branchConfig) return null;
 * 
 * return <OfflineProductForm branchConfig={branchConfig} />;
 * ```
 * 
 * 2. Yeni bir branş eklemek için:
 * - src/components/ProductPageFlow/OfflineFlow/config/offlineConstants.ts dosyasındaki
 *   OFFLINE_BRANCH_CONFIGS objesine yeni config ekleyin
 * 
 * Mevcut branşlar:
 * - ferdi-kaza
 * - ozel-saglik
 * - yabanci-saglik
 * - seyahat-saglik
 */

export { default as OfflineProductForm } from './OfflineProductForm';
export { OfflineStepper } from './components/common';
export { PersonalInfoStep, AdditionalInfoStep, RequestStep } from './components/steps';
export { 
  OFFLINE_BRANCH_CONFIGS, 
  OFFLINE_FORM_DEFAULTS,
  JOB_OPTIONS,
  getBranchConfig, 
  getStorageKeys,
  type OfflineBranchConfig,
} from './config';
export * from './types';
export * from './utils';

