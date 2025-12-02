
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

export enum DaskPropertyFloorCountRange {
    Unknown = 0,
    Between1And3 = 1,
    Between4And7 = 2,
    Between8And18 = 3,
    MoreThan19 = 4,
}

export enum DaskPropertyOwnershipType {
    Unknown = 0,
    Proprietor = 1,
    Tenant = 2,
    Other = 3,
}

export interface DaskFormData {
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
    selectionType: 'existing' | 'new' | 'renewal';
    selectedPropertyId: string | null;
    cityReference: string;
    districtReference: string;
    townReference: string;
    neighborhoodReference: string;
    streetReference: string;
    buildingReference: string;
    apartmentReference: string;
    uavtNo: string;
    daskOldPolicyNumber: string;
    buildingType: PropertyStructure;
    constructionYear: string | null;
    floorCountRange: DaskPropertyFloorCountRange;
    floorNumber: string;
    squareMeters: string;
    usageType: PropertyUtilizationStyle;
    buildingMaterial: PropertyStructure;
    riskZone: PropertyDamageStatus;
    ownershipType: DaskPropertyOwnershipType;
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
