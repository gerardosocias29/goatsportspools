import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useUserContext } from '../contexts/UserContext';
import CommissionerBreadcrumb from '../components/common/CommissionerBreadcrumb';
import AdminMetricCard from '../components/admin/common/AdminMetricCard';
import PageLoader from '../components/common/PageLoader';

const statusConfig = {
  open: { label: 'Open', classes: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400' },
  closed: { label: 'Closed', classes: 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400' },
  in_progress: { label: 'In Progress', classes: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400' },
  completed: { label: 'Completed', classes: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
};

const CommissionerDashboard = () => {
  const axiosService = useAxios();
  const { user } = useUserContext();

  const [pools, setPools] = useState([]);
  const [creditRequests, setCreditRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [poolsRes, creditsRes] = await Promise.all([
        axiosService.get('/api/squares-pools', { params: { my_pools: 'true' } }),
        axiosService.get('/api/credit-requests/commissioner').catch(() => ({ data: [] })),
      ]);

      const poolData = poolsRes.data?.data || poolsRes.data || [];
      setPools(Array.isArray(poolData) ? poolData : []);

      const creditData = creditsRes.data?.data || creditsRes.data || [];
      setCreditRequests(Array.isArray(creditData) ? creditData : []);
    } catch (err) {
      console.error('Error loading commissioner data:', err);
    } finally {
      setLoading(false);
    }
  }, [axiosService]);

  useEffect(() => { loadData(); }, [loadData]);

  // Computed metrics
  const totalPools = pools.length;
  const activePools = pools.filter(p => p.pool_status === 'open').length;
  const totalPlayers = pools.reduce((sum, p) => sum + (p.players_count || 0), 0);
  const totalPot = pools.reduce((sum, p) => sum + parseFloat(p.total_pot || 0), 0);
  const pendingRequests = creditRequests.filter(r => r.status === 'pending');

  // Aggregate winners across all pools
  const allWinners = pools.reduce((acc, pool) => {
    if (pool.winners && pool.winners.length > 0) {
      pool.winners.forEach(w => acc.push({ ...w, pool_name: pool.pool_name, pool_number: pool.pool_number }));
    }
    return acc;
  }, []);

  const handlePoolAction = async (poolId, action) => {
    setActionLoading(`${poolId}-${action}`);
    try {
      if (action === 'close') {
        await axiosService.post(`/api/squares-pools/${poolId}/close`);
      } else if (action === 'reopen') {
        await axiosService.post(`/api/squares-pools/${poolId}/reopen`);
      } else if (action === 'assign') {
        await axiosService.post(`/api/squares-pools/${poolId}/assign-numbers`);
      }
      await loadData();
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreditAction = async (requestId, status) => {
    setActionLoading(`credit-${requestId}`);
    try {
      await axiosService.patch(`/api/credit-requests/${requestId}`, { status });
      await loadData();
    } catch (err) {
      console.error('Error updating credit request:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <PageLoader />;

  const quarterLabels = { 1: 'Q1', 2: 'Half', 3: 'Q3', 4: 'Final' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <CommissionerBreadcrumb pageTitle="Dashboard" />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <AdminMetricCard
          icon={
            <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          }
          label="My Pools"
          value={totalPools}
        />
        <AdminMetricCard
          icon={
            <svg className="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Active Pools"
          value={activePools}
        />
        <AdminMetricCard
          icon={
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          label="Total Players"
          value={totalPlayers}
        />
        <AdminMetricCard
          icon={
            <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Total Pot"
          value={`$${totalPot.toFixed(2)}`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* My Pools Table */}
        <div className="col-span-12 xl:col-span-7">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">My Pools</h3>
              <Link
                to="/pools/create"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium !text-white bg-brand-500 hover:bg-brand-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Pool
              </Link>
            </div>

            {pools.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pool</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Players</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Squares</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pot</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {pools.map((pool) => {
                        const status = statusConfig[pool.pool_status] || statusConfig.open;
                        const claimed = pool.claimed_squares || 0;
                        return (
                          <tr key={pool.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                            <td className="px-5 py-3">
                              <Link to={`/pools/${pool.pool_number}`} className="text-sm font-medium text-gray-800 dark:text-white/90 hover:text-brand-500 transition-colors">
                                {pool.pool_name}
                              </Link>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">#{pool.pool_number}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.classes}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{pool.players_count || 0}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full max-w-[60px]">
                                  <div
                                    className="h-full bg-brand-500 rounded-full transition-all"
                                    style={{ width: `${claimed}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{claimed}/100</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                              ${parseFloat(pool.total_pot || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Link
                                  to={`/pools/${pool.pool_number}`}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  title="View Pool"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </Link>
                                {pool.pool_status === 'open' && (
                                  <button
                                    onClick={() => handlePoolAction(pool.id, 'close')}
                                    disabled={actionLoading === `${pool.id}-close`}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-warning-500 hover:bg-warning-50 dark:hover:bg-warning-500/10 transition-colors disabled:opacity-50"
                                    title="Close Pool"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                  </button>
                                )}
                                {pool.pool_status === 'closed' && (
                                  <button
                                    onClick={() => handlePoolAction(pool.id, 'reopen')}
                                    disabled={actionLoading === `${pool.id}-reopen`}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-success-500 hover:bg-success-50 dark:hover:bg-success-500/10 transition-colors disabled:opacity-50"
                                    title="Reopen Pool"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                    </svg>
                                  </button>
                                )}
                                {!pool.numbers_assigned && (pool.pool_status === 'open' || pool.pool_status === 'closed') && (
                                  <button
                                    onClick={() => handlePoolAction(pool.id, 'assign')}
                                    disabled={actionLoading === `${pool.id}-assign`}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                                    title="Assign Numbers"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {pools.map((pool) => {
                    const status = statusConfig[pool.pool_status] || statusConfig.open;
                    const claimed = pool.claimed_squares || 0;
                    return (
                      <div key={pool.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Link to={`/pools/${pool.pool_number}`} className="text-sm font-medium text-gray-800 dark:text-white/90 hover:text-brand-500">
                              {pool.pool_name}
                            </Link>
                            <p className="text-xs text-gray-400 dark:text-gray-500">#{pool.pool_number}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.classes}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Players</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{pool.players_count || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Squares</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{claimed}/100</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Pot</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">${parseFloat(pool.total_pot || 0).toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/pools/${pool.pool_number}`}
                            className="flex-1 py-2 rounded-lg text-xs font-medium text-center text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                          >
                            View Pool
                          </Link>
                          {pool.pool_status === 'open' && (
                            <button
                              onClick={() => handlePoolAction(pool.id, 'close')}
                              disabled={actionLoading === `${pool.id}-close`}
                              className="px-3 py-2 rounded-lg text-xs font-medium text-warning-600 bg-warning-50 hover:bg-warning-100 dark:bg-warning-500/10 dark:text-warning-400 transition-colors disabled:opacity-50"
                            >
                              Close
                            </button>
                          )}
                          {pool.pool_status === 'closed' && (
                            <button
                              onClick={() => handlePoolAction(pool.id, 'reopen')}
                              disabled={actionLoading === `${pool.id}-reopen`}
                              className="px-3 py-2 rounded-lg text-xs font-medium text-success-600 bg-success-50 hover:bg-success-100 dark:bg-success-500/10 dark:text-success-400 transition-colors disabled:opacity-50"
                            >
                              Reopen
                            </button>
                          )}
                          {!pool.numbers_assigned && (pool.pool_status === 'open' || pool.pool_status === 'closed') && (
                            <button
                              onClick={() => handlePoolAction(pool.id, 'assign')}
                              disabled={actionLoading === `${pool.id}-assign`}
                              className="px-3 py-2 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors disabled:opacity-50"
                            >
                              Assign #
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">No pools yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Create your first pool to get started!</p>
                <Link
                  to="/pools/create"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Pool
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions + Credit Requests */}
        <div className="col-span-12 xl:col-span-5 space-y-4 md:space-y-6">
          {/* Quick Actions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/pools/create"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
              >
                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Pool
              </Link>
              <Link
                to="/pools"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
              >
                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                View All Pools
              </Link>
            </div>
          </div>

          {/* Pending Credit Requests */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Credit Requests</h3>
              {pendingRequests.length > 0 && (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold !text-white bg-warning-500">
                  {pendingRequests.length}
                </span>
              )}
            </div>

            {pendingRequests.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                          {(req.requester?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                            {req.requester?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {req.pool?.pool_name || `Pool #${req.pool_id}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-brand-500">
                        {req.amount || req.credits_requested || '--'} credits
                      </span>
                    </div>
                    {req.reason && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{req.reason}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCreditAction(req.id, 'approved')}
                        disabled={actionLoading === `credit-${req.id}`}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium !text-white bg-success-500 hover:bg-success-600 transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleCreditAction(req.id, 'denied')}
                        disabled={actionLoading === `credit-${req.id}`}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium text-error-600 bg-error-50 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 transition-colors disabled:opacity-50"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <svg className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-400 dark:text-gray-500">No pending requests</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Winners */}
        <div className="col-span-12">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Recent Winners</h3>
            </div>

            {allWinners.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pool</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quarter</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Winner</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prize</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {allWinners.slice(0, 10).map((winner, idx) => (
                        <tr key={winner.id || idx}>
                          <td className="px-5 py-3 text-sm text-gray-800 dark:text-white/90">
                            {winner.pool_name}
                            <span className="text-xs text-gray-400 ml-1">#{winner.pool_number}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {quarterLabels[winner.quarter] || `Q${winner.quarter}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-white/90">
                            {winner.player?.name || 'Unknown'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-success-600 dark:text-success-400">
                            ${parseFloat(winner.prize_amount || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            {winner.is_paid ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400">
                                Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {allWinners.slice(0, 10).map((winner, idx) => (
                    <div key={winner.id || idx} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {winner.player?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {winner.pool_name} — {quarterLabels[winner.quarter] || `Q${winner.quarter}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-success-600 dark:text-success-400">
                          ${parseFloat(winner.prize_amount || 0).toFixed(2)}
                        </p>
                        {winner.is_paid ? (
                          <span className="text-xs text-success-500">Paid</span>
                        ) : (
                          <span className="text-xs text-warning-500">Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.02 6.02 0 01-7.54 0" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-sm">No winners calculated yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionerDashboard;
