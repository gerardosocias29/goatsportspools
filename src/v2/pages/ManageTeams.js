import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiUsers, FiFilter } from 'react-icons/fi';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmModal from '../components/ui/ConfirmModal';

/**
 * Manage Teams Page - V2 Implementation
 * Admin interface for creating and managing teams
 */
const ManageTeams = () => {
  const navigate = useNavigate();
  const axiosService = useAxios();
  const { colors, isDark } = useTheme();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [message, setMessage] = useState(null);
  const [filterLeague, setFilterLeague] = useState(''); // Filter by league

  // Confirm modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'warning',
    onConfirm: () => {},
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    league: 'NFL',
    nickname: '',
    code: '',
    conference: '',
    image_url: '',
  });

  useEffect(() => {
    loadTeams();
  }, [filterLeague]);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const params = filterLeague ? `?league=${filterLeague}` : '';
      const response = await axiosService.get(`/api/teams${params}`);
      setTeams(response.data || []);
    } catch (error) {
      console.error('Error loading teams:', error);
      setMessage({ type: 'error', text: 'Failed to load teams. Please try again.' });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = editingTeam
        ? await axiosService.post(`/api/teams/${editingTeam.id}`, formData)
        : await axiosService.post('/api/teams', formData);

      if (response.data.status) {
        setMessage({ type: 'success', text: response.data.message || 'Team saved successfully!' });
        setShowModal(false);
        resetForm();
        loadTeams();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to save team' });
      }
    } catch (error) {
      console.error('Error saving team:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'An error occurred while saving the team' });
    }
    setLoading(false);
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name || '',
      league: team.league || 'NFL',
      nickname: team.nickname || '',
      code: team.code || '',
      conference: team.conference || '',
      image_url: team.image_url || '',
    });
    setShowModal(true);
  };

  const handleDelete = (teamId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Team',
      message: 'Are you sure you want to delete this team? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await axiosService.delete(`/api/teams/${teamId}`);
          setMessage({ type: 'success', text: 'Team deleted successfully!' });
          loadTeams();
          setTimeout(() => setMessage(null), 3000);
        } catch (error) {
          console.error('Error deleting team:', error);
          setMessage({ type: 'error', text: error.response?.data?.message || 'An error occurred while deleting the team' });
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      league: 'NFL',
      nickname: '',
      code: '',
      conference: '',
      image_url: '',
    });
    setEditingTeam(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setMessage(null);
    resetForm();
  };

  const getLeagueEmoji = (league) => {
    switch (league) {
      case 'NFL': return '🏈';
      case 'NBA': return '🏀';
      case 'PBA': return '🎳';
      default: return '🏆';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: colors.background }}>
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
          <h1 className="text-4xl font-bold mb-6" style={{ color: colors.text }}>Team Management</h1>

          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* League Filter */}
            <div className="flex items-center gap-3">
              <FiFilter style={{ color: colors.text }} />
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterLeague('')}
                  className="px-4 py-2 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: filterLeague === '' ? colors.brand.primary : (isDark ? '#374151' : '#E5E7EB'),
                    color: filterLeague === '' ? '#FFFFFF' : colors.text,
                    border: `2px solid ${filterLeague === '' ? colors.brand.primary : colors.border}`,
                  }}
                >
                  All
                </button>
                {['NFL', 'NBA', 'PBA'].map(league => (
                  <button
                    key={league}
                    onClick={() => setFilterLeague(league)}
                    className="px-4 py-2 rounded-lg font-semibold transition-all"
                    style={{
                      backgroundColor: filterLeague === league ? colors.brand.primary : (isDark ? '#374151' : '#E5E7EB'),
                      color: filterLeague === league ? '#FFFFFF' : colors.text,
                      border: `2px solid ${filterLeague === league ? colors.brand.primary : colors.border}`,
                    }}
                  >
                    {getLeagueEmoji(league)} {league}
                  </button>
                ))}
              </div>
            </div>

            {/* Create Team Button */}
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
              style={{ backgroundColor: colors.brand.primary }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.brand.primaryHover}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.brand.primary}
            >
              <FiPlus size={20} />
              Add Team
            </button>
          </div>
        </div>

        {/* Teams Grid */}
        {loading && teams.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderTopColor: colors.brand.primary, borderBottomColor: colors.brand.primary }}></div>
            <p className="mt-4" style={{ color: colors.text }}>Loading teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
            <FiUsers size={64} className="mx-auto mb-4" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }} />
            <p className="text-lg" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
              {filterLeague ? `No ${filterLeague} teams found. Add your first team!` : 'No teams found. Create your first team!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teams.map((team) => (
              <div
                key={team.id}
                className="rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
                style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
              >
                {/* Team Card Header */}
                <div className="px-4 py-3" style={{ backgroundColor: colors.brand.primary }}>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                      {getLeagueEmoji(team.league)} {team.league || 'NFL'}
                    </span>
                    {team.conference && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                        {team.conference}
                      </span>
                    )}
                  </div>
                </div>

                {/* Team Info */}
                <div className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    {team.image_url ? (
                      <img
                        src={team.image_url}
                        alt={team.name}
                        className="w-16 h-16 object-contain"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                        style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB', color: colors.text }}
                      >
                        {team.code || team.name?.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg" style={{ color: colors.text }}>
                        {team.name}
                      </h3>
                      {team.nickname && (
                        <p className="text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                          {team.nickname}
                        </p>
                      )}
                      {team.code && (
                        <p className="text-xs mt-1 px-2 py-0.5 rounded inline-block" style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB', color: colors.text }}>
                          {team.code}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(team)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-white rounded-lg transition-colors duration-200"
                      style={{ backgroundColor: colors.brand.primary }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.brand.primaryHover}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.brand.primary}
                    >
                      <FiEdit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(team.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <FiTrash2 size={16} />
                      Delete
                    </button>
                  </div>
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
              className="rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: colors.card, border: `2px solid ${colors.brand.primary}` }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold mb-6" style={{ color: colors.text }}>
                {editingTeam ? 'Edit Team' : 'Add New Team'}
              </h2>

              <form onSubmit={handleSubmit}>
                {/* League Selection */}
                <div className="mb-6">
                  <label className="block font-semibold mb-2" style={{ color: colors.text }}>
                    League *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['NFL', 'NBA', 'PBA'].map(league => (
                      <button
                        key={league}
                        type="button"
                        onClick={() => setFormData({ ...formData, league })}
                        className="px-4 py-3 rounded-lg font-semibold transition-all"
                        style={{
                          backgroundColor: formData.league === league ? colors.brand.primary : (isDark ? '#374151' : '#E5E7EB'),
                          color: formData.league === league ? '#FFFFFF' : colors.text,
                          border: `2px solid ${formData.league === league ? colors.brand.primary : colors.border}`,
                        }}
                      >
                        {getLeagueEmoji(league)} {league}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Team Name */}
                <div className="mb-6">
                  <label className="block font-semibold mb-2" style={{ color: colors.text }}>
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                    placeholder="e.g., Kansas City Chiefs"
                    required
                  />
                </div>

                {/* Nickname */}
                <div className="mb-6">
                  <label className="block font-semibold mb-2" style={{ color: colors.text }}>
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                    placeholder="e.g., Chiefs"
                  />
                </div>

                {/* Code */}
                <div className="mb-6">
                  <label className="block font-semibold mb-2" style={{ color: colors.text }}>
                    Team Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                    placeholder="e.g., KC"
                    maxLength={10}
                  />
                </div>

                {/* Conference */}
                <div className="mb-6">
                  <label className="block font-semibold mb-2" style={{ color: colors.text }}>
                    Conference
                  </label>
                  <input
                    type="text"
                    value={formData.conference}
                    onChange={(e) => setFormData({ ...formData, conference: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                    placeholder="e.g., AFC West"
                  />
                </div>

                {/* Image URL */}
                <div className="mb-6">
                  <label className="block font-semibold mb-2" style={{ color: colors.text }}>
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                    placeholder="https://example.com/logo.png"
                  />
                  {formData.image_url && (
                    <div className="mt-2 p-2 rounded-lg" style={{ backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }}>
                      <img
                        src={formData.image_url}
                        alt="Logo preview"
                        className="w-16 h-16 object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
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
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: colors.brand.primary }}
                    onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = colors.brand.primaryHover)}
                    onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = colors.brand.primary)}
                  >
                    <FiCheck size={20} />
                    {loading ? 'Saving...' : (editingTeam ? 'Update Team' : 'Add Team')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          variant={confirmModal.variant}
        />
      </div>
    </div>
  );
};

export default ManageTeams;
