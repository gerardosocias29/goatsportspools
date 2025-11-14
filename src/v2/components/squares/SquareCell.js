import React from 'react';

/**
 * Individual Square Cell Component
 * Represents a single square in the 10x10 grid
 */
const SquareCell = ({
  square,
  isSelected,
  isHovered,
  isOwned,
  isCurrentUser,
  disabled,
  onClick,
  onMouseEnter,
  onMouseLeave,
  showNumbers,
}) => {
  const getCellStyles = () => {
    let baseStyles = 'w-full h-full min-h-[50px] md:min-h-[60px] lg:min-h-[70px] flex flex-col items-center justify-center text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer rounded-md border-2';

    if (disabled) {
      baseStyles += ' cursor-not-allowed opacity-50';
    }

    // Selected for purchase (current action)
    if (isSelected) {
      return `${baseStyles} bg-yellow-400 border-yellow-600 text-gray-900 shadow-lg scale-105`;
    }

    // Owned by current user
    if (isCurrentUser) {
      return `${baseStyles} bg-green-500 border-green-700 text-white shadow-md`;
    }

    // Owned by another player
    if (isOwned) {
      return `${baseStyles} bg-blue-500 border-blue-700 text-white`;
    }

    // Hovered
    if (isHovered && !disabled) {
      return `${baseStyles} bg-gray-200 border-gray-400 scale-105 shadow-md`;
    }

    // Available
    return `${baseStyles} bg-white border-gray-300 hover:bg-gray-100 hover:border-gray-400 hover:scale-105 hover:shadow-md`;
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(square);
    }
  };

  return (
    <div
      className={getCellStyles()}
      onClick={handleClick}
      onMouseEnter={() => onMouseEnter && onMouseEnter(square)}
      onMouseLeave={() => onMouseLeave && onMouseLeave()}
      title={square.playerName || 'Available'}
    >
      {/* Player initials or empty */}
      {square.playerInitials && (
        <div className="font-bold text-sm md:text-base">
          {square.playerInitials}
        </div>
      )}

      {/* Show numbers if assigned */}
      {showNumbers && square.xNumber !== null && square.yNumber !== null && (
        <div className="text-xs text-gray-600 mt-1">
          {square.xNumber}-{square.yNumber}
        </div>
      )}

      {/* Empty square indicator */}
      {!square.playerInitials && !disabled && (
        <div className="text-gray-400 text-2xl">+</div>
      )}
    </div>
  );
};

export default SquareCell;
