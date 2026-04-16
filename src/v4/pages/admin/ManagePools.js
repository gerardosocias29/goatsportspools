import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../../../app/contexts/AxiosContext';
import PageBreadcrumb from '../../components/admin/common/PageBreadcrumb';

const TABS = [
  { key: 'squares', label: 'Squares Pools' },
  { key: 'playoffs', label: 'NBA Playoff Pools' },
];

const statusColor = (status) => {
  switch (status) {
    case 'open':
    case 'SelectOpen':
      return 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400';
    case 'locked':
      return 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400';
    case 'closed':
    case 'completed':
      return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
  }
};

const ManagePools = () => {
  const { get } = useAxios();
  const navigate = useNavigate();

  const [tab, setTab] = useState('squares');
  const [squaresPools, setSquaresPools] = useState([]);
  const [playoffPools, setPlayoffPools] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPools = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'squares') {
        const res = await get('/api/squares-pools');
        setSquaresPools(res?.data?.data || res?.data || []);
      } else {
        const res = await get('/api/playoff-pools/list');
        if (res?.data?.status && Array.isArray(res.data.data)) {
          setPlayoffPools(res.data.data);
        }
      }
    } catch (err) {
      console.error('Failed to load pools:', err);
    } finally {
      setLoading(false);
    }
  }, [tab, get]);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  const currentList = tab === 'squares' ? squaresPools : playoffPools;

  return (
    <>
      <PageBreadcrumb pageTitle="Manage Pools" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header with tabs + create button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex gap-1">
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                    active
                      ? 'bg-brand-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => navigate('/admin/pools/create')}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Pool
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && currentList.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-4 text-3xl">
                {tab === 'squares' ? '🏈' : '🏀'}
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                No {tab === 'squares' ? 'Squares' : 'Playoff'} Pools Yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Create your first pool to get started.
              </p>
              <button
                onClick={() => navigate('/admin/pools/create')}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Pool
              </button>
            </div>
          )}

          {!loading && currentList.length > 0 && tab === 'squares' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {squaresPools.map((pool) => (
                <button
                  key={pool.id}
                  onClick={() => navigate(`/pools/${pool.pool_number || pool.id}`)}
                  className="text-left rounded-2xl border border-gray-200 bg-white p-5 hover:border-brand-300 hover:shadow-md transition dark:border-gray-800 dark:bg-white/[0.02] dark:hover:border-brand-500/40"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                      {pool.pool_name || pool.name || `Pool #${pool.id}`}
                    </h3>
                    {pool.status && (
                      <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusColor(pool.status)}`}>
                        {pool.status}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    {pool.pool_number && <div>#{pool.pool_number}</div>}
                    {pool.league && <div>League: {pool.league}</div>}
                    {pool.cost_per_square != null && (
                      <div>${pool.cost_per_square}/square</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && currentList.length > 0 && tab === 'playoffs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {playoffPools.map((pool) => (
                <button
                  key={pool.id}
                  onClick={() => navigate(`/playoffs/${pool.pool_number}`)}
                  className="text-left rounded-2xl border border-gray-200 bg-white p-5 hover:border-brand-300 hover:shadow-md transition dark:border-gray-800 dark:bg-white/[0.02] dark:hover:border-brand-500/40"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                      {pool.pool_name}
                    </h3>
                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusColor(pool.pool_status)}`}>
                      {pool.pool_status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span>{pool.participants_count} participant{pool.participants_count !== 1 ? 's' : ''}</span>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span>#{pool.pool_number}</span>
                    {pool.is_locked && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <span className="text-warning-500">Locked</span>
                      </>
                    )}
                  </div>
                  {pool.playoff && (
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {pool.playoff.name || `${pool.playoff.year} NBA Playoffs`}
                    </div>
                  )}
                  {pool.admin && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
                      Commissioner: {pool.admin.name || pool.admin.username}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ManagePools;
