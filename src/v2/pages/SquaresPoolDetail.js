import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiDollarSign, FiGrid, FiUsers, FiLock, FiTrendingUp } from 'react-icons/fi';
import SquaresGrid from '../components/squares/SquaresGrid';
import squaresMockService, { mockCurrentUser } from '../services/squaresMockData';

/**
 * Pool Detail Page
 * Shows grid details and allows square selection
 */
const SquaresPoolDetail = () => {
  const { poolId } = useParams();
  const navigate = useNavigate();

  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSquares, setSelectedSquares] = useState([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinPassword, setJoinPassword] = useState('');
  const [joinError, setJoinError] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);

  useEffect(() => {
    loadPool();
  }, [poolId]);

  const loadPool = async () => {
    setLoading(true);
    try {
      const response = await squaresMockService.getGrid(poolId);
      if (response.success) {
        setPool(response.data);

        // Check if user has already joined
        const playerGridsResponse = await squaresMockService.getPlayerGrids(mockCurrentUser.playerID);
        if (playerGridsResponse.success) {
          const joined = playerGridsResponse.data.some(g => g.id === parseInt(poolId));
          setHasJoined(joined);
        }
      }
    } catch (error) {
      console.error('Error loading pool:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPool = async () => {
    setJoinError('');
    try {
      const response = await squaresMockService.joinGrid(poolId, joinPassword);
      if (response.success) {
        setHasJoined(true);
        setShowJoinModal(false);
        setJoinPassword('');
      } else {
        setJoinError(response.error);
      }
    } catch (error) {
      setJoinError('Failed to join pool');
    }
  };

  const handleSquareSelection = (squares) => {
    setSelectedSquares(squares);
  };

  const handleConfirmSelection = async () => {
    if (selectedSquares.length === 0) return;

    const coordinates = selectedSquares.map(s => ({ x: s.xCoordinate, y: s.yCoordinate }));

    try {
      const response = await squaresMockService.selectSquares(poolId, coordinates);
      if (response.success) {
        // Reload pool to get updated data
        await loadPool();
        setSelectedSquares([]);
        setSelectionMode(false);
        alert(`Successfully selected ${coordinates.length} square(s)!`);
      } else {
        alert(response.error);
      }
    } catch (error) {
      alert('Failed to select squares');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getProgressPercentage = () => {
    if (!pool || !pool.totalSquares) return 0;
    return ((pool.selectedSquares / pool.totalSquares) * 100).toFixed(0);
  };

  const getTotalCost = () => {
    if (!pool || pool.costPerSquare === undefined) return '0.00';
    return (selectedSquares.length * pool.costPerSquare).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-white mt-4 text-xl">Loading pool...</p>
        </div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-2xl mb-4">Pool not found</p>
          <button
            onClick={() => navigate('/v2/squares')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Back to Pools
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/v2/squares')}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-all"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {pool.gridName}
            </h1>
            <p className="text-gray-300 mt-1">Pool #{pool.poolNumber}</p>
          </div>
        </div>

        {/* Pool Info Card */}
        <div className="mb-6 bg-gray-800 rounded-xl shadow-xl p-6 border-2 border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Game Info */}
            <div>
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <FiCalendar />
                <span className="text-sm font-medium">Game</span>
              </div>
              <div className="text-white font-bold text-lg">
                {pool.game?.homeTeam} vs {pool.game?.visitorTeam}
              </div>
              <div className="text-gray-400 text-sm mt-1">
                {pool.game?.league} • {formatDate(pool.game?.gameTime)}
              </div>
            </div>

            {/* Cost & Pot */}
            <div>
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <FiDollarSign />
                <span className="text-sm font-medium">Cost & Pot</span>
              </div>
              <div className="text-green-400 font-bold text-2xl">
                ${(pool.costPerSquare || 0).toFixed(2)}
              </div>
              <div className="text-gray-400 text-sm mt-1">
                Total Pot: <span className="text-yellow-400 font-semibold">${(pool.totalPot || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <FiGrid />
                <span className="text-sm font-medium">Progress</span>
              </div>
              <div className="text-white font-bold text-2xl">
                {getProgressPercentage()}%
              </div>
              <div className="text-gray-400 text-sm mt-1">
                {pool.selectedSquares}/{pool.totalSquares} squares filled
              </div>
            </div>

            {/* Rewards */}
            <div>
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <FiTrendingUp />
                <span className="text-sm font-medium">Rewards</span>
              </div>
              <div className="text-purple-400 font-bold text-lg">
                {pool.rewardType?.name || 'Standard'}
              </div>
              <div className="text-gray-400 text-sm mt-1">
                {pool.rewardType?.description}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Join/Selection Controls */}
        {!hasJoined ? (
          <div className="mb-6 bg-yellow-500 border-2 border-yellow-600 rounded-xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <FiLock className="text-4xl text-gray-900" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Join this pool to select squares</h3>
                  <p className="text-gray-800">You need to join before you can pick squares</p>
                </div>
              </div>
              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all shadow-lg"
              >
                Join Pool
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-gray-800 rounded-xl p-4 shadow-xl border-2 border-gray-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-green-400 text-3xl">✓</div>
                <div>
                  <h3 className="text-lg font-bold text-white">You've joined this pool!</h3>
                  <p className="text-gray-400 text-sm">
                    {selectionMode ? 'Click squares to select them' : 'Click "Select Squares" to start choosing'}
                  </p>
                </div>
              </div>

              {!selectionMode ? (
                <button
                  onClick={() => setSelectionMode(true)}
                  disabled={pool.gridStatus !== 'SelectOpen'}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg"
                >
                  Select Squares
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectionMode(false);
                      setSelectedSquares([]);
                    }}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSelection}
                    disabled={selectedSquares.length === 0}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg"
                  >
                    Confirm {selectedSquares.length > 0 && `(${selectedSquares.length})`}
                  </button>
                </div>
              )}
            </div>

            {selectionMode && selectedSquares.length > 0 && (
              <div className="mt-4 p-4 bg-blue-900 rounded-lg border border-blue-700">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">
                    {selectedSquares.length} square{selectedSquares.length !== 1 ? 's' : ''} selected
                  </span>
                  <span className="text-green-400 font-bold text-xl">
                    Total: ${getTotalCost()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grid */}
        <div className="mb-8">
          <SquaresGrid
            grid={pool}
            squares={pool.squares || []}
            onSquareSelect={handleSquareSelection}
            currentPlayerID={mockCurrentUser.playerID}
            selectionMode={selectionMode}
            disabled={!hasJoined || pool.gridStatus !== 'SelectOpen'}
          />
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pool Rules */}
          <div className="bg-gray-800 rounded-xl p-6 border-2 border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Pool Rules</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <span className="text-green-400 font-bold">•</span>
                <p>Max {pool.maxSquaresPerPlayer || 'Unlimited'} squares per player</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 font-bold">•</span>
                <p>Numbers assignment: {pool.numbersType}</p>
              </div>
              {pool.numbersAssignDate && (
                <div className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">•</span>
                  <p>Numbers assigned on: {formatDate(pool.numbersAssignDate)}</p>
                </div>
              )}
              {pool.closeDate && (
                <div className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">•</span>
                  <p>Pool closes: {formatDate(pool.closeDate)}</p>
                </div>
              )}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gray-800 rounded-xl p-6 border-2 border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">1.</span>
                <p>Select your squares on the 10x10 grid</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">2.</span>
                <p>Numbers (0-9) are assigned to each axis</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">3.</span>
                <p>Winners determined by last digit of each team's score</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">4.</span>
                <p>Prizes distributed based on reward structure</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border-2 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Join Pool</h2>
            <p className="text-gray-300 mb-6">
              {pool.costType === 'PasswordOpen'
                ? 'Enter the pool password to join'
                : 'Click join to enter this pool'}
            </p>

            {pool.costType === 'PasswordOpen' && (
              <div className="mb-6">
                <label className="block text-gray-300 font-medium mb-2">
                  Pool Password
                </label>
                <input
                  type="password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinPool()}
                />
              </div>
            )}

            {joinError && (
              <div className="mb-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                {joinError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinError('');
                  setJoinPassword('');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinPool}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold transition-all"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SquaresPoolDetail;
