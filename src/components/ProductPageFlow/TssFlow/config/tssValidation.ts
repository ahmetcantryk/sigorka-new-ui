/**
 * TSS Flow - Validation Schemas
 */

import * as yup from 'yup';
import { validateTCKNFull, validateTaxNumber, validateBirthDate, validateTurkishPhoneStrict } from '@/utils/validators';

// Step 1 - Personal Info Validation
export const personalInfoValidationSchema = yup.object({
    identityNumber: yup
        .string()
        .required('TC Kimlik No / Vergi Kimlik No gereklidir')
        .test('identity-validation', '', function (value) {
            if (!value) return true;
            // 10 haneli ise VKN, 11 haneli ise TCKN
            let validation;
            if (value.length === 10) {
                validation = validateTaxNumber(value);
            } else if (value.length === 11) {
                validation = validateTCKNFull(value);
            } else {
                return this.createError({ message: 'Kimlik numarası 10 veya 11 haneli olmalıdır' });
            }
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
        .test('birth-date-required', 'Doğum tarihi gereklidir', function (value) {
            // VKN (10 haneli) için birthDate zorunlu değil
            const identityNumber = this.parent.identityNumber;
            if (identityNumber && identityNumber.length === 10) {
                return true; // VKN için birthDate zorunlu değil
            }
            // TCKN (11 haneli) için birthDate zorunlu
            if (!value) return false;
            return true;
        })
        .test('birth-date-validation', '', function (value) {
            if (!value) return true;
            // VKN için validation yapma
            const identityNumber = this.parent.identityNumber;
            if (identityNumber && identityNumber.length === 10) {
                return true;
            }
            const validation = validateBirthDate(value);
            if (!validation.isValid) {
                return this.createError({ message: validation.message });
            }
            return true;
        }),
    job: yup.number(),
});

// Step 2 - Health Info Validation
export const healthInfoValidationSchema = yup.object({
    height: yup
        .number()
        .typeError('Boy sayısal olmalıdır')
        .positive('Boy pozitif olmalıdır')
        .required('Boy zorunludur')
        .min(50, 'Boy en az 50 cm olmalıdır')
        .max(250, 'Boy en fazla 250 cm olabilir'),
    weight: yup
        .number()
        .typeError('Kilo sayısal olmalıdır')
        .positive('Kilo pozitif olmalıdır')
        .required('Kilo zorunludur')
        .min(20, 'Kilo en az 20 kg olmalıdır')
        .max(300, 'Kilo en fazla 300 kg olabilir'),
});

// Additional Info Validation (for incomplete profiles)
export const additionalInfoValidationSchema = yup.object({
    fullName: yup.string().required('Ad Soyad zorunludur'),
    city: yup.string().required('İl seçimi zorunludur'),
    district: yup.string().required('İlçe seçimi zorunludur'),
});

