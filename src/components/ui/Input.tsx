'use client';

import React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      iconPosition = 'left',
      helperText,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputBaseClasses =
      'w-full px-4 py-2.5 border-2 border-lw-border rounded-xl font-body text-base text-lw-charcoal placeholder-lw-warm-gray transition-all duration-200';
    const inputFocusClasses =
      'focus:outline-none focus:border-lw-blue-light focus:bg-lw-cream focus:shadow-sm';
    const inputDisabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white';
    const inputErrorClasses = error ? 'border-lw-red focus:border-lw-red' : '';

    const finalInputClass = `${inputBaseClasses} ${inputFocusClasses} ${inputDisabledClasses} ${inputErrorClasses} ${className}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-lw-charcoal mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && iconPosition === 'left' && (
            <span className="absolute left-3 text-lw-warm-gray pointer-events-none flex items-center">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`${finalInputClass} ${
              icon && iconPosition === 'left' ? 'pl-10' : ''
            } ${icon && iconPosition === 'right' ? 'pr-10' : ''}`}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <span className="absolute right-3 text-lw-warm-gray pointer-events-none flex items-center">
              {icon}
            </span>
          )}
        </div>
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

Input.displayName = 'Input';

export default Input;
