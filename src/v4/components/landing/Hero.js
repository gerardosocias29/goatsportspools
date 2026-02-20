import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-white dark:bg-gray-900">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-brand-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />

      {/* Glowing orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-700 text-brand-600 dark:text-brand-400 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            We will facilitate your Super Bowl Squares here for FREE
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            <span className="text-gray-900 dark:text-white">Elevate Your</span>
            <br />
            <span className="bg-gradient-to-r from-brand-500 via-brand-600 to-orange-500 bg-clip-text text-transparent">
              Sports Betting
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">Experience</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Join the ultimate platform for sports pools, fantasy leagues, and social betting.
            <br className="hidden sm:block" />
            Compete with friends, track your wins, and become a champion.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/v4/sign-up"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold !text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-xl transition-all shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5"
            >
              Get Started Free
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/v4/pools"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold !text-white bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl transition-all shadow-sm"
            >
              Browse Pools
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
