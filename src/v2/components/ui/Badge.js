import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Badge = ({
  children,
  variant = 'default', // default, primary, success, error, warning, info
  size = 'md', // sm, md, lg
  rounded = false,
  className = '',
  ...props
}) => {
  const { colors } = useTheme();

  const sizeStyles = {
    sm: {
      padding: '0.125rem 0.5rem',
      fontSize: '0.75rem',
    },
    md: {
      padding: '0.25rem 0.75rem',
      fontSize: '0.875rem',
    },
    lg: {
      padding: '0.375rem 1rem',
      fontSize: '1rem',
    },
  };

  const variantStyles = {
    default: {
      backgroundColor: colors.highlight,
      color: colors.text,
    },
    primary: {
      backgroundColor: colors.brand.primary,
      color: '#FFFFFF',
    },
    success: {
      backgroundColor: colors.success,
      color: '#FFFFFF',
    },
    error: {
      backgroundColor: colors.error,
      color: '#FFFFFF',
    },
    warning: {
      backgroundColor: colors.warning,
      color: '#FFFFFF',
    },
    info: {
      backgroundColor: colors.info,
      color: '#FFFFFF',
    },
  };

  const badgeStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Inter", sans-serif',
    fontWeight: 600,
    borderRadius: rounded ? '9999px' : '0.5rem',
    whiteSpace: 'nowrap',
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  return (
    <span style={badgeStyles} className={className} {...props}>
      {children}
    </span>
  );
};

export default Badge;
