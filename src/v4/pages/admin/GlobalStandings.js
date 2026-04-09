import React, { useState, useEffect, useCallback } from 'react';
import { useAxios } from '../../../app/contexts/AxiosContext';
import PageBreadcrumb from '../../components/admin/common/PageBreadcrumb';

const GlobalStandings = () => {
  const { get } = useAxios();
  const [playoffs, setPlayoffs] = useState([]);
  const [selectedPlayoffId, setSelectedPlayoffId] = useState(null);
  const [standings, setStandings] = useState(null);
  const [loadingPlayoffs, setLoadingPlayoffs] = useState(true);
  const [loadingStandings, setLoadingStandings] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [search, setSearch] = useState('');

  // Fetch available playoffs
  useEffect(() => {
    const fetchPlayoffs = async () => {
      try {
        const res = await get('/api/admin/playoffs');
        if (res?.data?.status && Array.isArray(res.data.data)) {
          setPlayoffs(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedPlayoffId(res.data.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load playoffs:', err);
      } finally {
        setLoadingPlayoffs(false);
      }
    };
    fetchPlayoffs();
  }, [get]);

  // Fetch global standings when playoff changes
  const fetchStandings = useCallback(async () => {
    if (!selectedPlayoffId) return;
    setLoadingStandings(true);
    setExpandedRow(null);
    try {
      const res = await get(`/api/admin/playoffs/${selectedPlayoffId}/global-standings`);
      if (res?.data?.status) {
        setStandings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load global standings:', err);
      setStandings(null);
    } finally {
      setLoadingStandings(false);
    }
  }, [selectedPlayoffId, get]);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  const filtered = standings?.standings?.filter((entry) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (entry.user?.name || '').toLowerCase().includes(q) ||
      (entry.user?.username || '').toLowerCase().includes(q) ||
      (entry.pool_name || '').toLowerCase().includes(q) ||
      (entry.pool_number || '').toLowerCase().includes(q)
    );
  }) || [];

  if (loadingPlayoffs) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Global Standings" />
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Global Standings" />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Playoff selector */}
        <select
          value={selectedPlayoffId || ''}
          onChange={(e) => setSelectedPlayoffId(Number(e.target.value))}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 focus:border-brand-500 focus:ring-brand-500"
        >
          {playoffs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name || `${p.year} NBA Playoffs`}
            </option>
          ))}
        </select>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search player or pool..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 focus:border-brand-500 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Summary cards */}
      {standings && !loadingStandings && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Playoff</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{standings.playoff?.name || `${standings.playoff?.year} NBA`}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
            <p className="text-sm font-bold capitalize text-gray-900 dark:text-white">{standings.playoff?.status || '—'}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pools</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{standings.pools_count || 0}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Participants</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{standings.participants_count || 0}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loadingStandings && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loadingStandings && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-white/[0.02]">
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No Standings Data</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {search ? 'No results match your search.' : 'No participants found for this playoff.'}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!loadingStandings && filtered.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-10">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Player</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Pool</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Pts</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Brackets</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Best</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, idx) => {
                  const rank = idx + 1;
                  const isExpanded = expandedRow === entry.participant_id;
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
                        <td className="px-3 py-3 hidden md:table-cell">
                          <div className="min-w-0">
                            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{entry.pool_name}</p>
                            <p className="text-xs text-gray-400">#{entry.pool_number}</p>
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
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{entry.best_bracket.total_points || 0}</span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded best bracket info */}
                      {isExpanded && entry.best_bracket && (
                        <tr>
                          <td colSpan={6} className="bg-gray-50/50 dark:bg-gray-800/20 px-4 py-3">
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {entry.best_bracket.bracket_name || 'Best Bracket'}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    entry.best_bracket.status === 'finalized'
                                      ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400'
                                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                  }`}>
                                    {entry.best_bracket.status || 'draft'}
                                  </span>
                                  <span className="text-sm font-bold text-brand-500">{entry.best_bracket.total_points || 0} pts</span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-400 mt-1 md:hidden">
                                Pool: {entry.pool_name} (#{entry.pool_number})
                              </p>
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
      )}
    </div>
  );
};

export default GlobalStandings;
