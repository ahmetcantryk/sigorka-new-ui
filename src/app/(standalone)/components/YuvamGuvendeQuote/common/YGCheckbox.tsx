import React from 'react';

interface YGCheckboxProps {
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: React.ReactNode;
  error?: string;
}

export default function YGCheckbox({
  name,
  checked,
  onChange,
  label,
  error,
}: YGCheckboxProps) {
  return (
    <div className="yg-checkbox-wrapper">
      <label className="yg-checkbox-label">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="yg-checkbox"
        />
        <span className="yg-checkbox-text">{label}</span>
      </label>
      {error && <span className="yg-error-message">{error}</span>}
    </div>
  );
}



