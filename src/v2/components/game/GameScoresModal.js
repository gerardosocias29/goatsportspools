import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiTrendingUp } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * GameScoresModal Component
 * Modal for admins to input quarter-by-quarter scores for a game
 * Stores cumulative scores (Q1, Half, Q3, Final)
 */
const GameScoresModal = ({ game, onClose, onSave }) => {
  const { colors, isDark } = useTheme();
  const [scores, setScores] = useState({
    q1_home: '',
    q1_visitor: '',
    half_home: '',
    half_visitor: '',
    q3_home: '',
    q3_visitor: '',
    final_home: '',
    final_visitor: '',
    game_status: 'NotStarted',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (game) {
      setScores({
        q1_home: game.q1_home || game.home_first_quarter_score || '',
        q1_visitor: game.q1_visitor || game.visitor_first_quarter_score || '',
        half_home: game.half_home || game.home_half_time_score || '',
        half_visitor: game.half_visitor || game.visitor_half_time_score || '',
        q3_home: game.q3_home || game.home_third_quarter_score || '',
        q3_visitor: game.q3_visitor || game.visitor_third_quarter_score || '',
        final_home: game.final_home || game.home_final_score || '',
        final_visitor: game.final_visitor || game.visitor_final_score || '',
        game_status: game.game_status || 'NotStarted',
      });
    }
  }, [game]);

  const handleScoreChange = (field, value) => {
    // Only allow numeric input
    const numValue = value === '' ? '' : parseInt(value) || 0;
    setScores({ ...scores, [field]: numValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(game.id, scores);
      onClose();
    } catch (error) {
      console.error('Error saving scores:', error);
      alert('Failed to save scores. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getQuarterStatus = (quarter) => {
    const hasQ1 = scores.q1_home !== '' && scores.q1_visitor !== '';
    const hasHalf = scores.half_home !== '' && scores.half_visitor !== '';
    const hasQ3 = scores.q3_home !== '' && scores.q3_visitor !== '';
    const hasFinal = scores.final_home !== '' && scores.final_visitor !== '';

    switch (quarter) {
      case 'Q1': return hasQ1 ? '✓' : '○';
      case 'Half': return hasHalf ? '✓' : '○';
      case 'Q3': return hasQ3 ? '✓' : '○';
      case 'Final': return hasFinal ? '✓' : '○';
      default: return '○';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="rounded-xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: colors.card, border: `2px solid ${colors.brand.primary}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FiTrendingUp size={28} style={{ color: colors.brand.primary }} />
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: colors.text }}>
              Update Game Scores
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.text }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#E5E7EB'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Game Info */}
        <div
          className="mb-6 p-4 rounded-lg"
          style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg" style={{ color: colors.text }}>
                {game?.home_team?.name || game?.home_team} vs {game?.visitor_team?.name || game?.visitor_team}
              </p>
              <p className="text-sm mt-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                {new Date(game?.game_datetime).toLocaleString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex gap-2">
              {['Q1', 'Half', 'Q3', 'Final'].map(q => (
                <div
                  key={q}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: getQuarterStatus(q) === '✓' ? colors.brand.primary : (isDark ? '#1F2937' : '#E5E7EB'),
                    color: getQuarterStatus(q) === '✓' ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280')
                  }}
                >
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Game Status */}
          <div className="mb-6">
            <label className="block font-semibold mb-2" style={{ color: colors.text }}>
              Game Status
            </label>
            <select
              value={scores.game_status}
              onChange={(e) => setScores({ ...scores, game_status: e.target.value })}
              className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent"
              style={{
                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                border: `1px solid ${colors.border}`,
                color: colors.text,
                outlineColor: colors.brand.primary
              }}
            >
              <option value="NotStarted">Not Started</option>
              <option value="Started">Started / In Progress</option>
              <option value="Final">Final / Completed</option>
            </select>
          </div>

          {/* Scores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Q1 Scores */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6', border: `1px solid ${colors.border}` }}
            >
              <h3 className="font-bold mb-3 text-center" style={{ color: colors.text }}>
                1st Quarter (Cumulative)
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    {game?.home_team?.name || game?.home_team}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={scores.q1_home}
                    onChange={(e) => handleScoreChange('q1_home', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg text-center text-xl font-bold focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: colors.card,
                      border: `2px solid ${colors.border}`,
                      color: colors.text,
                      outlineColor: colors.brand.primary
                    }}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    {game?.visitor_team?.name || game?.visitor_team}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={scores.q1_visitor}
                    onChange={(e) => handleScoreChange('q1_visitor', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg text-center text-xl font-bold focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: colors.card,
                      border: `2px solid ${colors.border}`,
                      color: colors.text,
                      outlineColor: colors.brand.primary
                    }}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Halftime Scores */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6', border: `1px solid ${colors.border}` }}
            >
              <h3 className="font-bold mb-3 text-center" style={{ color: colors.text }}>
                Halftime (Q1 + Q2)
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    {game?.home_team?.name || game?.home_team}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={scores.half_home}
                    onChange={(e) => handleScoreChange('half_home', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg text-center text-xl font-bold focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: colors.card,
                      border: `2px solid ${colors.border}`,
                      color: colors.text,
                      outlineColor: colors.brand.primary
                    }}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    {game?.visitor_team?.name || game?.visitor_team}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={scores.half_visitor}
                    onChange={(e) => handleScoreChange('half_visitor', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg text-center text-xl font-bold focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: colors.card,
                      border: `2px solid ${colors.border}`,
                      color: colors.text,
                      outlineColor: colors.brand.primary
                    }}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Q3 Scores */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6', border: `1px solid ${colors.border}` }}
            >
              <h3 className="font-bold mb-3 text-center" style={{ color: colors.text }}>
                3rd Quarter (Q1+Q2+Q3)
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    {game?.home_team?.name || game?.home_team}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={scores.q3_home}
                    onChange={(e) => handleScoreChange('q3_home', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg text-center text-xl font-bold focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: colors.card,
                      border: `2px solid ${colors.border}`,
                      color: colors.text,
                      outlineColor: colors.brand.primary
                    }}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    {game?.visitor_team?.name || game?.visitor_team}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={scores.q3_visitor}
                    onChange={(e) => handleScoreChange('q3_visitor', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg text-center text-xl font-bold focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: colors.card,
                      border: `2px solid ${colors.border}`,
                      color: colors.text,
                      outlineColor: colors.brand.primary
                    }}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Final Scores */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6', border: `1px solid ${colors.border}` }}
            >
              <h3 className="font-bold mb-3 text-center" style={{ color: colors.text }}>
                Final Score
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    {game?.home_team?.name || game?.home_team}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={scores.final_home}
                    onChange={(e) => handleScoreChange('final_home', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg text-center text-xl font-bold focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: colors.card,
                      border: `2px solid ${colors.border}`,
                      color: colors.text,
                      outlineColor: colors.brand.primary
                    }}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    {game?.visitor_team?.name || game?.visitor_team}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={scores.final_visitor}
                    onChange={(e) => handleScoreChange('final_visitor', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg text-center text-xl font-bold focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: colors.card,
                      border: `2px solid ${colors.border}`,
                      color: colors.text,
                      outlineColor: colors.brand.primary
                    }}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Info Message */}
          <div
            className="mt-6 p-4 rounded-lg"
            style={{ backgroundColor: isDark ? '#1F2937' : '#FEF3C7', border: `1px solid ${isDark ? '#374151' : '#FCD34D'}` }}
          >
            <p className="text-sm" style={{ color: isDark ? '#FCD34D' : '#92400E' }}>
              <strong>Note:</strong> Enter cumulative scores for each period. For example, if the score after Q1 is 7-3,
              and Q2 score is 7-7, the halftime score should be 14-10.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors duration-200"
            >
              <FiX size={20} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: colors.brand.primary }}
              onMouseOver={(e) => !saving && (e.currentTarget.style.backgroundColor = colors.brand.primaryHover)}
              onMouseOut={(e) => !saving && (e.currentTarget.style.backgroundColor = colors.brand.primary)}
            >
              <FiSave size={20} />
              {saving ? 'Saving...' : 'Save Scores'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameScoresModal;
