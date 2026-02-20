import React, { useState, useCallback } from 'react';

const SquaresGrid = ({
  grid,
  squares = [],
  currentPlayerId,
  disabled = false,
  selectionMode = false,
  selectedSquares = [],
  onSquareSelect,
  onLimitReached,
}) => {
  const visitorTeamName = grid.visitorTeamName || 'Visitor';
  const homeTeamName = grid.homeTeamName || 'Home';
  const xNumbers = grid.xAxisNumbers || null;
  const yNumbers = grid.yAxisNumbers || null;
  const maxPerPlayer = grid.max_squares_per_player || null;

  const [highlightedPlayerId, setHighlightedPlayerId] = useState(null);

  // Count current user's owned squares
  const ownedCount = squares.filter(s => {
    const spId = parseInt(s.player_id ?? s.playerID);
    const cpId = parseInt(currentPlayerId);
    return !isNaN(spId) && !isNaN(cpId) && spId === cpId;
  }).length;

  const remainingSlots = maxPerPlayer ? maxPerPlayer - ownedCount : Infinity;

  // Helpers
  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getSquareAt = useCallback((x, y) => {
    const sq = squares.find(s =>
      (s.x_coordinate === x || s.xCoordinate === x) &&
      (s.y_coordinate === y || s.yCoordinate === y)
    );
    if (sq) {
      return {
        ...sq,
        x_coordinate: sq.x_coordinate ?? sq.xCoordinate ?? x,
        y_coordinate: sq.y_coordinate ?? sq.yCoordinate ?? y,
        player_id: sq.player_id ?? sq.playerID ?? null,
        playerName: sq.player?.name || sq.playerName || null,
        playerInitials: sq.player?.name ? getInitials(sq.player.name) : (sq.playerInitials || null),
        x_number: sq.x_number ?? null,
        y_number: sq.y_number ?? null,
      };
    }
    return { x_coordinate: x, y_coordinate: y, player_id: null, playerName: null, playerInitials: null, x_number: null, y_number: null };
  }, [squares]);

  const isOwned = (sq) => sq.player_id !== null && sq.player_id !== undefined;

  const isOwnedByMe = (sq) => {
    const spId = parseInt(sq.player_id);
    const cpId = parseInt(currentPlayerId);
    return !isNaN(spId) && !isNaN(cpId) && spId === cpId;
  };

  const isSelected = (sq) => selectedSquares.some(
    s => s.x_coordinate === sq.x_coordinate && s.y_coordinate === sq.y_coordinate
  );

  const isHighlighted = (sq) => {
    if (!highlightedPlayerId) return false;
    return parseInt(sq.player_id) === highlightedPlayerId;
  };

  const handleClick = (sq) => {
    // Clicking owned square toggles highlight
    if (isOwned(sq)) {
      const ownerId = parseInt(sq.player_id);
      setHighlightedPlayerId(prev => prev === ownerId ? null : ownerId);
      return;
    }

    // Clear highlight when clicking empty
    setHighlightedPlayerId(null);

    if (disabled || !selectionMode) return;

    if (isSelected(sq)) {
      onSquareSelect?.(selectedSquares.filter(
        s => !(s.x_coordinate === sq.x_coordinate && s.y_coordinate === sq.y_coordinate)
      ));
    } else {
      if (maxPerPlayer && remainingSlots <= selectedSquares.length) {
        onLimitReached?.(maxPerPlayer, ownedCount, selectedSquares.length);
        return;
      }
      onSquareSelect?.([...selectedSquares, sq]);
    }
  };

  // Get highlighted player info
  const highlightedInfo = (() => {
    if (!highlightedPlayerId) return null;
    const playerSquares = squares.filter(s => parseInt(s.player_id ?? s.playerID) === highlightedPlayerId);
    if (playerSquares.length === 0) return null;
    const first = playerSquares[0];
    return {
      name: first?.player?.name || first?.playerName || 'Unknown',
      count: playerSquares.length,
    };
  })();

  // Check if numbers are assigned
  const numbersAssigned = xNumbers && xNumbers.length > 0;

  // Cell styling
  const getCellClasses = (sq) => {
    if (isSelected(sq)) {
      return 'bg-warning-100 border-warning-400 text-warning-800 dark:bg-warning-500/20 dark:border-warning-500 dark:text-warning-300 scale-[1.03] shadow-md';
    }
    if (isHighlighted(sq)) {
      return 'ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-gray-900 scale-[1.03] shadow-lg bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-500/15 dark:border-brand-500/50 dark:text-brand-300';
    }
    if (isOwnedByMe(sq)) {
      return 'bg-success-100 border-success-400 text-success-800 dark:bg-success-500/20 dark:border-success-500 dark:text-success-300';
    }
    if (isOwned(sq)) {
      return 'bg-info-50 border-info-300 text-info-700 dark:bg-info-500/10 dark:border-info-500/30 dark:text-info-400';
    }
    if (!disabled && selectionMode) {
      return 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer';
    }
    return 'bg-white border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200';
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-3 md:p-5 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">

        {/* Scrollable container for mobile */}
        <div className="w-full overflow-x-auto md:overflow-x-visible pb-2 md:pb-0" style={{ touchAction: 'pan-x pan-y pinch-zoom' }}>
          <div className="min-w-[420px] md:min-w-0 max-w-3xl mx-auto">

            {/* Home Team label (top) — spans across Y number column + grid */}
            <div className="flex mb-1.5 sm:mb-2">
              {/* Spacer for visitor label column */}
              <div className="w-5 sm:w-6 md:w-8 flex-shrink-0 mr-0.5 sm:mr-1" />
              {/* Spacer for Y numbers column */}
              <div className="w-6 sm:w-8 md:w-10 flex-shrink-0 mr-0.5 sm:mr-1" />
              {/* Home team centered over grid */}
              <div className="flex-1 flex justify-center">
                <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg bg-gradient-to-r from-error-500 to-error-600 shadow-sm">
                  <p className="font-bold !text-white select-none text-[10px] sm:text-xs md:text-sm">{homeTeamName}</p>
                </div>
              </div>
            </div>

            {/* X Numbers row — must align exactly with the 10x10 grid columns */}
            <div className="flex mb-0.5 sm:mb-1">
              {/* Spacer for visitor label column */}
              <div className="w-5 sm:w-6 md:w-8 flex-shrink-0 mr-0.5 sm:mr-1" />
              {/* Spacer for Y numbers column */}
              <div className="w-6 sm:w-8 md:w-10 flex-shrink-0 mr-0.5 sm:mr-1" />
              {/* X numbers — same grid as the 10x10 cells */}
              <div className="flex-1 grid grid-cols-10 gap-0.5 sm:gap-1">
                {(xNumbers || Array(10).fill(null)).map((num, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-center py-1 sm:py-1.5 rounded text-[10px] sm:text-xs md:text-sm font-bold shadow-sm ${
                      num !== null
                        ? 'bg-brand-500 !text-white'
                        : 'bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400 opacity-60'
                    }`}
                  >
                    {num !== null ? num : '?'}
                  </div>
                ))}
              </div>
            </div>

            {/* Grid body: visitor label + Y numbers + cells */}
            <div className="flex">
              {/* Visitor Team label (left, rotated) */}
              <div className="flex items-center mr-0.5 sm:mr-1 w-5 sm:w-6 md:w-8 flex-shrink-0">
                <div
                  className="flex items-center justify-center rounded-lg bg-gradient-to-b from-success-500 to-success-600 w-full py-2 sm:py-4 shadow-sm"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  <p className="font-bold !text-white select-none text-[10px] sm:text-xs md:text-sm whitespace-nowrap">{visitorTeamName}</p>
                </div>
              </div>

              {/* Y Numbers column */}
              <div className="flex flex-col gap-0.5 sm:gap-1 mr-0.5 sm:mr-1 w-6 sm:w-8 md:w-10 flex-shrink-0">
                {(yNumbers || Array(10).fill(null)).map((num, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-center flex-1 rounded text-[10px] sm:text-xs md:text-sm font-bold shadow-sm ${
                      num !== null
                        ? 'bg-brand-500 !text-white'
                        : 'bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400 opacity-60'
                    }`}
                  >
                    {num !== null ? num : '?'}
                  </div>
                ))}
              </div>

              {/* 10x10 Grid */}
              <div className="flex-1 grid grid-cols-10 gap-0.5 sm:gap-1" style={{ gridAutoRows: '1fr' }}>
                {Array.from({ length: 10 }).map((_, yIdx) =>
                  Array.from({ length: 10 }).map((_, xIdx) => {
                    const sq = getSquareAt(xIdx, yIdx);
                    const seqNumber = yIdx * 10 + xIdx + 1;
                    const hasNumbers = sq.x_number !== null && sq.x_number !== undefined &&
                                       sq.y_number !== null && sq.y_number !== undefined;

                    return (
                      <button
                        key={`${xIdx}-${yIdx}`}
                        onClick={() => handleClick(sq)}
                        className={`
                          aspect-square w-full min-h-[32px] md:min-h-[44px] lg:min-h-[52px]
                          flex flex-col items-center justify-center
                          text-[7px] sm:text-[9px] md:text-[11px] font-medium
                          rounded border-2 transition-all duration-150
                          ${getCellClasses(sq)}
                        `}
                        title={sq.playerName ? `${sq.playerName} (${sq.x_coordinate}, ${sq.y_coordinate})` : `Square ${seqNumber}`}
                      >
                        {/* Top: Player initials if owned, or x_number-y_number if numbers assigned */}
                        {isOwned(sq) ? (
                          <>
                            <span className="leading-none truncate w-full text-center px-0.5 font-bold text-[8px] sm:text-[10px] md:text-xs">
                              {sq.playerInitials || '??'}
                            </span>
                            {hasNumbers && (
                              <span className="leading-none opacity-70 text-[6px] sm:text-[8px] md:text-[9px]">
                                {sq.x_number}-{sq.y_number}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            {/* Show number pair if assigned, otherwise sequence number */}
                            {numbersAssigned && hasNumbers ? (
                              <>
                                <span className="leading-none font-bold text-[7px] sm:text-[9px] md:text-[10px]">
                                  {sq.x_number}-{sq.y_number}
                                </span>
                                <span className="leading-none opacity-50 text-[6px] sm:text-[7px] md:text-[8px]">{seqNumber}</span>
                              </>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 text-[9px] sm:text-[10px] md:text-xs font-medium">{seqNumber}</span>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Highlighted Player Banner */}
        {highlightedInfo && (
          <div className="mt-3 p-2.5 sm:p-3 bg-brand-50 border border-brand-200 rounded-lg flex items-center justify-between dark:bg-brand-500/10 dark:border-brand-500/30">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center">
                <span className="!text-white text-xs font-bold">{highlightedInfo.count}</span>
              </div>
              <p className="text-sm text-brand-800 dark:text-brand-300 font-medium">
                Showing {highlightedInfo.count} square{highlightedInfo.count !== 1 ? 's' : ''} by <span className="font-bold">{highlightedInfo.name}</span>
              </p>
            </div>
            <button
              onClick={() => setHighlightedPlayerId(null)}
              className="px-2.5 py-1 bg-brand-100 hover:bg-brand-200 text-brand-700 rounded-md text-xs font-medium transition dark:bg-brand-500/20 dark:hover:bg-brand-500/30 dark:text-brand-300"
            >
              Clear
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white border-2 border-gray-200 rounded dark:bg-gray-800 dark:border-gray-700" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-warning-100 border-2 border-warning-400 rounded dark:bg-warning-500/20 dark:border-warning-500" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-success-100 border-2 border-success-400 rounded dark:bg-success-500/20 dark:border-success-500" />
            <span>Your Squares</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-info-50 border-2 border-info-300 rounded dark:bg-info-500/10 dark:border-info-500/30" />
            <span>Others</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-brand-50 border-2 border-brand-300 rounded ring-2 ring-brand-500 dark:bg-brand-500/15 dark:border-brand-500/50" />
            <span>Highlighted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SquaresGrid;
