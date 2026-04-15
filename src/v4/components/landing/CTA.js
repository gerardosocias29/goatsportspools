import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CTA = () => {
  return (
    <section className="min-h-[calc(100vh-80px)] flex items-center py-16 relative overflow-hidden bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[64px] bg-gray-900 border border-white/10 p-12 lg:p-24 overflow-hidden text-center shadow-[0_64px_128px_-32px_rgba(0,0,0,0.5)]"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-violet-600 to-indigo-900 opacity-90" />
          
          {/* Animated Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ repeat: Infinity, duration: 8 }}
            className="absolute -top-1/2 -left-1/4 w-full h-full bg-brand-400/20 blur-[120px] rounded-full"
          />

          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.h4 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-xs font-black uppercase tracking-[0.4em] text-white/50 mb-8"
            >
              Exclusive Community
            </motion.h4>
            
            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-tight mb-8">
              THE SEASON NEVER ENDS AT OKRNG
            </h2>
            
            <p className="text-xl text-white/60 font-medium mb-12 leading-relaxed">
              Join thousands of commissioners and players who have already leveled up 
              their sports pool experience. Free for basics, premium for the pros.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/sign-up"
                className="px-12 py-6 bg-white text-gray-900 rounded-[32px] font-black text-lg uppercase tracking-wider shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                Create Hub
              </Link>
              <Link
                to="/pools"
                className="px-12 py-6 bg-transparent border-2 border-white/20 text-white rounded-[32px] font-black text-lg uppercase tracking-wider backdrop-blur-md transition-all hover:bg-white/5 hover:border-white"
              >
                View Brackets
              </Link>
            </div>
            
            <p className="mt-12 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              No credit card required • Instant Pool Setup • Social-First Design
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
