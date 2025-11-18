import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGrid, FiDollarSign, FiUsers, FiTrendingUp, FiPlus, FiEye } from 'react-icons/fi';
import squaresMockService, { mockCurrentUser } from '../services/squaresMockData';

/**
 * Squares Admin Dashboard
 * Manage all pools created by the admin
 */
const SquaresAdminDashboard = () => {
  const navigate = useNavigate();
  const [pools, setPools] = useState([]);
  const [stats, setStats] = useState({
    totalPools: 0,
    activePools: 0,
    totalRevenue: 0,
    freeGridsRemaining: 10,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await squaresMockService.getGrids();
      if (response.success) {
        const allPools = response.data;
        // Filter pools created by current user
        const myPools = allPools.filter(p => p.admin === mockCurrentUser.playerID);
        setPools(myPools);

        // Calculate stats
        const activePools = myPools.filter(p => p.pool_status === 'open' || p.pool_status === 'in_progress').length;
        const totalRevenue = myPools.reduce((sum, p) => sum + (p.selectedSquares * p.costPerSquare), 0);
        const freeGrids = Math.max(0, 10 - myPools.filter(p => p.gridFeeType === 'Free').length);

        setStats({
          totalPools: myPools.length,
          activePools,
          totalRevenue,
          freeGridsRemaining: freeGrids,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { bg: 'bg-green-500', text: 'Open' },
      closed: { bg: 'bg-red-500', text: 'Closed' },
      in_progress: { bg: 'bg-blue-500', text: 'In Progress' },
      completed: { bg: 'bg-gray-500', text: 'Completed' },
    };
    return badges[status] || { bg: 'bg-gray-500', text: status };
  };

  const handleCreatePool = () => {
    navigate('/v2/squares/create');
  };

  const handleViewPool = (poolId) => {
    navigate(`/v2/squares/pool/${poolId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-300 text-lg">
                Manage your squares pools
              </p>
            </div>
            <button
              onClick={handleCreatePool}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <FiPlus className="text-xl" />
              Create New Pool
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Pools */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total Pools</p>
                <p className="text-white text-4xl font-bold mt-2">{stats.totalPools}</p>
              </div>
              <div className="bg-blue-500 bg-opacity-30 p-4 rounded-lg">
                <FiGrid className="text-white text-3xl" />
              </div>
            </div>
          </div>

          {/* Active Pools */}
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">Active Pools</p>
                <p className="text-white text-4xl font-bold mt-2">{stats.activePools}</p>
              </div>
              <div className="bg-green-500 bg-opacity-30 p-4 rounded-lg">
                <FiTrendingUp className="text-white text-3xl" />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Total Revenue</p>
                <p className="text-white text-4xl font-bold mt-2">${(stats.totalRevenue || 0).toFixed(0)}</p>
              </div>
              <div className="bg-purple-500 bg-opacity-30 p-4 rounded-lg">
                <FiDollarSign className="text-white text-3xl" />
              </div>
            </div>
          </div>

          {/* Free Grids */}
          <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm font-medium">Free Grids Left</p>
                <p className="text-white text-4xl font-bold mt-2">{stats.freeGridsRemaining}</p>
              </div>
              <div className="bg-yellow-500 bg-opacity-30 p-4 rounded-lg">
                <FiUsers className="text-white text-3xl" />
              </div>
            </div>
            <div className="mt-3 text-yellow-100 text-xs">
              {stats.freeGridsRemaining > 0 ? 'Promotion active' : 'Next 50 minimal fee'}
            </div>
          </div>
        </div>

        {/* Pools List */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Your Pools</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 mt-4">Loading pools...</p>
            </div>
          ) : pools.length === 0 ? (
            <div className="text-center py-12">
              <FiGrid className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-xl mb-6">No pools created yet</p>
              <button
                onClick={handleCreatePool}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Create Your First Pool
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 font-medium py-3 px-4">Pool Name</th>
                    <th className="text-left text-gray-400 font-medium py-3 px-4">Game</th>
                    <th className="text-center text-gray-400 font-medium py-3 px-4">Status</th>
                    <th className="text-center text-gray-400 font-medium py-3 px-4">Progress</th>
                    <th className="text-center text-gray-400 font-medium py-3 px-4">Revenue</th>
                    <th className="text-center text-gray-400 font-medium py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pools.map((pool) => {
                    const status = getStatusBadge(pool.pool_status);
                    const progress = pool.totalSquares ? ((pool.selectedSquares / pool.totalSquares) * 100).toFixed(0) : 0;
                    const revenue = ((pool.selectedSquares || 0) * (pool.costPerSquare || 0)).toFixed(2);

                    return (
                      <tr
                        key={pool.id}
                        className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="text-white font-semibold">{pool.gridName}</div>
                          <div className="text-gray-400 text-sm">#{pool.poolNumber}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-gray-300 text-sm">
                            {pool.game?.homeTeam} vs {pool.game?.visitorTeam}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {formatDate(pool.game?.gameTime)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`${status.bg} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="text-white font-semibold">{progress}%</div>
                          <div className="text-gray-400 text-xs">
                            {pool.selectedSquares}/100
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="text-green-400 font-bold">${revenue}</div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleViewPool(pool.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all inline-flex items-center gap-2"
                          >
                            <FiEye />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SquaresAdminDashboard;
