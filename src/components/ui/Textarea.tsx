'use client';

import React, { useState } from 'react';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxCharacters?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showCharCount = false,
      maxCharacters,
      className = '',
      id,
      disabled,
      value,
      onChange,
      maxLength,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = useState(
      typeof value === 'string' ? value.length : 0
    );

    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const max = maxCharacters || maxLength;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    const textareaBaseClasses =
      'w-full px-4 py-2.5 border-2 border-lw-border rounded-xl font-body text-base text-lw-charcoal placeholder-lw-warm-gray transition-all duration-200 resize-vertical';
    const textareaFocusClasses =
      'focus:outline-none focus:border-lw-blue-light focus:bg-lw-cream focus:shadow-sm';
    const textareaDisabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white';
    const textareaErrorClasses = error ? 'border-lw-red focus:border-lw-red' : '';

    const finalTextareaClass = `${textareaBaseClasses} ${textareaFocusClasses} ${textareaDisabledClasses} ${textareaErrorClasses} ${className}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-lw-charcoal mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          className={finalTextareaClass}
          value={value}
          onChange={handleChange}
          maxLength={max}
          {...props}
        />
        <div className="flex items-center justify-between mt-1.5">
          <div>
            {error && (
              <p className="text-sm text-lw-red font-medium">{error}</p>
            )}
            {helperText && !error && (
              <p className="text-sm text-lw-warm-gray">{helperText}</p>
            )}
          </div>
          {showCharCount && max && (
            <p className="text-sm text-lw-warm-gray">
              {charCount}/{max}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
