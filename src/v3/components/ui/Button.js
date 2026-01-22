import React from 'react';
import clsx from 'clsx';

/**
 * Button component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'primary'|'outline'} [props.variant='primary']
 * @param {'sm'|'md'} [props.size='md']
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.fullWidth=false]
 * @param {string} [props.className]
 * @param {React.ReactNode} [props.startIcon]
 * @param {React.ReactNode} [props.endIcon]
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  className = '',
  startIcon,
  endIcon,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-4 py-3 text-sm',
    md: 'px-5 py-3.5 text-sm',
  };

  const variantClasses = {
    primary:
      'bg-brand-500 !text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300',
    outline:
      'bg-white !text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
  };

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        disabled && 'cursor-not-allowed',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {startIcon && <span className="flex-shrink-0">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex-shrink-0">{endIcon}</span>}
    </button>
  );
};

export default Button;
