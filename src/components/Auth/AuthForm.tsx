'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Input from '../common/Input/Input';
import PhoneInput from '../common/Input/PhoneInput';
import { validateTCKN, validatePhone, validateTCKNFull, validateBirthDate as importedValidateBirthDate, validateTaxNumber } from '@/utils/validators';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';
import { useAuthConfig } from '@/context/AgencyConfigProvider';
import VerificationForm from './PhoneVerification/VerificationForm';
import { ValidationResult } from '../common/Input/types';
import { authApi } from '@/services/auth';
import { useAuthStore } from '@/store/useAuthStore';
import PhoneNotMatchModal from '../common/PhoneNotMatchModal';
import '../../styles/form-style.css';

interface AuthFormProps {
  onSuccess?: (token: string, phone: string, formData: any) => void;
  isRegistering?: boolean;
  onFormModeChange?: (isRegistering: boolean, formData: any) => void;
}

interface UserData {
  id: string;
  fullName: string;
  primaryEmail: string;
  primaryPhoneNumber: {
    number: string;
  };
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, isRegistering: initialIsRegistering = false, onFormModeChange }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '', // TC kimlik no veya vergi kimlik no
    phone: '',
    birthDate: '',
  });
  const [isRegistering, setIsRegistering] = useState(initialIsRegistering);
  const [identityType, setIdentityType] = useState<'tc' | 'vkn'>('tc');
  const [showValidation, setShowValidation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [tempToken, setTempToken] = useState<string>('');
  const [showPhoneNotMatchModal, setShowPhoneNotMatchModal] = useState(false);
  const { setUser, setCustomerId, setRememberMe: setStoreRememberMe } = useAuthStore();
  const authConfig = useAuthConfig();
  const {
    agency: { id: agentId },
  } = useAgencyConfig();

  const validateBirthDate = (value: string): ValidationResult => {
    return importedValidateBirthDate(value);
  };

  const getIdentifierValidation = (): ValidationResult => {
    return identityType === 'tc' 
      ? validateTCKNFull(formData.identifier)
      : validateTaxNumber(formData.identifier);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    setError(null);

    const cleanPhoneNumber = formData.phone.replace(/\D/g, '');
    const identifierResult = getIdentifierValidation();
    const isIdentifierValid = identifierResult.isValid;
    const phoneResult = validatePhone(formData.phone);
    const isPhoneValid = phoneResult.isValid;
    const birthDateResult = (!isRegistering || identityType === 'vkn') ? { isValid: true } : validateBirthDate(formData.birthDate);
    const isBirthDateValid = birthDateResult.isValid;

    if (!isIdentifierValid || !isPhoneValid || !isBirthDateValid) {
      return;
    }

    try {
      const requestData = {
        $type: identityType === 'tc' ? 'individual' : 'company',
        phoneNumber: {
          number: cleanPhoneNumber,
          countryCode: 90,
        },
        agentId,
        ...(identityType === 'tc' 
          ? { 
              identityNumber: parseInt(formData.identifier),
              // birthDate sadece üye ol modunda ve TC için gönder, giriş yap modunda gönderme
              ...(isRegistering && formData.birthDate ? { birthDate: formData.birthDate } : {})
            }
          : {
              taxNumber: formData.identifier,
            }
        ),
      };

      const response = await authApi.login(requestData);

      if (response.customerId) {
        setCustomerId(response.customerId);
        localStorage.setItem('customerId', response.customerId);
      }

      setTempToken(response.token);
      setShowVerification(true);

      if (onSuccess) {
        onSuccess(response.token, formData.phone, { 
          ...formData, 
          identityType, 
          agentId, 
          isRegistering 
        });
      }
    } catch (error: any) {
      // 404 hatası ve RESOURCE_NOT_FOUND_DATABASE kodu kontrolü
      if (error?.status === 404 || error?.codes?.includes('RESOURCE_NOT_FOUND_DATABASE')) {
        setShowPhoneNotMatchModal(true);
      } else {
        setError(error instanceof Error ? error.message : 'Bir hata oluştu');
      }
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIdentityTypeChange = (type: 'tc' | 'vkn') => {
    setIdentityType(type);
    setFormData(prev => ({ ...prev, identifier: '', birthDate: '' }));
  };

  const handleBack = () => {
    setShowVerification(false);
    setTempToken('');
  };

  const handleResend = async () => {
    try {
      const requestData = {
        $type: identityType === 'tc' ? 'individual' : 'company',
        phoneNumber: {
          number: formData.phone.replace(/\D/g, ''),
          countryCode: 90,
        },
        agentId,
        ...(identityType === 'tc' 
          ? { 
              identityNumber: parseInt(formData.identifier),
              // birthDate sadece üye ol modunda ve TC için gönder, giriş yap modunda gönderme
              ...(isRegistering && formData.birthDate ? { birthDate: formData.birthDate } : {})
            }
          : {
              taxNumber: formData.identifier,
            }
        ),
      };

      const response = await authApi.login(requestData);

      if (response.customerId) {
        setCustomerId(response.customerId);
        localStorage.setItem('customerId', response.customerId);
      }

      setTempToken(response.token);
      return { newToken: response.token };
    } catch (error: any) {
      // 404 hatası ve RESOURCE_NOT_FOUND_DATABASE kodu kontrolü
      if (error?.status === 404 || error?.codes?.includes('RESOURCE_NOT_FOUND_DATABASE')) {
        setShowPhoneNotMatchModal(true);
      } else {
        setError(error instanceof Error ? error.message : 'Kod yeniden gönderilemedi');
      }
      throw error;
    }
  };

  const handleVerificationSuccess = async (userData: UserData) => {
    setStoreRememberMe(rememberMe);
    setUser({
      id: userData.id,
      name: userData.fullName,
      email: userData.primaryEmail,
      phone: userData.primaryPhoneNumber.number,
    });
    setCustomerId(userData.id);

    const redirectUrl = searchParams.get('redirect') || '/dashboard/profile';
    router.push(redirectUrl);
  };

  if (showVerification) {
    return (
      <VerificationForm
        token={tempToken}
        phoneNumber={formData.phone}
        onBack={handleBack}
        onResend={handleResend}
        onSuccess={handleVerificationSuccess}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="shadow-xs rounded-xl bg-white p-8">
      <div className="space-y-6">
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                onFormModeChange?.(false, { ...formData, identityType, agentId });
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isRegistering
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(true);
                onFormModeChange?.(true, { ...formData, identityType, agentId });
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isRegistering
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Üye Ol
            </button>
          </div>
        </div>

        <div className="relative">
          <Input
            label={identityType === 'tc' ? 'T.C. Kimlik No' : 'Vergi Kimlik No'}
            name="identifier"
            value={formData.identifier}
            onChange={(e) => handleChange('identifier', e.target.value)}
            maxLength={identityType === 'tc' ? 11 : 10}
            required
            showValidation={showValidation}
            error={showValidation && !getIdentifierValidation().isValid}
            helperText={showValidation && !getIdentifierValidation().isValid ? getIdentifierValidation().message : ''}
            showErrorIcon={false}
          />
          
          {/* TC Switch VKN Container */}
          <div className="absolute right-4 top-[20px] flex items-center gap-2">
            <span className={`text-sm ${identityType === 'tc' ? 'text-[#ff8c00]' : 'text-gray-400'}`}>
              TC
            </span>
            
            {/* Switch */}
            <button
              type="button"
              onClick={() => handleIdentityTypeChange(identityType === 'tc' ? 'vkn' : 'tc')}
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                identityType === 'tc' ? 'bg-gray-300' : 'bg-[#ff8c00]'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                  identityType === 'tc' ? 'translate-x-0.5' : 'translate-x-3'
                }`}
              />
            </button>
            
            <span className={`text-sm ${identityType === 'vkn' ? 'text-[#ff8c00]' : 'text-gray-400'}`}>
              VKN
            </span>
          </div>
        </div>

        <PhoneInput
          name="phone"
          value={formData.phone}
          onChange={(value) => handleChange('phone', value)}
          required
          showValidation={showValidation}
          error={showValidation && !validatePhone(formData.phone).isValid}
          helperText={showValidation && !validatePhone(formData.phone).isValid ? validatePhone(formData.phone).message : ''}
          showErrorIcon={false}
        />

        {isRegistering && identityType === 'tc' && (
          <Input
            label="Doğum Tarihi"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            validate={validateBirthDate}
            min="1900-01-01"
            max={new Date().toISOString().split('T')[0]}
            required
            showValidation={showValidation}
            error={showValidation && !validateBirthDate(formData.birthDate).isValid}
            helperText={showValidation && !validateBirthDate(formData.birthDate).isValid ? validateBirthDate(formData.birthDate).message : ''}
            showErrorIcon={false}
          />
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-secondary hover:bg-opacity-90 px-4 py-3.5 font-medium text-white transition-colors">
          {isRegistering ? 'Üye Ol' : 'Giriş Yap'}
        </button>

        <p className="text-center text-xs text-gray-500">
          Devam ederek{' '}
          <Link href="/kvkk" className="text-secondary hover:underline">
            KVKK Aydınlatma Metni
          </Link>{' '}
          ve{' '}
          <Link href="/acik-riza-metni" className="text-secondary hover:underline">
            Açık Rıza Metni
          </Link>
          &apos;ni kabul etmiş olursunuz.
        </p>
      </div>

      {/* Phone Not Match Modal */}
      <PhoneNotMatchModal 
        isOpen={showPhoneNotMatchModal}
        onClose={() => setShowPhoneNotMatchModal(false)}
      />
    </form>
  );
};

export default AuthForm;
