"use client";
import React from 'react';

interface YGSelectProps {
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string | number; label: string }>;
  error?: string;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function YGSelect({
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
  placeholder,
  label,
  disabled = false,
  className = '',
}: YGSelectProps) {
  return (
    <div className="yg-form-group">
      {label && <label className="yg-form-label">{label}</label>}
      <div className="yg-select-wrapper">
        <select
          className={`yg-select ${error ? 'yg-input-error' : ''} ${className}`}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="yg-select-arrow">
          <img 
            src="/images/landing/taksit-arrow.svg" 
            alt="arrow" 
            style={{ display: 'block' }}
          />
        </span>
      </div>
      {error && <span className="yg-error-message">{error}</span>}
    </div>
  );
}


