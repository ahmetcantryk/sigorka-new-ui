import React, { useState, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface Option {
  value: string;
  label: string;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  icon?: React.ReactNode;
  options: Option[];
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ label, icon, options, value, onChange, className, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const hasValue = value !== '';

    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="relative mb-6">
        <div
          className={cn(
            'relative rounded-lg border transition-all duration-200',
            focused && 'border-secondary ring-2 ring-secondary/20',
            !focused && 'border-gray-300'
          )}
        >
          {/* Icon */}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>
          )}

          {/* Label */}
          <label
            className={cn(
              'pointer-events-none absolute left-3 transition-all duration-200',
              icon && 'left-10',
              hasValue || focused ? 'top-2.5 text-[10px]' : 'top-4 text-base',
              focused && 'text-secondary',
              !focused && !hasValue && 'text-gray-500'
            )}
          >
            {label}
          </label>

          {/* Select */}
          <select
            {...props}
            ref={ref}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              'block w-full appearance-none rounded-lg bg-transparent px-3 text-base leading-normal text-gray-900',
              'focus:outline-hidden',
              icon && 'pl-10',
              hasValue || focused ? 'pb-2 pt-6' : 'py-3.5',
              className
            )}
          >
            <option value=""></option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron Icon */}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </div>
        </div>
      </div>
    );
  }
);

SelectInput.displayName = 'SelectInput';

export default SelectInput;
