/**
 * Offline Flow - Types
 */

// ==================== BRANCH CONFIG ====================
export interface OfflineBranchConfig {
  // Branş kimliği
  id: string;
  
  // API request'inde kullanılacak productBranch değeri
  productBranch: string;
  
  // Görüntülenecek başlıklar
  displayName: string;
  shortName: string;
  
  // localStorage key prefix'i
  storageKeyPrefix: string;
  
  // DataLayer event prefix'i
  dataLayerEventPrefix: string;
  
  // Step tanımları
  steps: Array<{ id: number; label: string[] }>;
  
  // Talep oluşturuldu ekranındaki mesaj
  successMessage: string;
  
  // Mevcut talep var ekranındaki mesaj
  existingRequestMessage: string;
  
  // Talep oluşturma ekranındaki açıklama
  requestDescription: string;
  
  // İsteğe bağlı: Meslek alanı gösterilsin mi?
  showJobField?: boolean;
}

// ==================== ENUMS ====================
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

export enum CustomerType {
  Individual = 'individual',
  Company = 'company',
}

// ==================== FORM DATA ====================
export interface OfflineFormData {
  customerType: CustomerType;
  identityNumber: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  job: Job;
  fullName: string;
  city: string;
  district: string;
}

// ==================== COMPONENT PROPS ====================
export interface OfflineFormProps {
  branchConfig: OfflineBranchConfig;
  onRequestCreated?: () => void;
  onBack?: () => void;
}

export interface OfflineStepProps {
  branchConfig: OfflineBranchConfig;
  formik: any;
  isLoading: boolean;
  error: string | null;
}

export interface PersonalInfoStepProps extends OfflineStepProps {
  kvkkConsent: boolean;
  marketingConsent: boolean;
  kvkkError: string | null;
  accessToken: string | null;
  onKvkkChange: (value: boolean) => void;
  onMarketingChange: (value: boolean) => void;
  onSubmit: () => void;
}

export interface AdditionalInfoStepProps extends OfflineStepProps {
  cities: Array<{ value: string; text: string }>;
  districts: Array<{ value: string; text: string }>;
  onCityChange: (cityValue: string) => Promise<void>;
  onSubmit: () => void;
  fieldErrors?: Record<string, string>;
}

export interface RequestStepProps {
  branchConfig: OfflineBranchConfig;
  isLoading: boolean;
  requestResult: 'idle' | 'success' | 'error' | 'existing';
  error: string | null;
  onCreateRequest: () => void;
  onGoHome: () => void;
}

