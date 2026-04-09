import React from 'react';
import { Link } from 'react-router-dom';

const FreerollLeague = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Freeroll League
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Free-to-play NFL fantasy league is coming back! Compete against friends with zero entry fee.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
        <div className="text-6xl mb-6">🏈</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          Coming Soon — NFL 2026 Season
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Our freeroll league from 2024 is making a comeback. Stay tuned for registration details.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default FreerollLeague;
