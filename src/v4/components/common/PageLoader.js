import React from 'react';

const PageLoader = ({ inline = false, message = "Loading..." }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${inline ? 'py-20' : 'fixed inset-0 min-h-screen z-[99999]'} bg-white/95 dark:bg-gray-950/95 backdrop-blur-md`}>
      <div className="relative">
        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-brand-500/20 blur-[100px] rounded-full animate-pulse-slow" />

        {/* Logo Mark with Shimmer */}
        <div className="relative flex flex-col items-center">
          <div className="relative w-28 h-28 flex items-center justify-center animate-loader-pulse">
            <img
              src="/img/v2_logo.png"
              alt="OKRNG"
              className="w-full h-full object-contain relative z-10"
            />

            {/* Shimmer overlay effect */}
            <div className="absolute inset-0 z-20 overflow-hidden mix-blend-overlay">
              <div className="absolute inset-y-0 w-2/3 bg-white/40 skew-x-[-25deg] animate-loader-shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Narrative Loading */}
      <div className="mt-12 flex flex-col items-center">
        <p className="text-xs font-black text-gray-900 dark:text-white font-outfit uppercase tracking-[0.4em] animate-pulse">
          {message}
        </p>
        <div className="mt-4 w-16 h-0.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 animate-loader-progress" />
        </div>
      </div>

      <style>{`
        @keyframes loader-pulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.1); filter: brightness(1.2); }
        }
        @keyframes loader-shimmer {
          0% { left: -150%; }
          100% { left: 150%; }
        }
        @keyframes loader-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-loader-pulse {
          animation: loader-pulse 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-loader-shimmer {
          animation: loader-shimmer 2.5s ease-in-out infinite;
        }
        .animate-loader-progress {
          animation: loader-progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
