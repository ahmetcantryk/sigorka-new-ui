import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showSuccess?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, showSuccess, value, placeholder, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const hasValue = Boolean(value && value.toString().trim() !== '');
    const showLabel = focused || hasValue;

    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-transparent',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500',
            showSuccess && 'border-green-500',
            !error && !showSuccess && 'border-gray-300',
            className
          )}
          ref={ref}
          value={value}
          placeholder={placeholder}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {label && (
          <label
            className={cn(
              'pointer-events-none absolute left-3 transition-all duration-200',
              showLabel
                ? 'top-1 text-[10px] text-gray-500'
                : 'top-1/2 -translate-y-1/2 text-base text-gray-400',
              error && 'text-red-500',
              showSuccess && 'text-green-500'
            )}
          >
            {label}
          </label>
        )}
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input'; 