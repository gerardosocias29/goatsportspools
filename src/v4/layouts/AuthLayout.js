import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import ThemeToggleButton from '../components/common/ThemeToggleButton';

const AuthLayout = () => {
  return (
    <div className="relative flex min-h-screen bg-white dark:bg-gray-900">
      {/* Left — Form content */}
      <div className="flex flex-col justify-center w-full px-6 py-12 lg:w-1/2 sm:px-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <Outlet />
        </div>
      </div>

      {/* Right — Branded panel (hidden on mobile) */}
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-brand-500 via-brand-600 to-orange-600 overflow-hidden">
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative z-10 text-center px-12">
          <img src="/img/okrng.png" alt="OKRNG" className="h-24 w-auto mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">
            Welcome to OKRNG
          </h2>
          <p className="text-lg text-white/80 max-w-sm mx-auto">
            The ultimate platform for sports pools, fantasy leagues, and social betting. Join thousands of players competing for glory.
          </p>
        </div>
      </div>

      {/* Theme toggle — bottom right */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggleButton />
      </div>
    </div>
  );
};

export default AuthLayout;
