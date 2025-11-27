/**
 * Kasko Flow - Sabit Değerler ve Konfigürasyonlar
 * 
 * Form alanları, dropdown seçenekleri, teminat etiketleri gibi
 * sabit değerlerin merkezi yönetimi
 */

import { VehicleUtilizationStyle, VehicleFuelType } from '@/types/enums/vehicleEnums';

// ==================== JOB (MESLEK) ====================
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
].sort((a, b) => a.label.localeCompare(b.label, 'tr'));

// ==================== ARAÇ KULLANIM ŞEKLİ ====================
export const VEHICLE_USAGE_OPTIONS = [
  { label: 'Özel Otomobil', value: VehicleUtilizationStyle.PrivateCar },
  { label: 'Taksi', value: VehicleUtilizationStyle.Taxi },
  { label: 'Kiralık Araç', value: VehicleUtilizationStyle.RentalCar },
  { label: 'Hat Usulü Minibüs', value: VehicleUtilizationStyle.RouteBasedMinibus },
  { label: 'Orta Boy Otobüs', value: VehicleUtilizationStyle.MediumBus },
  { label: 'Büyük Otobüs', value: VehicleUtilizationStyle.LargeBus },
  { label: 'Kamyonet', value: VehicleUtilizationStyle.PickupTruck },
  { label: 'Kapalı Kasa Kamyonet', value: VehicleUtilizationStyle.ClosedBedPickup },
  { label: 'Kamyon', value: VehicleUtilizationStyle.Truck },
  { label: 'İnşaat Makinası', value: VehicleUtilizationStyle.ConstructionMachinery },
  { label: 'Traktör', value: VehicleUtilizationStyle.Tractor },
  { label: 'Römork', value: VehicleUtilizationStyle.Trailer },
  { label: 'Motosiklet', value: VehicleUtilizationStyle.Motorcycle },
  { label: 'Tanker', value: VehicleUtilizationStyle.Tanker },
  { label: 'Çekici', value: VehicleUtilizationStyle.TowTruck },
  { label: 'Motorlu Karavan', value: VehicleUtilizationStyle.MotorizedCaravan },
  { label: 'Çekilir Karavan', value: VehicleUtilizationStyle.TowableCaravan },
  { label: 'Traktör Hariç Tarım Makinası', value: VehicleUtilizationStyle.AgriculturalMachineExcludingTractor },
  { label: 'Açık Kasa Kamyon', value: VehicleUtilizationStyle.OpenBodyTruck },
  { label: 'Zırhlı Araç', value: VehicleUtilizationStyle.ArmoredVehicle },
  { label: 'Minibüs Dolmuş', value: VehicleUtilizationStyle.MinibusSharedTaxi },
  { label: 'Jeep', value: VehicleUtilizationStyle.Jeep },
  { label: 'Jeep SAV', value: VehicleUtilizationStyle.JeepSAV },
  { label: 'Jeep SUV', value: VehicleUtilizationStyle.JeepSUV },
  { label: 'Jeep Kiralık', value: VehicleUtilizationStyle.JeepRental },
  { label: 'Jeep Taksi', value: VehicleUtilizationStyle.JeepTaxi },
  { label: 'Ambulans', value: VehicleUtilizationStyle.Ambulance },
  { label: 'İtfaiye Aracı', value: VehicleUtilizationStyle.FirefighterCar },
  { label: 'Cenaze Nakil Aracı', value: VehicleUtilizationStyle.Hearse },
  { label: 'Şoförlü Kiralık Araç', value: VehicleUtilizationStyle.ChauffeuredRentalCar },
  { label: 'Operasyonel Kiralama', value: VehicleUtilizationStyle.OperationalRental },
  { label: 'Özel Minibüs', value: VehicleUtilizationStyle.PrivateMinibus },
  { label: 'Hat Minibüsü', value: VehicleUtilizationStyle.RouteMinibus },
  { label: 'Servis Minibüsü', value: VehicleUtilizationStyle.ServiceMinibus },
  { label: 'Şirket Minibüsü', value: VehicleUtilizationStyle.CompanyMinibus },
  { label: 'Kiralık Minibüs', value: VehicleUtilizationStyle.RentalMinibus },
  { label: 'Ambulans Minibüs', value: VehicleUtilizationStyle.AmbulanceMinibus },
  { label: 'Minibüs Yayın Aracı', value: VehicleUtilizationStyle.MinibusBroadcastingVehicle },
  { label: 'Minibüs Zırhlı Nakliye', value: VehicleUtilizationStyle.MinibusArmoredTransport },
  { label: 'Küçük Otobüs (15-35 Kişi)', value: VehicleUtilizationStyle.SmallBus1535Passengers },
  { label: 'Küçük Otobüs Servis', value: VehicleUtilizationStyle.SmallBusService },
  { label: 'Küçük Otobüs Şehir İçi', value: VehicleUtilizationStyle.SmallBusCity },
  { label: 'Küçük Otobüs Hat', value: VehicleUtilizationStyle.SmallBusRoute },
  { label: 'Büyük Otobüs (36+ Kişi)', value: VehicleUtilizationStyle.LargeBus36Plus },
  { label: 'Damperli Kamyon', value: VehicleUtilizationStyle.DumpTruck },
  { label: 'Soğutmalı Kamyon', value: VehicleUtilizationStyle.RefrigeratedTruck },
  { label: 'Beton Mikseri Kamyon', value: VehicleUtilizationStyle.TruckWithConcreteMixer },
  { label: 'Silo Kamyon', value: VehicleUtilizationStyle.SiloTruck },
  { label: 'Beton Pompası Kamyon', value: VehicleUtilizationStyle.TruckWithConcretePump },
  { label: 'Kaya Kamyonu', value: VehicleUtilizationStyle.RockTruck },
  { label: 'Vinçli Kamyon', value: VehicleUtilizationStyle.TruckWithCrane },
  { label: 'Ağır İş Makinası', value: VehicleUtilizationStyle.HeavyMachinery },
  { label: 'Ekskavatör', value: VehicleUtilizationStyle.Excavator },
  { label: 'Yükleyici', value: VehicleUtilizationStyle.Loader },
  { label: 'Buldozer', value: VehicleUtilizationStyle.Bulldozer },
  { label: 'Skreyper', value: VehicleUtilizationStyle.Scraper },
  { label: 'Greyder', value: VehicleUtilizationStyle.Grader },
  { label: 'Yol Silindiri', value: VehicleUtilizationStyle.RoadRoller },
  { label: 'Mobil Vinç', value: VehicleUtilizationStyle.MobileCrane },
  { label: 'İç Mekan Forklift', value: VehicleUtilizationStyle.IndoorForklift },
  { label: 'Dış Mekan Forklift', value: VehicleUtilizationStyle.OutdoorForklift },
  { label: 'Mobil Kompresör', value: VehicleUtilizationStyle.MobileCompressor },
  { label: 'Mobil Pompa', value: VehicleUtilizationStyle.MobilePump },
  { label: 'Mobil Kaynak Makinası', value: VehicleUtilizationStyle.MobileWeldingMachine },
  { label: 'Biçerdöver', value: VehicleUtilizationStyle.CombineHarvester },
  { label: 'Tanker Asit Taşıyıcı', value: VehicleUtilizationStyle.TankerAcidCarrier },
  { label: 'Tanker Su/Yakıt Taşıyıcı', value: VehicleUtilizationStyle.TankerWaterFuelCarrier },
  { label: 'Tanker Patlayıcı/Yanıcı', value: VehicleUtilizationStyle.TankerExplosiveFlammable },
  { label: 'Çekici Traktör', value: VehicleUtilizationStyle.TowTruckTractor },
  { label: 'Çekici Tanker', value: VehicleUtilizationStyle.TowTruckTanker },
  { label: 'Panel/Cam Van Minibüs', value: VehicleUtilizationStyle.PanelGlassVanMinubus },
];

// ==================== YAKIT TİPİ ====================
export const FUEL_TYPE_OPTIONS = [
  { label: 'Dizel', value: VehicleFuelType.Diesel },
  { label: 'Benzin', value: VehicleFuelType.Gasoline },
  { label: 'LPG', value: VehicleFuelType.Lpg },
  { label: 'Elektrik', value: VehicleFuelType.Electric },
  { label: 'LPG + Benzin', value: VehicleFuelType.LpgGasoline },
];

// ==================== TEMİNAT ETİKETLERİ ====================
export const COVERAGE_LABELS: Record<string, string> = {
  immLimitiAyrimsiz: 'İMM Limiti',
  ferdiKazaVefat: 'Ferdi Kaza Vefat',
  ferdiKazaSakatlik: 'Ferdi Kaza Sakatlık',
  ferdiKazaTedaviMasraflari: 'Ferdi Kaza Tedavi Masrafları',
  anahtarKaybi: 'Anahtar Kaybı',
  maneviTazminat: 'Manevi Tazminat',
  onarimServisTuru: 'Servis Geçerliliği',
  yedekParcaTuru: 'Yedek Parça Türü',
  camKirilmaMuafeyeti: 'Cam Hasarı',
  hukuksalKorumaAracaBagli: 'Hukuksal Koruma (Araca Bağlı)',
  ozelEsya: 'Özel Eşya',
  sigaraMaddeZarari: 'Sigara/Madde Zararı',
  patlayiciMaddeZarari: 'Patlayıcı Madde Zararı',
  kemirgenZarari: 'Kemirgen Zararı',
  yukKaymasiZarari: 'Yük Kayması Zararı',
  eskime: 'Eskime',
  hasarsizlikIndirimKoruma: 'Hasarsızlık İndirim Koruma',
  yurtdisiKasko: 'Yurtdışı Kasko',
  aracCalinmasi: 'Araç Çalınması',
  anahtarCalinmasi: 'Anahtar Çalınması',
  hukuksalKorumaSurucuyeBagli: 'Hukuksal Koruma (Sürücüye Bağlı)',
  miniOnarim: 'Mini Onarım',
  yolYardim: 'Yol Yardım',
  yanlisAkaryakitDolumu: 'Yanlış Akaryakıt Dolumu',
  yanma: 'Yanma',
  carpma: 'Çarpma',
  carpisma: 'Çarpışma',
  glkhhTeror: 'GLKHH Terör',
  grevLokavt: 'Grev/Lokavt',
  dogalAfetler: 'Doğal Afetler',
  hirsizlik: 'Hırsızlık',
  kiralikArac: 'İkame Araç',
};

// ==================== SERVİS TÜRLERİ ====================
export const SERVICE_TYPE_LABELS: Record<string, string> = {
  ANLASMALI_OZEL_SERVIS: 'Anlaşmalı Özel Servis',
  ANLASMALI_YETKILI_SERVIS: 'Anlaşmalı Yetkili Servis',
  YETKILI_SERVIS: 'Yetkili Servis',
  TUM_YETKILI_SERVISLER: 'Tüm Yetkili Servisler',
  OZEL_SERVIS: 'Özel Servis',
  SIGORTALI_BELIRLER: 'Sigortalı Belirler',
};

// ==================== PARÇA TÜRLERİ ====================
export const PART_TYPE_LABELS: Record<string, string> = {
  ORIJINAL_PARCA: 'Orijinal Parça',
  ESDEGER_PARCA: 'Eşdeğer Parça',
};

// ==================== ANA TEMİNATLAR (QUOTE CARD) ====================
export const MAIN_COVERAGE_KEYS = [
  'camKirilmaMuafeyeti',  // Cam Hasarı
  'immLimitiAyrimsiz',    // İMM Limiti
  'onarimServisTuru',     // Servis Geçerliliği
  'kiralikArac',          // İkame Araç
];

// ==================== FORM VARSAYILAN DEĞERLERİ ====================
export const KASKO_FORM_DEFAULTS = {
  identityNumber: '',
  email: '',
  phoneNumber: '',
  birthDate: '',
  job: Job.Unknown,
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
export const KASKO_STEPS = [
  { id: 0, label: ['Kişisel', 'Bilgiler'] },
  { id: 1, label: ['Araç', 'Bilgileri'] },
  { id: 2, label: ['Teklif', 'Karşılaştırma'] },
  { id: 3, label: ['Ödeme'] },
];

// ==================== LOCAL STORAGE KEYS ====================
export const STORAGE_KEYS = {
  PROPOSAL_ID: 'proposalIdForKasko',
  SELECTED_QUOTE: 'selectedQuoteForPurchase',
  CURRENT_PROPOSAL: 'currentProposalId',
  SELECTED_PRODUCT: 'selectedProductIdForKasko',
  INITIAL_EMAIL: 'kaskoInitialEmail',
  INITIAL_JOB: 'kaskoInitialJob',
  PERSONAL_INFO_COMPLETED: 'kaskoPersonalInfoCompleted',
  CASE_CREATED: 'kaskoCaseCreated',
};

// ==================== POLLING KONFIGÜRASYONU ====================
export const POLLING_CONFIG = {
  INTERVAL: 5000,          // 5 saniye
  TIMEOUT: 180000,         // 3 dakika
  INITIAL_PROGRESS: 30,    // Başlangıç progress
  FINISH_DURATION: 30000,  // Active quote sonrası 30 saniye
};

