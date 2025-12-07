import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const LuckyCoin = () => {
  const { colors } = useTheme();
  const [isFlipping, setIsFlipping] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const coinRef = useRef(null);
  const popoverRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        coinRef.current &&
        !coinRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setShowResults(false);
    setShowTooltip(false);

    // Generate new results
    const newResults = generateResults();

    // Show results after animation completes
    setTimeout(() => {
      setResults(newResults);
      setIsFlipping(false);
      setShowResults(true);
    }, 600);
  };

  const containerStyles = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  };

  const coinContainerStyles = {
    width: '36px',
    height: '36px',
    perspective: '1000px',
  };

  const coinStyles = {
    width: '100%',
    height: '100%',
    position: 'relative',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isFlipping ? 'rotateY(720deg)' : 'rotateY(0deg)',
    animation: !isFlipping && !showResults ? 'coinPulse 2s ease-in-out infinite' : 'none',
  };

  const coinFaceStyles = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    background: 'linear-gradient(135deg, #ffd700 0%, #ffb347 50%, #ffd700 100%)',
    boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
    border: '2px solid #daa520',
    fontSize: '20px',
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
    opacity: showTooltip && !showResults ? 1 : 0,
    visibility: showTooltip && !showResults ? 'visible' : 'hidden',
    transition: 'opacity 150ms ease, visibility 150ms ease',
  };

  const popoverStyles = {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '12px',
    padding: '16px',
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    zIndex: 1100,
    minWidth: '200px',
    opacity: showResults ? 1 : 0,
    visibility: showResults ? 'visible' : 'hidden',
    transition: 'opacity 200ms ease, visibility 200ms ease',
  };

  const resultRowStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: `1px solid ${colors.border}`,
  };

  const resultLabelStyles = {
    fontSize: '13px',
    color: colors.text,
    opacity: 0.7,
  };

  const resultValueStyles = {
    fontSize: '14px',
    fontWeight: 600,
    color: colors.text,
  };

  return (
    <div style={containerStyles}>
      <div
        ref={coinRef}
        style={coinContainerStyles}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div style={coinStyles}>
          <div style={coinFaceStyles}>
            🍀
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <div style={tooltipStyles}>
        Press for luck
      </div>

      {/* Results Popover */}
      {results && (
        <div ref={popoverRef} style={popoverStyles}>
          <div style={{
            textAlign: 'center',
            marginBottom: '12px',
            paddingBottom: '12px',
            borderBottom: `1px solid ${colors.border}`,
          }}>
            <span style={{
              fontSize: '16px',
              fontWeight: 700,
              color: colors.brand?.primary || '#d47a3e',
              fontFamily: '"Hubot Sans", sans-serif',
            }}>
              Your Lucky Results
            </span>
          </div>

          <div style={resultRowStyles}>
            <span style={resultLabelStyles}>Color</span>
            <span style={{
              ...resultValueStyles,
              color: results.colorHex,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: results.colorHex,
              }} />
              {results.color}
            </span>
          </div>

          <div style={resultRowStyles}>
            <span style={resultLabelStyles}>Coin</span>
            <span style={resultValueStyles}>{results.coin}</span>
          </div>

          <div style={resultRowStyles}>
            <span style={resultLabelStyles}>Number (0-10)</span>
            <span style={resultValueStyles}>{results.num10}</span>
          </div>

          <div style={resultRowStyles}>
            <span style={resultLabelStyles}>Number (0-100)</span>
            <span style={resultValueStyles}>{results.num100}</span>
          </div>

          <div style={resultRowStyles}>
            <span style={resultLabelStyles}>Number (0-1000)</span>
            <span style={resultValueStyles}>{results.num1000}</span>
          </div>

          <div style={{ ...resultRowStyles, borderBottom: 'none' }}>
            <span style={resultLabelStyles}>Card Suit</span>
            <span style={{
              ...resultValueStyles,
              fontSize: '20px',
              color: results.suitColor,
            }}>
              {results.suit}
            </span>
          </div>

          <div style={{
            marginTop: '12px',
            textAlign: 'center',
            paddingTop: '12px',
            borderTop: `1px solid ${colors.border}`,
          }}>
            <span style={{
              fontSize: '11px',
              color: colors.text,
              opacity: 0.5,
            }}>
              Click coin to randomize again
            </span>
          </div>
        </div>
      )}

      {/* CSS Keyframes for pulse animation */}
      <style>{`
        @keyframes coinPulse {
          0%, 100% {
            transform: scale(1) rotateY(0deg);
          }
          50% {
            transform: scale(1.05) rotateY(10deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LuckyCoin;
