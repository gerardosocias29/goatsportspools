import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import ThemeToggleButton from '../common/ThemeToggleButton';
import LuckyCoin, { LUCKY_RESULTS_KEY } from '../common/LuckyCoin';
import { useUserContext } from '../../contexts/UserContext';

const PublicHeader = () => {
  const location = useLocation();
  const { signOut, openUserProfile } = useClerk();
  const { user, clerkUser, loading, isSignedIn, isLoaded, getRoleLabel, isSuperadmin, isSquareAdmin } = useUserContext();

  const navItems = React.useMemo(() => {
    const base = [
      { label: 'Home', path: '/v4' },
      { label: 'Squares Pools', path: '/v4/pools' },
      { label: 'March Madness', path: '/v4/march-madness' },
    ];
    if (isSuperadmin || isSquareAdmin) {
      base.push({ label: 'Commissioner Dashboard', path: '/v4/commissioner-dashboard' });
      return base;
    }
    base.push({ label: 'Commissioner', path: '/v4/commissioner' });
    return base;
  }, [isSuperadmin, isSquareAdmin]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [luckyResults, setLuckyResults] = useState(() => {
    try {
      const saved = localStorage.getItem(LUCKY_RESULTS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === '/v4') return location.pathname === '/v4' || location.pathname === '/v4/';
    return location.pathname.startsWith(path);
  };

  const handleSignOut = () => {
    signOut(() => { window.location.href = '/v4'; });
  };

  const dashboardPath = isSuperadmin ? '/v4/admin' : '/dashboard';
  const avatarUrl = clerkUser?.imageUrl;
  const displayName = clerkUser?.firstName || user?.name || 'User';
  const roleLabel = getRoleLabel();

  return (
    <>
    <header
      className={`sticky top-0 z-[99999] w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md'
          : 'bg-white dark:bg-gray-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + I'm Feeling Lucky */}
          <div className="flex items-center gap-3">
            <Link to="/v4" className="flex items-center gap-2">
              <img src="/img/v2_logo.png" alt="OKRNG" className="h-9 w-auto" />
              <span className="hidden sm:block font-bold text-xl text-gray-900 dark:text-white">
                OKRNG
              </span>
            </Link>
            <LuckyCoin onResultsChange={setLuckyResults} />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 text-sm font-medium transition-colors group ${
                  isActive(item.path)
                    ? 'text-brand-500 dark:text-brand-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {item.label}
                {/* Active: solid underline */}
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-full" />
                )}
                {/* Hover: animated underline from center */}
                {!isActive(item.path) && (
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-brand-500/60 rounded-full transition-all duration-300 group-hover:w-full group-hover:left-0" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggleButton />

            {isLoaded && isSignedIn ? (
              <>
                {/* Dashboard Button — Superadmin only */}
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
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-8 h-8 rounded-full object-cover border-2 border-brand-500"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                        {displayName}
                      </div>
                      {loading ? (
                        <div className="h-3 w-16 mt-1 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      ) : (
                        <div className="text-xs font-medium text-brand-500 leading-tight">
                          {roleLabel}
                        </div>
                      )}
                    </div>
                    <svg className="hidden md:block w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 md:hidden">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{displayName}</div>
                        {loading ? (
                          <div className="h-3 w-16 mt-1 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        ) : (
                          <div className="text-xs text-brand-500 font-medium">{roleLabel}</div>
                        )}
                      </div>

                      {isSuperadmin && (
                        <a
                          href={dashboardPath}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Admin
                        </a>
                      )}

                      {isSuperadmin && (
                        <a
                          href="/v4/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Admin Panel
                        </a>
                      )}

                      <button
                        onClick={() => { setIsDropdownOpen(false); openUserProfile(); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Account Center
                      </button>

                      <Link
                        to="/v4/settings/payment"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Payment Settings
                      </Link>

                      <Link
                        to="/v4/settings/winnings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        My Winnings
                      </Link>

                      <hr className="my-1 border-gray-100 dark:border-gray-700" />

                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
                <Link
                  to="/v4/sign-in"
                  className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/v4/sign-up"
                  className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : null}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-brand-500 !text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <hr className="my-2 border-gray-200 dark:border-gray-700" />

              {isSignedIn ? (
                <>
                  {isSuperadmin && (
                    <a
                      href={dashboardPath}
                      className="px-4 py-3 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition-colors text-center"
                    >
                      Dashboard
                    </a>
                  )}
                  <button
                    onClick={() => { setIsMenuOpen(false); openUserProfile(); }}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    Account Center
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/v4/sign-in"
                    className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/v4/sign-up"
                    className="px-4 py-3 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition-colors text-center"
                  >
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
      <div className="sticky top-16 z-[99998] bg-[#1a1f2e] border-b border-brand-500/30 py-1 px-2 sm:px-4 flex justify-center">
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
