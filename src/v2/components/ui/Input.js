import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  size = 'md', // sm, md, lg
  className = '',
  ...props
}) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);

  const sizeStyles = {
    sm: {
      height: '2rem',
      fontSize: '0.875rem',
      padding: icon ? (iconPosition === 'left' ? '0.5rem 0.75rem 0.5rem 2.5rem' : '0.5rem 2.5rem 0.5rem 0.75rem') : '0.5rem 0.75rem',
    },
    md: {
      height: '2.75rem',
      fontSize: '1rem',
      padding: icon ? (iconPosition === 'left' ? '0.75rem 1rem 0.75rem 3rem' : '0.75rem 3rem 0.75rem 1rem') : '0.75rem 1rem',
    },
    lg: {
      height: '3.5rem',
      fontSize: '1.125rem',
      padding: icon ? (iconPosition === 'left' ? '1rem 1.25rem 1rem 3.5rem' : '1rem 3.5rem 1rem 1.25rem') : '1rem 1.25rem',
    },
  };

  const inputStyles = {
    width: fullWidth ? '100%' : 'auto',
    fontFamily: '"Inter", sans-serif',
    borderRadius: '0.75rem',
    border: error
      ? `2px solid ${colors.error}`
      : isFocused
      ? `2px solid ${colors.brand.primary}`
      : `1px solid ${colors.border}`,
    backgroundColor: isDark ? colors.card : '#FFFFFF',
    color: colors.text,
    outline: 'none',
    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    ...sizeStyles[size],
  };

  const labelStyles = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    color: colors.text,
  };

  const helperTextStyles = {
    fontSize: '0.75rem',
    marginTop: '0.25rem',
    color: error ? colors.error : colors.text,
    opacity: error ? 1 : 0.6,
  };

  const iconStyles = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [iconPosition]: size === 'sm' ? '0.75rem' : size === 'lg' ? '1.25rem' : '1rem',
    color: colors.text,
    opacity: 0.5,
    pointerEvents: 'none',
  };

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto' }} className={className}>
      {label && (
        <label style={labelStyles}>
          {label}
          {required && <span style={{ color: colors.error, marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && <div style={iconStyles}>{icon}</div>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          style={inputStyles}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <div style={helperTextStyles}>{error || helperText}</div>
      )}
    </div>
  );
};

// Textarea Component
export const Textarea = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = false,
  rows = 4,
  className = '',
  ...props
}) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);

  const textareaStyles = {
    width: fullWidth ? '100%' : 'auto',
    fontFamily: '"Inter", sans-serif',
    fontSize: '1rem',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: error
      ? `2px solid ${colors.error}`
      : isFocused
      ? `2px solid ${colors.brand.primary}`
      : `1px solid ${colors.border}`,
    backgroundColor: isDark ? colors.card : '#FFFFFF',
    color: colors.text,
    outline: 'none',
    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    resize: 'vertical',
    minHeight: '100px',
  };

  const labelStyles = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    color: colors.text,
  };

  const helperTextStyles = {
    fontSize: '0.75rem',
    marginTop: '0.25rem',
    color: error ? colors.error : colors.text,
    opacity: error ? 1 : 0.6,
  };

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto' }} className={className}>
      {label && (
        <label style={labelStyles}>
          {label}
          {required && <span style={{ color: colors.error, marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        rows={rows}
        style={textareaStyles}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {(error || helperText) && (
        <div style={helperTextStyles}>{error || helperText}</div>
      )}
    </div>
  );
};

export default Input;
