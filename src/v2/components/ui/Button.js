import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Button = ({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'md', // sm, md, lg, xl
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const { colors } = useTheme();

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontFamily: '"Inter", sans-serif',
    fontWeight: 600,
    borderRadius: '0.75rem',
    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    border: 'none',
    outline: 'none',
    width: fullWidth ? '100%' : 'auto',
  };

  const sizeStyles = {
    sm: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      height: '2rem',
    },
    md: {
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      height: '2.75rem',
    },
    lg: {
      padding: '1rem 2rem',
      fontSize: '1.125rem',
      height: '3.5rem',
    },
    xl: {
      padding: '1.25rem 2.5rem',
      fontSize: '1.25rem',
      height: '4rem',
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: colors.brand.primary,
      color: '#FFFFFF',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
    secondary: {
      backgroundColor: colors.brand.secondary,
      color: '#FFFFFF',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.brand.primary,
      border: `2px solid ${colors.brand.primary}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.text,
    },
    danger: {
      backgroundColor: colors.error,
      color: '#FFFFFF',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
  };

  const hoverStyles = {
    primary: {
      backgroundColor: colors.brand.primaryHover,
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    secondary: {
      backgroundColor: colors.brand.secondaryHover,
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    outline: {
      backgroundColor: `${colors.brand.primary}10`,
    },
    ghost: {
      backgroundColor: colors.highlight,
    },
    danger: {
      backgroundColor: '#DC2626',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const buttonStyle = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(isHovered && !disabled && !loading ? hoverStyles[variant] : {}),
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={buttonStyle}
      className={className}
      {...props}
    >
      {loading && (
        <svg
          className="v2-pulse"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
};

export default Button;
