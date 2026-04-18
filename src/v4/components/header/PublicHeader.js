import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggleButton from '../common/ThemeToggleButton';
import LuckyCoin, { LUCKY_RESULTS_KEY } from '../common/LuckyCoin';
import { useUserContext } from '../../contexts/UserContext';

const PublicHeader = () => {
  const location = useLocation();
  const { signOut, openUserProfile } = useClerk();
  const { user, clerkUser, loading, isSignedIn, isLoaded, getRoleLabel, isSuperadmin, isSquareAdmin } = useUserContext();

  const navItems = React.useMemo(() => {
    const base = [
      { label: 'Home', path: '/' },
      {
        label: 'Pools',
        dropdown: true,
        children: [
          { label: 'Squares Pools', path: '/pools', description: 'Classic box pools for any game' },
          { label: 'NBA Playoffs', path: '/playoffs', description: 'Draft teams for the post-season' },
        ],
      },
      { label: 'March Madness', path: '/march-madness' },
    ];
    if (isSuperadmin || isSquareAdmin) {
      base.push({ label: 'Commissioner Dashboard', path: '/commissioner-dashboard' });
      return base;
    }
    base.push({ label: 'Commissioner', path: '/commissioner' });
    return base;
  }, [isSuperadmin, isSquareAdmin]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPoolsOpen, setIsPoolsOpen] = useState(false);
  const [luckyResults, setLuckyResults] = useState(() => {
    try {
      const saved = localStorage.getItem(LUCKY_RESULTS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const dropdownRef = useRef(null);
  const poolsDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    setIsPoolsOpen(false);
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
    const handleBlur = () => {
      setIsDropdownOpen(false);
      setIsPoolsOpen(false);
      setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('blur', handleBlur);
    };
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

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[99999] transition-all duration-500 py-2 ${isScrolled
          ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-2xl shadow-black/5'
          : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 bg-brand-500 blur-xl opacity-0 group-hover:opacity-30 transition-opacity" />
                  <img src="/img/v2_logo.png" alt="OKRNG" className="h-auto w-full relative z-10 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="hidden sm:block font-outfit font-black text-2xl tracking-tighter text-gray-900 dark:text-white uppercase leading-none">
                  OK<span className="text-brand-500">RNG</span>
                </span>
              </Link>
              <div className="hidden lg:block">
                <LuckyCoin onResultsChange={setLuckyResults} />
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-md p-1 rounded-2xl border border-white/20 dark:border-gray-700/30">
              {navItems.map((item) =>
                item.dropdown ? (
                  <div
                    key={item.label}
                    className="relative"
                    ref={poolsDropdownRef}
                    onMouseEnter={() => setIsPoolsOpen(true)}
                    onMouseLeave={() => setIsPoolsOpen(false)}
                  >
                    <button
                      onClick={() => setIsPoolsOpen(!isPoolsOpen)}
                      className={`relative px-5 py-2 text-sm font-semibold transition-all flex items-center gap-1.5 rounded-xl ${item.children.some((c) => isActive(c.path))
                        ? 'text-brand-500 bg-white dark:bg-gray-900 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                      {item.label}
                      <motion.svg
                        animate={{ rotate: isPoolsOpen ? 180 : 0 }}
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </motion.svg>
                    </button>

                    <AnimatePresence>
                      {isPoolsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-2 z-50 overflow-hidden"
                        >
                          <div className="bg-gray-50/50 dark:bg-gray-800/50 p-3 mb-2 rounded-xl">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Available Pools</h4>
                          </div>
                          {item.children.map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={() => setIsPoolsOpen(false)}
                              className={`flex flex-col gap-0.5 px-4 py-3 rounded-xl transition-all ${isActive(child.path)
                                ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            >
                              <span className="text-sm font-bold">{child.label}</span>
                              <span className="text-[11px] opacity-60 font-medium">{child.description}</span>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-5 py-2 text-sm font-semibold transition-all rounded-xl ${isActive(item.path)
                      ? 'text-brand-500 bg-white dark:bg-gray-900 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl border border-white/20 dark:border-gray-700/30">
                <ThemeToggleButton />
              </div>

              {isLoaded && isSignedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2.5 pl-1 pr-3 py-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl border border-white/20 dark:border-gray-700/30 hover:border-brand-500/30 transition-all group"
                  >
                    <div className="relative">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="w-9 h-9 rounded-xl object-cover border-2 border-white dark:border-gray-900 shadow-sm"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-sm font-black shadow-sm">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[100px]">
                        {displayName}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-brand-500">
                        {roleLabel}
                      </div>
                    </div>
                    <motion.svg
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-64 rounded-3xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] p-2 z-50"
                      >
                        <div className="px-4 py-4 mb-2 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Signed in as</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{displayName}</p>
                          <div className="mt-2 inline-flex px-2 py-0.5 bg-brand-500/10 text-brand-500 text-[10px] font-bold rounded-full uppercase tracking-widest">
                            {roleLabel}
                          </div>
                        </div>

                        <div className="space-y-1">
                          {isSuperadmin && (
                            <Link
                              to={dashboardPath}
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl transition-all"
                            >
                              <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              Admin Control
                            </Link>
                          )}

                          <button
                            onClick={() => { setIsDropdownOpen(false); openUserProfile(); }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            Profile Hub
                          </button>

                          <Link
                            to="/settings/payment"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            </div>
                            Billing
                          </Link>
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                            </div>
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : isLoaded ? (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/sign-in"
                    className="hidden sm:inline-flex px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-brand-500 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/sign-up"
                    className="inline-flex px-6 py-2.5 text-sm font-bold !text-white bg-brand-500 hover:bg-brand-600 rounded-2xl shadow-lg shadow-brand-500/25 transition-all hover:scale-105 active:scale-95"
                  >
                    Join OKRNG
                  </Link>
                </div>
              ) : null}

              {/* Mobile Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden w-11 h-11 flex items-center justify-center rounded-2xl bg-gray-100/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-white transition-all active:scale-90"
              >
                <div className="w-5 h-4 relative flex flex-col justify-between">
                  <span className={`w-full h-0.5 bg-current rounded-full transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                  <span className={`w-full h-0.5 bg-current rounded-full transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
                  <span className={`w-full h-0.5 bg-current rounded-full transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100000] bg-white dark:bg-gray-950 p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <img src="/img/v2_logo.png" alt="OKRNG" className="h-10 w-auto object-contain" />
                <span className="font-outfit font-black text-2xl tracking-tighter text-gray-900 dark:text-white uppercase leading-none">
                  OK<span className="text-brand-500">RNG</span>
                </span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <div key={item.label} className="flex flex-col">
                  {item.dropdown ? (
                    <>
                      <div className="px-6 py-4 pb-1 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 font-outfit">Pools & Leagues</div>
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`px-6 py-3 rounded-2xl text-xl font-black transition-colors font-outfit ${isActive(child.path)
                            ? 'text-brand-500 bg-brand-500/5'
                            : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
                            }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-6 py-3 rounded-2xl text-xl font-black transition-colors font-outfit ${isActive(item.path)
                        ? 'text-brand-500 bg-brand-500/5'
                        : 'text-gray-900 dark:text-white'
                        }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            <div className="mt-auto pt-8 flex flex-col gap-4">
              {!isSignedIn && (
                <>
                  <Link
                    to="/sign-up"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full py-5 rounded-3xl bg-brand-500 text-white text-center text-xl font-black shadow-xl shadow-brand-500/25"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/sign-in"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full py-4 rounded-3xl bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white text-center text-lg font-black"
                  >
                    Sign In
                  </Link>
                </>
              )}
              <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-900 rounded-3xl">
                <span className="text-sm font-bold text-gray-500 font-outfit tracking-tight">Appearance</span>
                <ThemeToggleButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacing for fixed header and ticker */}
      {/* <div className={luckyResults ? 'h-[136px]' : 'h-20'} /> */}

      {/* Lucky Ticker Redesign */}
      {luckyResults && (
        <div className="fixed top-[61px] left-0 right-0 z-[99998] px-4 pb-4">
          <div className="max-w-4xl mx-auto overflow-hidden bg-gray-900/90 dark:bg-black/80 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl flex items-center h-10 divide-x divide-white/10">
            <div className="flex-1 flex items-center justify-around px-4">
              <TickerItem label="#" value={luckyResults.num10} />
              <TickerItem label="Color" value={luckyResults.color} color={luckyResults.color === 'Red' ? 'text-red-500' : 'text-blue-400'} />
              <TickerItem label="Num" value={luckyResults.num100} />
              <TickerItem label="Flip" value={luckyResults.coin} color={luckyResults.coin === 'Heads' ? 'text-green-500' : 'text-amber-400'} />
              <TickerItem label="Triple" value={luckyResults.num1000} />
              <TickerItem label="Suit" value={luckyResults.suit} color={(luckyResults.suit === '♥' || luckyResults.suit === '♦') ? 'text-red-500' : 'text-white'} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const TickerItem = ({ label, value, color = "text-white" }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-[8px] font-black uppercase tracking-widest text-white/30 font-outfit">{label}</span>
    <span className={`text-xs font-black font-mono tracking-tighter ${color}`}>{value}</span>
  </div>
);

export default PublicHeader;
