import React from 'react';

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required = false,
  placeholder = 'Select option...',
  className = '',
  disabled = false,
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={name} className="text-xs font-semibold text-slate-700 tracking-wide">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm px-3.5 py-2.5 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-500 ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''
        } ${className}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && <span className="text-xs font-medium text-rose-500">{error}</span>}
    </div>
  );
};

export default Select;
