import React from 'react';

const features = [
  {
    title: 'Football Squares',
    description: 'Classic 10x10 grid pools with automated payouts and real-time score tracking. Perfect for game day parties.',
    gradient: 'from-brand-500 to-orange-500',
    shadow: 'shadow-brand-500/20',
    /* 3 squares: #1 top-left, #3 bottom-left, #2 centered-right */
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <rect x="2" y="2" width="8.5" height="8.5" rx="2" />
        <rect x="2" y="13.5" width="8.5" height="8.5" rx="2" />
        <rect x="13.5" y="7.75" width="8.5" height="8.5" rx="2" />
        <path d="M10.5 6.25h3" strokeDasharray="1.5 1.5" opacity="0.5" />
        <path d="M10.5 17.75h3" strokeDasharray="1.5 1.5" opacity="0.5" />
      </svg>
    ),
  },
  {
    title: 'Private Leagues',
    description: 'Create custom leagues with friends, family, or coworkers. Set your own rules and prizes.',
    gradient: 'from-green-500 to-emerald-500',
    shadow: 'shadow-green-500/20',
    /* Shield with trophy cup — protected competition */
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 8.5h6v3.5a3 3 0 01-6 0V8.5z" />
        <path d="M9 9.5H7.5a1 1 0 01-1-1v0a1.5 1.5 0 011.5-1.5H9" />
        <path d="M15 9.5h1.5a1 1 0 001-1v0A1.5 1.5 0 0016 7h-1" />
        <line x1="12" y1="14" x2="12" y2="16" />
        <path d="M10 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Live Auctions',
    description: 'Real-time March Madness team auctions with live bidding, video streaming, and budget tracking.',
    gradient: 'from-purple-500 to-violet-500',
    shadow: 'shadow-purple-500/20',
    /* Rising bid bars + pulsing LIVE dot */
    icon: (
      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24">
        <circle cx="19" cy="4" r="3.5" fill="currentColor" opacity="0.2" />
        <circle cx="19" cy="4" r="2" fill="currentColor" opacity="0.45" />
        <circle cx="19" cy="4" r="1" fill="currentColor" />
        <rect x="3" y="15" width="4" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth={1.5} />
        <rect x="9" y="10" width="4" height="11" rx="1" fill="none" stroke="currentColor" strokeWidth={1.5} />
        <rect x="15" y="9" width="4" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth={1.5} />
        <path d="M5 13l4-3 4 1 3-3" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 8l2-2m0 0v2.5m0-2.5h-2.5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Live Updates',
    description: 'Real-time scores, odds, and pool updates. Never miss a moment of the action.',
    gradient: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/20',
    /* Broadcast tower with radiating signal waves */
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <circle cx="12" cy="10" r="2" />
        <path d="M8.5 6.5a5 5 0 017 0" strokeLinecap="round" />
        <path d="M5.5 3.5a9 9 0 0113 0" strokeLinecap="round" />
        <line x1="12" y1="12" x2="12" y2="19" />
        <path d="M8 19h8" strokeLinecap="round" />
        <path d="M9 19l-2 3" strokeLinecap="round" />
        <path d="M15 19l2 3" strokeLinecap="round" />
      </svg>
    ),
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Win
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Powerful features designed to make sports betting social, fun, and profitable.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg ${feature.shadow}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
