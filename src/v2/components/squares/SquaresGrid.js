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
  const xNumbers = grid.xAxisNumbers || null;
  const yNumbers = grid.yAxisNumbers || null;

  const isSquareSelected = (square) => {
    // Only compare using normalized snake_case fields
    return selectedSquares.some(
      s => s.x_coordinate === square.x_coordinate && s.y_coordinate === square.y_coordinate
    );
  };

  const isSquareOwned = (square) => {
    return square.player_id !== null && square.player_id !== undefined;
  };

  const isSquareOwnedByCurrentUser = (square) => {
    // Ensure both values are numbers for comparison
    const squarePlayerId = parseInt(square.player_id);
    const currentPlayerId = parseInt(currentPlayerID);
    const isOwner = !isNaN(squarePlayerId) && !isNaN(currentPlayerId) && squarePlayerId === currentPlayerId;

    // Debug logging for owned squares
    if (square.player_id !== null && square.player_id !== undefined) {
      console.log(`Square [${square.x_coordinate},${square.y_coordinate}]:`, {
        player_id: square.player_id,
        player_id_parsed: squarePlayerId,
        currentPlayerID,
        currentPlayerID_parsed: currentPlayerId,
        isOwner,
        originalTypes: `${typeof square.player_id} vs ${typeof currentPlayerID}`
      });
    }
    return isOwner;
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
      // Deselect: remove this square from selection
      setSelectedSquares(prev =>
        prev.filter(s => !(s.x_coordinate === square.x_coordinate && s.y_coordinate === square.y_coordinate))
      );
    } else {
      // Select: add this square to selection
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

  // Clear selections when selection mode is disabled
  useEffect(() => {
    if (!selectionMode) {
      setSelectedSquares([]);
    }
  }, [selectionMode]);

  // Notify parent of selection changes
  useEffect(() => {
    if (onSquareSelect) {
      onSquareSelect(selectedSquares);
    }
  }, [selectedSquares]);

  // Organize squares into grid
  const getSquareAt = (x, y) => {
    // Backend uses snake_case: x_coordinate, y_coordinate, player_id
    const square = squares.find(s =>
      (s.x_coordinate === x || s.xCoordinate === x) &&
      (s.y_coordinate === y || s.yCoordinate === y)
    );

    if (square) {
      // Normalize to snake_case and add computed fields
      return {
        ...square,
        x_coordinate: square.x_coordinate !== undefined ? square.x_coordinate : square.xCoordinate,
        y_coordinate: square.y_coordinate !== undefined ? square.y_coordinate : square.yCoordinate,
        player_id: square.player_id !== undefined ? square.player_id : square.playerID,
        x_number: square.x_number !== undefined ? square.x_number : square.xNumber,
        y_number: square.y_number !== undefined ? square.y_number : square.yNumber,
        playerName: square.player?.name || square.playerName,
        playerInitials: square.player?.name ? getInitials(square.player.name) : (square.playerInitials || null),
      };
    }

    // Empty square
    return {
      x_coordinate: x,
      y_coordinate: y,
      player_id: null,
      x_number: null,
      y_number: null,
      playerName: null,
      playerInitials: null,
    };
  };

  // Helper function to get player initials
  const getInitials = (name) => {
    if (!name) return null;
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="w-full">
      {/* Grid Container */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 rounded-xl shadow-2xl">

        {/* Main Grid with Side Labels */}
        <div className="flex items-center justify-center gap-2 md:gap-3 w-full">

          {/* Grid Structure */}
          <div className="flex-1 max-w-4xl">

            {/* Top Numbers Row (X Axis) */}
            <div className="flex mb-2">
              {
                xNumbers && (
                  <div className="w-12"></div> // Spacer for corner
                )
              }
              <div className="flex-1 grid grid-cols-10 gap-1 md:gap-2">
                <div className='col-span-10 flex justify-center mb-2'>
                  {/* X Axis Label */}
                  <div className="flex items-center gap-2 border rounded-lg shadow-md px-4 min-w-[250px]" style={{
                    backgroundImage: `url(${grid.homeTeamBackground})`,
                    backgroundSize: 'cover', // Ensures the image covers the entire div
                    backgroundPosition: 'center', // Centers the image within the div
                  }}>
                    <img src={grid.homeTeamLogo} className="w-[50px]"/>
                    <p className="font-bold text-white select-none">{grid.homeTeamName}</p>
                  </div>
                </div>
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
              {/* Y Numbers Column with Vertical Team Label */}
              <div className="relative h-auto flex flex-col gap-1 md:gap-2 mr-2">
                {/* Vertically Centered, Rotated Label */}
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[130%] flex justify-left -rotate-90"
                  style={{ width: '60px', zIndex: 2 }}
                >
                  <div
                    className="flex flex-col items-center gap-2 border rounded-lg shadow-md px-2 py-2 min-w-[50px]"
                    style={{
                      backgroundImage: `url(${grid.visitorTeamBackground})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transform: 'rotate(-90deg)',
                      minHeight: '260px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      display: 'flex',
                    }}
                  >
                    <img src={grid.visitorTeamLogo} className="w-[50px] mb-2" style={{ transform: 'none' }} />
                    <p className="font-bold text-white select-none whitespace-nowrap" style={{ transform: 'none', writingMode: 'vertical-rl', textAlign: 'center' }}>{grid.visitorTeamName}</p>
                  </div>
                </div>
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
                    <div className="text-gray-500 text-xs flex items-center justify-center" style={{ height: '100%', minHeight: '180px', transform: 'rotate(-90deg)' }}>
                      <span style={{ display: 'inline-block', transform: 'rotate(0)' }}>Not assigned</span>
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
                        isHovered={hoveredSquare?.x_coordinate === xIdx && hoveredSquare?.y_coordinate === yIdx}
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
