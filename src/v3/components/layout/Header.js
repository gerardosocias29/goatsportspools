import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Navigation items
  const navItems = [
    { label: 'Home', path: '/v3' },
    { label: 'Dashboard', path: '/v3/dashboard' },
    { label: 'Pools', path: '/v3/pools' },
    { label: 'Squares', path: '/v3/squares' },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/v3') {
      return location.pathname === '/v3' || location.pathname === '/v3/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-md'
          : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/v3" className="flex items-center gap-3">
            <img
              src="/img/v2_logo.png"
              alt="GOAT Sports Pools"
              className="h-10 w-auto"
            />
            <span className="hidden sm:block font-bold text-xl text-gray-900">
              GOAT Sports
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-brand-500 !text-white'
                    : '!text-gray-600 hover:!text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Sign In Button - Desktop */}
            <Link
              to="/sign-in"
              className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium !text-gray-600 hover:!text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sign In
            </Link>

            {/* Get Started Button - Desktop */}
            <Link
              to="/sign-up"
              className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors"
            >
              Get Started
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 bg-white">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-brand-500 !text-white'
                      : '!text-gray-600 hover:!text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <hr className="my-2 border-gray-200" />
              <Link
                to="/sign-in"
                className="px-4 py-3 rounded-lg text-sm font-medium !text-gray-600 hover:!text-gray-900 hover:bg-gray-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="px-4 py-3 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition-colors text-center"
              >
                Get Started
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
