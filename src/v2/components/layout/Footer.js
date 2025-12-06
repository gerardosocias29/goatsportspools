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
    padding: '2rem',
  };

  const bottomStyles = {
    // borderTop: `1px solid ${colors.border}`,
    // paddingTop: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    // flexWrap: 'wrap',
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
    width: '208px',
  };

  const navLinksStyles = {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    flex: 1,
  };

  const navLinkStyles = {
    fontSize: '0.875rem',
    color: colors.brand.primary,
    opacity: 1,
    cursor: 'pointer',
    transition: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    textDecoration: 'none',
  };

  const socialLinksStyles = {
    display: 'flex',
    gap: '1rem',
    width: '208px',
    // justifyContent: 'flex-end',
  };

  const socialIconStyles = {
    color: '#d47a3e',
    cursor: 'pointer',
    transition: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
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
        <div style={bottomStyles} className='lg:flex-row flex-col'>
          <div style={logoStyles} className='flex lg:justify-start justify-center'>
            <img
              src="/img/v2_logo.png"
              alt="OKRNG"
              style={{ height: '32px', width: 'auto' }}
            />
            <span>OKRNG</span>
          </div>

          <div style={navLinksStyles}>
            <a
              style={navLinkStyles}
              onClick={() => navigate('/')}
              className='hover:font-bold'
            >
              Home
            </a>
            <a
              style={navLinkStyles}
              onClick={() => navigate('/about')}
              className='hover:font-bold'
            >
              About Us
            </a>
            <a
              style={navLinkStyles}
              onClick={() => navigate('/legal')}
              className='hover:font-bold'
            >
              Legal
            </a>
            <a
              style={navLinkStyles}
              onClick={() => navigate('/help')}
              className='hover:font-bold'
            >
              Help
            </a>
            <a
              style={navLinkStyles}
              onClick={() => navigate('/faq')}
              className='hover:font-bold'
            >
              FAQ
            </a>
          </div>

          <div style={socialLinksStyles} className='flex lg:justify-end justify-center'>
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              style={socialIconStyles}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              style={socialIconStyles}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            {/* Twitter/X */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              style={socialIconStyles}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              style={socialIconStyles}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          </div>
        </div>
{/* 
        <div style={copyrightStyles}>
          © {new Date().getFullYear()} OKRNG. All rights reserved.
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
