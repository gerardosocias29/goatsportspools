import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { UserButton, useUser } from '@clerk/clerk-react';
import Button from '../ui/Button';

const Header = ({ user, onSignOut }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const headerStyles = {
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    height: '64px',
    backgroundColor: colors.card,
    borderBottom: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    zIndex: 1200,
    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const containerStyles = {
    maxWidth: '1536px',
    margin: '0 auto',
    padding: '0 2rem',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const logoStyles = {
    fontSize: '1rem',
    fontWeight: 700,
    fontFamily: '"Hubot Sans", sans-serif',
    color: colors.text,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const navStyles = {
    display: 'none',
    alignItems: 'center',
    gap: '2rem',
  };

  const navStylesDesktop = {
    alignItems: 'center',
    gap: '2rem',
  };

  const navLinkStyles = {
    fontSize: '1rem',
    fontWeight: 500,
    color: colors.text,
    cursor: 'pointer',
    transition: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    padding: '0.5rem 0',
    position: 'relative',
  };

  // Add window width detection for mobile
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const rightSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  };

  // Removed unused styles: themeToggleStyles, userMenuStyles, menuItemStyles

  const mobileMenuButtonStyles = {
    width: '40px',
    height: '40px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    flexDirection: 'column',
    gap: '0.25rem',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const hamburgerLineStyles = {
    width: '24px',
    height: '2px',
    backgroundColor: colors.text,
    borderRadius: '2px',
    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <header style={headerStyles}>
      <div style={containerStyles}>
        {/* Logo */}
        <div style={logoStyles} onClick={() => navigate('/')}>
          <img
            src="/img/v2_logo.png"
            alt="OKRNG"
            style={{ height: '32px', width: 'auto' }}
          />
          <span>OKRNG</span>
        </div>

        {/* Desktop Navigation - Only show on desktop */}
        {!isMobile && (
          <nav style={{ ...navStylesDesktop, display: 'flex' }}>
            <a style={navLinkStyles} onClick={() => navigate('/')}>
              Home
            </a>
            <a style={navLinkStyles} onClick={() => navigate('/pools')}>
              Pools
            </a>
            <a style={navLinkStyles} onClick={() => navigate('/leagues')}>
              Freeroll League
            </a>
            <a style={navLinkStyles} onClick={() => navigate('/betting')}>
              Auction Madness
            </a>
            {isSignedIn && (user?.role_id === 1 || user?.role_id === 2) && (
              <a style={navLinkStyles} onClick={() => navigate('/squares/admin')}>
                Commissioner
              </a>
            )}
            {isSignedIn && user?.role_id === 1 && (
              <a style={navLinkStyles} onClick={() => navigate('/admin/settings')}>
                Admin
              </a>
            )}
          </nav>
        )}

        {/* Right Section */}
        <div style={rightSectionStyles}>
          {/* Mobile Menu Button - Shows on mobile, hides on desktop */}
          {isMobile && (
            <button
              style={{ ...mobileMenuButtonStyles, display: 'flex' }}
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle menu"
            >
              <span style={hamburgerLineStyles} />
              <span style={hamburgerLineStyles} />
              <span style={hamburgerLineStyles} />
            </button>
          )}

          {/* Theme Toggle - Temporarily commented out */}
          {/* <button
            style={themeToggleStyles}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button> */}

          {/* User Menu with Clerk UserButton */}
          {isSignedIn && (
            <div className="flex items-center gap-4">
              {isLoaded && clerkUser && (
                <p className="select-none hidden lg:block" style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: colors.text
                }}>
                  {clerkUser.fullName}
                </p>
              )}
              <UserButton afterSignOutUrl='/sign-in' />
            </div>
          )}

          {!isSignedIn && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="primary" size="md" onClick={() => navigate('/sign-in')}>
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay - Shows when hamburger is clicked on mobile */}
      {showMobileMenu && (
        <div
          style={{
            position: 'absolute',
            top: '64px',
            left: 0,
            right: 0,
            backgroundColor: colors.card,
            borderBottom: `1px solid ${colors.border}`,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '1rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            zIndex: 1100,
          }}
        >
          <a
            style={navLinkStyles}
            onClick={() => {
              navigate('/');
              setShowMobileMenu(false);
            }}
          >
            Home
          </a>
          <a
            style={navLinkStyles}
            onClick={() => {
              navigate('/pools');
              setShowMobileMenu(false);
            }}
          >
            Pools
          </a>
          <a
            style={navLinkStyles}
            onClick={() => {
              navigate('/leagues');
              setShowMobileMenu(false);
            }}
          >
            Freeroll League
          </a>
          <a
            style={navLinkStyles}
            onClick={() => {
              navigate('/betting');
              setShowMobileMenu(false);
            }}
          >
            Auction Madness
          </a>
          {isSignedIn && (user?.role_id === 1 || user?.role_id === 2) && (
            <a
              style={navLinkStyles}
              onClick={() => {
                navigate('/squares/admin');
                setShowMobileMenu(false);
              }}
            >
              Commissioner
            </a>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
