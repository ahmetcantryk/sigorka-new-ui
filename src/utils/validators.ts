import { ValidationResult } from '../components/common/Input/types';

export const validateTCKN = (
  value: string,
  validateIncompleteInput: boolean = true
): ValidationResult => {
  if (!value) return { isValid: false, message: 'Bu alan zorunludur' };

  // If we're not validating incomplete inputs and the length is less than 11,
  // consider it valid (for use during typing)
  if (!validateIncompleteInput && value.length < 11) {
    return { isValid: true, message: '' };
  }

  if (!/^\d{11}$/.test(value)) {
    return { isValid: false, message: 'T.C. Kimlik No 11 haneli olmalıdır' };
  }
  return { isValid: true };
};

export const validatePhone = (
  value: string,
  validateIncompleteInput: boolean = true
): ValidationResult => {
  const digits = value.replace(/\D/g, '').replace(/^0+/, '');

  if (!value) return { isValid: false, message: 'Bu alan zorunludur' };

  if (!validateIncompleteInput && digits.length < 10) {
    return { isValid: true, message: '' };
  }

  if (digits.length !== 10) {
    return { isValid: false, message: 'Telefon numarası 10 haneli olmalıdır' };
  }
  if (!digits.startsWith('5')) {
    return { isValid: false, message: 'Telefon numarası 5 ile başlamalıdır' };
  }
  return { isValid: true };
};

export const validateFirstName = (value: string): ValidationResult => {
  if (!value) return { isValid: false, message: 'Bu alan zorunludur' };
  if (value.trim().length < 2) {
    return { isValid: false, message: 'Ad en az 2 karakter olmalıdır' };
  }
  if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(value.trim())) {
    return { isValid: false, message: 'Ad sadece harflerden oluşmalıdır' };
  }
  return { isValid: true };
};

export const validateLastName = (value: string): ValidationResult => {
  if (!value) return { isValid: false, message: 'Bu alan zorunludur' };
  if (value.trim().length < 2) {
    return { isValid: false, message: 'Soyad en az 2 karakter olmalıdır' };
  }
  if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ ]+$/.test(value.trim())) {
    return { isValid: false, message: 'Soyad sadece harflerden oluşmalıdır' };
  }
  return { isValid: true };
};

export const validateBirthDate = (value: string): ValidationResult => {
  if (!value) return { isValid: false, message: 'Bu alan zorunludur' };

  // Date format kontrolü (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    return { isValid: false, message: 'Geçerli bir tarih formatı giriniz' };
  }

  const inputDate = new Date(value);
  const today = new Date();
  
  // Geçerli tarih kontrolü
  if (isNaN(inputDate.getTime())) {
    return { isValid: false, message: 'Geçerli bir tarih giriniz' };
  }

  // Gelecek tarih kontrolü
  if (inputDate > today) {
    return { isValid: false, message: 'Gelecek tarih seçilemez' };
  }

  // 1900 öncesi kontrol
  const minDate = new Date('1900-01-01');
  if (inputDate < minDate) {
    return { isValid: false, message: 'Lütfen geçerli bir tarih giriniz' };
  }

  // 18 yaş kontrolü
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
  
  if (inputDate > eighteenYearsAgo) {
    return { isValid: false, message: '18 yaşından küçük olamazsınız' };
  }

  // 6 haneli yıl kontrolü (YYYY formatında max 4 hane)
  const year = inputDate.getFullYear();
  if (year > 9999) {
    return { isValid: false, message: 'Geçerli bir yıl giriniz' };
  }

  return { isValid: true };
};

export const validateTCKNFull = (value: string): ValidationResult => {
  if (!value) return { isValid: false, message: 'Bu alan zorunludur' };

  // Sadece rakam kontrolü
  if (!/^\d+$/.test(value)) {
    return { isValid: false, message: 'T.C. Kimlik No sadece rakamlardan oluşmalıdır' };
  }

  // 11 hane kontrolü
  if (value.length !== 11) {
    return { isValid: false, message: 'T.C. Kimlik No 11 haneli olmalıdır' };
  }

  // İlk hane 0 olamaz
  if (value[0] === '0') {
    return { isValid: false, message: 'T.C. Kimlik No ilk hanesi 0 olamaz' };
  }

  // Tüm haneler aynı olamaz
  const firstDigit = value[0];
  if (value.split('').every(digit => digit === firstDigit)) {
    return { isValid: false, message: 'Geçerli bir T.C. Kimlik No giriniz' };
  }

  // Algoritma suistimalini engellemek için ek kontroller
  const invalidPatterns = [
    // Bilinen sahte TCKN'ler
    '11111111110', '22222222220', '33333333330', '44444444440', '55555555550',
    '66666666660', '77777777770', '88888888880', '99999999990',
    // Ardışık rakamlar
    '12345678901', '23456789012', '34567890123', '45678901234', '56789012345',
    '67890123456', '78901234567', '89012345678', '90123456789', '01234567890',
    // Ters ardışık rakamlar
    '10987654321', '21098765432', '32109876543', '43210987654', '54321098765',
    '65432109876', '76543210987', '87654321098', '98765432109', '09876543210',
    // Test amaçlı bilinen geçersiz TCKN'ler
    '11111111111', '00000000000', '99999999999',
    // Algoritma geçen ama gerçek olmayan diğer kalıplar
    '11111111116', '22222222228', '33333333339', '44444444440',
    '55555555551', '66666666662', '77777777773', '88888888884',
    // Basit kalıplar
    '10101010101', '20202020202', '30303030303', '40404040404', '50505050505',
    '60606060606', '70707070707', '80808080808', '90909090909',
    '12121212121', '13131313131', '14141414141', '15151515151',
    '16161616161', '17171717171', '18181818181', '19191919191',
    '21212121212', '23232323232', '24242424242', '25252525252',
    '26262626262', '27272727272', '28282828282', '29292929292'
  ];

  if (invalidPatterns.includes(value)) {
    return { isValid: false, message: 'Geçerli bir T.C. Kimlik No giriniz' };
  }

  // Çok basit kalıpları tespit et (örn: 12312312312)
  const repeatingPattern = value.match(/^(\d{2,3})\1+$/);
  if (repeatingPattern) {
    return { isValid: false, message: 'Geçerli bir T.C. Kimlik No giriniz' };
  }

  // Aynı iki rakamın tekrarı (örn: 11223344556)
  const doubleDigitPattern = /^(\d)\1(\d)\2(\d)\3(\d)\4(\d)\5$/;
  if (doubleDigitPattern.test(value)) {
    return { isValid: false, message: 'Geçerli bir T.C. Kimlik No giriniz' };
  }

  // Matematik kontrol algoritması
  const digits = value.split('').map(Number);
  
  // 10. hane kontrolü (tek hanelerin toplamı * 7 - çift hanelerin toplamı) mod 10
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const check10 = (oddSum * 7 - evenSum) % 10;
  
  if (check10 !== digits[9]) {
    return { isValid: false, message: 'Geçerli bir T.C. Kimlik No giriniz' };
  }

  // 11. hane kontrolü (ilk 10 hanenin toplamı mod 10)
  const totalSum = digits.slice(0, 10).reduce((acc, digit) => acc + digit, 0);
  const check11 = totalSum % 10;
  
  if (check11 !== digits[10]) {
    return { isValid: false, message: 'Geçerli bir T.C. Kimlik No giriniz' };
  }

  return { isValid: true };
};

export const validateTurkishPhoneStrict = (
  value: string,
  validateIncompleteInput: boolean = true
): ValidationResult => {
  if (!value) {
    return { isValid: false, message: 'Bu alan zorunludur' };
  }

  // Sadece rakamları al
  const digits = value.replace(/\D/g, '');

  // İnput yazılırken eksikse kontrol etme opsiyonu
  if (!validateIncompleteInput && digits.length < 10) {
    return { isValid: true, message: '' };
  }

  // Minimum 10 hane kontrolü (sadece validateIncompleteInput true ise)
  if (validateIncompleteInput && digits.length < 10) {
    return { isValid: false, message: 'Telefon numarası en az 10 haneli olmalıdır' };
  }

  if (digits.length !== 10) {
    return { isValid: false, message: 'Telefon numarası 10 haneli olmalıdır' };
  }

  if (!digits.startsWith('5')) {
    return { isValid: false, message: 'Telefon numarası 5 ile başlamalıdır' };
  }

  // İlk üç hane geçerli operatör kodları mı?
  const operatorCode = digits.substring(0, 3);
  const validOperatorCodes = [
    // Türk Telekom
    '500', '501', '502', '503', '504', '505', '506', '507', '508', '509',
    // Turkcell
    '530', '531', '532', '533', '534', '535', '536', '537', '538', '539',
    // Vodafone
    '540', '541', '542', '543', '544', '545', '546', '547', '548', '549',
    // Diğer
    '550', '551', '552', '553', '554', '555', '556', '557', '558', '559',
    '561'
  ];

  if (!validOperatorCodes.includes(operatorCode)) {
    return {
      isValid: false,
      message: 'Geçerli bir operatör kodu giriniz (örnek: 532, 555, 561)'
    };
  }

  return { isValid: true };
};

export const validateCardNumber = (value: string): ValidationResult => {
  if (!value) return { isValid: false, message: 'Bu alan zorunludur' };
  const digits = value.replace(/\s/g, '');
  // Sadece rakam kontrolü
  if (!/^\d+$/.test(digits)) {
    return { isValid: false, message: 'Yalnızca rakamlardan oluşmalıdır' };
  }
  if (digits.length !== 16) {
    return { isValid: false, message: 'Kart numarası 16 haneli olmalıdır' };
  }
  return { isValid: true };
};

export const validateCardHolder = (value: string): ValidationResult => {
  if (!value) return { isValid: false, message: 'Bu alan zorunludur' };
  if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(value.trim())) {
    return { isValid: false, message: 'Ad soyad sadece harflerden oluşmalıdır' };
  }
  return { isValid: true };
};

export const validateExpiryDate = (value: string): ValidationResult => {
  if (!value) return { isValid: false, message: 'Bu alan zorunludur' };

  // Sadece rakam ve / karakteri kontrolü
  const digitsOnly = value.replace(/\//g, '');
  if (!/^\d*$/.test(digitsOnly)) {
    return { isValid: false, message: 'Yalnızca rakamlardan oluşmalıdır' };
  }

  if (!/^\d{2}\/\d{2}$/.test(value)) {
    return { isValid: false, message: 'Tarih AA/YY formatında olmalıdır' };
  }

  const [month, year] = value.split('/');
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  if (monthNum < 1 || monthNum > 12) {
    return { isValid: false, message: 'Geçerli bir ay giriniz' };
  }

  const currentYear = new Date().getFullYear() % 100; // Son iki hane
  const currentMonth = new Date().getMonth() + 1;

  if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
    return { isValid: false, message: 'Geçmiş tarihli kart kullanılamaz' };
  }

  return { isValid: true };
};

export const validateCvv = (value: string): ValidationResult => {
  if (!value) return { isValid: false, message: 'Bu alan zorunludur' };
  if (!/^\d+$/.test(value)) {
    return { isValid: false, message: 'Yalnızca rakamlardan oluşmalıdır' };
  }
  if (value.length < 3) {
    return { isValid: false, message: 'CVV kodunu eksiksiz giriniz' };
  }
  if (value === '000') {
    return { isValid: false, message: 'Lütfen geçerli bir CVV kodu giriniz' };
  }
  return { isValid: true };
};

export const validateTaxNumber = (value: string): ValidationResult => {
  if (!value) return { isValid: false, message: 'Bu alan zorunludur' };
  
  // Sadece rakam kontrolü
  if (!/^\d+$/.test(value)) {
    return { isValid: false, message: 'Vergi Kimlik No sadece rakamlardan oluşmalıdır' };
  }
  
  // 10 hane kontrolü
  if (value.length !== 10) {
    return { isValid: false, message: 'Vergi Kimlik No 10 haneli olmalıdır' };
  }
  
  return { isValid: true };
};

// VKN Algoritma Doğrulaması
const validateVKNAlgorithm = (value: string): boolean => {
  const digits = value.split('').map(Number);
  const multipliers = [9, 8, 7, 6, 5, 4, 3, 2, 1];
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * multipliers[i];
  }
  
  const remainder = sum % 11;
  let checkDigit;
  
  if (remainder < 2) {
    checkDigit = remainder;
  } else {
    checkDigit = 11 - remainder;
  }
  
  return checkDigit === digits[9];
};

// Kart Sahibi Kimlik Numarası Validasyonu (10 haneli VKN veya 11 haneli TCKN)
export const validateCardHolderIdentityNumber = (value: string): ValidationResult => {
  // Boş kontrol
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'Kimlik numarası boş bırakılamaz.' };
  }

  // Sadece rakam kontrolü
  if (!/^\d+$/.test(value)) {
    return { isValid: false, message: 'Lütfen geçerli bir kimlik numarası girin.' };
  }

  // Hane sayısı kontrolü (10 veya 11 hane)
  if (value.length !== 10 && value.length !== 11) {
    return { isValid: false, message: 'Lütfen geçerli bir kimlik numarası girin.' };
  }

  // 10 haneli ise VKN doğrulaması
  if (value.length === 10) {
    // İlk hane 0 olamaz
    if (value[0] === '0') {
      return { isValid: false, message: 'Geçersiz Kimlik Numarası.' };
    }

    // Tüm haneler aynı olamaz
    const firstDigit = value[0];
    if (value.split('').every(digit => digit === firstDigit)) {
      return { isValid: false, message: 'Geçersiz Kimlik Numarası.' };
    }

    // VKN algoritma kontrolü
    if (!validateVKNAlgorithm(value)) {
      return { isValid: false, message: 'Geçersiz Kimlik Numarası.' };
    }

    return { isValid: true };
  }

  // 11 haneli ise TCKN doğrulaması
  if (value.length === 11) {
    // İlk hane 0 olamaz
    if (value[0] === '0') {
      return { isValid: false, message: 'Geçersiz Kimlik Numarası.' };
    }

    // Tüm haneler aynı olamaz
    const firstDigit = value[0];
    if (value.split('').every(digit => digit === firstDigit)) {
      return { isValid: false, message: 'Geçersiz Kimlik Numarası.' };
    }

    // Bilinen geçersiz kalıplar
    const invalidPatterns = [
      '11111111110', '22222222220', '33333333330', '44444444440', '55555555550',
      '66666666660', '77777777770', '88888888880', '99999999990',
      '12345678901', '23456789012', '34567890123', '45678901234', '56789012345',
      '67890123456', '78901234567', '89012345678', '90123456789', '01234567890',
      '10987654321', '21098765432', '32109876543', '43210987654', '54321098765',
      '65432109876', '76543210987', '87654321098', '98765432109', '09876543210',
      '11111111111', '00000000000', '99999999999'
    ];

    if (invalidPatterns.includes(value)) {
      return { isValid: false, message: 'Geçersiz Kimlik Numarası.' };
    }

    // TCKN algoritma kontrolü
    const digits = value.split('').map(Number);
    
    // 10. hane kontrolü
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    const check10 = (oddSum * 7 - evenSum) % 10;
    
    if (check10 !== digits[9]) {
      return { isValid: false, message: 'Geçersiz Kimlik Numarası.' };
    }

    // 11. hane kontrolü
    const totalSum = digits.slice(0, 10).reduce((acc, digit) => acc + digit, 0);
    const check11 = totalSum % 10;
    
    if (check11 !== digits[10]) {
      return { isValid: false, message: 'Geçersiz Kimlik Numarası.' };
    }

    return { isValid: true };
  }

  return { isValid: false, message: 'Lütfen geçerli bir kimlik numarası girin.' };
};