import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Football Squares',
    description: 'Classic 10x10 grid pools with automated payouts and real-time score tracking. Perfect for game day parties.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    color: 'bg-blue-600',
  },
  {
    title: 'NBA Playoff Brackets',
    description: 'Draft your dream team and compete throughout the post-season. Real-time scoring and global leaderboards.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'bg-brand-500',
  },
  {
    title: 'Live Auction Drafts',
    description: 'Experience the thrill of a live auction. Bid on teams in real-time and build your portfolio for March Madness.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    color: 'bg-violet-600',
  },
  {
    title: 'Commissioner Tools',
    description: 'Everything you need to manage your league. From member invitations to fund administration and payout logic.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    color: 'bg-emerald-600',
  },
];

const Features = () => {
  return (
    <section className="min-h-[calc(100vh-80px)] flex items-center py-20 bg-gray-50 dark:bg-gray-950 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h4 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-xs font-black uppercase tracking-[0.3em] text-brand-500 mb-4"
          >
            Extreme Versatility
          </motion.h4>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight"
          >
            PRO TOOLS FOR THE <br /> MODERN SPORTS FAN
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group relative p-10 bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-2xl shadow-gray-200/50 dark:shadow-none transition-all"
            >
              <div className={`w-16 h-16 ${feature.color} text-white rounded-[20px] flex items-center justify-center mb-10 shadow-xl transition-all group-hover:scale-110 group-hover:rotate-6`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">
                {feature.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
                {feature.description}
              </p>
              
              <div className="flex items-center gap-2 group/btn cursor-pointer">
                 <span className="text-sm font-black text-brand-500 uppercase tracking-widest group-hover/btn:mr-2 transition-all">Explore Feature</span>
                 <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                 </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
