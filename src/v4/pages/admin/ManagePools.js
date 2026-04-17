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
  const { get, post } = useAxios();
  const navigate = useNavigate();

  const [tab, setTab] = useState('squares');
  const [squaresPools, setSquaresPools] = useState([]);
  const [playoffPools, setPlayoffPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(null); // `${pool_number}-${action}`
  const [alert, setAlert] = useState(null); // { kind: 'success'|'error', msg }

  const flash = (kind, msg) => {
    setAlert({ kind, msg });
    setTimeout(() => setAlert(null), 4000);
  };

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

  const handlePoolAction = async (pool, action) => {
    const confirmMsg =
      action === 'lock'
        ? `Lock pool "${pool.pool_name}"? This stops bracket edits.`
        : action === 'recalc'
        ? `Recalculate scores for "${pool.pool_name}"?`
        : null;
    if (confirmMsg && !window.confirm(confirmMsg)) return;

    const key = `${pool.pool_number}-${action}`;
    setBusy(key);
    try {
      const url =
        action === 'lock'
          ? `/api/admin/playoffs/pools/${pool.pool_number}/lock`
          : `/api/admin/playoffs/pools/${pool.pool_number}/recalculate`;
      const res = await post(url);
      if (res?.data?.status) {
        flash('success', res.data.message || 'Done');
        fetchPools();
      } else {
        flash('error', res?.data?.message || 'Action failed');
      }
    } catch (err) {
      flash('error', err?.response?.data?.message || 'Action failed');
    } finally {
      setBusy(null);
    }
  };

  const currentList = tab === 'squares' ? squaresPools : playoffPools;

  return (
    <>
      <PageBreadcrumb pageTitle="Manage Pools" />

      {alert && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            alert.kind === 'success'
              ? 'border-success-200 bg-success-50 text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400'
              : 'border-error-200 bg-error-50 text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400'
          }`}
        >
          {alert.msg}
        </div>
      )}

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
              {playoffPools.map((pool) => {
                const locked = pool.pool_status === 'locked' || pool.is_locked;
                const lockKey = `${pool.pool_number}-lock`;
                const recalcKey = `${pool.pool_number}-recalc`;
                return (
                  <div
                    key={pool.id}
                    className="relative rounded-2xl border border-gray-200 bg-white p-5 transition dark:border-gray-800 dark:bg-white/[0.02]"
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
                    </div>
                    {pool.playoff && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                        {pool.playoff.name || `${pool.playoff.year} NBA Playoffs`}
                      </div>
                    )}
                    {pool.admin && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                        Commissioner: {pool.admin.name || pool.admin.username}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handlePoolAction(pool, 'lock')}
                        disabled={locked || busy === lockKey}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-warning-500 text-white hover:bg-warning-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {locked ? 'Locked' : busy === lockKey ? 'Locking...' : 'Lock Pool'}
                      </button>
                      <button
                        onClick={() => handlePoolAction(pool, 'recalc')}
                        disabled={busy === recalcKey}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {busy === recalcKey ? 'Scoring...' : 'Recalculate'}
                      </button>
                      <button
                        onClick={() => navigate('/admin/playoffs')}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        View Brackets
                      </button>
                      <button
                        onClick={() => navigate('/admin/playoffs')}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="mt-2 flex justify-end">
                      <a
                        href={`/playoffs/${pool.pool_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-600 hover:underline"
                      >
                        Preview as player
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ManagePools;
