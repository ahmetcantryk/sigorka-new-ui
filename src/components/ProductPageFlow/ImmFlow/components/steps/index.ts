/**
 * Imm Flow - Step Components
 * 
 * IMM'de meslek inputu olmadığı için kendi PersonalInfoStep'imizi kullanıyoruz
 * Diğer step'ler Kasko'dan alınıyor
 */

// IMM'e özel PersonalInfoStep (meslek yok)
export { default as PersonalInfoStep } from './ImmPersonalInfoStep';

// Kasko'dan alınan step'ler
export {
  VehicleSelectionStep,
  AdditionalInfoStep,
} from '../../../KaskoFlow/components/steps';
