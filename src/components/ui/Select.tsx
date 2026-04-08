'use client';

import React from 'react';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const selectBaseClasses =
      'w-full px-4 py-2.5 border-2 border-lw-border rounded-xl font-body text-base text-lw-charcoal transition-all duration-200 appearance-none cursor-pointer bg-white bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%234a7fb5\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")] bg-no-repeat bg-right-4 pr-10';
    const selectFocusClasses =
      'focus:outline-none focus:border-lw-blue-light focus:shadow-sm';
    const selectDisabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : '';
    const selectErrorClasses = error ? 'border-lw-red focus:border-lw-red' : '';

    const finalSelectClass = `${selectBaseClasses} ${selectFocusClasses} ${selectDisabledClasses} ${selectErrorClasses} ${className}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-lw-charcoal mb-2"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={finalSelectClass}
          {...props}
        >
          {placeholder && (
            <option value="" disabled selected>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-lw-red font-medium">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-lw-warm-gray">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
