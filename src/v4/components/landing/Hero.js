import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = ['squares', 'auction', 'playoffs'];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="min-h-screen flex items-center bg-white dark:bg-gray-950 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-[-10%] w-[60%] h-[100%] bg-gradient-to-l from-brand-500/10 via-brand-500/5 to-transparent blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Live Indicator */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-gray-900/5 dark:bg-white/5 border border-gray-900/10 dark:border-white/10 mb-8 backdrop-blur-md">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500" />
              </span>
              <span className="text-sm font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">NFL Super Bowl LIX Live!</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.85] mb-8">
              <span className="text-gray-900 dark:text-white block">THE FUTURE OF</span>
              <span className="text-brand-500 block">SPORTS</span>
              <span className="bg-gradient-to-r from-brand-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent block">POOLS</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium mb-12 max-w-xl leading-relaxed">
              Don't just watch the game. Own it. Join the elite community of fans hosting premium squares, brackets, and auctions.
            </p>

            {/* Actions */}
            <div className="flex flex-col items-start gap-4">
              <Link
                to="/sign-up"
                className="relative group overflow-hidden px-10 py-5 bg-brand-500 rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-brand-500/25 text-center w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative text-lg font-black text-white uppercase tracking-wider">Start Winning Now</span>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Already a member?{' '}
                <Link to="/sign-in" className="font-bold text-brand-500 hover:text-brand-600 hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Right Content Overlay / Slideshow */}
          <div className="hidden lg:block relative">
            <AnimatePresence mode="wait">
              <motion.div 
                key={slides[currentSlide]}
                initial={{ opacity: 0, scale: 0.95, y: 30 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 1.05, y: -30 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className="relative z-10"
              >
                 <div className="bg-gradient-to-br from-brand-500/10 to-violet-500/10 p-1 rounded-[48px] border border-white/10 backdrop-blur-3xl shadow-3xl">
                    <div className="bg-gray-950 rounded-[44px] overflow-hidden border border-white/10 relative p-12 aspect-square flex flex-col items-center justify-center">
                       <div className="flex-1 w-full flex items-center justify-center">
                          {currentSlide === 0 && <SquaresSlide />}
                          {currentSlide === 1 && <AuctionSlide />}
                          {currentSlide === 2 && <PlayoffsSlide />}
                       </div>
                       
                       {/* Labels moved inside the card for cleaner look */}
                       <div className="mt-8 text-center">
                          <h4 className="text-2xl font-black text-white uppercase tracking-tighter">
                            {currentSlide === 0 && "Live Squares"}
                            {currentSlide === 1 && "Live Auctions"}
                            {currentSlide === 2 && "The Finals"}
                          </h4>
                          <p className="text-xs font-bold text-brand-500 uppercase tracking-[0.4em] mt-1">
                            {currentSlide === 0 && "Interactive Grid"}
                            {currentSlide === 1 && "Real-time Bidding"}
                            {currentSlide === 2 && "Road to the Cup"}
                          </p>
                       </div>
                    </div>
                 </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Indicators */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20">
              {slides.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 transition-all duration-500 rounded-full ${i === currentSlide ? 'w-10 bg-brand-500' : 'w-2 bg-gray-300 dark:bg-gray-800 hover:bg-gray-400'}`} 
                />
              ))}
            </div>

            {/* Decorative Blobs */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-500/20 rounded-full blur-[80px]" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px]" />
          </div>
        </div>
      </div>
    </section>
  );
};

// -------------------------------------------------------------------------
// SLIDE COMPONENTS
// -------------------------------------------------------------------------

const SquaresSlide = () => (
  <div className="w-full h-full flex items-center justify-center p-4">
    <div className="grid grid-cols-8 gap-2 w-full max-w-[320px]">
      {[...Array(64)].map((_, i) => (
        <motion.div 
          key={i} 
          whileHover={{ scale: 1.2, zIndex: 20 }}
          className={`aspect-square rounded-sm border ${
            [10, 15, 24, 31, 42, 53, 58].includes(i) 
              ? 'bg-brand-500 border-brand-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10' 
              : 'bg-white/5 border-white/5 opacity-40'
          }`} 
        />
      ))}
    </div>
  </div>
);

const AuctionSlide = () => (
  <div className="w-full h-full flex items-center justify-center p-4">
    <div className="relative w-full max-w-[280px] space-y-4">
      {[1, 2, 3].map(i => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`p-5 rounded-2xl border ${i === 1 ? 'bg-brand-500 border-brand-400 shadow-lg shadow-brand-500/20 scale-105' : 'bg-white/5 border-white/10 opacity-60'} flex items-center justify-between`}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 overflow-hidden">
               <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="user" />
            </div>
            <div className="space-y-1.5">
              <div className="w-20 h-2.5 bg-white/30 rounded-full" />
              <div className="w-12 h-2 bg-white/10 rounded-full" />
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-white tracking-tighter">$45{i}</div>
            <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">High Bid</div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const PlayoffsSlide = () => (
  <div className="w-full h-full flex items-center justify-center p-2">
    <div className="relative w-full max-w-[400px] h-full flex items-center gap-6">
       
       {/* Stage 1: Quarter Finals */}
       <div className="flex-1 flex flex-col gap-3 relative">
          <div className="absolute -top-7 left-0 text-[8px] font-black text-brand-500 uppercase tracking-[0.2em] opacity-50">Quarters</div>
          {[1, 2, 3, 4].map(i => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="w-full h-8 bg-white/5 border border-white/10 rounded-lg flex items-center px-2 shadow-sm"
            >
               <div className="w-3 h-3 rounded bg-gray-800 border border-white/10" />
               <div className="ml-2 w-10 h-1 bg-white/10 rounded-full" />
            </motion.div>
          ))}
       </div>

       {/* Visual Separator */}
       <div className="h-16 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent shrink-0" />

       {/* Stage 2: Semi Finals */}
       <div className="flex-1 flex flex-col gap-8 relative py-4">
          <div className="absolute -top-7 left-0 text-[8px] font-black text-violet-500 uppercase tracking-[0.2em] opacity-50">Semis</div>
          {[1, 2].map(i => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="w-full h-12 bg-white/10 border border-white/20 rounded-xl flex items-center px-3 shadow-xl"
            >
               <div className="w-5 h-5 rounded-lg bg-gray-800 border border-white/10" />
               <div className="ml-3 w-14 h-1.5 bg-white/20 rounded-full" />
            </motion.div>
          ))}
       </div>

       {/* Visual Separator */}
       <div className="h-16 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent shrink-0" />

       {/* Stage 3: Champion */}
       <div className="flex-1 flex items-center justify-center relative">
          <div className="absolute -top-7 left-0 text-[8px] font-black text-fuchsia-500 uppercase tracking-[0.2em] opacity-50">Winner</div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            className="relative"
          >
             <motion.div 
               animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} 
               transition={{ duration: 4, repeat: Infinity }}
               className="absolute inset-x-0 -inset-y-8 bg-brand-500 blur-[30px]" 
             />
             <div className="relative w-28 h-24 bg-brand-500 border border-brand-400 rounded-[28px] flex flex-col items-center justify-center shadow-3xl shadow-brand-500/50">
                <div className="w-12 h-2.5 bg-white/30 rounded-full mb-2 shadow-inner" />
                <div className="text-[10px] font-black text-white uppercase tracking-[0.1em]">Champ</div>
                
                {/* Winner Badge */}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-lg border-2 border-amber-200">
                   <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                     <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                   </svg>
                </div>
             </div>
          </motion.div>
       </div>

    </div>
  </div>
);

export default Hero;
