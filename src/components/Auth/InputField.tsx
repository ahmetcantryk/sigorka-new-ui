interface InputFieldProps {
  icon: React.ReactNode;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  type?: string;
  showPassword?: boolean;
  inputMode?: string;
  required?: boolean;
}

const InputField = ({
  icon,
  label,
  name,
  value,
  onChange,
  placeholder,
  maxLength,
  className = '',
  type = 'text',
  showPassword = false,
  inputMode,
  required = false,
}: InputFieldProps) => {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
          {icon}
        </div>
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          name={name}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          inputMode={inputMode}
          placeholder={placeholder}
          className="block w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          required={required}
        />
      </div>
    </div>
  );
};

export default InputField;
