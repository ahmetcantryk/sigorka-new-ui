/**
 * Konut Flow Types
 */

export enum CustomerType {
    Individual = 'INDIVIDUAL',
    Company = 'COMPANY'
}

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

export enum PropertyStructure {
    Unknown = 0,
    SteelReinforcedConcrete = 1,
    Other = 2,
}

export enum PropertyUtilizationStyle {
    Unknown = 0,
    House = 1,
    Business = 2,
    Other = 3,
}

export enum PropertyDamageStatus {
    Unknown = 0,
    None = 1,
    SlightlyDamaged = 2,
    ModeratelyDamaged = 3,
    SeverelyDamaged = 4,
}

export enum KonutPropertyFloorCountRange {
    Unknown = 0,
    Between1And3 = 1,
    Between4And7 = 2,
    Between8And18 = 3,
    MoreThan19 = 4,
}

export enum KonutPropertyOwnershipType {
    Unknown = 0,
    Proprietor = 1,
    Tenant = 2,
    Other = 3,
}

// Enflasyon Enum ve Seçenekleri
export enum InflationType {
    Unknown = 0,
    Inflation50 = 7,      // % 50 ENFLASYONLU
    Inflation60 = 8,      // % 60 ENFLASYONLU
    Inflation70 = 9,      // % 70 ENFLASYONLU
    Inflation65 = 11,     // %65 ENFLASYONLU
    Inflation80 = 13,     // % 80 ENFLASYONLU
    Inflation75 = 14,     // % 75 ENFLASYONLU
}

export const INFLATION_OPTIONS = [
    { value: InflationType.Inflation50, label: '% 50 ENFLASYONLU' },
    { value: InflationType.Inflation60, label: '% 60 ENFLASYONLU' },
    { value: InflationType.Inflation65, label: '% 65 ENFLASYONLU' },
    { value: InflationType.Inflation70, label: '% 70 ENFLASYONLU' },
    { value: InflationType.Inflation75, label: '% 75 ENFLASYONLU' },
    { value: InflationType.Inflation80, label: '% 80 ENFLASYONLU' },
];

export interface KonutFormData {
    // Personal Info
    customerType: CustomerType;
    identityNumber: string;
    taxNumber: string;
    email: string;
    phoneNumber: string;
    birthDate: string;
    job: number;
    fullName: string;
    title: string; // Company title
    city: string;
    district: string;

    // Property Info
    selectionType: 'existing' | 'new';
    selectedPropertyId: string | null;
    cityReference: string;
    districtReference: string;
    townReference: string;
    neighborhoodReference: string;
    streetReference: string;
    buildingReference: string;
    apartmentReference: string;
    uavtNo: string;
    buildingType: PropertyStructure;
    constructionYear: string | null;
    floorCountRange: KonutPropertyFloorCountRange;
    floorNumber: string;
    squareMeters: string;
    usageType: PropertyUtilizationStyle;
    buildingMaterial: PropertyStructure;
    riskZone: PropertyDamageStatus;
    ownershipType: KonutPropertyOwnershipType;

    // Teminat Bilgileri
    furniturePrice: string;           // Eşya Bedeli
    electronicDevicePrice: string;    // Elektronik Cihaz Bedeli
    insulationPrice: string;          // İzolasyon Bedeli
    windowPrice: string;              // Cam Bedeli
    inflationValue: InflationType;    // Enflasyon tipi
}

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

// Coverage type for API response
export interface KonutCoverage {
    $type: string;
    [key: string]: any;
}
