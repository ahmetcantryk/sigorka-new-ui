'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authApi } from '@/services/auth';
import { useAuthStore } from '@/store/useAuthStore';

interface VerificationFormProps {
  token: string;
  phoneNumber: string;
  onBack: () => void;
  onSuccess: (userData: any) => void;
}

interface FormData {
  code: string;
}

const schema = yup.object({
  code: yup
    .string()
    .required('Doğrulama kodu gereklidir')
    .matches(/^[0-9]{6}$/, 'Geçerli bir doğrulama kodu giriniz'),
});

export default function VerificationForm({
  token,
  phoneNumber,
  onBack,
  onSuccess,
}: VerificationFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { setTokens, setUser, setCustomerId } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      code: '',
    },
  });

  const startResendCountdown = () => {
    setResendDisabled(true);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendDisabled) return;

    setError(null);
    setIsLoading(true);

    try {
      // SMS yeniden gönderme API'si burada çağrılacak
      // await authApi.resendVerificationCode(token);
      startResendCountdown();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Kod gönderilemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsLoading(true);

    try {
      // 1. MFA doğrulaması
      const response = await authApi.verifyMfa({
        token,
        code: data.code,
      });

      // 2. Token'ları store'a kaydet
      if (response.accessToken && response.refreshToken) {
        setTokens(response.accessToken, response.refreshToken);
      } else {
        throw new Error('Token bilgileri alınamadı');
      }

      // 3. Profil bilgilerini al
      try {
        const userData = await authApi.getProfile();
        
        // 4. Kullanıcı bilgilerini store'a kaydet
        setUser({
          id: userData.id,
          name: userData.fullName || '',
          email: userData.primaryEmail || '',
          phone: userData.primaryPhoneNumber?.number || '',
        });
        setCustomerId(userData.id);

        // 5. Başarılı callback'i çağır
        onSuccess(userData);
      } catch (profileError) {
        // Profil alınamasa bile giriş başarılı sayılabilir
        // MFA yanıtındaki user bilgisini kullan
        if (response.user) {
          setUser(response.user);
          setCustomerId(response.user.id);
          onSuccess(response.user);
        } else {
          throw new Error('Kullanıcı bilgileri alınamadı');
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Doğrulama başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Telefon Numarası */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {phoneNumber} numaralı telefonunuza gönderilen 6 haneli doğrulama kodunu giriniz.
        </p>
      </div>

      {/* Doğrulama Kodu */}
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
          Doğrulama Kodu
        </label>
        <input
          type="text"
          id="code"
          {...register('code')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="6 haneli kod"
          maxLength={6}
        />
        {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
      </div>

      {/* Hata mesajı */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Butonlar */}
      <div className="flex flex-col space-y-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            'Doğrula'
          )}
        </button>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Geri Dön
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendDisabled || isLoading}
            className="text-sm text-primary hover:text-primary/90 disabled:opacity-50"
          >
            {resendDisabled
              ? `Yeni kod gönder (${countdown}s)`
              : 'Yeni kod gönder'}
          </button>
        </div>
      </div>
    </form>
  );
} 