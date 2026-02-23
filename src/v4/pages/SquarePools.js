import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useUserContext } from '../contexts/UserContext';
import PoolCard from '../components/pools/PoolCard';
import JoinPoolModal from '../components/pools/JoinPoolModal';
import PageLoader from '../components/common/PageLoader';

const SquarePools = () => {
  const axios = useAxios();
  const navigate = useNavigate();
  const { isSignedIn, isSuperadmin, isSquareAdmin } = useUserContext();

  const [pools, setPools] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [tab, setTab] = useState('active');
  const [league, setLeague] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [poolsRes, teamsRes] = await Promise.all([
          axios.get('/api/squares-pools'),
          axios.get('/api/teams'),
        ]);
        setPools(poolsRes.data.data || poolsRes.data || []);
        setTeams(teamsRes.data.data || teamsRes.data || []);
      } catch (err) {
        console.error('Error fetching pools:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter pools client-side based on tab, league, and search
  const filteredPools = useMemo(() => {
    return pools.filter(pool => {
      // Tab filter: Active = open/in_progress, History = closed/completed
      const status = pool.pool_status;
      if (tab === 'active') {
        if (status !== 'open' && status !== 'SelectOpen' && status !== 'in_progress' && status !== 'GameStarted') {
          return false;
        }
      } else {
        if (status !== 'closed' && status !== 'SelectClosed' && status !== 'completed') {
          return false;
        }
      }

      // League filter
      if (league !== 'all') {
        const poolLeague = pool.game?.league;
        if (poolLeague !== league) return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const name = (pool.pool_name || pool.gridName || '').toLowerCase();
        const number = (pool.pool_number || '').toLowerCase();
        if (!name.includes(q) && !number.includes(q)) return false;
      }

      return true;
    });
  }, [pools, tab, league, search]);

  const leagueOptions = [
    { value: 'all', label: 'All Leagues' },
    { value: 'NFL', label: 'NFL' },
    { value: 'NBA', label: 'NBA' },
    { value: 'NCAAF', label: 'NCAAF' },
    { value: 'NCAAB', label: 'NCAAB' },
  ];

  const tabClass = (value) =>
    tab === value
      ? 'shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800'
      : 'text-gray-500 dark:text-gray-400';

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Squares Pools
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Join a pool and pick your winning squares
          </p>
        </div>
        {isSignedIn && (
          <div className="flex items-center gap-2">
            {(isSuperadmin || isSquareAdmin) && (
              <button
                onClick={() => navigate('/pools/create')}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Pool
              </button>
            )}
            <button
              onClick={() => setJoinModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Join Pool
            </button>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 mb-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pools..."
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>

          {/* League select */}
          <div className="relative sm:w-40">
            <select
              value={league}
              onChange={(e) => setLeague(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm shadow-theme-xs appearance-none focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {leagueOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Segmented Tab */}
          <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900 sm:w-auto">
            <button
              onClick={() => setTab('active')}
              className={`px-4 py-2 font-medium w-full sm:w-auto rounded-md text-sm transition-all hover:text-gray-900 dark:hover:text-white ${tabClass('active')}`}
            >
              Active
            </button>
            <button
              onClick={() => setTab('history')}
              className={`px-4 py-2 font-medium w-full sm:w-auto rounded-md text-sm transition-all hover:text-gray-900 dark:hover:text-white ${tabClass('history')}`}
            >
              History
            </button>
          </div>
        </div>
      </div>

      {/* Pool Grid */}
      {filteredPools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPools.map(pool => (
            <PoolCard key={pool.id} pool={pool} teams={teams} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-white/[0.02]">
          <div className="flex flex-col items-center justify-center py-16 px-6">
            {tab === 'active' ? (
              <>
                <div className="mx-auto w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-5">
                  <svg className="w-10 h-10 text-brand-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="3" y1="15" x2="21" y2="15" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                    <line x1="15" y1="3" x2="15" y2="21" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No active pools
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                  {search || league !== 'all'
                    ? 'No pools match your current filters. Try adjusting your search or league selection.'
                    : 'There are no active pools right now. Join one with a pool code or check back soon!'}
                </p>
                {isSignedIn && (
                  <button
                    onClick={() => setJoinModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 shadow-theme-xs transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Join with Code
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
                  <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No pool history
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                  {search || league !== 'all'
                    ? 'No completed pools match your filters. Try adjusting your search.'
                    : 'Your completed and closed pools will show up here once they finish.'}
                </p>
                <button
                  onClick={() => setTab('active')}
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 shadow-theme-xs dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  View Active Pools
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Join Pool Modal */}
      <JoinPoolModal isOpen={joinModalOpen} onClose={() => setJoinModalOpen(false)} />
    </div>
  );
};

export default SquarePools;
