import React from 'react';

interface YGOTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function YGOTPInput({ value, onChange, length = 6, disabled = false, isLoading = false }: YGOTPInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;
    const newValue = e.target.value.replace(/\D/g, '').slice(0, length);
    onChange(newValue);
  };

  return (
    <label className="yg-otp-wrap" aria-label={`${length} haneli doğrulama kodu`}>
      {/* Görsel alt çizgiler */}
      <div className="yg-otp-slots" aria-hidden="true">
        {Array.from({ length }).map((_, index) => (
          <div key={index} className="yg-otp-slot"></div>
        ))}
      </div>

      {/* Tek gerçek input */}
      <input
        className="yg-otp-input"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={length}
        value={value}
        onChange={handleChange}
        placeholder="••••••"
        disabled={disabled || isLoading}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="yg-otp-spinner">
          <div className="yg-otp-spinner-circle"></div>
        </div>
      )}
    </label>
  );
}

