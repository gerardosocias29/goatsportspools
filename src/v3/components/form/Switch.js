import React from 'react';
import clsx from 'clsx';

/**
 * Toggle switch component
 * @param {Object} props
 * @param {boolean} props.checked
 * @param {Function} props.onChange
 * @param {string} [props.label]
 * @param {string} [props.description]
 * @param {boolean} [props.disabled=false]
 * @param {'sm'|'md'} [props.size='md']
 * @param {string} [props.className]
 */
const Switch = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className = '',
  id,
}) => {
  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: {
      track: 'w-9 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-4',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={clsx('flex items-start', className)}>
      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
          sizes.track,
          checked
            ? 'bg-brand-500'
            : 'bg-gray-200 dark:bg-gray-700',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={clsx(
            'inline-block rounded-full bg-white shadow transform transition duration-200 ease-in-out',
            sizes.thumb,
            'mt-0.5 ml-0.5',
            checked ? sizes.translate : 'translate-x-0'
          )}
        />
      </button>
      {(label || description) && (
        <div className="ml-3">
          {label && (
            <label
              htmlFor={switchId}
              className={clsx(
                'text-sm font-medium text-gray-900 dark:text-white',
                disabled && 'opacity-50'
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
        </div>
      )}
    </div>
  );
};

export default Switch;
