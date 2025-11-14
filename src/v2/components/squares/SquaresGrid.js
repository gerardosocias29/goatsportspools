import React, { useState, useEffect } from 'react';
import SquareCell from './SquareCell';

/**
 * Main Squares Grid Component
 * Displays the 10x10 grid with team labels and numbers
 */
const SquaresGrid = ({
  grid,
  squares = [],
  onSquareSelect,
  currentPlayerID,
  selectionMode = false,
  disabled = false,
}) => {
  const [selectedSquares, setSelectedSquares] = useState([]);
  const [hoveredSquare, setHoveredSquare] = useState(null);

  // Parse axis numbers
  const xNumbers = grid.xAxisNumbers ? grid.xAxisNumbers.split(',').map(Number) : null;
  const yNumbers = grid.yAxisNumbers ? grid.yAxisNumbers.split(',').map(Number) : null;

  const isSquareSelected = (square) => {
    return selectedSquares.some(
      s => s.xCoordinate === square.xCoordinate && s.yCoordinate === square.yCoordinate
    );
  };

  const isSquareOwned = (square) => {
    return square.playerID !== null;
  };

  const isSquareOwnedByCurrentUser = (square) => {
    return square.playerID === currentPlayerID;
  };

  const handleSquareClick = (square) => {
    if (disabled || !selectionMode) return;

    if (isSquareOwned(square)) {
      // If owned by current user, allow deselection in some modes
      if (isSquareOwnedByCurrentUser(square)) {
        return; // Can't deselect already purchased squares
      }
      return; // Can't select owned squares
    }

    // Toggle selection
    if (isSquareSelected(square)) {
      setSelectedSquares(prev =>
        prev.filter(s => !(s.xCoordinate === square.xCoordinate && s.yCoordinate === square.yCoordinate))
      );
    } else {
      setSelectedSquares(prev => [...prev, square]);
    }
  };

  const handleMouseEnter = (square) => {
    if (!disabled && selectionMode) {
      setHoveredSquare(square);
    }
  };

  const handleMouseLeave = () => {
    setHoveredSquare(null);
  };

  // Notify parent of selection changes
  useEffect(() => {
    if (onSquareSelect) {
      onSquareSelect(selectedSquares);
    }
  }, [selectedSquares]);

  // Organize squares into grid
  const getSquareAt = (x, y) => {
    return squares.find(s => s.xCoordinate === x && s.yCoordinate === y) || {
      xCoordinate: x,
      yCoordinate: y,
      playerID: null,
    };
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Grid Container */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 rounded-xl shadow-2xl">

        {/* Top Team Label */}
        <div className="text-center mb-4">
          <div className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg text-lg md:text-xl font-bold">
            {grid.xAxisTeam || 'Team X'}
          </div>
        </div>

        {/* Main Grid with Side Labels */}
        <div className="flex items-center justify-center gap-2 md:gap-3">

          {/* Left Side - Y Axis Team Label (Vertical) */}
          <div className="flex items-center">
            <div className="writing-mode-vertical bg-red-600 text-white px-3 py-6 rounded-lg shadow-lg text-lg md:text-xl font-bold transform -rotate-180">
              {grid.yAxisTeam || 'Team Y'}
            </div>
          </div>

          {/* Grid Structure */}
          <div className="flex-1 max-w-4xl">

            {/* Top Numbers Row (X Axis) */}
            <div className="flex mb-2">
              <div className="w-12"></div> {/* Spacer for corner */}
              <div className="flex-1 grid grid-cols-10 gap-1 md:gap-2">
                {xNumbers ? (
                  xNumbers.map((num, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-center h-10 bg-blue-500 text-white font-bold text-sm md:text-base rounded shadow"
                    >
                      {num}
                    </div>
                  ))
                ) : (
                  <div className="col-span-10 text-center text-gray-500 text-sm py-2">
                    Numbers not assigned yet
                  </div>
                )}
              </div>
            </div>

            {/* Grid Rows with Y Numbers */}
            <div className="flex">
              {/* Y Numbers Column */}
              <div className="flex flex-col gap-1 md:gap-2 mr-2">
                {yNumbers ? (
                  yNumbers.map((num, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-center w-10 h-full min-h-[50px] md:min-h-[60px] lg:min-h-[70px] bg-red-500 text-white font-bold text-sm md:text-base rounded shadow"
                    >
                      {num}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-xs writing-mode-vertical transform rotate-180">
                    Not assigned
                  </div>
                )}
              </div>

              {/* Actual Grid of Squares */}
              <div className="flex-1 grid grid-cols-10 gap-1 md:gap-2">
                {Array.from({ length: 10 }).map((_, yIdx) =>
                  Array.from({ length: 10 }).map((_, xIdx) => {
                    const square = getSquareAt(xIdx, yIdx);
                    return (
                      <SquareCell
                        key={`${xIdx}-${yIdx}`}
                        square={square}
                        isSelected={isSquareSelected(square)}
                        isHovered={hoveredSquare?.xCoordinate === xIdx && hoveredSquare?.yCoordinate === yIdx}
                        isOwned={isSquareOwned(square)}
                        isCurrentUser={isSquareOwnedByCurrentUser(square)}
                        disabled={disabled || isSquareOwned(square)}
                        onClick={handleSquareClick}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        showNumbers={xNumbers && yNumbers}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-400 border-2 border-yellow-600 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 border-2 border-green-700 rounded"></div>
            <span>Your Squares</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 border-2 border-blue-700 rounded"></div>
            <span>Other Players</span>
          </div>
        </div>

        {/* Selection Info */}
        {selectionMode && selectedSquares.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <p className="text-center text-blue-900 font-semibold">
              {selectedSquares.length} square{selectedSquares.length !== 1 ? 's' : ''} selected
              {grid.costPerSquare > 0 && (
                <span className="ml-2">
                  (${(selectedSquares.length * grid.costPerSquare).toFixed(2)})
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SquaresGrid;
