import React, { useState, forwardRef, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { ValidationResult } from './types';
import useValidation from './useValidation';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  validate?: (value: string) => ValidationResult;
  errorMessage?: string;
  showValidation?: boolean;
  readOnly?: boolean;
  hideSuccessIndicator?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showErrorIcon?: boolean;
  error?: boolean;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      validate,
      errorMessage,
      value = '',
      onChange,
      className,
      onFocus,
      onBlur,
      required,
      type,
      showValidation = false,
      readOnly = false,
      hideSuccessIndicator = false,
      leftIcon,
      rightIcon,
      showErrorIcon = true,
      error,
      helperText,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const [touched, setTouched] = useState(false);
    const [modified, setModified] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [userModified, setUserModified] = useState(false);
    const { isValid, validationMessage, validateInput } = useValidation();
    const hasValue = Boolean(value);
    const isDateInput = type === 'date';
    const hasError = isValid === false && hasValue;

    // value prop'unun null olma durumunu kontrol et
    const safeValue = value === null ? '' : value;

    useEffect(() => {
      if (validate && (showValidation || touched || modified)) {
        validateInput(value as string, validate);
      }
    }, [value, touched, modified, isTyping, validate, validateInput, hasValue, showValidation]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      setIsTyping(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      setTouched(true);
      setIsTyping(false);

      // Only validate on blur if field has been modified (has value) or showValidation is true
      if (validate && typeof value === 'string' && (hasValue || showValidation)) {
        validateInput(value, validate);
      }

      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setUserModified(true);
      setModified(true);
      onChange?.(e);
    };

    // Only show validation errors if:
    // 1. The field has been touched AND modified AND has a validation error AND not currently typing, OR
    // 2. showValidation is explicitly set to true (e.g., on form submission)
    const showError =
      ((touched && modified && !isTyping) || showValidation) &&
      ((validate && !isValid && hasValue) || (showValidation && required && !hasValue));

    // Only show success if:
    // 1. Field has a value AND validate function exists AND validation is successful AND not focused
    // 2. AND either hideSuccessIndicator is false OR the user has actually modified the field
    const showSuccess =
      hasValue &&
      validate &&
      isValid === true &&
      !focused &&
      (!hideSuccessIndicator || userModified);

    return (
      <div>
        <div
          className={cn(
            'relative rounded-lg border transition-all duration-200',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            focused && 'border-secondary ring-primary/10 ring-2',
            showError && !focused && 'border-red-500',
            showSuccess && 'border-green-500',
            !showError && !showSuccess && !focused && 'border-gray-300',
            'peer-focus:ring-primary/20 peer-focus:ring-2'
          )}
        >
          <label
            className={clsx(
              'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500 transition-all duration-200',
              focused && 'text-secondary',
              (focused || value) && 'top-2 -translate-y-0 scale-75 text-xs',
              hasError && 'text-red-500'
            )}
          >
            {label}
          </label>

          <input
            {...props}
            ref={ref}
            type={type}
            value={safeValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              'block w-full rounded-lg bg-transparent px-3 text-base leading-normal text-gray-900',
              (hasValue || focused)
                ? 'pb-2 pt-6'
                : isDateInput
                ? 'py-[13.5px]'
                : 'py-3.5',
              'focus:outline-hidden h-[52px]',
              '[&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset]',
              '[&:-webkit-autofill:focus]:bg-transparent [&:-webkit-autofill:hover]:bg-transparent',
              '[&:-webkit-autofill:focus]:text-gray-900 [&:-webkit-autofill]:text-gray-900',
              isDateInput && !focused && !hasValue && 'text-transparent',
              isDateInput && hasValue && 'hide-calendar-icon',
              className
            )}
            placeholder={focused ? props.placeholder : ''}
            style={{ caretColor: 'rgb(59, 130, 246)' }}
            readOnly={onChange ? false : readOnly}
          />

          {!focused && hasValue && (
            <div className={cn("absolute top-1/2 -translate-y-1/2", isDateInput ? "right-8" : "right-3")}>
              {showSuccess && <Check className="h-5 w-5 text-green-500" />}
              {showError && showErrorIcon && <AlertCircle className="h-5 w-5 text-red-500" />}
            </div>
          )}
        </div>

        {showError && (
          <p className="mt-1 text-sm text-red-500">
            {validationMessage || errorMessage || 'Bu alan zorunludur'}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;