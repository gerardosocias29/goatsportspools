import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Card = ({
  children,
  hover = true,
  padding = 'md', // none, sm, md, lg, xl
  glass = false,
  className = '',
  onClick,
  ...props
}) => {
  const { colors, isDark } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);

  const paddingStyles = {
    none: '0',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '2.5rem',
  };

  const baseStyles = {
    borderRadius: '1rem',
    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    padding: paddingStyles[padding],
    cursor: onClick ? 'pointer' : 'default',
  };

  const cardStyles = glass
    ? {
        background: isDark
          ? 'rgba(30, 39, 54, 0.5)'
          : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      }
    : {
        backgroundColor: colors.card,
        boxShadow: isDark
          ? '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)'
          : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      };

  const hoverStyles =
    hover && isHovered
      ? {
          transform: 'translateY(-2px)',
          backgroundColor: glass ? undefined : colors.cardHover,
          boxShadow: isDark
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }
      : {};

  const combinedStyles = {
    ...baseStyles,
    ...cardStyles,
    ...hoverStyles,
  };

  return (
    <div
      style={combinedStyles}
      className={className}
      onClick={onClick}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header Component
export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div
      style={{
        marginBottom: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(211, 201, 194, 0.3)',
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Title Component
export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3
      style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        margin: 0,
      }}
      className={className}
      {...props}
    >
      {children}
    </h3>
  );
};

// Card Description Component
export const CardDescription = ({ children, className = '', ...props }) => {
  const { colors } = useTheme();

  return (
    <p
      style={{
        fontSize: '0.875rem',
        color: colors.text,
        opacity: 0.7,
        marginTop: '0.25rem',
      }}
      className={className}
      {...props}
    >
      {children}
    </p>
  );
};

// Card Footer Component
export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div
      style={{
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid rgba(211, 201, 194, 0.3)',
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
