import React from 'react';
import clsx from 'clsx';

/**
 * Card component for content containers
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {boolean} [props.hoverable=false]
 * @param {boolean} [props.bordered=false]
 * @param {'none'|'sm'|'md'|'lg'} [props.padding='md']
 */
const Card = ({
  children,
  className = '',
  hoverable = false,
  bordered = false,
  padding = 'md',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-2xl shadow-theme-sm',
        hoverable && 'hover:shadow-theme-md transition-shadow cursor-pointer',
        bordered && 'border border-gray-200 dark:border-gray-700',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

// Card subcomponents for composition
Card.Header = ({ children, className = '' }) => (
  <div
    className={clsx(
      'pb-4 border-b border-gray-200 dark:border-gray-700',
      className
    )}
  >
    {children}
  </div>
);

Card.Title = ({ children, className = '' }) => (
  <h3 className={clsx('text-lg font-semibold text-gray-900 dark:text-white', className)}>
    {children}
  </h3>
);

Card.Description = ({ children, className = '' }) => (
  <p className={clsx('text-sm text-gray-500 dark:text-gray-400 mt-1', className)}>
    {children}
  </p>
);

Card.Body = ({ children, className = '' }) => (
  <div className={clsx('py-4', className)}>{children}</div>
);

Card.Footer = ({ children, className = '' }) => (
  <div
    className={clsx(
      'pt-4 border-t border-gray-200 dark:border-gray-700',
      className
    )}
  >
    {children}
  </div>
);

export default Card;
