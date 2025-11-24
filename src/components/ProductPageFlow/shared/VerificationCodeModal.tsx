/**
 * VerificationCodeModal
 * 
 * SMS doğrulama kodu popup componenti
 * Product Page Flow için özel tasarım
 */

'use client';

import { useState, useEffect, useRef } from 'react';

interface VerificationCodeModalProps {
  isOpen: boolean;
  phoneNumber: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onCancel: () => void;
}

const VerificationCodeModal = ({
  isOpen,
  phoneNumber,
  onVerify,
  onResend,
  onCancel,
}: VerificationCodeModalProps) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCode(['', '', '', '', '', '']);
      setTimeLeft(60);
      setError(null);
      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setCode(newCode);
    
    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Lütfen 6 haneli kodu giriniz');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await onVerify(fullCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Doğrulama başarısız');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setIsVerifying(true);
    try {
      await onResend();
      setTimeLeft(60);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kod gönderilemedi');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="pp-modal-overlay" onClick={onCancel}>
      <div className="pp-modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="pp-modal-title">Doğrulama Kodu</span>
        
        <p className="pp-modal-description">
          <span className="pp-phone-number">
            {phoneNumber ? `0${phoneNumber.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')}` : '0555 555 55 55'}
          </span> numaralı telefona gelen 6 haneli
          sms doğrulama kodunu aşağıdaki alana girebilirsiniz.
        </p>

        <div className="pp-code-inputs">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="pp-code-input"
            />
          ))}
        </div>

        {error && <div className="pp-modal-error">{error}</div>}

        <div className="pp-modal-timer-container">
          <p className="pp-modal-timer">
            Kod Gelmedi mi? {timeLeft > 0 ? (
              <span>{formatTime(timeLeft)} sonra tekrar gönderebilirsiniz.</span>
            ) : (
              <span>Şimdi tekrar kod gönderebilirsiniz.</span>
            )}
          </p>
        </div>

        {timeLeft > 0 ? (
          <button
            type="button"
            className="pp-btn-verify"
            onClick={handleVerify}
            disabled={isVerifying || code.join('').length !== 6}
          >
            {isVerifying ? 'Doğrulanıyor...' : 'Onayla'}
          </button>
        ) : (
          <button
            type="button"
            className="pp-btn-verify"
            onClick={handleResend}
            disabled={isVerifying}
          >
            {isVerifying ? 'Gönderiliyor...' : 'Tekrar Gönder'}
          </button>
        )}

        <button
          type="button"
          className="pp-btn-cancel"
          onClick={onCancel}
        >
          İptal
        </button>
      </div>
    </div>
  );
};

export default VerificationCodeModal;

