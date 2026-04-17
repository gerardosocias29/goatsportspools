import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useAxios } from '../../app/contexts/AxiosContext';
import PlayoffJoinModal from '../components/playoffs/PlayoffJoinModal';
import PlayoffCreateModal from '../components/playoffs/PlayoffCreateModal';
import ConfirmModal from '../components/common/ConfirmModal';
import PlayoffPoolEditModal from '../components/playoffs/admin/PlayoffPoolEditModal';
import PlayoffPoolBracketsModal from '../components/playoffs/admin/PlayoffPoolBracketsModal';

const NBAPlayoffs = () => {
  const { user, isSignedIn, isLoaded, isSuperadmin, isPlayoffAdmin } = useUserContext();
  const { get, post } = useAxios();
  const navigate = useNavigate();

  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(null);
  const [alert, setAlert] = useState(null);
  const [editPool, setEditPool] = useState(null);
  const [bracketsPool, setBracketsPool] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  const canCreate = isSuperadmin || isPlayoffAdmin;

  const flash = (kind, msg) => {
    setAlert({ kind, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  // Wait for backend user to be loaded (not just Clerk) so the auth token is ready
  const authReady = isLoaded && isSignedIn && !!user;

  const fetchPools = useCallback(async () => {
    if (!authReady) return;
    setLoading(true);
    try {
      const res = await get('/api/playoff-pools/list');
      if (res?.data?.status && Array.isArray(res.data.data)) {
        setPools(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load pools:', err);
    } finally {
      setLoading(false);
    }
  }, [authReady, get]);

  const canManagePool = (pool) =>
    isSuperadmin || (pool.admin && user && pool.admin.id === user.id);

  const runPoolAction = async (pool, action) => {
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
      setConfirmState(null);
    }
  };

  const askConfirm = (pool, action) => {
    const configs = {
      lock: {
        title: 'Lock Pool',
        message: `Lock pool "${pool.pool_name}"? This stops bracket edits.`,
        confirmLabel: 'Lock Pool',
        confirmVariant: 'warn',
      },
      recalc: {
        title: 'Recalculate Scores',
        message: `Recalculate scores for "${pool.pool_name}"?`,
        confirmLabel: 'Recalculate',
        confirmVariant: 'brand',
      },
    };
    setConfirmState({ pool, action, ...configs[action] });
  };

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  const handleModalClose = (modalSetter) => {
    modalSetter(false);
    fetchPools();
  };

  const statusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400';
      case 'locked': return 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400';
      case 'closed':
      case 'completed': return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            NBA Playoffs
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create or join bracket pools for the NBA Playoffs
          </p>
        </div>
        {isSignedIn && (
          <div className="flex items-center gap-2">
            {canCreate && (
              <button
                onClick={() => setCreateModalOpen(true)}
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

      {/* Pool List */}
      {isSignedIn && loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {isSignedIn && alert && (
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

      {isSignedIn && !loading && pools.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pools.map((pool) => {
            const canManage = canManagePool(pool);
            const locked = pool.pool_status === 'locked' || pool.is_locked;
            const lockKey = `${pool.pool_number}-lock`;
            const recalcKey = `${pool.pool_number}-recalc`;
            return (
              <div
                key={pool.id}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition dark:border-gray-800 dark:bg-white/[0.03]"
              >
                <button
                  onClick={() => navigate(`/playoffs/${pool.pool_number}`)}
                  className="text-left group"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-500 transition">
                      {pool.pool_name}
                    </h3>
                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusColor(pool.pool_status)}`}>
                      {pool.pool_status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {pool.participants_count} participant{pool.participants_count !== 1 ? 's' : ''}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span>#{pool.pool_number}</span>
                    {pool.is_locked && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <span className="inline-flex items-center gap-1 text-warning-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Locked
                        </span>
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

                {canManage && (
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Admin controls
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => askConfirm(pool, 'lock')}
                        disabled={locked || busy === lockKey}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-warning-500 text-white hover:bg-warning-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {locked ? 'Locked' : busy === lockKey ? 'Locking...' : 'Lock Pool'}
                      </button>
                      <button
                        onClick={() => askConfirm(pool, 'recalc')}
                        disabled={busy === recalcKey}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {busy === recalcKey ? 'Scoring...' : 'Recalculate'}
                      </button>
                      <button
                        onClick={() => setBracketsPool(pool)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        View Brackets
                      </button>
                      <button
                        onClick={() => setEditPool(pool)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {isSignedIn && !loading && pools.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-white/[0.02]">
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-5 text-4xl">
              🏀
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Pools Yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
              Join a pool using the pool code shared by your commissioner, or create your own.
            </p>
            <button
              onClick={() => setJoinModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 shadow-theme-xs transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Join with Code
            </button>
          </div>
        </div>
      )}

      {/* Not signed in */}
      {!isSignedIn && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-white/[0.02]">
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-5 text-4xl">
              🏀
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              NBA Playoff Bracket Pools
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
              Sign in to join or create NBA Playoff bracket pools.
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <PlayoffJoinModal isOpen={joinModalOpen} onClose={() => handleModalClose(setJoinModalOpen)} />
      {canCreate && (
        <PlayoffCreateModal isOpen={createModalOpen} onClose={() => handleModalClose(setCreateModalOpen)} />
      )}

      <PlayoffPoolEditModal
        isOpen={!!editPool}
        pool={editPool}
        onClose={() => setEditPool(null)}
        onSaved={() => { setEditPool(null); flash('success', 'Pool updated.'); fetchPools(); }}
        onError={(msg) => flash('error', msg)}
      />

      <PlayoffPoolBracketsModal
        isOpen={!!bracketsPool}
        pool={bracketsPool}
        onClose={() => setBracketsPool(null)}
        onError={(msg) => flash('error', msg)}
        onSuccess={(msg) => flash('success', msg)}
      />

      <ConfirmModal
        isOpen={!!confirmState}
        onClose={() => setConfirmState(null)}
        onConfirm={() => confirmState && runPoolAction(confirmState.pool, confirmState.action)}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmLabel={confirmState?.confirmLabel}
        confirmVariant={confirmState?.confirmVariant}
        busy={!!busy}
      />
    </div>
  );
};

export default NBAPlayoffs;
