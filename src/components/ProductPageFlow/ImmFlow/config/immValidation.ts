/**
 * Imm Flow - Validation Şemaları
 * 
 * Kasko ile aynı validation kuralları kullanılıyor
 */

// Kasko'dan tüm validation'ları import et
export {
  personalInfoValidationSchema,
  vehicleValidationSchema,
  additionalInfoValidationSchema,
  getValidationSchemaByStep,
  validateFormValues,
} from '../../KaskoFlow/config/kaskoValidation';

