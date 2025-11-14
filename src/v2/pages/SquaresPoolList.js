import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiUsers, FiDollarSign, FiGrid, FiLock, FiUnlock } from 'react-icons/fi';
import squaresMockService from '../services/squaresMockData';

/**
 * Squares Pool List Page
 * Shows all available squares pools
 */
const SquaresPoolList = () => {
  const navigate = useNavigate();
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all',
    league: 'all',
  });

  useEffect(() => {
    loadPools();
  }, [filter]);

  const loadPools = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filter.status !== 'all') filters.status = filter.status;
      if (filter.league !== 'all') filters.league = filter.league;

      const response = await squaresMockService.getGrids(filters);
      if (response.success) {
        setPools(response.data);
      }
    } catch (error) {
      console.error('Error loading pools:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      SelectOpen: 'bg-green-500 text-white',
      SelectClosed: 'bg-yellow-500 text-gray-900',
      GameStarted: 'bg-blue-500 text-white',
      GameCompleted: 'bg-gray-500 text-white',
      Closed: 'bg-red-500 text-white',
    };
    return badges[status] || 'bg-gray-300 text-gray-700';
  };

  const getStatusText = (status) => {
    const texts = {
      SelectOpen: 'Open for Selection',
      SelectClosed: 'Selection Closed',
      GameStarted: 'Game in Progress',
      GameCompleted: 'Completed',
      Closed: 'Closed',
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getProgressPercentage = (pool) => {
    if (!pool.totalSquares) return 0;
    return ((pool.selectedSquares / pool.totalSquares) * 100).toFixed(0);
  };

  const handlePoolClick = (poolId) => {
    navigate(`/v2/squares/pool/${poolId}`);
  };

  const handleCreatePool = () => {
    navigate('/v2/squares/create');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Squares Pools
              </h1>
              <p className="text-gray-300 text-lg">
                Join a pool and pick your winning squares
              </p>
            </div>
            <button
              onClick={handleCreatePool}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <FiGrid className="text-xl" />
              Create New Pool
            </button>
          </div>
        </div>

        {/* Promo Banner */}
        <div className="mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🎉</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                Special Launch Promotion!
              </h3>
              <p className="text-gray-800 text-lg">
                First 10 grids FREE! Next 50 grids minimal fee. Create your pool now!
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-lg flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Status
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="SelectOpen">Open for Selection</option>
              <option value="SelectClosed">Selection Closed</option>
              <option value="GameStarted">Game Started</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              League
            </label>
            <select
              value={filter.league}
              onChange={(e) => setFilter({ ...filter, league: e.target.value })}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Leagues</option>
              <option value="NFL">NFL</option>
              <option value="NBA">NBA</option>
              <option value="NCAAF">NCAA Football</option>
              <option value="NCAAB">NCAA Basketball</option>
            </select>
          </div>
        </div>

        {/* Pools Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-300 mt-4">Loading pools...</p>
          </div>
        ) : pools.length === 0 ? (
          <div className="text-center py-20 bg-gray-800 rounded-xl">
            <FiGrid className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No pools found</p>
            <button
              onClick={handleCreatePool}
              className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Create the First Pool
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool) => (
              <div
                key={pool.id}
                onClick={() => handlePoolClick(pool.id)}
                className="bg-gray-800 rounded-xl shadow-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer border-2 border-gray-700 hover:border-blue-500"
              >
                {/* Status Badge */}
                <div className={`${getStatusBadge(pool.gridStatus)} px-4 py-2 text-sm font-semibold text-center`}>
                  {getStatusText(pool.gridStatus)}
                </div>

                {/* Pool Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {pool.gridName}
                  </h3>

                  {/* Game Info */}
                  {pool.game && (
                    <div className="mb-4 pb-4 border-b border-gray-700">
                      <div className="flex items-center gap-2 text-blue-400 text-sm mb-2">
                        <span className="font-semibold">{pool.game.league}</span>
                      </div>
                      <div className="text-gray-300 text-sm font-medium">
                        {pool.game.homeTeam} vs {pool.game.visitorTeam}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
                        <FiCalendar />
                        {formatDate(pool.game.gameTime)}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Squares Filled</span>
                        <span className="text-white font-semibold">
                          {pool.selectedSquares}/{pool.totalSquares}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-500"
                          style={{ width: `${getProgressPercentage(pool)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Cost per Square */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <FiDollarSign />
                        <span>Per Square</span>
                      </div>
                      <span className="text-green-400 font-bold text-lg">
                        ${(pool.costPerSquare || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Total Pot */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <FiUsers />
                        <span>Total Pot</span>
                      </div>
                      <span className="text-yellow-400 font-bold text-lg">
                        ${(pool.totalPot || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Access Type */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        {pool.costType === 'PasswordOpen' ? <FiLock /> : <FiUnlock />}
                        <span>Access</span>
                      </div>
                      <span className="text-gray-300 text-sm">
                        {pool.costType === 'PasswordOpen' ? 'Password Required' : 'Open'}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePoolClick(pool.id);
                    }}
                  >
                    {pool.gridStatus === 'SelectOpen' ? 'Join & Select Squares' : 'View Pool'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SquaresPoolList;
