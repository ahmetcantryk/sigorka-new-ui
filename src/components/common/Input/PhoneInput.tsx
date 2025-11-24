import React, { useEffect, useRef, useState } from 'react';
import { validatePhone } from '../../../utils/validators';
import Input from './Input';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
  showValidation?: boolean;
  disabled?: boolean;
  hideSuccessIndicator?: boolean;
  showErrorIcon?: boolean;
  error?: boolean;
  helperText?: string;
}

const PhoneInput = ({
  value,
  onChange,
  name = 'phone',
  required,
  showValidation = false,
  disabled = false,
  hideSuccessIndicator = false,
  showErrorIcon = true,
  error,
  helperText,
}: PhoneInputProps) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Format the phone number with leading 0
  const formatPhoneNumber = (input: string) => {
    // Make sure it starts with 0
    let digits = input.replace(/\D/g, '');
    if (!digits.startsWith('0') && digits.length > 0) {
      digits = '0' + digits;
    } else if (digits.length === 0) {
      return '';
    }

    let formatted = '0';
    if (digits.length > 1) formatted += ' ' + digits.slice(1, 4);
    if (digits.length > 4) formatted += ' ' + digits.slice(4, 7);
    if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
    if (digits.length > 9) formatted += ' ' + digits.slice(9, 11);
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '');

    // Allow maximum 11 digits (including the leading 0)
    if (digits.length <= 11) {
      const formattedValue = formatPhoneNumber(digits);
      setDisplayValue(formattedValue);

      // Remove the leading 0 for the actual value passed to onChange
      let valueToStore = digits;
      if (valueToStore.startsWith('0')) {
        valueToStore = valueToStore.slice(1);
      }

      onChange(valueToStore);

      // Mark as typing
      setIsTyping(true);

      // Clear typing status after some time
      clearTimeout((window as any).phoneTypingTimer);
      (window as any).phoneTypingTimer = setTimeout(() => {
        setIsTyping(false);
      }, 500);
    }
  };

  // Custom validator that doesn't show errors during typing
  const customValidator = (valueToValidate: string) => {
    // Extract digits for validation
    const digits = valueToValidate.replace(/\D/g, '');
    let valueForValidation = digits;

    // Remove leading 0 if present for validation
    if (valueForValidation.startsWith('0')) {
      valueForValidation = valueForValidation.slice(1);
    }

    // Use validateIncompleteInput=false when typing
    return validatePhone(valueForValidation, !isTyping);
  };

  // Handle autofill
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleAutofill = () => {
      const currentValue = input.value;
      const digits = currentValue.replace(/\D/g, '');
      const formattedValue = formatPhoneNumber(digits);
      setDisplayValue(formattedValue);

      let valueToStore = digits;
      if (valueToStore.startsWith('0')) {
        valueToStore = valueToStore.slice(1);
      }

      onChange(valueToStore);
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
          handleAutofill();
        }
      });
    });

    observer.observe(input, {
      attributes: true,
      attributeFilter: ['value'],
    });

    return () => observer.disconnect();
  }, [onChange]);

  // Update display value when value prop changes
  useEffect(() => {
    if (!value) {
      setDisplayValue('');
    } else if (value !== displayValue.replace(/\D/g, '').replace(/^0/, '')) {
      // Ensure the leading 0 is added when formatting
      setDisplayValue(formatPhoneNumber('0' + value));
    }
  }, [value]);

  // When component unmounts, clear the timer
  useEffect(() => {
    return () => {
      clearTimeout((window as any).phoneTypingTimer);
    };
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    setIsTyping(true);
    // If empty, add the leading 0 when focused
    if (!displayValue) {
      setDisplayValue('0');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsTyping(false);
    // Clear the display if only 0 is entered
    if (displayValue === '0') {
      setDisplayValue('');
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        name={name}
        label="Cep Telefonu"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="transition-all duration-200"
        validate={customValidator}
        placeholder="0(5__)___ __ __"
        autoComplete="tel"
        inputMode="numeric"
        required={required}
        showValidation={showValidation}
        disabled={disabled}
        hideSuccessIndicator={hideSuccessIndicator}
        showErrorIcon={showErrorIcon}
        error={error}
        helperText={helperText}
      />
    </div>
  );
};

export default PhoneInput;