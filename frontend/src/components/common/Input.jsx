import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  required = false,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={name} className="text-xs font-semibold text-slate-700 tracking-wide">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm px-3.5 py-2.5 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-500 ${
            Icon ? 'pl-10' : ''
          } ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs font-medium text-rose-500">{error}</span>}
    </div>
  );
};

export default Input;
