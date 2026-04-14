import React, { useState, useEffect, useCallback } from 'react';
import { useAxios } from '../../../app/contexts/AxiosContext';
import BracketViewModal from './BracketViewModal';

const roundLabels = { 1: 'R1', 2: 'R2', 3: 'CF', 4: 'Finals' };

const PoolStandings = ({ poolNumber }) => {
  const { get } = useAxios();
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [viewBracket, setViewBracket] = useState(null);

  const fetchStandings = useCallback(async () => {
    if (!poolNumber) return;
    setLoading(true);
    setError(null);
    try {
      const res = await get(`/api/playoff-pools/${poolNumber}/standings`);
      if (res?.data?.status) {
        setStandings(res.data.data.standings || []);
      }
    } catch (err) {
      console.error('Failed to load standings:', err);
      setError(err?.response?.data?.message || 'Failed to load standings.');
    } finally {
      setLoading(false);
    }
  }, [poolNumber, get]);

  useEffect(() => { fetchStandings(); }, [fetchStandings]);

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
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-4 text-3xl">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No Standings Yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
            Standings appear once brackets are marked PAID by the commissioner.
          </p>
        </div>
      </div>
    );
  }

  const roundPts = (rounds, n) => {
    const r = rounds?.[n] || rounds?.[String(n)];
    if (!r) return 0;
    return (r.base_points || 0) + (r.games_bonus || 0) + (r.seed_bonus || 0);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Standings</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {standings.length} bracket{standings.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-10">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Bracket</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total Pts</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">R1</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">R2</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Conf Finals</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Finals</th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {standings.map((entry, idx) => {
              const rank = idx + 1;
              const isExpanded = expandedRow === entry.bracket_id;
              return (
                <React.Fragment key={entry.bracket_id}>
                  <tr
                    onClick={() => setExpandedRow(isExpanded ? null : entry.bracket_id)}
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
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setViewBracket(entry); }}
                        className="flex items-center gap-2.5 min-w-0 text-left group"
                      >
                        {entry.user?.avatar ? (
                          <img src={entry.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400 shrink-0">
                            {(entry.bracket_name || entry.user?.name || '?')[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-500">
                            {entry.bracket_name || 'Bracket'}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            @{entry.user?.username || entry.user?.name || 'user'}
                          </p>
                        </div>
                      </button>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{entry.total_points || 0}</span>
                    </td>
                    <td className="px-3 py-3 text-center hidden sm:table-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{roundPts(entry.rounds, 1)}</span>
                    </td>
                    <td className="px-3 py-3 text-center hidden sm:table-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{roundPts(entry.rounds, 2)}</span>
                    </td>
                    <td className="px-3 py-3 text-center hidden md:table-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{roundPts(entry.rounds, 3)}</span>
                    </td>
                    <td className="px-3 py-3 text-center hidden md:table-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{roundPts(entry.rounds, 4)}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </td>
                  </tr>

                  {isExpanded && entry.rounds && Object.keys(entry.rounds).length > 0 && (
                    <tr>
                      <td colSpan={8} className="bg-gray-50/50 dark:bg-gray-800/20 px-4 py-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {Object.entries(entry.rounds).map(([round, data]) => {
                            const roundTotal = (data.base_points || 0) + (data.games_bonus || 0) + (data.seed_bonus || 0);
                            return (
                              <div key={round} className="rounded-lg bg-white dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 p-2.5">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{roundLabels[round] || `R${round}`}</span>
                                  <span className="text-xs font-semibold text-success-600 dark:text-success-400">
                                    {data.correct}/{data.total}
                                  </span>
                                </div>
                                <div className="space-y-0.5 text-[11px]">
                                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Base</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{data.base_points || 0}</span></div>
                                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Games</span>
                                    <span className={`font-medium ${data.games_bonus > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                                      {data.games_bonus > 0 ? `+${data.games_bonus}` : '0'}</span></div>
                                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Seed</span>
                                    <span className={`font-medium ${data.seed_bonus > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}>
                                      {data.seed_bonus > 0 ? `+${data.seed_bonus}` : '0'}</span></div>
                                </div>
                                <div className="mt-1.5 pt-1 border-t border-gray-200 dark:border-gray-600 flex justify-between">
                                  <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Total</span>
                                  <span className="text-xs font-bold text-gray-900 dark:text-white">{roundTotal}</span>
                                </div>
                              </div>
                            );
                          })}
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

      {viewBracket && (
        <BracketViewModal
          poolNumber={poolNumber}
          bracketId={viewBracket.bracket_id}
          title={viewBracket.bracket_name}
          onClose={() => setViewBracket(null)}
        />
      )}
    </div>
  );
};

export default PoolStandings;
