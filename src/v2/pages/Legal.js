import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Legal = () => {
  const { colors, isDark } = useTheme();

  const containerStyles = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '5rem 2rem',
  };

  const titleStyles = {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 800,
    fontFamily: '"Hubot Sans", sans-serif',
    marginBottom: '2rem',
    background: isDark
      ? 'linear-gradient(135deg, #FFF6ED 0%, #D47A3E 100%)'
      : 'linear-gradient(135deg, #1E1E1E 0%, #D47A3E 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const contentStyles = {
    fontSize: '1.125rem',
    lineHeight: 1.8,
    color: colors.text,
  };

  const cardStyles = {
    padding: '2rem',
    borderRadius: '1rem',
    backgroundColor: isDark ? 'rgba(30, 39, 54, 0.5)' : 'rgba(255, 255, 255, 0.8)',
    border: `1px solid ${colors.border}`,
    backdropFilter: 'blur(10px)',
  };

  return (
    <div style={containerStyles} className="v2-fade-in">
      <h1 style={titleStyles}>Legal</h1>
      <div style={cardStyles}>
        <p style={contentStyles}>
          OKRNG is a beta platform provided solely for entertainment purposes. OKRNG does not
          facilitate wagering, does not guarantee outcomes, and is not responsible for pool
          administration, payouts, disputes, errors, or losses. By using this site, you agree
          to do so at your own risk.
        </p>
      </div>
    </div>
  );
};

export default Legal;
