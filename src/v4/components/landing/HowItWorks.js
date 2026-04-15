import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Create or Join',
    description: 'Start a new pool in seconds or join an existing one with a pool code. Invite friends via link or QR code.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Pick Your Squares',
    description: 'Claim squares on the 10x10 grid. Numbers are assigned randomly at game time for a fair playing field.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <rect x="14" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <rect x="14" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <rect x="3" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Win Big',
    description: 'Match the last digit of each team\'s score at the end of each quarter. Winners are calculated automatically.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
      </svg>
    ),
  },
];

const HowItWorks = () => {
  return (
    <section className="min-h-[calc(100vh-80px)] flex items-center py-16 bg-white dark:bg-gray-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="max-w-xl text-left">
            <motion.h4 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-xs font-black uppercase tracking-[0.4em] text-brand-500 mb-4"
            >
              The Process
            </motion.h4>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tighter"
            >
              SIMPLE AS 1-2-3
            </motion.h2>
          </div>
          <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-sm">
             Ready to dive into the action? Here's the roadmap to your first victory.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connector Line Background */}
          <div className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent z-0" />

          {steps.map((step, index) => (
            <motion.div 
              key={step.number} 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative z-10 text-left"
            >
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-[40px] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-white/5 shadow-inner mb-10 relative group">
                <div className="absolute inset-0 bg-brand-500/10 rounded-[40px] scale-0 group-hover:scale-100 transition-transform duration-500" />
                <div className="text-brand-500 relative z-10 transition-transform group-hover:scale-110">
                  {step.icon}
                </div>
                <span className="absolute -top-4 -left-4 w-12 h-12 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white text-lg font-black rounded-2xl flex items-center justify-center shadow-lg">
                  {step.number}
                </span>
              </div>

              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter">
                {step.title}
              </h3>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
