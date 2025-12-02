/**
 * TSS Flow - Constants
 */

import { Job, CustomerType } from '../types';

// ==================== FORM DEFAULTS ====================
export const TSS_FORM_DEFAULTS = {
    customerType: CustomerType.Individual,
    identityNumber: '',
    email: '',
    phoneNumber: '',
    birthDate: '',
    job: Job.Unknown,
    fullName: '',
    city: '',
    district: '',
    height: '',
    weight: '',
};

// ==================== STEPS ====================
export const TSS_STEPS = [
    { id: 0, label: ['Kişisel', 'Bilgiler'] },
    { id: 1, label: ['Sağlık', 'Bilgileri'] },
    { id: 2, label: ['Teklif', 'Karşılaştırma'] },
    { id: 3, label: ['Ödeme'] },
];

// ==================== STORAGE KEYS ====================
export const TSS_STORAGE_KEYS = {
    PROPOSAL_ID: 'proposalIdForTss',
    SELECTED_QUOTE: 'selectedQuoteForPurchaseTss',
    CURRENT_PROPOSAL: 'currentProposalIdTss',
    SELECTED_PRODUCT: 'selectedProductIdForTss',
    INITIAL_EMAIL: 'tssInitialEmail',
    INITIAL_JOB: 'tssInitialJob',
    INITIAL_BIRTH_DATE: 'tssInitialBirthDate',
    PERSONAL_INFO_COMPLETED: 'tssPersonalInfoCompleted',
    CASE_CREATED: 'tssCaseCreated',
};

// ==================== POLLING CONFIG ====================
export const TSS_POLLING_CONFIG = {
    INTERVAL: 5000,                      // 5 saniyede bir polling
    TIMEOUT: 180000,                     // 3 dakika timeout
    INITIAL_PROGRESS: 30,                // Başlangıç progress
    BACKGROUND_POLLING_DURATION: 30000,  // 30 saniye - İlk active teklif sonrası arka plan polling süresi
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

// ==================== TSS COVERAGE LABELS ====================
// API'den gelen alan adları -> Türkçe etiketler
export const TSS_COVERAGE_LABELS: Record<string, string> = {
    // Sağlık Paketi içindeki alanlar
    tedaviSekli: 'Tedavi Şekli',
    ayaktaYillikTedaviSayisi: 'Ayakta Yıllık Tedavi Sayısı',
    
    // Ana teminatlar
    yatarakTedavi: 'Yatarak Tedavi',
    ayaktaTedavi: 'Ayakta Tedavi',
    doktorMuayene: 'Doktor Muayene',
    
    // Detay teminatlar
    disPaketi: 'Diş Sağlığı',
    diyetisyenHizmeti: 'Diyetisyen Hizmeti',
    yogunBakim: 'Yoğun Bakım',
    checkUpHizmeti: 'Check-up',
    psikolojikDanismanlik: 'Psikolojik Danışmanlık',
    fizikTedavi: 'Fizik Tedavi',
    suniUzuv: 'Suni Uzuv',
    ambulans: 'Ambulans',
    ameliyat: 'Ameliyat',
    kemoterapi: 'Kemoterapi',
    radyoterapi: 'Radyoterapi',
    diyaliz: 'Diyaliz',
    evdeBakim: 'Evde Bakım',
    yediGun24SaatTibbiDanismanlik: '7/24 Tıbbi Danışmanlık',
    dogum: 'Doğum',
    kucukMudahale: 'Küçük Müdahale',
};

// Kartta gösterilecek ana teminatlar (ilk 3) - API field names
export const TSS_MAIN_COVERAGES = [
    'yatarakTedavi',
    'ayaktaTedavi', 
    'checkUpHizmeti',
];

// Modal'da gösterilecek tüm teminatlar - API field names (sıralı)
// Not: doktorMuayene kaldırıldı (ayaktaTedavi ile aynı)
// Not: checkUpHizmeti ana teminatlarda gösterildiği için buradan kaldırıldı
export const TSS_ALL_COVERAGES = [
    'yatarakTedavi',
    'ayaktaTedavi',
    'checkUpHizmeti',
    'disPaketi',
    'diyetisyenHizmeti',
    'yogunBakim',
    'psikolojikDanismanlik',
    'fizikTedavi',
    'suniUzuv',
    'ambulans',
    'ameliyat',
    'kemoterapi',
    'radyoterapi',
    'diyaliz',
    'evdeBakim',
    'yediGun24SaatTibbiDanismanlik',
    'dogum',
    'kucukMudahale',
];

// ==================== TEMİNAT AÇIKLAMALARI ====================
// API field name -> Açıklama
export const TSS_COVERAGE_DESCRIPTIONS: Record<string, string> = {
    yatarakTedavi: 'Hastanede yatış gerektiren ameliyat, operasyon, yoğun bakım ve yatarak tedavi giderlerini karşılar.',
    ayaktaTedavi: 'Muayene, tetkik, tahlil, görüntüleme ve reçeteli tedavi gibi yatış gerektirmeyen sağlık hizmetlerini limitler dahilinde kapsar.',
    doktorMuayene: 'Doktor muayene ve konsültasyon hizmetlerini kapsar.',
    yediGun24SaatTibbiDanismanlik: 'Mobil veya dijital platform üzerinden ek bir ücret ödemeden görüntülü doktor görüşmesi ve tıbbi danışmanlık hizmeti sağlar.',
    checkUpHizmeti: 'Genel sağlık durumunu kapsamlı tarama ve kontrol paketini ek bir ücret ödemeden teminat altına alır.',
    disPaketi: 'Diş muayenesi, temizlik, dolgu gibi belirlenen dental tedavi ve hizmetleri ücretsiz olarak sağlar.',
    yogunBakim: 'Yoğun bakım ünitesinde yapılan tedavi giderlerini karşılar.',
    ameliyat: 'Cerrahi müdahale gerektiren ameliyat giderlerini karşılar.',
    kemoterapi: 'Kanser tedavisinde uygulanan kemoterapi giderlerini karşılar.',
    radyoterapi: 'Kanser tedavisinde uygulanan radyoterapi giderlerini karşılar.',
    diyaliz: 'Böbrek yetmezliği tedavisinde uygulanan diyaliz giderlerini karşılar.',
    evdeBakim: 'Hastane sonrası evde bakım ve tedavi giderlerini karşılar.',
    dogum: 'Doğum ve hamilelik sürecindeki sağlık giderlerini karşılar.',
    kucukMudahale: 'Ameliyat gerektirmeyen küçük cerrahi müdahale giderlerini karşılar.',
    fizikTedavi: 'Fizik tedavi ve rehabilitasyon giderlerini karşılar.',
    suniUzuv: 'Protez ve suni uzuv giderlerini karşılar.',
    ambulans: 'Acil durumlarda ambulans hizmeti giderlerini karşılar.',
    diyetisyenHizmeti: 'Diyetisyen danışmanlık hizmeti giderlerini karşılar.',
    psikolojikDanismanlik: 'Psikolojik danışmanlık ve terapi hizmeti giderlerini karşılar.',
};

// Hastane Ağı değerleri
export const HASTANE_AGI_LABELS: Record<string, string> = {
    'STANDART_KAPSAM': 'Standart Kapsam',
    'GENIS_KAPSAM': 'Geniş Kapsam',
    'DAR_KAPSAM': 'Dar Kapsam',
    'BILINMIYOR': 'Belirsiz',
};

// Tedavi şekli değerleri
export const TEDAVI_SEKLI_LABELS: Record<string, string> = {
    'YATARAK': 'Yatarak Tedavi',
    'AYAKTA': 'Ayakta Tedavi',
    'YATARAK_AYAKTA': 'Yatarak ve Ayakta Tedavi',
};

// Tedavi şekline göre hangi teminatların aktif olduğu
export const TEDAVI_SEKLI_COVERAGE_MAP: Record<string, { yatarakTedavi: boolean; ayaktaTedavi: boolean }> = {
    'YATARAK': { yatarakTedavi: true, ayaktaTedavi: false },
    'AYAKTA': { yatarakTedavi: false, ayaktaTedavi: true },
    'YATARAK_AYAKTA': { yatarakTedavi: true, ayaktaTedavi: true },
};
