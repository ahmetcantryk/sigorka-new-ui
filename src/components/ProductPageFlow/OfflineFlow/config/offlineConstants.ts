/**
 * Offline Flow - Constants
 * 
 * Tüm offline talep formları için dinamik konfigürasyon
 */

import { Job, CustomerType, OfflineBranchConfig } from '../types';

// Re-export for backwards compatibility
export type { OfflineBranchConfig } from '../types';

// ==================== BRANCH CONFIGS ====================
export const OFFLINE_BRANCH_CONFIGS: Record<string, OfflineBranchConfig> = {
  'ferdi-kaza': {
    id: 'ferdi-kaza',
    productBranch: 'FERDI_KAZA',
    displayName: 'Ferdi Kaza Sigortası',
    shortName: 'Ferdi Kaza',
    storageKeyPrefix: 'ferdiKaza',
    dataLayerEventPrefix: 'ferdikaza',
    steps: [
      { id: 0, label: ['Kişisel', 'Bilgiler'] },
      { id: 1, label: ['Talep', 'Oluştur'] },
    ],
    successMessage: 'En kısa sürede uzman ekibimiz Ferdi Kaza Sigortası teklif talebiniz için sizlerle iletişime geçecek. Farklı bir ihtiyacınız olursa 0850 404 04 04\'ü arayabilirsiniz.',
    existingRequestMessage: 'Ferdi Kaza Sigortası için zaten açık bir talebiniz bulunmaktadır.',
    requestDescription: 'Talebinizi oluşturduktan sonra uzman ekibimiz sizinle iletişime geçerek ihtiyaçlarınıza en uygun teklifi hazırlayacaktır.',
    showJobField: true,
  },
  
  'ozel-saglik': {
    id: 'ozel-saglik',
    productBranch: 'SAGLIK',
    displayName: 'Özel Sağlık Sigortası',
    shortName: 'Özel Sağlık',
    storageKeyPrefix: 'ozelSaglik',
    dataLayerEventPrefix: 'oss',
    steps: [
      { id: 0, label: ['Kişisel', 'Bilgiler'] },
      { id: 1, label: ['Talep', 'Oluştur'] },
    ],
    successMessage: 'En kısa sürede uzman ekibimiz Özel Sağlık Sigortası teklif talebiniz için sizlerle iletişime geçecek. Farklı bir ihtiyacınız olursa 0850 404 04 04\'ü arayabilirsiniz.',
    existingRequestMessage: 'Özel Sağlık Sigortası için zaten açık bir talebiniz bulunmaktadır.',
    requestDescription: 'Talebinizi oluşturduktan sonra uzman ekibimiz sizinle iletişime geçerek ihtiyaçlarınıza en uygun teklifi hazırlayacaktır.',
    showJobField: true,
  },
  
  'yabanci-saglik': {
    id: 'yabanci-saglik',
    productBranch: 'SAGLIK',
    displayName: 'Yabancı Sağlık Sigortası',
    shortName: 'Yabancı Sağlık',
    storageKeyPrefix: 'yabanciSaglik',
    dataLayerEventPrefix: 'yss',
    steps: [
      { id: 0, label: ['Kişisel', 'Bilgiler'] },
      { id: 1, label: ['Talep', 'Oluştur'] },
    ],
    successMessage: 'En kısa sürede uzman ekibimiz Yabancı Sağlık Sigortası teklif talebiniz için sizlerle iletişime geçecek. Farklı bir ihtiyacınız olursa 0850 404 04 04\'ü arayabilirsiniz.',
    existingRequestMessage: 'Yabancı Sağlık Sigortası için zaten açık bir talebiniz bulunmaktadır.',
    requestDescription: 'Talebinizi oluşturduktan sonra uzman ekibimiz sizinle iletişime geçerek ihtiyaçlarınıza en uygun teklifi hazırlayacaktır.',
    showJobField: true,
  },
  
  'seyahat-saglik': {
    id: 'seyahat-saglik',
    productBranch: 'SEYAHAT',
    displayName: 'Seyahat Sağlık Sigortası',
    shortName: 'Seyahat Sağlık',
    storageKeyPrefix: 'seyahatSaglik',
    dataLayerEventPrefix: 'sss',
    steps: [
      { id: 0, label: ['Kişisel', 'Bilgiler'] },
      { id: 1, label: ['Talep', 'Oluştur'] },
    ],
    successMessage: 'En kısa sürede uzman ekibimiz Seyahat Sağlık Sigortası teklif talebiniz için sizlerle iletişime geçecek. Farklı bir ihtiyacınız olursa 0850 404 04 04\'ü arayabilirsiniz.',
    existingRequestMessage: 'Seyahat Sağlık Sigortası için zaten açık bir talebiniz bulunmaktadır.',
    requestDescription: 'Talebinizi oluşturduktan sonra uzman ekibimiz sizinle iletişime geçerek ihtiyaçlarınıza en uygun teklifi hazırlayacaktır.',
    showJobField: true,
  },
};

// ==================== FORM DEFAULTS ====================
export const OFFLINE_FORM_DEFAULTS = {
  customerType: CustomerType.Individual,
  identityNumber: '',
  email: '',
  phoneNumber: '',
  birthDate: '',
  job: Job.Unknown,
  fullName: '',
  city: '',
  district: '',
};

// ==================== JOB OPTIONS ====================
export const JOB_OPTIONS = [
  { value: Job.Unknown, label: 'Bilinmiyor' },
  { value: Job.Banker, label: 'Bankacı' },
  { value: Job.CorporateEmployee, label: 'Kurumsal Çalışan' },
  { value: Job.LtdEmployee, label: 'Ltd. Şirket Çalışanı' },
  { value: Job.Police, label: 'Polis' },
  { value: Job.MilitaryPersonnel, label: 'Askeri Personel' },
  { value: Job.RetiredSpouse, label: 'Emekli Eşi' },
  { value: Job.Teacher, label: 'Öğretmen' },
  { value: Job.Doctor, label: 'Doktor' },
  { value: Job.Pharmacist, label: 'Eczacı' },
  { value: Job.Nurse, label: 'Hemşire' },
  { value: Job.HealthcareWorker, label: 'Sağlık Çalışanı' },
  { value: Job.Lawyer, label: 'Avukat' },
  { value: Job.Judge, label: 'Hakim' },
  { value: Job.Prosecutor, label: 'Savcı' },
  { value: Job.Freelancer, label: 'Serbest Meslek' },
  { value: Job.Farmer, label: 'Çiftçi' },
  { value: Job.Instructor, label: 'Eğitmen' },
  { value: Job.ReligiousOfficial, label: 'Din Görevlisi' },
  { value: Job.AssociationManager, label: 'Dernek Yöneticisi' },
  { value: Job.Officer, label: 'Memur' },
  { value: Job.Retired, label: 'Emekli' },
  { value: Job.Housewife, label: 'Ev Hanımı' },
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Branş ID'sine göre config döndürür
 */
export const getBranchConfig = (branchId: string): OfflineBranchConfig | undefined => {
  return OFFLINE_BRANCH_CONFIGS[branchId];
};

/**
 * Branş için storage key'leri döndürür
 */
export const getStorageKeys = (prefix: string) => ({
  PROPOSAL_ID: `${prefix}ProposalId`,
  INITIAL_EMAIL: `${prefix}InitialEmail`,
  INITIAL_JOB: `${prefix}InitialJob`,
  PERSONAL_INFO_COMPLETED: `${prefix}PersonalInfoCompleted`,
  CASE_CREATED: `${prefix}CaseCreated`,
});

