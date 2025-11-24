import React, { useState, forwardRef } from 'react';
import { cn } from '../../../utils/cn';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  showValidation?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      value,
      onChange,
      className,
      onFocus,
      onBlur,
      required,
      showValidation = false,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const [touched, setTouched] = useState(false);
    const [modified, setModified] = useState(false);
    const hasValue = Boolean(value);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused(false);
      setTouched(true);
      onBlur?.(e);
    };

    // Track if the field has been modified
    React.useEffect(() => {
      if (hasValue) {
        setModified(true);
      }
    }, [value, hasValue]);

    // Only show error if touched AND modified or showValidation is true
    const showError = ((touched && modified) || showValidation) && required && !hasValue;

    return (
      <div className="relative mb-6">
        <div
          className={cn(
            'relative rounded-lg border transition-all duration-200',
            focused && 'border-secondary ring-2 ring-secondary/20',
            showError && !focused && 'border-red-500',
            !showError && !focused && 'border-gray-300'
          )}
        >
          {/* Label */}
          <label
            className={cn(
              'pointer-events-none absolute left-3 transition-all duration-200',
              hasValue || focused ? 'top-2.5 text-[10px]' : 'top-4 text-base',
              focused && 'text-secondary',
              showError && !focused && 'text-red-500',
              !focused && !showError && !hasValue && 'text-gray-500'
            )}
          >
            {label}
          </label>

          {/* TextArea */}
          <textarea
            {...props}
            ref={ref}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              'block w-full resize-none rounded-lg bg-transparent px-3 text-base leading-normal text-gray-900',
              'focus:outline-hidden',
              hasValue || focused ? 'pb-2 pt-6' : 'pb-2 pt-4',
              className
            )}
          />
        </div>

        {/* Error Message */}
        {showError && <p className="mt-1.5 text-sm text-red-500">Bu alan zorunludur</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
