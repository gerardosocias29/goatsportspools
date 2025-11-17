import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiCalendar, FiDownload, FiUpload } from 'react-icons/fi';
import { useAxios } from '../../app/contexts/AxiosContext';

/**
 * Manage Games Page - V2 Implementation
 * Matches V2 UI patterns with dark theme and Tailwind styling
 * Admin interface for creating and managing games for Squares Pools
 */
const ManageGames = () => {
  const navigate = useNavigate();
  const axiosService = useAxios();
  const [games, setGames] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [message, setMessage] = useState(null);

  // Form state - matches V1 structure
  const [formData, setFormData] = useState({
    game_datetime: '',
    home_team: null,
    visitor_team: null,
    favored_team: null,
    underdog_team: null,
  });

  useEffect(() => {
    loadGames();
    loadTeams();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    try {
      const response = await axiosService.get('/api/games/manage');
      setGames(response.data.data || response.data);
    } catch (error) {
      console.error('Error loading games:', error);
      setMessage({ type: 'error', text: 'Failed to load games. Please try again.' });
    }
    setLoading(false);
  };

  const loadTeams = async () => {
    try {
      const response = await axiosService.get('/api/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error loading teams:', error);
      setMessage({ type: 'error', text: 'Failed to load teams. Please try again.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = editingGame
        ? await axiosService.post(`/api/games/update/${editingGame.id}`, formData)
        : await axiosService.post('/api/games/create', formData);

      if (response.data.status) {
        setMessage({ type: 'success', text: response.data.message || 'Game saved successfully!' });
        setShowModal(false);
        resetForm();
        loadGames();

        // Auto-hide success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to save game' });
      }
    } catch (error) {
      console.error('Error saving game:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'An error occurred while saving the game' });
    }
    setLoading(false);
  };

  const handleEdit = (game) => {
    // Prevent editing completed games
    if (game.game_status === 'Final' || (game.home_team_score > 0 && game.visitor_team_score > 0)) {
      setMessage({ type: 'error', text: 'Completed games cannot be edited' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setEditingGame(game);

    // Find team objects from teams array
    const homeTeamObj = teams.find(t => t.name === game.home_team?.name || t.name === game.home_team);
    const visitorTeamObj = teams.find(t => t.name === game.visitor_team?.name || t.name === game.visitor_team);

    setFormData({
      game_datetime: game.game_datetime?.substring(0, 16) || '',
      home_team: homeTeamObj || null,
      visitor_team: visitorTeamObj || null,
      favored_team: homeTeamObj || null,
      underdog_team: visitorTeamObj || null,
    });
    setShowModal(true);
  };

  const handleDelete = async (gameId) => {
    // Find the game to check its status
    const game = games.find(g => g.id === gameId);
    if (game && game.game_status === 'Final') {
      setMessage({ type: 'error', text: 'Completed games cannot be deleted' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!window.confirm('Are you sure you want to delete this game?')) return;

    try {
      const response = await axiosService.delete(`/api/games/${gameId}`);
      setMessage({ type: 'success', text: 'Game deleted successfully!' });
      loadGames();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting game:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'An error occurred while deleting the game' });
    }
  };

  const resetForm = () => {
    setFormData({
      game_datetime: '',
      home_team: null,
      visitor_team: null,
      favored_team: null,
      underdog_team: null,
    });
    setEditingGame(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setMessage(null);
    resetForm();
  };

  // Get available teams for dropdown (excluding already selected team)
  const getAvailableHomeTeams = () => {
    if (!formData.visitor_team) return teams;
    return teams.filter(t => t.id !== formData.visitor_team.id);
  };

  const getAvailableVisitorTeams = () => {
    if (!formData.home_team) return teams;
    return teams.filter(t => t.id !== formData.home_team.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-900/50 border-green-500 text-green-200'
              : 'bg-red-900/50 border-red-500 text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-6">Game Management</h1>

          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Import/Export Buttons (Disabled) */}
            <div className="flex gap-3">
              <button
                disabled
                className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-gray-400 rounded-lg cursor-not-allowed opacity-50"
                title="Import functionality coming soon"
              >
                <FiUpload size={18} />
                Import Games
              </button>
              <button
                disabled
                className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-gray-400 rounded-lg cursor-not-allowed opacity-50"
                title="Export functionality coming soon"
              >
                <FiDownload size={18} />
                Export CSV
              </button>
            </div>

            {/* Create Game Button */}
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <FiPlus size={20} />
              Create Game
            </button>
          </div>
        </div>

        {/* Games Grid */}
        {loading && games.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <p className="text-white mt-4">Loading games...</p>
          </div>
        ) : games.length === 0 ? (
          <div className="bg-gray-800/50 rounded-xl p-12 text-center border border-gray-700">
            <FiCalendar size={64} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg">No games found. Create your first game!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-gray-800 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden border border-gray-700"
              >
                {/* Game Card Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <FiCalendar size={18} />
                      <span className="text-sm font-medium">
                        {new Date(game.game_datetime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      game.game_status === 'Final'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {game.game_status || 'Scheduled'}
                    </span>
                  </div>
                </div>

                {/* Teams */}
                <div className="p-6">
                  {/* Home Team */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700">
                    {game.home_team?.image_url && (
                      <img
                        src={game.home_team.image_url}
                        alt={game.home_team.name}
                        className="w-12 h-12 object-contain"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        {game.home_team?.name || game.home_team}
                      </p>
                      <p className="text-gray-400 text-sm">Home</p>
                    </div>
                  </div>

                  {/* Visitor Team */}
                  <div className="flex items-center gap-3">
                    {game.visitor_team?.image_url && (
                      <img
                        src={game.visitor_team.image_url}
                        alt={game.visitor_team.name}
                        className="w-12 h-12 object-contain"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        {game.visitor_team?.name || game.visitor_team}
                      </p>
                      <p className="text-gray-400 text-sm">Visitor</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-2">
                  {game.game_status === 'Final' || (game.home_team_score > 0 && game.visitor_team_score > 0) ? (
                    // Past game - show disabled state with tooltip
                    <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-gray-500 rounded-lg cursor-not-allowed" title="Completed games cannot be edited">
                      <FiEdit2 size={16} />
                      Locked
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(game)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <FiEdit2 size={16} />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(game.id)}
                    disabled={game.game_status === 'Final'}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                      game.game_status === 'Final'
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                    title={game.game_status === 'Final' ? 'Completed games cannot be deleted' : ''}
                  >
                    <FiTrash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={handleModalClose}
          >
            <div
              className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                {editingGame ? 'Edit Game' : 'Create New Game'}
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Game Date & Time */}
                <div className="mb-6">
                  <label className="block text-white font-semibold mb-2">
                    Game Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.game_datetime}
                    onChange={(e) => setFormData({ ...formData, game_datetime: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Home Team */}
                <div className="mb-6">
                  <label className="block text-white font-semibold mb-2">
                    Home Team *
                  </label>
                  <select
                    value={formData.home_team?.id || ''}
                    onChange={(e) => {
                      const team = teams.find(t => t.id === parseInt(e.target.value));
                      setFormData({
                        ...formData,
                        home_team: team,
                        favored_team: team
                      });
                    }}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Home Team</option>
                    {getAvailableHomeTeams().map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Visitor Team */}
                <div className="mb-6">
                  <label className="block text-white font-semibold mb-2">
                    Visitor Team *
                  </label>
                  <select
                    value={formData.visitor_team?.id || ''}
                    onChange={(e) => {
                      const team = teams.find(t => t.id === parseInt(e.target.value));
                      setFormData({
                        ...formData,
                        visitor_team: team,
                        underdog_team: team
                      });
                    }}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Visitor Team</option>
                    {getAvailableVisitorTeams().map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors duration-200"
                  >
                    <FiX size={20} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiCheck size={20} />
                    {loading ? 'Saving...' : (editingGame ? 'Update Game' : 'Create Game')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageGames;
