import React, { useState, useEffect, useCallback } from 'react';
import { useAxios } from '../../../app/contexts/AxiosContext';

const PoolStandings = ({ poolNumber }) => {
  const { get } = useAxios();
  const [standings, setStandings] = useState([]);
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const fetchStandings = useCallback(async () => {
    if (!poolNumber) return;
    setLoading(true);
    setError(null);
    try {
      const res = await get(`/api/playoff-pools/${poolNumber}/standings`);
      if (res?.data?.status) {
        setStandings(res.data.data.standings || []);
        setPool(res.data.data.pool || null);
      }
    } catch (err) {
      console.error('Failed to load standings:', err);
      setError(err?.response?.data?.message || 'Failed to load standings.');
    } finally {
      setLoading(false);
    }
  }, [poolNumber, get]);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-error-500">{error}</p>
      </div>
    );
  }

  if (standings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-white/[0.02]">
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-4 text-3xl">
            📊
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No Standings Yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
            Standings will appear once participants submit their brackets and scoring begins.
          </p>
        </div>
      </div>
    );
  }

  const roundLabels = { 1: 'R1', 2: 'R2', 3: 'CF', 4: 'Finals' };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Standings</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {standings.length} participant{standings.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-10">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Player</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Pts</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Brackets</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Best</th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {standings.map((entry, idx) => {
              const isExpanded = expandedRow === entry.participant_id;
              const rank = idx + 1;
              return (
                <React.Fragment key={entry.participant_id}>
                  <tr
                    onClick={() => setExpandedRow(isExpanded ? null : entry.participant_id)}
                    className="border-b border-gray-50 dark:border-gray-800/50 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        rank === 1 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                        rank === 2 ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' :
                        rank === 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                        'text-gray-500 dark:text-gray-400'
                      }`}>
                        {rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {entry.user?.avatar ? (
                          <img src={entry.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400">
                            {(entry.user?.name || '?')[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {entry.user?.name || entry.user?.username || 'Unknown'}
                          </p>
                          {entry.user?.username && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">@{entry.user.username}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{entry.total_points || 0}</span>
                    </td>
                    <td className="px-3 py-3 text-center hidden sm:table-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{entry.brackets_count || 0}</span>
                    </td>
                    <td className="px-3 py-3 text-center hidden md:table-cell">
                      {entry.best_bracket ? (
                        <div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{entry.best_bracket.total_points || 0}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">pts</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </td>
                  </tr>

                  {/* Expanded bracket details */}
                  {isExpanded && entry.brackets && entry.brackets.length > 0 && (
                    <tr>
                      <td colSpan={6} className="bg-gray-50/50 dark:bg-gray-800/20 px-4 py-3">
                        <div className="space-y-3">
                          {entry.brackets.map((bracket) => (
                            <div key={bracket.bracket_id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-3">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {bracket.bracket_name || 'Bracket'}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    bracket.status === 'finalized'
                                      ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400'
                                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                  }`}>
                                    {bracket.status || 'draft'}
                                  </span>
                                  <span className="text-sm font-bold text-brand-500">{bracket.total_points || 0} pts</span>
                                </div>
                              </div>
                              {/* Round breakdown — split bonuses */}
                              {bracket.rounds && Object.keys(bracket.rounds).length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {Object.entries(bracket.rounds).map(([round, data]) => {
                                    const roundTotal = (data.base_points || 0) + (data.games_bonus || 0) + (data.seed_bonus || 0);
                                    return (
                                      <div key={round} className="rounded-lg bg-gray-50 dark:bg-gray-700/30 p-2.5">
                                        <div className="flex items-center justify-between mb-1.5">
                                          <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                                            {roundLabels[round] || `R${round}`}
                                          </span>
                                          <span className="text-xs font-semibold text-success-600 dark:text-success-400">
                                            {data.correct}/{data.total}
                                          </span>
                                        </div>
                                        <div className="space-y-0.5 text-[11px]">
                                          <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Base</span>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{data.base_points || 0}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Games</span>
                                            <span className={`font-medium ${data.games_bonus > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                              {data.games_bonus > 0 ? `+${data.games_bonus}` : '0'}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Seed</span>
                                            <span className={`font-medium ${data.seed_bonus > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                              {data.seed_bonus > 0 ? `+${data.seed_bonus}` : '0'}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="mt-1.5 pt-1 border-t border-gray-200 dark:border-gray-600 flex justify-between">
                                          <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Total</span>
                                          <span className="text-xs font-bold text-gray-900 dark:text-white">{roundTotal}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PoolStandings;
