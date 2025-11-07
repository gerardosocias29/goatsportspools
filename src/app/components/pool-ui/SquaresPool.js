import React, { useState } from 'react';

/**
 * Football Squares Pool Component
 * A 10x10 grid-based betting game for football matches
 */
const SquaresPool = () => {
  // State management
  const [selectedSquares, setSelectedSquares] = useState([]);
  const [mySquares, setMySquares] = useState([]);
  const [poolStatus] = useState('OPEN');
  const [squaresFilled] = useState(18);
  const [totalSquares] = useState(100);
  const [maxSelectable] = useState(20);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Game setup
  const homeTeam = {
    name: 'Detroit Lions',
    abbreviation: 'DL',
    location: 'Home'
  };
  
  const awayTeam = {
    name: 'Tampa Bay Buccaneers',
    abbreviation: 'TB',
    location: 'Away'
  };

  // Random numbers for grid axes (0-9)
  const homeNumbers = [0, 7, 3, 4, 1, 6, 9, 2, 5, 8];
  const awayNumbers = [4, 2, 9, 1, 6, 8, 3, 0, 7, 5];

  // Prize structure
  const prizePool = 1000;
  const quarterPrizes = {
    Q1: 200,
    Q2: 300,
    Q3: 200,
    Q4: 300
  };

  // Grid data - representing square ownership
  // Empty string = available, initials = taken
  const gridData = [
    ['', 'U99', 'U74', 'U95', '', '', '', 'U99', '', 'U23'],
    ['', '', '', 'U95', '', 'U1', 'U72', '', 'U63', ''],
    ['', '', '', '', '', 'U1', '', '', 'U35', ''],
    ['', '', '', '', '', '', '', 'U2', '', 'U81'],
    ['', '', '', '', '', '', 'U66', 'U65', '', ''],
    ['', '', '', 'U44', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', 'U78', ''],
    ['', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', 'U79'],
  ];

  // Calculate available squares
  const availableSquares = totalSquares - squaresFilled;

  // Handle square selection
  const handleSquareClick = (rowIndex, colIndex) => {
    const squareId = `${rowIndex}-${colIndex}`;
    const isTaken = gridData[rowIndex][colIndex] !== '';
    
    if (isTaken) return; // Can't select taken squares
    
    if (selectedSquares.includes(squareId)) {
      // Deselect
      setSelectedSquares(selectedSquares.filter(id => id !== squareId));
    } else {
      // Select if under limit
      if (selectedSquares.length < maxSelectable) {
        setSelectedSquares([...selectedSquares, squareId]);
      }
    }
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedSquares([]);
  };

  // Purchase selected squares
  const handlePurchase = () => {
    if (selectedSquares.length === 0) return;
    
    const cost = selectedSquares.length * 5; // $5 per square
    const confirmPurchase = window.confirm(
      `Purchase ${selectedSquares.length} square(s) for $${cost}?`
    );
    
    if (confirmPurchase) {
      // TODO: Integrate with backend API
      console.log('Purchasing squares:', selectedSquares);
      // After successful purchase, update gridData and mySquares
      setMySquares([...mySquares, ...selectedSquares]);
      setSelectedSquares([]);
    }
  };

  // View my squares
  const handleMySquares = () => {
    // TODO: Implement modal or navigation to show user's squares
    console.log('My Squares:', mySquares);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-4xl">🏈</span>
                Football Squares Pool
                <span className="inline-flex items-center px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full ml-2">
                  {poolStatus}
                </span>
              </h1>
              <p className="text-gray-600 mt-1">Pick your squares and win based on quarterly scores!</p>
            </div>
          </div>

          {/* Game Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Teams */}
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="bg-blue-600 text-white rounded-lg px-6 py-3 mb-2">
                    <div className="text-2xl font-bold">{homeTeam.abbreviation}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">{homeTeam.name}</div>
                  <div className="text-xs text-gray-500">{homeTeam.location}</div>
                </div>

                <div className="text-3xl font-bold text-gray-400">VS</div>

                <div className="text-center">
                  <div className="bg-red-600 text-white rounded-lg px-6 py-3 mb-2">
                    <div className="text-2xl font-bold">{awayTeam.abbreviation}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">{awayTeam.name}</div>
                  <div className="text-xs text-gray-500">{awayTeam.location}</div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Total Squares</div>
                <div className="text-2xl font-bold text-gray-900">{totalSquares}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Filled</div>
                <div className="text-2xl font-bold text-green-600">{squaresFilled}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Available</div>
                <div className="text-2xl font-bold text-blue-600">{availableSquares}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">My Squares</div>
                <div className="text-2xl font-bold text-purple-600">{mySquares.length}</div>
              </div>
            </div>

            {/* Selection Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center md:text-left">
                <div className="text-sm text-gray-600 mb-1">Selected</div>
                <div className="text-xl font-bold text-yellow-600">
                  {selectedSquares.length}/{maxSelectable}
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="text-sm text-gray-600 mb-1">Total Cost</div>
                <div className="text-xl font-bold text-gray-900">
                  ${selectedSquares.length * 5}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prize Pool Section */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🏆</span>
            <h2 className="text-xl font-bold text-gray-900">Prize Pool: ${prizePool}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(quarterPrizes).map(([quarter, prize]) => (
              <div
                key={quarter}
                className="bg-white rounded-lg p-4 text-center border border-yellow-200 shadow-sm"
              >
                <div className="text-sm font-semibold text-gray-600 mb-1">{quarter}</div>
                <div className="text-2xl font-bold text-yellow-600">${prize}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded"></div>
              <span className="text-sm font-medium text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 border-2 border-green-600 rounded"></div>
              <span className="text-sm font-medium text-gray-700">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 border-2 border-orange-600 rounded text-white text-xs flex items-center justify-center font-bold">U1</div>
              <span className="text-sm font-medium text-gray-700">Taken</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500 border-2 border-purple-600 rounded text-white text-xs flex items-center justify-center font-bold">ME</div>
              <span className="text-sm font-medium text-gray-700">Your Squares</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-400 border-2 border-yellow-500 rounded"></div>
              <span className="text-sm font-medium text-gray-700">Winning Square</span>
            </div>
          </div>
        </div>

        {/* Grid Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200 flex gap-4">
          <div>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Grid Table */}
                <div className="flex items-start gap-2">
                  {/* Away Team Label (Vertical) */}
                  <div className="flex flex-col" style={{ width: '32px' }}>
                    <div className="h-8 flex-shrink-0 mb-1"></div>
                    <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0"></div>
                    <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 'calc(10 * (3rem - 0.5rem))', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="text-sm font-bold text-red-600 whitespace-nowrap tracking-wider w-full">
                      {awayTeam.name.toUpperCase()}
                    </div>
                  </div>

                  {/* Main Grid */}
                  <div className="flex-1">
                    {/* Home Team Label (Horizontal) */}
                    <div className="flex mb-1">
                      <div className="w-12 h-8 md:w-16 md:h-8 flex-shrink-0"></div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-sm font-bold text-blue-600 tracking-widest">
                          {homeTeam.name.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="flex">
                      {/* Top-left corner cell */}
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 border-2 border-gray-400 flex-shrink-0"></div>
                      
                      {/* Home team numbers (horizontal) */}
                      {homeNumbers.map((num, i) => (
                        <div
                          key={i}
                          className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 text-white flex items-center justify-center font-bold text-lg md:text-xl border-2 border-blue-700 flex-shrink-0 -ml-0.5"
                        >
                          {num}
                        </div>
                      ))}
                    </div>

                    {/* Grid rows with away numbers */}
                    {gridData.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex -mt-0.5">
                        {/* Away team number for this row */}
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-red-600 text-white flex items-center justify-center font-bold text-lg md:text-xl border-2 border-red-700 flex-shrink-0">
                          {awayNumbers[rowIndex]}
                        </div>

                        {/* Square cells */}
                        {row.map((square, colIndex) => {
                          const squareId = `${rowIndex}-${colIndex}`;
                          const isSelected = selectedSquares.includes(squareId);
                          const isTaken = square !== '';
                          const isMine = mySquares.includes(squareId);

                          let cellClass = 'w-12 h-12 md:w-16 md:h-16 flex items-center justify-center font-bold text-xs border-2 cursor-pointer transition-all duration-200 flex-shrink-0 -ml-0.5 ';

                          if (isMine) {
                            cellClass += 'bg-purple-500 text-white border-purple-600 hover:bg-purple-600';
                          } else if (isSelected) {
                            cellClass += 'bg-green-500 text-white border-green-600';
                          } else if (isTaken) {
                            cellClass += 'bg-orange-500 text-white border-orange-600';
                          } else {
                            cellClass += 'bg-white hover:bg-green-100 hover:border-green-500 border-gray-300';
                          }

                          return (
                            <div
                              key={colIndex}
                              onClick={() => handleSquareClick(rowIndex, colIndex)}
                              className={cellClass}
                              title={isTaken ? `Taken by ${square}` : isSelected ? 'Click to deselect' : 'Click to select'}
                            >
                              {isMine ? 'ME' : square}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-center text-sm text-gray-600">
                  <p>Numbers on sides represent last digit of each team's score</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 min-w-[180px] w-full">
            <div className='mb-1 h-[30px]'></div>
            {/* ADD ACTION BUTTONS HERE */}
            <button
              onClick={handleMySquares}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>👤</span>
              <span className="text-sm">My Squares</span>
            </button>
            
            <button
              onClick={() => setShowHowToPlay(!showHowToPlay)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>ℹ️</span>
              <span className="text-sm">How to Play</span>
            </button>
            
            {selectedSquares.length > 0 && (
              <button
                onClick={handleClearSelection}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>✕</span>
                <span className="text-sm">Clear</span>
              </button>
            )}
            
            <button
              onClick={handlePurchase}
              disabled={selectedSquares.length === 0}
              className={`font-semibold px-4 py-3 rounded-lg transition-colors flex flex-col items-center justify-center gap-1 whitespace-nowrap ${
                selectedSquares.length > 0
                  ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span className="text-xl">🛒</span>
              <span className="text-xs">Purchase</span>
              <span className="text-sm font-bold">{selectedSquares.length} sq</span>
              <span className="text-xs">${selectedSquares.length * 5}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={handleMySquares}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>👤</span>
                My Squares
              </button>
              <button
                onClick={() => setShowHowToPlay(!showHowToPlay)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>ℹ️</span>
                How to Play
              </button>
            </div>

            <div className="flex gap-3">
              {selectedSquares.length > 0 && (
                <button
                  onClick={handleClearSelection}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>✕</span>
                  Clear Selection
                </button>
              )}
              <button
                onClick={handlePurchase}
                disabled={selectedSquares.length === 0}
                className={`font-semibold px-8 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                  selectedSquares.length > 0
                    ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>🛒</span>
                Purchase {selectedSquares.length} Square{selectedSquares.length !== 1 ? 's' : ''} (${selectedSquares.length * 5})
              </button>
            </div>
          </div>
        </div> */}

        {/* How to Play Section */}
        {showHowToPlay && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📖</span>
              How to Play
            </h3>
            <div className="space-y-3 text-gray-700">
              <p><strong>1.</strong> Select up to {maxSelectable} squares on the grid by clicking on available (white) squares.</p>
              <p><strong>2.</strong> Each square costs $5. Purchase your selected squares.</p>
              <p><strong>3.</strong> Numbers (0-9) are randomly assigned to each team after all squares are filled.</p>
              <p><strong>4.</strong> Winners are determined by the last digit of each team's score at the end of each quarter.</p>
              <p><strong>5.</strong> Find where the two numbers intersect on the grid - that square wins the quarter prize!</p>
              <p className="text-sm italic pt-2 border-t border-blue-200">
                Example: If Detroit has 17 points (last digit 7) and Tampa Bay has 14 points (last digit 4), 
                the winning square is where column 7 and row 4 meet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SquaresPool;
