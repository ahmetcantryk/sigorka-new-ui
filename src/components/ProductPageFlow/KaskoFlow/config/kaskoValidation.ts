/**
 * Kasko Flow - Validation Şemaları
 * 
 * Form alanları için Yup validation şemaları
 */

import * as yup from 'yup';
import { validateTCKNFull, validateTurkishPhoneStrict, validateBirthDate } from '@/utils/validators';

// ==================== KİŞİSEL BİLGİLER VALİDASYON ====================
export const personalInfoValidationSchema = yup.object({
  identityNumber: yup
    .string()
    .required('TC Kimlik No gereklidir')
    .test('tckn-validation', '', function (value) {
      if (!value) return true;
      const validation = validateTCKNFull(value);
      if (!validation.isValid) {
        return this.createError({ message: validation.message });
      }
      return true;
    }),
  email: yup
    .string()
    .notRequired()
    .test('email-format', 'Geçerli bir e-posta adresi giriniz (örn: ornek@eposta.com)', function (value) {
      if (!value || value.trim() === '') return true; // Boşsa geçerli
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }),
  phoneNumber: yup
    .string()
    .required('Telefon numarası gereklidir')
    .test('phone-validation', '', function (value) {
      if (!value) return true;
      const validation = validateTurkishPhoneStrict(value, true);
      if (!validation.isValid) {
        return this.createError({ message: validation.message });
      }
      return true;
    }),
  birthDate: yup
    .string()
    .required('Doğum tarihi gereklidir')
    .test('birth-date-validation', '', function (value) {
      if (!value) return true;
      const validation = validateBirthDate(value);
      if (!validation.isValid) {
        return this.createError({ message: validation.message });
      }
      return true;
    }),
  job: yup.number(),
});

// ==================== ARAÇ BİLGİLERİ VALİDASYON ====================
export const vehicleValidationSchema = yup.object({
  plateCity: yup.string().required('Plaka il kodu zorunludur'),
  plateCode: yup.string().when('vehicleType', {
    is: 'plated',
    then: (schema) => schema
      .required('Plaka zorunludur')
      .matches(/^([A-Z]{1}[0-9]{4}|[A-Z]{2}[0-9]{3}|[A-Z]{2}[0-9]{4}|[A-Z]{3}[0-9]{2}|[A-Z]{3}[0-9]{3})$/,
        'Plaka formatı geçersiz'),
    otherwise: (schema) => schema.nullable(),
  }),
  documentSerialCode: yup.string().when('vehicleType', {
    is: 'plated',
    then: (schema) => schema
      .required('Belge seri kodu zorunludur')
      .length(2, 'Belge seri kodu 2 harf olmalıdır'),
    otherwise: (schema) => schema.nullable(),
  }),
  documentSerialNumber: yup.string().when('vehicleType', {
    is: 'plated',
    then: (schema) => schema
      .required('Belge seri numarası zorunludur')
      .length(6, 'Belge seri numarası 6 rakam olmalıdır'),
    otherwise: (schema) => schema.nullable(),
  }),
  brandCode: yup.string().required('Marka seçimi zorunludur'),
  modelCode: yup.string().required('Model seçimi zorunludur'),
  year: yup.string()
    .required('Model yılı zorunludur')
    .matches(/^[0-9]{4}$/, 'Model yılı 4 rakam olmalıdır'),
  usageType: yup.string().required('Kullanım şekli zorunludur'),
  fuelType: yup.string().required('Yakıt tipi zorunludur'),
  chassisNo: yup.string()
    .required('Şasi No zorunludur')
    .length(17, 'Şasi No 17 karakter olmalıdır'),
  engineNo: yup.string()
    .required('Motor No zorunludur')
    .min(6, 'Motor No en az 6 karakter olmalıdır'),
  registrationDate: yup.string().required('Tescil tarihi zorunludur'),
  seatCount: yup.string().required('Koltuk adedi zorunludur'),
});

// ==================== EKSİK BİLGİLER VALİDASYON ====================
export const additionalInfoValidationSchema = yup.object({
  fullName: yup.string().required('Ad Soyad zorunludur'),
  city: yup.string().required('İl seçimi zorunludur'),
  district: yup.string().required('İlçe seçimi zorunludur'),
});

// ==================== VALIDATION HELPER FONKSİYONLARI ====================

/**
 * Aktif step'e göre validation şemasını döndürür
 */
export const getValidationSchemaByStep = (step: number) => {
  switch (step) {
    case 0:
      return personalInfoValidationSchema;
    case 1:
      return vehicleValidationSchema;
    default:
      return yup.object({});
  }
};

/**
 * Form değerlerini belirli bir şemaya göre validate eder
 */
export const validateFormValues = async <T extends Record<string, any>>(
  values: T,
  schema: yup.ObjectSchema<any>
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  try {
    await schema.validate(values, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      err.inner.forEach((error) => {
        if (error.path) {
          errors[error.path] = error.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { _general: 'Validation hatası' } };
  }
};

