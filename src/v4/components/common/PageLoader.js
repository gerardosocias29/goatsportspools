import React, { useState, useCallback, useRef, useEffect } from 'react';

const SPORTS_EMOJIS = [
  '\u{1F3C8}', // football
  '\u{1F3C0}', // basketball
  '\u{26BD}',  // soccer
  '\u{26BE}',  // baseball
  '\u{1F3BE}', // tennis
  '\u{1F3D0}', // volleyball
  '\u{1F3C9}', // rugby
  '\u{1F3B1}', // pool/billiards
];

const CYCLE_MS = 2500;
const PEAK_MS = CYCLE_MS * 0.7; // 1750ms — burst at peak of growth

const PageLoader = ({ inline = false }) => {
  const [emojiBatches, setEmojiBatches] = useState([]);
  const batchIdRef = useRef(0);

  const spawnEmojis = useCallback(() => {
    const count = 5 + Math.floor(Math.random() * 4); // 5-8 emojis per burst
    const batch = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 360;
      const distance = 100 + Math.random() * 140;
      const rad = (angle * Math.PI) / 180;
      const x = Math.cos(rad) * distance;
      const y = Math.sin(rad) * distance;
      const emoji = SPORTS_EMOJIS[Math.floor(Math.random() * SPORTS_EMOJIS.length)];
      const size = 28 + Math.random() * 16; // 28-44px
      const duration = 0.7 + Math.random() * 0.5;
      const rotation = Math.random() * 360;

      batch.push({ angle, x, y, emoji, size, duration, rotation });
    }

    const id = batchIdRef.current++;
    setEmojiBatches((prev) => [...prev, { id, emojis: batch }]);

    setTimeout(() => {
      setEmojiBatches((prev) => prev.filter((b) => b.id !== id));
    }, 1400);
  }, []);

  // Fire emoji burst at the peak (70%) of each 1s pulse cycle
  useEffect(() => {
    let timeoutId;
    function fireBurst() {
      spawnEmojis();
      timeoutId = setTimeout(fireBurst, CYCLE_MS);
    }
    timeoutId = setTimeout(fireBurst, PEAK_MS);
    return () => clearTimeout(timeoutId);
  }, [spawnEmojis]);

  return (
    <div className={`flex items-center justify-center ${inline ? 'py-32' : 'min-h-screen'} bg-white dark:bg-gray-900`}>
      <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
        {/* Emoji particles — behind the logo */}
        {emojiBatches.map((batch) =>
          batch.emojis.map((e, i) => (
            <span
              key={`${batch.id}-${i}`}
              className="absolute pointer-events-none select-none"
              style={{
                left: '50%',
                top: '50%',
                fontSize: `${e.size}px`,
                zIndex: 0,
                animation: `emojiThrow ${e.duration}s cubic-bezier(0.2, 0, 0.4, 1) forwards`,
                '--throw-x': `${e.x}px`,
                '--throw-y': `${e.y}px`,
                '--spin': `${e.rotation}deg`,
              }}
            >
              {e.emoji}
            </span>
          ))
        )}

        {/* OKRNG Logo — on top, no circle */}
        <img
          src="/img/v2_logo.png"
          alt="OKRNG"
          className="relative"
          style={{
            width: 64,
            height: 64,
            zIndex: 10,
            animation: 'logoPulse 2.5s infinite',
          }}
        />
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes logoPulse {
          0% {
            transform: scale(0.9);
            animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
          }
          70% {
            transform: scale(1.35);
            animation-timing-function: cubic-bezier(0.7, 0, 1, 0.5);
          }
          88% {
            transform: scale(0.82);
            animation-timing-function: ease-out;
          }
          100% {
            transform: scale(0.9);
          }
        }

        @keyframes emojiThrow {
          0% {
            transform: translate(-50%, -50%) translate(0px, 0px) scale(0.3) rotate(0deg);
            opacity: 0.85;
          }
          15% {
            transform: translate(-50%, -50%) translate(calc(var(--throw-x) * 0.15), calc(var(--throw-y) * 0.15)) scale(1.1) rotate(calc(var(--spin) * 0.3));
            opacity: 1;
          }
          60% {
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) translate(var(--throw-x), var(--throw-y)) scale(0.2) rotate(var(--spin));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
