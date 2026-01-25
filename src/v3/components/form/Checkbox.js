import React, { forwardRef } from 'react';
import clsx from 'clsx';

/**
 * Checkbox component
 * @param {Object} props
 * @param {boolean} [props.checked]
 * @param {Function} [props.onChange]
 * @param {string} [props.label]
 * @param {string} [props.description]
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.error]
 * @param {string} [props.className]
 */
const Checkbox = forwardRef(({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx('flex items-start', className)}>
      <div className="flex items-center h-5">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={clsx(
            'w-4 h-4 rounded border-gray-300 dark:border-gray-600',
            'text-brand-500 focus:ring-brand-500 focus:ring-2',
            'dark:bg-gray-800 dark:checked:bg-brand-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-error-500'
          )}
          {...props}
        />
      </div>
      {(label || description) && (
        <div className="ml-3">
          {label && (
            <label
              htmlFor={checkboxId}
              className={clsx(
                'text-sm font-medium text-gray-900 dark:text-white',
                disabled && 'opacity-50 cursor-not-allowed',
                error && 'text-error-500'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={clsx(
              'text-sm text-gray-500 dark:text-gray-400',
              disabled && 'opacity-50'
            )}>
              {description}
            </p>
          )}
          {error && (
            <p className="text-sm text-error-500 mt-1">{error}</p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
