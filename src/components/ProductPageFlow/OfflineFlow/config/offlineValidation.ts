/**
 * Offline Flow - Validation Schemas
 */

import * as yup from 'yup';
import { validateTCKNFull, validateBirthDate, validateTurkishPhoneStrict, validateTaxNumber } from '@/utils/validators';

/**
 * Yaş hesaplama fonksiyonu
 */
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

/**
 * Kişisel bilgiler validasyonu - Dinamik (branchId'ye göre yaş sınırı)
 * @param branchId - Sigorta branş ID'si (örn: 'seyahat-saglik')
 */
export const getPersonalInfoValidationSchema = (branchId?: string) => yup.object({
  identityNumber: yup.string()
    .required('TC Kimlik No veya Vergi Kimlik No gereklidir')
    .test('identity-validation', '', function(value) {
      if (!value) return true;
      
      // 10 haneli ise VKN, 11 haneli ise TCKN
      if (value.length === 10) {
        const validation = validateTaxNumber(value);
        if (!validation.isValid) {
          return this.createError({ message: validation.message });
        }
      } else if (value.length === 11) {
        const validation = validateTCKNFull(value);
        if (!validation.isValid) {
          return this.createError({ message: validation.message });
        }
      } else {
        return this.createError({ message: 'TC Kimlik No 11, Vergi Kimlik No 10 haneli olmalıdır' });
      }
      return true;
    }),
  email: yup.string()
    .notRequired()
    .test('email-format', 'Geçerli bir e-posta adresi giriniz (örn: ornek@eposta.com)', function (value) {
      if (!value || value.trim() === '') return true; // Boşsa geçerli
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }),
  phoneNumber: yup.string()
    .required('Telefon numarası gereklidir')
    .test('phone-validation', '', function(value) {
      if (!value) return true;
      const validation = validateTurkishPhoneStrict(value, true);
      if (!validation.isValid) {
        return this.createError({ message: validation.message });
      }
      return true;
    }),
  birthDate: yup
    .string()
    .test('birth-date-required', 'Doğum tarihi gereklidir', function (value) {
      // VKN (10 haneli) için birthDate zorunlu değil
      const identityNumber = (this.parent as any).identityNumber as string | undefined;
      if (identityNumber && identityNumber.length === 10) {
        return true; // VKN için doğum tarihi zorunlu değil
      }
      // TCKN (11 haneli) ve diğer durumlarda doğum tarihi zorunlu
      if (!value) return false;
      return true;
    })
    .test('birth-date-validation', '', function (value) {
      if (!value) return true;
      // VKN (10 haneli) için yaş validasyonu yapma
      const identityNumber = (this.parent as any).identityNumber as string | undefined;
      if (identityNumber && identityNumber.length === 10) {
        return true;
      }
      const validation = validateBirthDate(value);
      if (!validation.isValid) {
        return this.createError({ message: validation.message });
      }
      return true;
    }),
});

/**
 * Kişisel bilgiler validasyonu (geriye uyumluluk için)
 */
export const personalInfoValidationSchema = getPersonalInfoValidationSchema();

/**
 * Ek bilgiler validasyonu (Ad Soyad, İl, İlçe)
 */
export const additionalInfoValidationSchema = yup.object({
  fullName: yup.string()
    .required('Ad Soyad gereklidir')
    .min(3, 'Ad Soyad en az 3 karakter olmalıdır'),
  city: yup.string()
    .required('İl seçimi gereklidir'),
  district: yup.string()
    .required('İlçe seçimi gereklidir'),
});

