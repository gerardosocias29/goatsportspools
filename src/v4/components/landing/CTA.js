import React from 'react';
import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-orange-500" />

      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to Start Your Pool?
        </h2>
        <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Trusted by sports fans for a smarter betting experience with OKRNG.
          Create your account in seconds and start inviting friends.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/v4/sign-up"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-brand-600 bg-white hover:bg-gray-100 rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            Create Free Account
          </Link>
          <Link
            to="/v4/pools"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl transition-all"
          >
            View Demo Pool
          </Link>
        </div>
        <p className="text-sm text-white/60 mt-6">
          No credit card required &middot; Free to start &middot; Cancel anytime
        </p>
      </div>
    </section>
  );
};

export default CTA;
