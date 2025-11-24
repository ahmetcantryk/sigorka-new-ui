import { useState } from 'react';
import { ValidationResult } from './types';

const useValidation = () => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState('');

  const validateInput = (value: string, validator: (value: string) => ValidationResult) => {
    const result = validator(value);
    setIsValid(result.isValid);
    setValidationMessage(result.message || '');
  };

  return {
    isValid,
    validationMessage,
    validateInput,
  };
};

export default useValidation;
