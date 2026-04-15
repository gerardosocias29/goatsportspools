import React from 'react';
import { motion } from 'framer-motion';

const sports = [
  {
    name: 'NFL Football',
    description: 'DOMINATE THE SQUARES',
    image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&q=80&w=800',
    color: 'from-blue-600/80 to-blue-900/90',
  },
  {
    name: 'NBA Basketball',
    description: 'PLAYOFF BRACKETS LIVE',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800',
    color: 'from-orange-600/80 to-red-900/90',
  },
  {
    name: 'NCAA MADNESS',
    description: 'THE BIG AUCTION',
    image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=800',
    color: 'from-brand-500/80 to-brand-900/90',
  },
];

const Sports = () => {
  return (
    <section className="min-h-[calc(100vh-80px)] flex items-center py-20 bg-white dark:bg-gray-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-end mb-12">
          <div className="flex-1">
            <motion.h4 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-xs font-black uppercase tracking-[0.4em] text-brand-500 mb-6"
            >
              Coverage
            </motion.h4>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-[0.9]"
            >
              ALL THE SPORTS <br /> YOU LIVE FOR
            </motion.h2>
          </div>
          <div className="lg:w-1/3">
             <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
               From the Super Bowl to the Final Four, OKRNG provides the most premium pool experience for every major sporting event.
             </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {sports.map((sport, index) => (
            <motion.div
              key={sport.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
              className="group relative h-[500px] rounded-[48px] overflow-hidden cursor-pointer"
            >
              {/* Background Image */}
              <img 
                src={sport.image} 
                alt={sport.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${sport.color} opacity-60 group-hover:opacity-80 transition-opacity`} />
              
              {/* Content */}
              <div className="absolute inset-x-8 bottom-8 text-white">
                 <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">{sport.description}</div>
                 <h3 className="text-4xl font-black tracking-tighter uppercase">{sport.name}</h3>
                 
                 <div className="mt-6 flex h-0 overflow-hidden group-hover:h-12 transition-all duration-500">
                    <button className="bg-white text-gray-900 px-6 py-2 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">
                       Enter Arena
                    </button>
                 </div>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-white/30 rounded-tr-2xl group-hover:border-white transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sports;
