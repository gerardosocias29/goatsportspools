import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { UserButton, useUser } from '@clerk/clerk-react';
import Button from '../ui/Button';
import LuckyCoin from '../ui/LuckyCoin';

const LUCKY_RESULTS_KEY = 'okrng_lucky_results';

const Header = ({ user, onSignOut }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [luckyResults, setLuckyResults] = useState(() => {
    // Initialize from localStorage
    try {
      const saved = localStorage.getItem(LUCKY_RESULTS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Save to localStorage when results change
  const handleResultsChange = (newResults) => {
    setLuckyResults(newResults);
    try {
      localStorage.setItem(LUCKY_RESULTS_KEY, JSON.stringify(newResults));
    } catch (e) {
      console.error('Failed to save lucky results:', e);
    }
  };

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
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
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
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Modern hamburger line styles with animation support
  const getHamburgerLineStyles = (lineIndex) => {
    const baseStyles = {
      position: 'absolute',
      width: '22px',
      height: '2px',
      backgroundColor: colors.text,
      borderRadius: '2px',
      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    };

    if (showMobileMenu) {
      // X animation
      if (lineIndex === 0) {
        return { ...baseStyles, transform: 'rotate(45deg)', top: '50%', marginTop: '-1px' };
      } else if (lineIndex === 1) {
        return { ...baseStyles, opacity: 0, transform: 'scaleX(0)' };
      } else {
        return { ...baseStyles, transform: 'rotate(-45deg)', top: '50%', marginTop: '-1px' };
      }
    } else {
      // Hamburger
      if (lineIndex === 0) {
        return { ...baseStyles, top: '12px' };
      } else if (lineIndex === 1) {
        return { ...baseStyles, top: '50%', marginTop: '-1px' };
      } else {
        return { ...baseStyles, bottom: '12px' };
      }
    }
  };

  // Modern minimalist styles for the sticky results bar
  const resultsBarStyles = {
    position: 'sticky',
    top: '64px',
    left: 0,
    right: 0,
    // Solid background with gradient overlay - prevents content showing through
    background: isDark
      ? `#161C29 linear-gradient(135deg, rgba(22, 163, 74, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%)`
      : `#FAF6F2 linear-gradient(135deg, rgba(22, 163, 74, 0.06) 0%, rgba(34, 197, 94, 0.03) 100%)`,
    borderBottom: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(22, 163, 74, 0.15)'}`,
    padding: '5px 8px',
    zIndex: 1199,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <>
      <header style={headerStyles}>
        <div style={containerStyles}>
          {/* Logo and Lucky Coin */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={logoStyles} onClick={() => navigate('/')}>
              <img
                src="/img/v2_logo.png"
                alt="OKRNG"
                style={{ height: '32px', width: 'auto' }}
              />
              {!isMobile && <span>OKRNG</span>}
            </div>
            <LuckyCoin onResultsChange={handleResultsChange} />
          </div>

          {/* Desktop Navigation - Only show on desktop */}
          {!isMobile && (
            <nav style={{ ...navStylesDesktop, display: 'flex' }}>
              <a style={navLinkStyles} href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                Home
              </a>
              <a style={navLinkStyles} href="/pools" onClick={(e) => { e.preventDefault(); navigate('/pools'); }}>
                Pools
              </a>
              <a style={navLinkStyles} href="/leagues" onClick={(e) => { e.preventDefault(); navigate('/leagues'); }}>
                Freeroll League
              </a>
              <a style={navLinkStyles} href="/betting" onClick={(e) => { e.preventDefault(); navigate('/betting'); }}>
                Auction Madness
              </a>
              {isSignedIn && (
                <a style={navLinkStyles} href="/squares/admin" onClick={(e) => { e.preventDefault(); navigate('/squares/admin'); }}>
                  Commissioner
                </a>
              )}
              {isSignedIn && user?.role_id == 1 && (
                <a style={navLinkStyles} href="/admin/settings" onClick={(e) => { e.preventDefault(); navigate('/admin/settings'); }}>
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
                style={mobileMenuButtonStyles}
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                aria-label="Toggle menu"
              >
                <span style={getHamburgerLineStyles(0)} />
                <span style={getHamburgerLineStyles(1)} />
                <span style={getHamburgerLineStyles(2)} />
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

            {/* User Menu with Clerk UserButton - Desktop only */}
            {!isMobile && isSignedIn && (
              <div className="flex items-center gap-4">
                {isLoaded && clerkUser && (
                  <p className="select-none" style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: colors.text
                  }}>
                    {clerkUser.fullName}
                  </p>
                )}
                <UserButton
                  afterSignOutUrl='/sign-in'
                  appearance={{
                    elements: {
                      userButtonPopoverActionButton__manageAccount: {
                        display: 'none',
                      },
                    },
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Action
                      label="Notifications"
                      labelIcon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      }
                      onClick={() => navigate('/notifications')}
                    />
                    <UserButton.Action
                      label="Promotions"
                      labelIcon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="8" width="18" height="14" rx="2" ry="2" />
                          <path d="M12 8V3" />
                          <path d="M8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
                          <path d="M12 12v4" />
                        </svg>
                      }
                      onClick={() => navigate('/promotions')}
                    />
                    <UserButton.Action
                      label="Account Center"
                      labelIcon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="7" r="4" />
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        </svg>
                      }
                      open="user-profile"
                    />
                    <UserButton.Action label="signOut" />
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            )}

            {/* Sign In button - Desktop only when not signed in */}
            {!isMobile && !isSignedIn && (
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
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
                setShowMobileMenu(false);
              }}
            >
              Home
            </a>
            <a
              style={navLinkStyles}
              href="/pools"
              onClick={(e) => {
                e.preventDefault();
                navigate('/pools');
                setShowMobileMenu(false);
              }}
            >
              Pools
            </a>
            <a
              style={navLinkStyles}
              href="/leagues"
              onClick={(e) => {
                e.preventDefault();
                navigate('/leagues');
                setShowMobileMenu(false);
              }}
            >
              Freeroll League
            </a>
            <a
              style={navLinkStyles}
              href="/betting"
              onClick={(e) => {
                e.preventDefault();
                navigate('/betting');
                setShowMobileMenu(false);
              }}
            >
              Auction Madness
            </a>
            {isSignedIn && (user?.role_id == 1 || user?.role_id == 2) && (
              <a
                style={navLinkStyles}
                href="/squares/admin"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/squares/admin');
                  setShowMobileMenu(false);
                }}
              >
                Commissioner
              </a>
            )}

            {/* Divider */}
            <div style={{
              height: '1px',
              backgroundColor: colors.border,
              margin: '0.5rem 0',
            }} />

            {/* User section in mobile menu */}
            {isSignedIn ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.25rem 0',
              }}>
                <UserButton
                  afterSignOutUrl='/sign-in'
                  appearance={{
                    elements: {
                      userButtonPopoverActionButton__manageAccount: {
                        display: 'none',
                      },
                    },
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Action
                      label="Notifications"
                      labelIcon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      }
                      onClick={() => { navigate('/notifications'); setShowMobileMenu(false); }}
                    />
                    <UserButton.Action
                      label="Promotions"
                      labelIcon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="8" width="18" height="14" rx="2" ry="2" />
                          <path d="M12 8V3" />
                          <path d="M8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
                          <path d="M12 12v4" />
                        </svg>
                      }
                      onClick={() => { navigate('/promotions'); setShowMobileMenu(false); }}
                    />
                    <UserButton.Action
                      label="Account Center"
                      labelIcon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="7" r="4" />
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        </svg>
                      }
                      open="user-profile"
                    />
                    <UserButton.Action label="signOut" />
                  </UserButton.MenuItems>
                </UserButton>
                {isLoaded && clerkUser && (
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: colors.text,
                  }}>
                    {clerkUser.fullName}
                  </span>
                )}
              </div>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => { navigate('/sign-in'); setShowMobileMenu(false); }}
                style={{ width: '100%' }}
              >
                Sign In
              </Button>
            )}
          </div>
        )}
      </header>

      {/* Sticky Lucky Results Bar - always shows when results exist (persisted in localStorage) */}
      {luckyResults && (
        <div style={{
          ...resultsBarStyles,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: isMobile ? '100%' : '1180px',
            gap: isMobile ? '4px' : '0',
          }}>
            {/* Result item style for equal distribution */}
            {(() => {
              const itemStyle = {
                flex: isMobile ? 1 : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '4px 2px' : '4px 12px',
                borderRadius: '6px',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                minWidth: isMobile ? '0' : '44px',
              };
              const textStyle = {
                fontSize: isMobile ? '10px' : '12px',
                fontWeight: 700,
                color: colors.text,
                whiteSpace: 'nowrap',
              };
              return (
                <>
                  {/* 1-10 */}
                  <div style={itemStyle}>
                    <span style={textStyle}>{luckyResults.num10}</span>
                  </div>

                  {/* Color */}
                  <div style={itemStyle}>
                    <span style={{ ...textStyle, color: luckyResults.colorHex }}>{luckyResults.color}</span>
                  </div>

                  {/* 0-99 */}
                  <div style={itemStyle}>
                    <span style={textStyle}>{luckyResults.num100}</span>
                  </div>

                  {/* Coin */}
                  <div style={itemStyle}>
                    <span style={textStyle}>{luckyResults.coin}</span>
                  </div>

                  {/* 0-999 */}
                  <div style={itemStyle}>
                    <span style={textStyle}>{luckyResults.num1000}</span>
                  </div>

                  {/* Suit */}
                  <div style={itemStyle}>
                    <span style={{ ...textStyle, fontSize: isMobile ? '14px' : '16px', color: luckyResults.suitColor }}>{luckyResults.suit}</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
