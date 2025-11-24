"use client";
import React from 'react';

interface YGInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  type?: string;
  error?: string;
  maxLength?: number;
  disabled?: boolean;
}

export default function YGInput({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  type = 'text',
  error,
  maxLength,
  disabled = false,
}: YGInputProps) {
  return (
    <div className="yg-form-group">
      {label && <label className="yg-form-label">{label}</label>}
      <input
        className={`yg-input ${error ? 'yg-input-error' : ''}`}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        type={type}
        maxLength={maxLength}
        disabled={disabled}
      />
      {error && <span className="yg-error-message">{error}</span>}
    </div>
  );
}

