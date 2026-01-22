import React from 'react';
import clsx from 'clsx';

/**
 * Label component for form fields
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.htmlFor]
 * @param {boolean} [props.required=false]
 * @param {string} [props.className]
 */
const Label = ({ children, htmlFor, required = false, className = '' }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx(
        'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5',
        className
      )}
    >
      {children}
      {required && <span className="text-error-500 ml-1">*</span>}
    </label>
  );
};

export default Label;
