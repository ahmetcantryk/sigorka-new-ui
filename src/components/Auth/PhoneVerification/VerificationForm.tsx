import React, { useState, useEffect } from 'react';
import { ArrowLeft, Timer } from 'lucide-react';
import Input from '../../common/Input/Input';
import { useAuthStore } from '../../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import { customerApi } from '../../../services/api';
import { API_ENDPOINTS } from '../../../config/api';
import { fetchWithAuth } from '../../../services/fetchWithAuth';

interface VerificationFormProps {
  token: string;
  phoneNumber: string;
  onBack: () => void;
  onResend: () => Promise<{ newToken?: string } | void>;
  onSuccess?: (userData: any) => Promise<void>;
}

const VerificationForm = ({ token, phoneNumber, onBack, onResend, onSuccess }: VerificationFormProps) => {
  const router = useRouter();
  const { setTokens, setUser, setCustomerId } = useAuthStore();
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [showValidation, setShowValidation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [currentFormToken, setCurrentFormToken] = useState(token);

  useEffect(() => {
    setCurrentFormToken(token);
  }, [token]);

  useEffect(() => {
    if (!phoneNumber || !currentFormToken) {
      onBack();
      return;
    }

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, phoneNumber, currentFormToken, onBack]);

  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.AUTH_REFRESH_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Token yenileme başarısız oldu');
      }

      return data.accessToken;
    } catch (error) {
      throw error;
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError(null);
    
    try {
      const result = await onResend();
      if (result && result.newToken) {
        setCurrentFormToken(result.newToken);
      }
    } catch (err) {
      // Hata olsa bile kullanıcıya gösterme, sessizce devam et
      console.warn('Resend hatası (kullanıcıya gösterilmiyor):', err);
    }
    
    // Timer'ı her durumda başlat
    setTimeLeft(60);
    setResendLoading(false);
  };

  const startRefreshTimer = (refreshToken: string) => {
    const timer = setTimeout(async () => {
      try {
        const newAccessToken = await refreshAccessToken(refreshToken);
        setTokens(newAccessToken, refreshToken);
        startRefreshTimer(refreshToken);
      } catch (error) {
      }
    }, 8 * 60 * 1000);

    setRefreshTimer(timer);
  };

  useEffect(() => {
    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [refreshTimer]);

  const formatPhoneNumber = (phone: string) => {
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    setError(null);
    setLoading(true);

    if (!code) {
      setLoading(false);
      return;
    }

    try {
      const verifyResponse = await fetchWithAuth(API_ENDPOINTS.AUTH_VERIFY_MFA, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: currentFormToken,
          code,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setError('Yanlış bir doğrulama kodu girdin.');
        setLoading(false);
        return;
      }

      if (verifyData.accessToken && verifyData.refreshToken) {
        setTokens(verifyData.accessToken, verifyData.refreshToken);
        startRefreshTimer(verifyData.refreshToken);

        try {
          const profile = await customerApi.getProfile();
          
          if (onSuccess) {
            await onSuccess(profile);
          } else {
            // Fallback behavior if onSuccess is not provided
            setUser({
              id: profile.id,
              name: profile.fullName,
              email: profile.primaryEmail,
              phone: profile.primaryPhoneNumber.number,
            });
            setCustomerId(profile.id);
            localStorage.setItem('customerId', profile.id);
            router.push('/dashboard/profile');
          }
        } catch (error) {
          setError('Profil bilgileri alınamadı. Lütfen tekrar deneyin.');
        }
      } else {
        setError('Geçersiz API yanıtı. Lütfen tekrar deneyin.');
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  return (
    <div className="shadow-xs rounded-xl bg-white p-8">
      <div className="mb-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          Telefonuna bir doğrulama kodu gönderdik!
        </h2>
        <p className="text-gray-600">
          <span className="font-medium">0{formatPhoneNumber(phoneNumber)}</span> numaralı cep
          telefonuna gelen doğrulama kodunu girebilir misin?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Doğrulama Kodu"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
          required
          showValidation={showValidation}
          inputMode="numeric"
        />

        {error && <div className="text-center text-sm text-red-500">{error}</div>}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center text-secondary transition-colors hover:text-opacity-80"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Geri Dön
          </button>

          {timeLeft > 0 ? (
            <div className="flex items-center text-sm text-gray-500">
              <Timer className="mr-1 h-4 w-4" />
              <span>00:{timeLeft.toString().padStart(2, '0')}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading}
              className="text-sm text-secondary transition-colors hover:text-opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resendLoading ? 'Gönderiliyor...' : 'Tekrar Kod Gönder'}
            </button>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-secondary px-4 py-3.5 font-medium text-white transition-colors hover:bg-opacity-90"
        >
          Onayla
        </button>
      </form>
    </div>
  );
};

export default VerificationForm;