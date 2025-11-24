import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useAgencyConfig } from '../../../context/AgencyConfigProvider';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  showSuccess?: boolean;
  disabled?: boolean;
  hideSuccessIndicator?: boolean;
  sx?: React.CSSProperties;
  searchable?: boolean;
}

const CustomSelect = ({
  label,
  options,
  value,
  onChange,
  required,
  error,
  placeholder = 'Seçiniz',
  showSuccess,
  disabled = false,
  hideSuccessIndicator = false,
  sx,
  searchable = false,
}: CustomSelectProps) => {
  const { theme: { primaryColor } } = useAgencyConfig();
  const hexToRgb = (hex: string): string | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
      : null;
  };
  const primaryRgb = hexToRgb(primaryColor);
  const ringColor = primaryRgb ? `rgba(${primaryRgb}, 0.2)` : undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [modified, setModified] = useState(false);
  const [userModified, setUserModified] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);
  const hasValue = Boolean(value && value !== '' && selectedOption);

  // Türkçe karakter dönüşümü için özel fonksiyon
  const toTurkishUpperCase = (text: string): string => {
    return text
      .replace(/ı/g, 'I')
      .replace(/i/g, 'İ')
      .replace(/ş/g, 'Ş')
      .replace(/ğ/g, 'Ğ')
      .replace(/ü/g, 'Ü')
      .replace(/ö/g, 'Ö')
      .replace(/ç/g, 'Ç')
      .toUpperCase();
  };

  // Arama yapılabilir seçenekleri filtrele - Türkçe karakter duyarlı arama
  const filteredOptions = searchable && searchTerm
    ? options.filter(option => 
        toTurkishUpperCase(option.label).includes(toTurkishUpperCase(searchTerm))
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocused(false);
        setTouched(true);
        setSearchTerm(''); // Dropdown kapanınca arama terimini temizle
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dropdown açıldığında arama inputuna odaklan
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, searchable]);

  useEffect(() => {
    if (hasValue) {
      setModified(true);
    }
  }, [value, hasValue]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setTouched(true);
    setModified(true);
    setUserModified(true);
    setSearchTerm(''); // Seçim yapıldığında arama terimini temizle
  };

  const showError = touched && modified && required && !value;
  // Only show success if explicitly set or if the field has a value and user has modified it
  const shouldShowSuccess = showSuccess || (hasValue && userModified && !hideSuccessIndicator);
  const errorMessage = error || 'Bu alan zorunludur';

  return (
    <div className="relative" ref={containerRef} style={sx}>
      <div
        className={cn(
          'relative rounded-lg border transition-all duration-200',
          showError && !focused && 'border-red-500',
          shouldShowSuccess && 'border-green-500',
          !showError && !shouldShowSuccess && !focused && 'border-gray-300',
          disabled && 'cursor-not-allowed bg-gray-50 opacity-60'
        )}
        style={{
          height: '56px', // Sabit yükseklik
          ...(focused
            ? { borderColor: primaryColor, boxShadow: ringColor ? `0 0 0 2px ${ringColor}` : undefined }
            : {})
        }}
      >
        <label
          className={cn(
            'pointer-events-none absolute left-3 transition-all duration-200',
            hasValue || focused || isOpen
              ? 'top-2.5 text-[10px]'
              : 'top-1/2 -translate-y-1/2 text-base',
            showError && !focused && 'text-red-500',
            shouldShowSuccess && !focused && 'text-green-500',
            !focused && !showError && !shouldShowSuccess && !hasValue && 'text-gray-500'
          )}
          style={focused ? { color: primaryColor } : undefined}
        >
          {label}
        </label>

        <button
          type="button"
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen);
              setFocused(!isOpen);
            }
          }}
          disabled={disabled}
          className={cn(
            'flex w-full items-center justify-between text-left h-full',
            'focus:outline-hidden',
            hasValue || focused || isOpen ? 'px-3 pb-2 pt-6' : 'px-3 py-3.5',
            disabled && 'cursor-not-allowed opacity-60 pointer-events-none'
          )}
        >
          <span className={cn(
            !hasValue && 'text-gray-400 opacity-0',
            hasValue && 'text-gray-900 opacity-100',
            disabled && 'text-gray-400'
          )}>
            {hasValue ? selectedOption?.label : placeholder}
          </span>
          <ChevronDown className={cn(
            "h-5 w-5 text-gray-400",
            disabled && "opacity-50"
          )} />
        </button>

        {isOpen && !disabled && (
          <div
            className="absolute left-0 right-0 z-50 mt-1 max-h-60 rounded-md border border-gray-200 bg-white shadow-lg"
            style={{ minWidth: '100%' }}
          >
            {searchable && (
              <div className="border-b border-gray-200 p-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(toTurkishUpperCase(e.target.value))}
                  placeholder="Ara..."
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none uppercase"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <div className="max-h-48 overflow-auto py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      'cursor-pointer px-3 py-2 hover:bg-blue-50',
                      value === option.value && 'bg-blue-50 text-blue-600',
                      disabled && 'cursor-not-allowed opacity-50'
                    )}
                    onClick={() => !disabled && handleSelect(option.value)}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  Sonuç bulunamadı
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showError && (
        <p className="mt-1 text-sm text-red-500">{errorMessage || 'Bu alan zorunludur'}</p>
      )}
    </div>
  );
};

export default CustomSelect;
