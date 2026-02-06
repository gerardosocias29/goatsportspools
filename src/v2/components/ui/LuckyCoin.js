import React, { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const LuckyCoin = ({ onResultsChange }) => {
  const { colors, isDark } = useTheme();
  const [isFlipping, setIsFlipping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const coinRef = useRef(null);

  const generateResults = () => {
    // Two separate random numbers from -1 to 1
    const randomNum = Math.random() * 2 - 1;
    const randomNum2 = Math.random() * 2 - 1;

    // Scaled results (absolute values)
    const num100 = Math.round(Math.abs(randomNum * 100));
    const num10 = Math.floor(Math.random() * 10) + 1; // Separate random, always 1-10
    const num1000 = Math.round(Math.abs(randomNum2 * 1000));

    // Color: Negative = Red, Positive = Black
    const color = randomNum < 0 ? 'Red' : 'Black';
    const colorHex = randomNum < 0 ? '#ef4444' : '#1a1a2e';

    // Coin: Negative = Tails, Positive = Heads
    const coin = randomNum < 0 ? 'Tails' : 'Heads';

    // Card suit based on scaled1000 value
    let suit = '';
    let suitColor = '';
    if (num1000 <= 250) {
      suit = '♠';
      suitColor = '#1a1a2e';
    } else if (num1000 <= 500) {
      suit = '♣';
      suitColor = '#1a1a2e';
    } else if (num1000 <= 750) {
      suit = '♥';
      suitColor = '#dc3545';
    } else {
      suit = '♦';
      suitColor = '#dc3545';
    }

    return {
      color,
      colorHex,
      coin,
      num10,
      num100,
      num1000,
      suit,
      suitColor,
    };
  };

  const handleClick = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    setShowTooltip(false);

    // Generate new results
    const newResults = generateResults();

    // Show results after animation completes
    setTimeout(() => {
      if (onResultsChange) {
        onResultsChange(newResults);
      }
      setIsFlipping(false);
    }, 600);
  };

  const buttonStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#16a34a',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 150ms ease',
    whiteSpace: 'nowrap',
  };

  const tooltipStyles = {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '8px',
    padding: '8px 14px',
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 500,
    color: colors.text,
    whiteSpace: 'normal',
    width: '220px',
    textAlign: 'center',
    lineHeight: '1.4',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    opacity: showTooltip ? 1 : 0,
    visibility: showTooltip ? 'visible' : 'hidden',
    transition: 'opacity 150ms ease, visibility 150ms ease',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
      {/* Lucky Button */}
      <button
        ref={coinRef}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={isFlipping}
        style={{
          ...buttonStyles,
          opacity: isFlipping ? 0.7 : 1,
          transform: isFlipping ? 'scale(0.95)' : 'scale(1)',
        }}
      >
        <span style={{ fontSize: '16px' }}>🍀</span>
        {/* Desktop text */}
        <span className="hidden lg:inline">I'm Feeling Lucky</span>
        {/* Tablet text */}
        <span className="hidden sm:inline lg:hidden">I'm Lucky</span>
      </button>

      {/* Tooltip */}
      <div style={tooltipStyles}>
        Generate a random coin flip, color, number, and card suit for fun!
      </div>
    </div>
  );
};

export default LuckyCoin;
