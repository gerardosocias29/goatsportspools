import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import ThemeToggleButton from '../common/ThemeToggleButton';
import LuckyCoin, { LUCKY_RESULTS_KEY } from '../common/LuckyCoin';
import { useUserContext } from '../../contexts/UserContext';

const BROWN = '#D47A3E';
const GRAY = '#9ca3af';
const FONT = { fontFamily: "'Oswald', sans-serif" };
const STYLE_INACTIVE = { ...FONT, color: GRAY };
const STYLE_ACTIVE = { ...FONT, color: BROWN, textShadow: '0 0 8px rgba(212,122,62,0.35)' };

const PublicHeader = () => {
  const location = useLocation();
  const { signOut, openUserProfile } = useClerk();
  const { user, clerkUser, loading, isSignedIn, isLoaded, getRoleLabel, isSuperadmin, isSquareAdmin } = useUserContext();

  const navItems = React.useMemo(() => {
    const base = [
      { label: 'Home', path: '/' },
      {
        label: 'My Pools',
        dropdown: true,
        children: [
          { label: 'NBA Playoff Pool', path: '/playoffs' },
          { label: 'Squares Pool', path: '/pools' },
        ],
      },
      { label: 'Freeroll League', path: '/freeroll' },
      { label: 'Auction Madness', path: '/march-madness' },
    ];
    if (isSuperadmin || isSquareAdmin) {
      base.push({ label: 'Commissioner', path: '/commissioner-dashboard' });
      return base;
    }
    base.push({ label: 'Commissioner', path: '/commissioner' });
    return base;
  }, [isSuperadmin, isSquareAdmin]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPoolsOpen, setIsPoolsOpen] = useState(false);
  const [isMobilePoolsOpen, setIsMobilePoolsOpen] = useState(false);
  const [luckyResults, setLuckyResults] = useState(() => {
    try {
      const saved = localStorage.getItem(LUCKY_RESULTS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const dropdownRef = useRef(null);
  const poolsDropdownRef = useRef(null);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    setIsPoolsOpen(false);
    setIsMobilePoolsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (poolsDropdownRef.current && !poolsDropdownRef.current.contains(e.target)) {
        setIsPoolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleSignOut = () => {
    signOut(() => { window.location.href = '/'; });
  };

  const dashboardPath = isSuperadmin ? '/admin' : '/dashboard';
  const avatarUrl = clerkUser?.imageUrl;
  const displayName = clerkUser?.firstName || user?.name || 'User';
  const roleLabel = getRoleLabel();

  /* ═══════════════════════════════════════════════════
     POOLS DROPDOWN
     ═══════════════════════════════════════════════════ */
  const renderPoolsDropdown = (item) => {
    const childActive = item.children.some((c) => isActive(c.path));
    return (
      <div key={item.label} className="relative" ref={poolsDropdownRef}>
        <button
          onClick={() => setIsPoolsOpen(!isPoolsOpen)}
          className={`relative px-1 py-1 text-[15px] font-semibold uppercase tracking-[0.15em] transition-colors flex items-center gap-1 ${
            childActive ? '' : 'hover:text-white'
          }`}
          style={childActive ? STYLE_ACTIVE : STYLE_INACTIVE}
        >
          {item.label}
          <svg className={`w-3.5 h-3.5 transition-transform ${isPoolsOpen ? 'rotate-180' : ''} text-current`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {childActive && (
            <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-brand-500 rounded-full" />
          )}
        </button>
        {isPoolsOpen && (
          <div className="absolute left-0 mt-1 w-52 rounded-xl shadow-lg py-1.5 z-50 bg-[#0f1a35] border border-white/10">
            {item.children.map((child) => (
              <Link
                key={child.path}
                to={child.path}
                style={isActive(child.path) ? { ...FONT, color: BROWN } : { ...FONT, color: '#d1d5db' }}
                className={`block px-4 py-2.5 text-[14px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                  isActive(child.path)
                    ? 'bg-white/5'
                    : 'hover:text-white hover:bg-white/5'
                }`}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════
     DESKTOP NAV
     ═══════════════════════════════════════════════════ */
  const renderNav = () => (
    <nav className="hidden md:flex items-center gap-10 lg:gap-14">
      {navItems.map((item) => {
        if (item.dropdown) return renderPoolsDropdown(item);
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            style={active ? STYLE_ACTIVE : STYLE_INACTIVE}
            className={`relative px-1 py-1 text-[15px] font-semibold uppercase tracking-[0.15em] transition-colors ${
              active ? '' : 'hover:text-white'
            }`}
          >
            {item.label}
            {active && (
              <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-brand-500 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
    <header className="sticky top-0 z-[99999] w-full transition-all duration-300 bg-[#0a1128] shadow-lg">
      <div className="mx-auto max-w-full px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo + I'm Feeling Lucky */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <img src="/img/v2_logo.png" alt="OKRNG" className="h-11 w-auto" />
              <span
                className="hidden sm:block font-bold text-2xl text-white"
                style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: '0.05em' }}
              >
                OKRNG
              </span>
            </Link>
            <LuckyCoin onResultsChange={setLuckyResults} />
          </div>

          {/* Desktop Nav */}
          {renderNav()}

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggleButton />

            {isLoaded && isSignedIn ? (
              <>
                {isSuperadmin && (
                  <a
                    href={dashboardPath}
                    className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors shadow-sm"
                  >
                    Admin
                  </a>
                )}

                {/* Avatar + Name/Role Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-white/10"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover border-2 border-brand-500" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium leading-tight text-white">{displayName}</div>
                      {loading ? (
                        <div className="h-3 w-16 mt-1 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      ) : (
                        <div className="text-xs font-medium text-brand-500 leading-tight">{roleLabel}</div>
                      )}
                    </div>
                    {!loading && (
                      <span className="md:hidden text-[10px] font-semibold text-brand-500 leading-none">{roleLabel}</span>
                    )}
                    <svg className="hidden md:block w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0f1a35] border border-white/10 shadow-lg py-2 z-50" style={FONT}>
                      <div className="px-4 py-2 border-b border-white/10 md:hidden">
                        <div className="text-sm font-semibold text-white uppercase tracking-wide">{displayName}</div>
                        {loading ? (
                          <div className="h-3 w-16 mt-1 rounded bg-white/10 animate-pulse" />
                        ) : (
                          <div className="text-xs font-medium text-brand-500">{roleLabel}</div>
                        )}
                      </div>

                      {isSuperadmin && (
                        <a href={dashboardPath} className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wide text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Admin Panel
                        </a>
                      )}

                      <button
                        onClick={() => { setIsDropdownOpen(false); openUserProfile(); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wide text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Account Center
                      </button>

                      <Link to="/settings/payment" className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wide text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Payment Settings
                      </Link>

                      <Link to="/settings/winnings" className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wide text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        My Winnings
                      </Link>

                      <hr className="my-1 border-white/10" />

                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wide text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : isLoaded ? (
              <>
                <Link to="/sign-in" className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors text-gray-300 hover:text-white hover:bg-white/10">
                  Sign In
                </Link>
                <Link to="/sign-up" className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors">
                  Get Started
                </Link>
              </>
            ) : null}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors text-gray-300 hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) =>
                item.dropdown ? (
                  <div key={item.label}>
                    <button
                      onClick={() => setIsMobilePoolsOpen(!isMobilePoolsOpen)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        item.children.some((c) => isActive(c.path))
                          ? 'text-brand-500 bg-brand-500/10'
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{item.label}</span>
                      <svg className={`w-4 h-4 transition-transform ${isMobilePoolsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isMobilePoolsOpen && (
                      <div className="ml-4 mt-1 flex flex-col gap-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                              isActive(child.path)
                                ? 'bg-brand-500 !text-white'
                                : 'text-gray-300 hover:bg-white/10'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-brand-500 !text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
              <hr className="my-2 border-white/10" />

              {isSignedIn ? (
                <>
                  {isSuperadmin && (
                    <a href={dashboardPath} className="px-4 py-3 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition-colors text-center">
                      Dashboard
                    </a>
                  )}
                  <button
                    onClick={() => { setIsMenuOpen(false); openUserProfile(); }}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors text-left"
                  >
                    Account Center
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/sign-in" className="px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors">
                    Sign In
                  </Link>
                  <Link to="/sign-up" className="px-4 py-3 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition-colors text-center">
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>

    {/* Sports Betting Ticker — Results Bar */}
    {luckyResults && (
      <div className="sticky top-[72px] z-[99998] bg-[#1a1f2e] border-b border-brand-500/30 py-1 px-2 sm:px-4 flex justify-center">
        <div className="flex items-center justify-center w-full max-w-5xl gap-1 sm:gap-1.5">
          <div className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] min-w-0 sm:min-w-[60px]">
            <span className="text-[7px] sm:text-[8px] font-semibold text-brand-500 uppercase tracking-wider">#</span>
            <span className="text-[10px] sm:text-xs font-extrabold text-white font-mono">{luckyResults.num10}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/10 shrink-0" />
          <div className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] min-w-0 sm:min-w-[60px]">
            <span className="text-[7px] sm:text-[8px] font-semibold text-brand-500 uppercase tracking-wider hidden sm:inline">Color</span>
            <span className={`text-[10px] sm:text-xs font-extrabold font-mono ${luckyResults.color === 'Red' ? 'text-red-500' : 'text-gray-200'}`}>
              {luckyResults.color}
            </span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/10 shrink-0" />
          <div className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] min-w-0 sm:min-w-[60px]">
            <span className="text-[7px] sm:text-[8px] font-semibold text-brand-500 uppercase tracking-wider">
              <span className="sm:hidden">##</span>
              <span className="hidden sm:inline">Num</span>
            </span>
            <span className="text-[10px] sm:text-xs font-extrabold text-white font-mono">{luckyResults.num100}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/10 shrink-0" />
          <div className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] min-w-0 sm:min-w-[60px]">
            <span className="text-[7px] sm:text-[8px] font-semibold text-brand-500 uppercase tracking-wider">Flip</span>
            <span className={`text-[10px] sm:text-xs font-extrabold font-mono ${luckyResults.coin === 'Heads' ? 'text-green-500' : 'text-amber-400'}`}>
              <span className="sm:hidden">{luckyResults.coin === 'Heads' ? 'H' : 'T'}</span>
              <span className="hidden sm:inline">{luckyResults.coin}</span>
            </span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/10 shrink-0" />
          <div className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] min-w-0 sm:min-w-[60px]">
            <span className="text-[7px] sm:text-[8px] font-semibold text-brand-500 uppercase tracking-wider">
              <span className="sm:hidden">###</span>
              <span className="hidden sm:inline">Triple</span>
            </span>
            <span className="text-[10px] sm:text-xs font-extrabold text-white font-mono">{luckyResults.num1000}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/10 shrink-0" />
          <div className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-1.5 sm:px-3 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] min-w-0 sm:min-w-[60px]">
            <span className="text-[7px] sm:text-[8px] font-semibold text-brand-500 uppercase tracking-wider hidden sm:inline">Suit</span>
            <span className={`text-xs sm:text-sm font-extrabold ${(luckyResults.suit === '♥' || luckyResults.suit === '♦') ? 'text-red-500' : 'text-gray-200'}`}>
              {luckyResults.suit}
            </span>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default PublicHeader;
