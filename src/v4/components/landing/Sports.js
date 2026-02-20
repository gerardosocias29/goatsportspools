import React from 'react';

const sports = [
  {
    emoji: '\uD83C\uDFC8',
    name: 'NFL Football',
    description: 'Weekly games & Super Bowl',
    bg: 'bg-brand-100 dark:bg-brand-900/30',
  },
  {
    emoji: '\uD83C\uDFC0',
    name: 'NBA Basketball',
    description: 'Regular season & Playoffs',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
  },
  {
    emoji: '\uD83C\uDFC0',
    name: 'NCAA Basketball',
    description: 'March Madness & tournaments',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
];

const Sports = () => {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Text */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              All Your Favorite Sports
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Whether it's the Super Bowl, March Madness, or NBA Finals — we've got you covered.
              Create pools for any game, any sport, any time.
            </p>
            <div className="space-y-4">
              {sports.map((sport) => (
                <div key={sport.name} className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${sport.bg} rounded-xl flex items-center justify-center`}>
                    <span className="text-2xl">{sport.emoji}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{sport.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{sport.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Decorative grid */}
          <div className="relative">
            <div className="grid grid-cols-5 gap-2">
              {[...Array(25)].map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-lg transition-all duration-300 hover:scale-105 ${
                    [3, 7, 11, 13, 17, 21].includes(i)
                      ? 'bg-gradient-to-br from-brand-500 to-orange-500 shadow-lg shadow-brand-500/20'
                      : 'bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sports;
