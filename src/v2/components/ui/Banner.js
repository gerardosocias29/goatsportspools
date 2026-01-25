import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Banner Component
 * A reusable banner for displaying announcements, promotions, and alerts
 *
 * @param {string} title - The banner title
 * @param {string} description - The banner description
 * @param {string} icon - Emoji or icon to display (default: none)
 * @param {string} variant - Color variant: 'primary', 'success', 'warning', 'info', 'promo' (default: 'primary')
 * @param {boolean} dismissible - Whether the banner can be dismissed (default: false)
 * @param {function} onDismiss - Callback when banner is dismissed
 * @param {React.ReactNode} action - Optional action button/element
 * @param {object} style - Additional custom styles
 */
const Banner = ({
  title,
  description,
  icon,
  variant = 'primary',
  dismissible = false,
  onDismiss,
  action,
  style = {},
  children,
}) => {
  const { colors, isDark } = useTheme();

  // Variant color configurations
  const variantStyles = {
    primary: {
      background: isDark
        ? `linear-gradient(135deg, ${colors.brand.primary}20 0%, ${colors.brand.primary}10 100%)`
        : `linear-gradient(135deg, ${colors.brand.primary}15 0%, ${colors.brand.primary}08 100%)`,
      border: `1px solid ${colors.brand.primary}40`,
      titleColor: isDark ? colors.text : colors.brand.primary,
      descColor: isDark ? `${colors.text}CC` : colors.text,
    },
    success: {
      background: isDark
        ? `linear-gradient(135deg, ${colors.success}20 0%, ${colors.success}10 100%)`
        : `linear-gradient(135deg, ${colors.success}15 0%, ${colors.success}08 100%)`,
      border: `1px solid ${colors.success}40`,
      titleColor: isDark ? colors.text : colors.success,
      descColor: isDark ? `${colors.text}CC` : colors.text,
    },
    warning: {
      background: isDark
        ? `linear-gradient(135deg, ${colors.warning}20 0%, ${colors.warning}10 100%)`
        : `linear-gradient(135deg, ${colors.warning}15 0%, ${colors.warning}08 100%)`,
      border: `1px solid ${colors.warning}40`,
      titleColor: isDark ? colors.text : '#92400E',
      descColor: isDark ? `${colors.text}CC` : colors.text,
    },
    info: {
      background: isDark
        ? `linear-gradient(135deg, ${colors.info}20 0%, ${colors.info}10 100%)`
        : `linear-gradient(135deg, ${colors.info}15 0%, ${colors.info}08 100%)`,
      border: `1px solid ${colors.info}40`,
      titleColor: isDark ? colors.text : colors.info,
      descColor: isDark ? `${colors.text}CC` : colors.text,
    },
    promo: {
      background: isDark
        ? `linear-gradient(135deg, #F59E0B30 0%, ${colors.brand.primary}25 100%)`
        : `linear-gradient(135deg, #FCD34D 0%, #FB923C 100%)`,
      border: isDark ? '1px solid #F59E0B40' : 'none',
      titleColor: isDark ? colors.text : '#1E1E1E',
      descColor: isDark ? `${colors.text}CC` : '#374151',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;

  const bannerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem 1.5rem',
    borderRadius: '0.75rem',
    background: currentVariant.background,
    border: currentVariant.border,
    position: 'relative',
    boxShadow: isDark
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    ...style,
  };

  const iconStyles = {
    fontSize: '2.5rem',
    lineHeight: 1,
    flexShrink: 0,
  };

  const contentStyles = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyles = {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: currentVariant.titleColor,
    margin: 0,
    marginBottom: description ? '0.25rem' : 0,
  };

  const descriptionStyles = {
    fontSize: '1rem',
    color: currentVariant.descColor,
    margin: 0,
    lineHeight: 1.5,
  };

  const dismissButtonStyles = {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '0.25rem',
    color: currentVariant.descColor,
    fontSize: '1.25rem',
    lineHeight: 1,
    opacity: 0.7,
    transition: 'opacity 150ms ease',
  };

  const actionContainerStyles = {
    flexShrink: 0,
  };

  return (
    <div style={bannerStyles}>
      {icon && <div style={iconStyles}>{icon}</div>}

      <div style={contentStyles}>
        {title && <h3 style={titleStyles}>{title}</h3>}
        {description && <p style={descriptionStyles}>{description}</p>}
        {children}
      </div>

      {action && <div style={actionContainerStyles}>{action}</div>}

      {dismissible && (
        <button
          style={dismissButtonStyles}
          onClick={onDismiss}
          onMouseEnter={(e) => (e.target.style.opacity = '1')}
          onMouseLeave={(e) => (e.target.style.opacity = '0.7')}
          aria-label="Dismiss banner"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Banner;
