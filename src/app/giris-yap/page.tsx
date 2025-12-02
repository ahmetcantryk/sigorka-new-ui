'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { CustomerProfile } from '@/services/fetchWithAuth';
import { performLogin, verifyOTP, CustomerType } from '@/utils/authHelper';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';
import { validateTCKNFull, validateTaxNumber, validateTurkishPhoneStrict, validateBirthDate } from '@/utils/validators';
import VerificationCodeModal from '@/components/ProductPageFlow/shared/VerificationCodeModal';
import PhoneNotMatchModal from '@/components/common/PhoneNotMatchModal';
import MobileBirthDateCalendar from '@/components/ProductPageFlow/shared/MobileBirthDateCalendar';
import '@/styles/product-flow/product-page-flow.css';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agencyConfig = useAgencyConfig();
  const agentId = agencyConfig?.agency?.id;

  const { setUser, setCustomerId, setTokens } = useAuthStore();

  // Form state
  const [isRegistering, setIsRegistering] = useState(false);
  const [identityType, setIdentityType] = useState<'tc' | 'vkn'>('tc');
  const [formData, setFormData] = useState({
    identifier: '',
    phoneNumber: '',
    birthDate: '',
  });
  const [touched, setTouched] = useState({
    identifier: false,
    phoneNumber: false,
    birthDate: false,
  });

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Verification Modal
  const [showVerification, setShowVerification] = useState(false);
  const [tempToken, setTempToken] = useState<string>('');
  const [showPhoneNotMatchModal, setShowPhoneNotMatchModal] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Doğum tarihi gösterilecek mi? (Sadece üye ol + TC seçiliyse)
  const showBirthDate = isRegistering && identityType === 'tc';

  // Validation helpers
  const getIdentifierValidation = () => {
    if (!formData.identifier) {
      return { isValid: false, message: identityType === 'tc' ? 'T.C. Kimlik No gereklidir' : 'Vergi Kimlik No gereklidir' };
    }
    return identityType === 'tc'
      ? validateTCKNFull(formData.identifier)
      : validateTaxNumber(formData.identifier);
  };

  const getPhoneValidation = () => {
    if (!formData.phoneNumber) {
      return { isValid: false, message: 'Telefon numarası gereklidir' };
    }
    return validateTurkishPhoneStrict(formData.phoneNumber, true);
  };

  const getBirthDateValidation = () => {
    // Doğum tarihi sadece üye ol + TC seçiliyse zorunlu
    if (!showBirthDate) {
      return { isValid: true, message: '' };
    }
    if (!formData.birthDate) {
      return { isValid: false, message: 'Doğum tarihi gereklidir' };
    }
    return validateBirthDate(formData.birthDate);
  };

  // Handle form change
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Identity type switch
  const handleIdentityTypeChange = (type: 'tc' | 'vkn') => {
    setIdentityType(type);
    setFormData(prev => ({ ...prev, identifier: '', birthDate: '' }));
    setTouched({ identifier: false, phoneNumber: false, birthDate: false });
  };

  // Form submission
  const handleSubmit = async () => {
    // Mark relevant fields as touched
    setTouched({ 
      identifier: true, 
      phoneNumber: true, 
      birthDate: showBirthDate // Sadece görünüyorsa touch et
    });

    // Validate all fields
    const identifierValidation = getIdentifierValidation();
    const phoneValidation = getPhoneValidation();
    const birthDateValidation = getBirthDateValidation();

    if (!identifierValidation.isValid || !phoneValidation.isValid || !birthDateValidation.isValid) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
      const isVKN = identityType === 'vkn';
      const customerType = isVKN ? CustomerType.Company : CustomerType.Individual;
      const identityOrTaxNumber = isVKN ? formData.identifier : parseInt(formData.identifier);

      // Doğum tarihi sadece üye ol + TC seçiliyse gönderilecek
      const birthDateToSend = showBirthDate ? formData.birthDate : undefined;

      const loginData = await performLogin(
        identityOrTaxNumber,
        isVKN ? undefined : birthDateToSend,
        cleanPhone,
        agentId,
        customerType
      );

      if (loginData.token) {
        setTempToken(loginData.token);
        setShowVerification(true);
      }
    } catch (error: any) {
      if (error?.status === 404 || error?.codes?.includes('RESOURCE_NOT_FOUND_DATABASE')) {
        setShowPhoneNotMatchModal(true);
      } else {
        setError(error instanceof Error ? error.message : 'Bir hata oluştu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verification handlers
  const handleVerificationComplete = async (code: string) => {
    if (!tempToken) return;

    try {
      const verifyData = await verifyOTP(tempToken, code);

      if (!verifyData.accessToken) {
        throw new Error('Doğrulama başarısız oldu.');
      }

      setTokens(verifyData.accessToken, verifyData.refreshToken);

      // Get user profile
      const meResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
      if (meResponse.ok) {
        const profile: CustomerProfile = await meResponse.json();

        setCustomerId(profile.id);
        setUser({
          id: profile.id,
          name: profile.fullName || '',
          email: profile.primaryEmail || '',
          phone: profile.primaryPhoneNumber?.number || '',
        });
      }

      setShowVerification(false);

      // Redirect
      const redirectUrl = searchParams.get('redirect') || '/dashboard/profile';
      router.push(redirectUrl);
    } catch (error) {
      throw new Error('Doğrulama kodu hatalı. Lütfen tekrar deneyin.');
    }
  };

  const handleResendOTP = async () => {
    try {
      const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
      const isVKN = identityType === 'vkn';
      const customerType = isVKN ? CustomerType.Company : CustomerType.Individual;
      const identityOrTaxNumber = isVKN ? formData.identifier : parseInt(formData.identifier);

      // Doğum tarihi sadece üye ol + TC seçiliyse gönderilecek
      const birthDateToSend = showBirthDate ? formData.birthDate : undefined;

      const loginData = await performLogin(
        identityOrTaxNumber,
        isVKN ? undefined : birthDateToSend,
        cleanPhone,
        agentId,
        customerType
      );

      if (loginData.token) {
        setTempToken(loginData.token);
      }
    } catch (error: any) {
      if (error?.status === 404 || error?.codes?.includes('RESOURCE_NOT_FOUND_DATABASE')) {
        setShowPhoneNotMatchModal(true);
      }
      throw error;
    }
  };

  // Validation results
  const identifierValidation = getIdentifierValidation();
  const phoneValidation = getPhoneValidation();
  const birthDateValidation = getBirthDateValidation();

  return (
    <div className="login-page-wrapper">
      <div className="login-page-container">
        {/* Logo */}
      

        {/* Welcome Text */}
        <div className="login-header">
          <h1 className="login-title">Hesabınıza Giriş Yapın</h1>
          <p className="login-subtitle">
            Giriş yapmak veya üye olmak için aşağıdaki alanları doldurunuz.
          </p>
        </div>

        {/* Form Card */}
        <div className="login-form">
          <div className="login-card">
            {/* Tab Switch */}
            <div className="login-tabs">
              <button
                type="button"
                className={`login-tab ${!isRegistering ? 'active' : ''}`}
                onClick={() => setIsRegistering(false)}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                className={`login-tab ${isRegistering ? 'active' : ''}`}
                onClick={() => setIsRegistering(true)}
              >
                Üye Ol
              </button>
            </div>

            {/* TC/VKN Kimlik No */}
            <div className={`login-form-group ${touched.identifier && !identifierValidation.isValid ? 'error' : ''}`}>
              <label className="login-label">
                {identityType === 'tc' ? 'T.C. Kimlik No' : 'Vergi Kimlik No'}
              </label>
              <div className="login-input-wrapper">
                <input
                  type="text"
                  className="login-input"
                  value={formData.identifier}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    handleChange('identifier', value);
                  }}
                  onBlur={() => handleBlur('identifier')}
                  placeholder={identityType === 'tc' ? '___________' : '__________'}
                  maxLength={identityType === 'tc' ? 11 : 10}
                />
                {/* TC/VKN Switch */}
                <div className="login-identity-switch">
                  <span className={identityType === 'tc' ? 'active' : ''}>TC</span>
                  <button
                    type="button"
                    className={`login-switch-btn ${identityType === 'vkn' ? 'active' : ''}`}
                    onClick={() => handleIdentityTypeChange(identityType === 'tc' ? 'vkn' : 'tc')}
                  >
                    <span className="login-switch-knob"></span>
                  </button>
                  <span className={identityType === 'vkn' ? 'active' : ''}>VKN</span>
                </div>
              </div>
              {touched.identifier && !identifierValidation.isValid && (
                <div className="login-error-message">{identifierValidation.message}</div>
              )}
            </div>

            {/* Telefon Numarası */}
            <div className={`login-form-group ${touched.phoneNumber && !phoneValidation.isValid ? 'error' : ''}`}>
              <label className="login-label">Cep Telefonu Numarası</label>
              <input
                type="tel"
                className="login-input"
                value={formData.phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length === 0) {
                    handleChange('phoneNumber', '');
                  } else if (value[0] !== '5') {
                    handleChange('phoneNumber', '5' + value.slice(0, 9));
                  } else {
                    handleChange('phoneNumber', value.slice(0, 10));
                  }
                }}
                onBlur={() => handleBlur('phoneNumber')}
                placeholder="5__ ___ __ __"
                maxLength={10}
              />
              {touched.phoneNumber && !phoneValidation.isValid && (
                <div className="login-error-message">{phoneValidation.message}</div>
              )}
            </div>

            {/* Doğum Tarihi - Sadece üye ol + TC seçiliyse görünür */}
            {showBirthDate && (
              <div className={`login-form-group ${touched.birthDate && !birthDateValidation.isValid ? 'error' : ''}`}>
                <label className="login-label">Doğum Tarihi</label>
                {isMobile ? (
                  <MobileBirthDateCalendar
                    value={formData.birthDate}
                    onChange={(val) => handleChange('birthDate', val)}
                    onBlur={() => handleBlur('birthDate')}
                  />
                ) : (
                  <input
                    type="date"
                    className="login-input"
                    value={formData.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    onBlur={() => handleBlur('birthDate')}
                    min="1900-01-01"
                    max={new Date().toISOString().split('T')[0]}
                    placeholder="__ / __ / ____"
                  />
                )}
                {touched.birthDate && !birthDateValidation.isValid && (
                  <div className="login-error-message">{birthDateValidation.message}</div>
                )}
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="login-error-banner">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="login-button-group">
              <button
                type="button"
                className="login-btn-submit"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'İşleniyor...' : (isRegistering ? 'Üye Ol' : 'Giriş Yap')}
              </button>
            </div>

            {/* KVKK Info Text */}
            <p className="login-kvkk-text">
              Devam ederek{' '}
              <Link href="/kvkk" target="_blank" rel="noopener noreferrer">KVKK Aydınlatma Metni</Link>
              {' '}ve{' '}
              <Link href="/acik-riza-metni" target="_blank" rel="noopener noreferrer">Açık Rıza Metni</Link>
              'ni kabul etmiş olursunuz.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      <VerificationCodeModal
        isOpen={showVerification}
        phoneNumber={formData.phoneNumber}
        onVerify={handleVerificationComplete}
        onResend={handleResendOTP}
        onCancel={() => setShowVerification(false)}
      />

      {/* Phone Not Match Modal */}
      <PhoneNotMatchModal
        isOpen={showPhoneNotMatchModal}
        onClose={() => setShowPhoneNotMatchModal(false)}
      />
    </div>
  );
}
