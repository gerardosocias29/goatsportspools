import React, { forwardRef } from 'react';
import clsx from 'clsx';
import Label from './Label';

/**
 * Input field component with label and error support
 * @param {Object} props
 * @param {string} [props.type='text']
 * @param {string} [props.label]
 * @param {string} [props.placeholder]
 * @param {string} [props.error]
 * @param {string} [props.hint]
 * @param {boolean} [props.required=false]
 * @param {boolean} [props.disabled=false]
 * @param {React.ReactNode} [props.startIcon]
 * @param {React.ReactNode} [props.endIcon]
 * @param {string} [props.className]
 */
const InputField = forwardRef(({
  type = 'text',
  label,
  placeholder,
  error,
  hint,
  required = false,
  disabled = false,
  startIcon,
  endIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
      )}
      <div className="relative">
        {startIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {startIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={clsx(
            'w-full rounded-lg border bg-white dark:bg-gray-800 px-4 py-2.5 text-sm transition-colors',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
            'disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed',
            error
              ? 'border-error-500 text-error-600 dark:text-error-400'
              : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white',
            startIcon && 'pl-10',
            endIcon && 'pr-10'
          )}
          {...props}
        />
        {endIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {endIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-error-500">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{hint}</p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;
