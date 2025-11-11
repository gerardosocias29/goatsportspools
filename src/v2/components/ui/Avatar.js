import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Avatar = ({
  src,
  alt = 'Avatar',
  size = 'md', // xs, sm, md, lg, xl, 2xl
  fallback,
  status, // online, offline, busy, away
  className = '',
  ...props
}) => {
  const { colors } = useTheme();
  const [imageError, setImageError] = React.useState(false);

  const sizeMap = {
    xs: '1.5rem',
    sm: '2rem',
    md: '2.5rem',
    lg: '3rem',
    xl: '4rem',
    '2xl': '5rem',
  };

  const fontSizeMap = {
    xs: '0.625rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.75rem',
    '2xl': '2.25rem',
  };

  const statusSizeMap = {
    xs: '0.375rem',
    sm: '0.5rem',
    md: '0.625rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.25rem',
  };

  const statusColors = {
    online: colors.success,
    offline: '#9CA3AF',
    busy: colors.error,
    away: colors.warning,
  };

  const avatarStyles = {
    width: sizeMap[size],
    height: sizeMap[size],
    borderRadius: '50%',
    backgroundColor: colors.brand.primary,
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: fontSizeMap[size],
    fontWeight: 600,
    fontFamily: '"Inter", sans-serif',
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
  };

  const statusStyles = status
    ? {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: statusSizeMap[size],
        height: statusSizeMap[size],
        borderRadius: '50%',
        backgroundColor: statusColors[status],
        border: `2px solid ${colors.background}`,
      }
    : null;

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div style={avatarStyles} className={className} {...props}>
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <span>{fallback || getInitials(alt)}</span>
      )}
      {status && <div style={statusStyles} />}
    </div>
  );
};

// Avatar Group Component
export const AvatarGroup = ({
  children,
  max = 3,
  size = 'md',
  className = '',
  ...props
}) => {
  const { colors } = useTheme();
  const childArray = React.Children.toArray(children);
  const displayChildren = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  const sizeMap = {
    xs: '1.5rem',
    sm: '2rem',
    md: '2.5rem',
    lg: '3rem',
    xl: '4rem',
    '2xl': '5rem',
  };

  const fontSizeMap = {
    xs: '0.625rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.75rem',
    '2xl': '2.25rem',
  };

  const groupStyles = {
    display: 'flex',
    alignItems: 'center',
    marginLeft: '-0.5rem',
  };

  const avatarWrapperStyles = {
    marginLeft: '-0.5rem',
    border: `2px solid ${colors.background}`,
    borderRadius: '50%',
  };

  const remainingStyles = {
    width: sizeMap[size],
    height: sizeMap[size],
    borderRadius: '50%',
    backgroundColor: colors.highlight,
    color: colors.text,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: fontSizeMap[size],
    fontWeight: 600,
    fontFamily: '"Inter", sans-serif',
    marginLeft: '-0.5rem',
    border: `2px solid ${colors.background}`,
  };

  return (
    <div style={groupStyles} className={className} {...props}>
      {displayChildren.map((child, index) => (
        <div key={index} style={avatarWrapperStyles}>
          {React.cloneElement(child, { size })}
        </div>
      ))}
      {remainingCount > 0 && (
        <div style={remainingStyles}>+{remainingCount}</div>
      )}
    </div>
  );
};

export default Avatar;
