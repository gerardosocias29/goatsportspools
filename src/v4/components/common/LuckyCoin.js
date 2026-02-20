import React, { useState } from 'react';

const LUCKY_RESULTS_KEY = 'okrng_v4_lucky_results';

const LuckyCoin = ({ onResultsChange }) => {
  const [isFlipping, setIsFlipping] = useState(false);

  const generateResults = () => {
    const randomNum = Math.random() * 2 - 1;
    const randomNum2 = Math.random() * 2 - 1;

    const num100 = Math.round(Math.abs(randomNum * 100));
    const num10 = Math.floor(Math.random() * 10) + 1;
    const num1000 = Math.round(Math.abs(randomNum2 * 1000));

    const color = randomNum < 0 ? 'Red' : 'Black';
    const coin = randomNum < 0 ? 'Tails' : 'Heads';

    let suit = '';
    if (num1000 <= 250) suit = '♠';
    else if (num1000 <= 500) suit = '♣';
    else if (num1000 <= 750) suit = '♥';
    else suit = '♦';

    return { color, coin, num10, num100, num1000, suit };
  };

  const handleClick = () => {
    if (isFlipping) return;
    setIsFlipping(true);

    const newResults = generateResults();

    setTimeout(() => {
      if (onResultsChange) onResultsChange(newResults);
      try {
        localStorage.setItem(LUCKY_RESULTS_KEY, JSON.stringify(newResults));
      } catch {}
      setIsFlipping(false);
    }, 600);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isFlipping}
      className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide !text-white transition-all duration-200 whitespace-nowrap
        bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-md hover:shadow-lg
        ${isFlipping ? 'opacity-80 scale-95' : 'scale-100'}`}
    >
      {/* Sparkle/star icon */}
      <svg
        className={`w-4 h-4 transition-transform duration-500 ${isFlipping ? 'rotate-[360deg]' : ''}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
      </svg>
      {/* Desktop */}
      <span className="hidden lg:inline">I'm Feeling Lucky</span>
      {/* Tablet */}
      <span className="hidden sm:inline lg:hidden">Lucky</span>
    </button>
  );
};

export { LUCKY_RESULTS_KEY };
export default LuckyCoin;
