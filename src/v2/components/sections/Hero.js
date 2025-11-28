import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../ui/Button';

const Hero = () => {
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();

  const heroStyles = {
    position: 'relative',
    overflow: 'hidden',
    paddingTop: '5rem',
    paddingBottom: '5rem',
  };

  const containerStyles = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 2rem',
    position: 'relative',
    zIndex: 1,
  };

  const contentStyles = {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
  };

  const badgeStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    backgroundColor: isDark ? 'rgba(212, 122, 62, 0.1)' : 'rgba(212, 122, 62, 0.1)',
    border: `1px solid ${colors.brand.primary}30`,
    color: colors.brand.primary,
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '2rem',
  };

  const headingStyles = {
    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
    fontWeight: 800,
    fontFamily: '"Hubot Sans", sans-serif',
    // lineHeight: 1.1,
    marginBottom: '1.5rem',
    background: isDark
      ? 'linear-gradient(135deg, #FFF6ED 0%, #D47A3E 100%)'
      : 'linear-gradient(135deg, #1E1E1E 0%, #D47A3E 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const descriptionStyles = {
    fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
    lineHeight: 1.6,
    color: colors.text,
    opacity: 0.8,
    marginBottom: '3rem',
  };

  const ctaContainerStyles = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  };

  const statsContainerStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
    marginTop: '5rem',
    padding: '3rem 2rem',
    borderRadius: '1.5rem',
    backgroundColor: isDark ? 'rgba(30, 39, 54, 0.5)' : 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${colors.border}`,
  };

  const statStyles = {
    textAlign: 'center',
  };

  const statValueStyles = {
    fontSize: '2.5rem',
    fontWeight: 800,
    fontFamily: '"Hubot Sans", sans-serif',
    color: colors.brand.primary,
    marginBottom: '0.5rem',
  };

  const statLabelStyles = {
    fontSize: '1rem',
    color: colors.text,
    opacity: 0.7,
  };

  // Background decorations
  const decorationStyles = {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(100px)',
    opacity: isDark ? 0.15 : 0.1,
    pointerEvents: 'none',
  };

  const decoration1Styles = {
    ...decorationStyles,
    width: '500px',
    height: '500px',
    background: colors.brand.primary,
    top: '-250px',
    right: '-250px',
  };

  const decoration2Styles = {
    ...decorationStyles,
    width: '400px',
    height: '400px',
    background: colors.brand.secondary,
    bottom: '-200px',
    left: '-200px',
  };

  return (
    <section style={heroStyles}>
      {/* Background Decorations */}
      <div style={decoration1Styles} />
      <div style={decoration2Styles} />

      <div style={containerStyles}>
        <div style={contentStyles} className="v2-fade-in">
          {/* Badge */}
          <div style={badgeStyles}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span>Trusted by thousands of sports fans</span>
          </div>

          {/* Main Heading */}
          <h1 style={headingStyles}>
            Elevate Your Sports Betting Experience
          </h1>

          {/* Description */}
          <p style={descriptionStyles}>
            Join the ultimate platform for sports pools, fantasy leagues, and social betting.
            Compete with friends, track your wins, and become the GOAT.
          </p>

          {/* CTA Buttons */}
          <div style={ctaContainerStyles}>
            <Button
              variant="primary"
              size="xl"
              onClick={() => navigate('/sign-up')}
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => navigate('/demo')}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              }
            >
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div style={statsContainerStyles} className="v2-glass">
            <div style={statStyles}>
              <div style={statValueStyles}>10K+</div>
              <div style={statLabelStyles}>Active Users</div>
            </div>

            <div style={statStyles}>
              <div style={statValueStyles}>$2M+</div>
              <div style={statLabelStyles}>Pool Prizes</div>
            </div>

            <div style={statStyles}>
              <div style={statValueStyles}>50+</div>
              <div style={statLabelStyles}>Active Leagues</div>
            </div>

            <div style={statStyles}>
              <div style={statValueStyles}>99.9%</div>
              <div style={statLabelStyles}>Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
