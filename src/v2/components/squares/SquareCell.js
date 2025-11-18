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
  // Debug: Log owned squares
  React.useEffect(() => {
    if (isOwned && square.x_coordinate === 0 && square.y_coordinate === 0) {
      console.log('SquareCell [0,0] - isOwned:', isOwned);
      console.log('SquareCell [0,0] - isCurrentUser:', isCurrentUser);
      console.log('SquareCell [0,0] - square:', square);
      console.log('SquareCell [0,0] - playerInitials:', square.playerInitials);
    }
  }, [isOwned, square]);

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
      {showNumbers && square.x_number !== null && square.x_number !== undefined &&
       square.y_number !== null && square.y_number !== undefined && (
        <div className="text-xs font-bold mt-1">
          {square.x_number}-{square.y_number}
        </div>
      )}

      {/* Empty square indicator */}
      {!square.playerInitials && !isOwned && (
        <div className="text-gray-400 text-2xl font-light">+</div>
      )}
    </div>
  );
};

export default SquareCell;
