import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const Footer = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();

  const footerStyles = {
    backgroundColor: colors.card,
    borderTop: `1px solid ${colors.border}`,
    marginTop: 'auto',
  };

  const containerStyles = {
    maxWidth: '1536px',
    margin: '0 auto',
    padding: '3rem 2rem 2rem',
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  };

  const columnStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  };

  const titleStyles = {
    fontSize: '1rem',
    fontWeight: 700,
    fontFamily: '"Hubot Sans", sans-serif',
    color: colors.text,
    marginBottom: '0.5rem',
  };

  const linkStyles = {
    fontSize: '0.875rem',
    color: colors.text,
    opacity: 0.7,
    cursor: 'pointer',
    transition: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const bottomStyles = {
    borderTop: `1px solid ${colors.border}`,
    paddingTop: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  };

  const logoStyles = {
    fontSize: '1rem',
    fontWeight: 700,
    fontFamily: '"Hubot Sans", sans-serif',
    color: colors.text,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const socialLinksStyles = {
    display: 'flex',
    gap: '1rem',
  };

  const socialIconStyles = {
    width: '40px',
    height: '40px',
    borderRadius: '0.5rem',
    backgroundColor: colors.highlight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const copyrightStyles = {
    fontSize: '0.875rem',
    color: colors.text,
    opacity: 0.6,
    marginTop: '1rem',
    textAlign: 'center',
    width: '100%',
  };

  return (
    <footer style={footerStyles}>
      <div style={containerStyles}>
        <div style={gridStyles}>
          {/* Company */}
          <div style={columnStyles}>
            <h4 style={titleStyles}>Company</h4>
            <a
              style={linkStyles}
              onClick={() => navigate('/v2/about')}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
              About Us
            </a>
            <a
              style={linkStyles}
              onClick={() => navigate('/v2/contact')}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
              Contact
            </a>
            <a
              style={linkStyles}
              onClick={() => navigate('/v2/careers')}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
              Careers
            </a>
          </div>

          {/* Product */}
          <div style={columnStyles}>
            <h4 style={titleStyles}>Product</h4>
            <a
              style={linkStyles}
              onClick={() => navigate('/v2/pools')}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
              Pools
            </a>
            <a
              style={linkStyles}
              onClick={() => navigate('/v2/leagues')}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
              Leagues
            </a>
            <a
              style={linkStyles}
              onClick={() => navigate('/v2/betting')}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
              Betting
            </a>
            <a
              style={linkStyles}
              onClick={() => navigate('/v2/features')}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
              Features
            </a>
          </div>

          {/* Resources */}
          <div style={columnStyles}>
            <h4 style={titleStyles}>Resources</h4>
            <a
              style={linkStyles}
              onClick={() => navigate('/v2/help')}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
              Help Center
            </a>
            <a
              style={linkStyles}
              onClick={() => navigate('/v2/blog')}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
              Blog
            </a>
            <a
              style={linkStyles}
              onClick={() => navigate('/v2/guides')}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
              Guides
            </a>
            <a
              style={linkStyles}
              onClick={() => navigate('/v2/faq')}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
              FAQ
            </a>
          </div>

          {/* Legal */}
          <div style={columnStyles}>
            <h4 style={titleStyles}>Legal</h4>
            <a
              style={linkStyles}
              onClick={() => navigate('/v2/privacy')}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
              Privacy Policy
            </a>
            <a
              style={linkStyles}
              onClick={() => navigate('/v2/terms')}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
              Terms of Service
            </a>
            <a
              style={linkStyles}
              onClick={() => navigate('/v2/responsible-gaming')}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
              Responsible Gaming
            </a>
          </div>
        </div>

        <div style={bottomStyles}>
          <div style={logoStyles}>
            <img
              src="/assets/images/favicon.png"
              alt="GoatSportsPools"
              style={{ height: '32px', width: 'auto' }}
            />
            <span>GoatSportsPools</span>
          </div>

          <div style={socialLinksStyles}>
            {/* Twitter */}
            <div
              style={socialIconStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.brand.primary;
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.highlight;
                e.currentTarget.style.color = colors.text;
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </div>

            {/* Facebook */}
            <div
              style={socialIconStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.brand.primary;
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.highlight;
                e.currentTarget.style.color = colors.text;
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </div>

            {/* Instagram */}
            <div
              style={socialIconStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.brand.primary;
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.highlight;
                e.currentTarget.style.color = colors.text;
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </div>
          </div>
        </div>

        <div style={copyrightStyles}>
          © {new Date().getFullYear()} GOAT Sports Pools. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
