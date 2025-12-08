import React, { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const LuckyCoin = ({ onResultsChange }) => {
  const { colors, isDark } = useTheme();
  const [isFlipping, setIsFlipping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const coinRef = useRef(null);

  const generateResults = () => {
    // Generate random number from -1 to 1
    const randomValue = Math.random() * 2 - 1;
    const absValue = Math.abs(randomValue);

    // Calculate all results
    const num1000 = Math.floor(absValue * 1000);
    const num100 = Math.floor(absValue * 100);
    const num10 = Math.floor(absValue * 10);

    // Card suit based on quartiles of 0-1000
    const suits = ['♠', '♣', '♥', '♦'];
    const suitIndex = Math.floor(absValue * 4);
    const suit = suits[Math.min(suitIndex, 3)];
    const suitColors = ['#1a1a2e', '#1a1a2e', '#dc3545', '#dc3545'];
    const suitColor = suitColors[Math.min(suitIndex, 3)];

    return {
      color: randomValue >= 0 ? 'Blue' : 'Red',
      colorHex: randomValue >= 0 ? '#3b82f6' : '#ef4444',
      coin: randomValue >= 0 ? 'Heads' : 'Tails',
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
    padding: '6px 12px',
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    color: colors.text,
    whiteSpace: 'nowrap',
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
        Press for luck!
      </div>
    </div>
  );
};

export default LuckyCoin;
