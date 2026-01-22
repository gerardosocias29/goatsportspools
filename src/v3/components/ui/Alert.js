import React from 'react';
import clsx from 'clsx';

/**
 * Alert component for displaying messages
 * @param {Object} props
 * @param {'success'|'error'|'warning'|'info'} [props.variant='info']
 * @param {string} props.title
 * @param {string} [props.message]
 * @param {React.ReactNode} [props.children]
 * @param {boolean} [props.dismissible=false]
 * @param {Function} [props.onDismiss]
 * @param {string} [props.className]
 */
const Alert = ({
  variant = 'info',
  title,
  message,
  children,
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const variantConfig = {
    success: {
      container: 'border-success-500 bg-success-50 dark:bg-success-500/10',
      icon: 'text-success-500',
      title: 'text-success-800 dark:text-success-400',
      message: 'text-success-700 dark:text-success-300',
    },
    error: {
      container: 'border-error-500 bg-error-50 dark:bg-error-500/10',
      icon: 'text-error-500',
      title: 'text-error-800 dark:text-error-400',
      message: 'text-error-700 dark:text-error-300',
    },
    warning: {
      container: 'border-warning-500 bg-warning-50 dark:bg-warning-500/10',
      icon: 'text-warning-500',
      title: 'text-warning-800 dark:text-warning-400',
      message: 'text-warning-700 dark:text-warning-300',
    },
    info: {
      container: 'border-info-500 bg-info-50 dark:bg-info-500/10',
      icon: 'text-info-500',
      title: 'text-info-800 dark:text-info-400',
      message: 'text-info-700 dark:text-info-300',
    },
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const config = variantConfig[variant];

  return (
    <div
      className={clsx(
        'relative rounded-xl border-l-4 p-4',
        config.container,
        className
      )}
      role="alert"
    >
      <div className="flex">
        <div className={clsx('flex-shrink-0', config.icon)}>
          {icons[variant]}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={clsx('text-sm font-semibold', config.title)}>
              {title}
            </h3>
          )}
          {message && (
            <p className={clsx('mt-1 text-sm', config.message)}>
              {message}
            </p>
          )}
          {children}
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={clsx(
              'ml-3 flex-shrink-0 rounded-md p-1.5 inline-flex transition-colors',
              'hover:bg-black/5 dark:hover:bg-white/10',
              config.icon
            )}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
