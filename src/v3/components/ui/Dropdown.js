import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

/**
 * Dropdown component for menus and select-like interfaces
 * @param {Object} props
 * @param {React.ReactNode} props.trigger - The trigger element
 * @param {React.ReactNode} props.children - Dropdown content
 * @param {'left'|'right'} [props.align='left']
 * @param {string} [props.className]
 * @param {boolean} [props.closeOnItemClick=true]
 */
const Dropdown = ({
  trigger,
  children,
  align = 'left',
  className = '',
  closeOnItemClick = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleItemClick = () => {
    if (closeOnItemClick) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={clsx(
            'absolute z-50 mt-2 min-w-[200px] py-2 bg-white dark:bg-gray-800 rounded-xl shadow-theme-lg border border-gray-200 dark:border-gray-700',
            align === 'left' ? 'left-0' : 'right-0',
            className
          )}
          onClick={handleItemClick}
        >
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Dropdown item component
 */
Dropdown.Item = ({
  children,
  icon,
  onClick,
  disabled = false,
  danger = false,
  className = '',
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={clsx(
      'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
      'hover:bg-gray-50 dark:hover:bg-gray-700/50',
      disabled && 'opacity-50 cursor-not-allowed',
      danger
        ? 'text-error-600 dark:text-error-400'
        : 'text-gray-700 dark:text-gray-300',
      className
    )}
  >
    {icon && <span className="flex-shrink-0">{icon}</span>}
    {children}
  </button>
);

/**
 * Dropdown divider
 */
Dropdown.Divider = () => (
  <hr className="my-2 border-gray-200 dark:border-gray-700" />
);

/**
 * Dropdown header/label
 */
Dropdown.Label = ({ children, className = '' }) => (
  <div
    className={clsx(
      'px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider',
      className
    )}
  >
    {children}
  </div>
);

export default Dropdown;
