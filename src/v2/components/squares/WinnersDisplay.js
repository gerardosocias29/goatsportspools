import React from 'react';
import { FiAward, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import StatusBadge from '../ui/StatusBadge';

/**
 * WinnersDisplay Component
 * Displays quarter-by-quarter winners for a squares pool
 * Shows winning squares, players, and prize amounts
 */
const WinnersDisplay = ({ pool, winners, game }) => {
  const { colors, isDark } = useTheme();

  if (!winners || winners.length === 0) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
      >
        <FiAward size={48} className="mx-auto mb-4" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }} />
        <p className="text-lg" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
          No winners calculated yet. Winners will appear here once the game scores are entered.
        </p>
      </div>
    );
  }

  const getQuarterLabel = (quarter) => {
    const labels = {
      'Q1': '1st Quarter',
      'Q2': '2nd Quarter / Halftime',
      'Half': 'Halftime',
      'Q3': '3rd Quarter',
      'Q4': 'Final / 4th Quarter',
      'Final': 'Final Score'
    };
    return labels[quarter] || quarter;
  };

  const getQuarterScores = (quarter) => {
    if (!game) return null;

    const scoreMap = {
      'Q1': { home: game.q1_home, visitor: game.q1_visitor },
      'Q2': { home: game.half_home, visitor: game.half_visitor },
      'Half': { home: game.half_home, visitor: game.half_visitor },
      'Q3': { home: game.q3_home, visitor: game.q3_visitor },
      'Q4': { home: game.final_home, visitor: game.final_visitor },
      'Final': { home: game.final_home, visitor: game.final_visitor }
    };

    return scoreMap[quarter];
  };

  const getLastDigit = (score) => {
    if (score === null || score === undefined) return '?';
    return score % 10;
  };

  // Group winners by quarter
  const winnersByQuarter = winners.reduce((acc, winner) => {
    const quarter = winner.quarter || winner.Quarter;
    if (!acc[quarter]) acc[quarter] = [];
    acc[quarter].push(winner);
    return acc;
  }, {});

  // Define quarter order
  const quarterOrder = ['Q1', 'Q2', 'Half', 'Q3', 'Q4', 'Final'];
  const sortedQuarters = quarterOrder.filter(q => winnersByQuarter[q]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <FiAward size={32} style={{ color: colors.brand.primary }} />
        <h2 className="text-3xl font-bold" style={{ color: colors.text }}>
          Winners
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedQuarters.map(quarter => {
          const quarterWinners = winnersByQuarter[quarter];
          const scores = getQuarterScores(quarter);

          return (
            <div
              key={quarter}
              className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl"
              style={{ backgroundColor: colors.card, border: `2px solid ${colors.brand.primary}` }}
            >
              {/* Quarter Header */}
              <div
                className="px-6 py-4"
                style={{ backgroundColor: colors.brand.primary }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    {getQuarterLabel(quarter)}
                  </h3>
                  {scores && scores.home !== null && scores.visitor !== null && (
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                      <span className="text-white font-bold text-lg">
                        {scores.home} - {scores.visitor}
                      </span>
                    </div>
                  )}
                </div>
                {scores && scores.home !== null && scores.visitor !== null && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-white/80 text-sm">Winning Numbers:</span>
                    <div className="flex gap-2">
                      <div className="bg-white/30 px-3 py-1 rounded font-bold text-white">
                        {getLastDigit(scores.home)}
                      </div>
                      <span className="text-white">×</span>
                      <div className="bg-white/30 px-3 py-1 rounded font-bold text-white">
                        {getLastDigit(scores.visitor)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Winner Info */}
              <div className="p-6">
                {quarterWinners.map((winner, idx) => (
                  <div key={idx} className="space-y-4">
                    {/* Player Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: colors.brand.primary }}
                        >
                          <FiAward className="text-white" size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-lg" style={{ color: colors.text }}>
                            {winner.player_name || winner.PlayerName || 'Unknown Player'}
                          </p>
                          <p className="text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                            Square: ({winner.x_number ?? winner.XNumber}, {winner.y_number ?? winner.YNumber})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <FiDollarSign style={{ color: colors.brand.primary }} size={20} />
                          <span className="text-2xl font-bold" style={{ color: colors.brand.primary }}>
                            ${parseFloat(winner.win_amount || winner.WinAmount || 0).toFixed(2)}
                          </span>
                        </div>
                        {winner.is_paid || winner.IsPaid ? (
                          <StatusBadge status="paid" label="Paid" />
                        ) : (
                          <StatusBadge status="pending" label="Pending" />
                        )}
                      </div>
                    </div>

                    {/* Payment Info */}
                    {(winner.is_paid || winner.IsPaid) && (winner.paid_date || winner.PaidDate) && (
                      <div
                        className="mt-3 p-3 rounded-lg text-sm"
                        style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                      >
                        <p style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                          Paid on: {new Date(winner.paid_date || winner.PaidDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {sortedQuarters.length === 0 && (
        <div
          className="rounded-xl p-8 text-center"
          style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
        >
          <FiTrendingUp size={48} className="mx-auto mb-4" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }} />
          <p className="text-lg" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
            Waiting for game scores to calculate winners
          </p>
        </div>
      )}

      {/* Total Prizes Summary */}
      {winners.length > 0 && (
        <div
          className="rounded-xl p-6 mt-6"
          style={{
            backgroundColor: colors.card,
            border: `2px solid ${colors.brand.primary}`
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors.brand.primary }}
              >
                <FiDollarSign className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  Total Prizes Awarded
                </p>
                <p className="text-3xl font-bold" style={{ color: colors.text }}>
                  ${winners.reduce((sum, w) => sum + parseFloat(w.win_amount || w.WinAmount || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                {winners.filter(w => w.is_paid || w.IsPaid).length} of {winners.length} paid
              </p>
              <div className="mt-2">
                <div
                  className="w-32 h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB' }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${(winners.filter(w => w.is_paid || w.IsPaid).length / winners.length) * 100}%`,
                      backgroundColor: colors.brand.primary
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinnersDisplay;
