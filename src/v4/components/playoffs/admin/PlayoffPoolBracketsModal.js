import React, { useState, useEffect, useCallback } from 'react';
import SharedModal from '../../admin/common/Modal';
import PageLoader from '../../common/PageLoader';
import { useAxios } from '../../../../app/contexts/AxiosContext';

const statusBadge = (status) => {
  const map = {
    finalized: 'bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400',
    draft: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    locked: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
  };
  const cls = map[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${cls}`}>
      {status || '—'}
    </span>
  );
};

const PlayoffPoolBracketsModal = ({ isOpen, pool, onClose, onError, onSuccess }) => {
  const { get, patch } = useAxios();
  const [brackets, setBrackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!pool?.pool_number) return;
    setLoading(true);
    try {
      const res = await get(`/api/admin/playoffs/pools/${pool.pool_number}/brackets`);
      if (res?.data?.status) setBrackets(res.data.data || []);
      else onError?.(res?.data?.message || 'Failed to load brackets');
    } catch (err) {
      onError?.(err?.response?.data?.message || 'Failed to load brackets');
    } finally {
      setLoading(false);
    }
  }, [pool, get, onError]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  if (!isOpen || !pool) return null;

  const togglePaid = async (bracket, nextPaid) => {
    setBusyId(bracket.id);
    try {
      const res = await patch(`/api/admin/playoffs/brackets/${bracket.id}/paid`, { is_paid: nextPaid });
      if (res?.data?.status) {
        onSuccess?.(res.data.message || 'Updated.');
        setBrackets((prev) => prev.map((b) => (b.id === bracket.id ? { ...b, ...res.data.data } : b)));
      } else {
        onError?.(res?.data?.message || 'Failed to update paid status');
      }
    } catch (err) {
      onError?.(err?.response?.data?.message || 'Failed to update paid status');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = brackets.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (b.bracket_name || '').toLowerCase().includes(q) ||
      (b.participant?.user?.name || '').toLowerCase().includes(q) ||
      (b.participant?.user?.username || '').toLowerCase().includes(q)
    );
  });

  const paidCount = brackets.filter((b) => b.is_paid).length;

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Brackets — ${pool.pool_name}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs text-gray-500 dark:text-gray-400">Pool #{pool.pool_number}</span>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-success-600 dark:text-success-400">{paidCount}</span>
            {' '}of {brackets.length} paid
          </div>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by bracket name or player..."
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />

        {loading ? (
          <div className="py-10">
            <PageLoader inline />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {brackets.length === 0 ? 'No brackets in this pool yet.' : 'No brackets match your search.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="px-5 py-3">Bracket</th>
                  <th className="px-5 py-3">Player</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-center">Points</th>
                  <th className="px-5 py-3 text-center">Paid</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((b) => {
                  const user = b.participant?.user;
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{b.bracket_name}</td>
                      <td className="px-5 py-3">
                        <div className="text-sm text-gray-700 dark:text-gray-300">{user?.name || '—'}</div>
                        {user?.username && <div className="text-xs text-gray-400">@{user.username}</div>}
                      </td>
                      <td className="px-5 py-3">{statusBadge(b.status)}</td>
                      <td className="px-5 py-3 text-center font-semibold text-gray-900 dark:text-white">
                        {b.total_points || 0}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {b.is_paid ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-success-600 dark:text-success-400">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            PAID
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Unpaid</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => togglePaid(b, !b.is_paid)}
                          disabled={busyId === b.id}
                          className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                            b.is_paid
                              ? 'text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700'
                              : 'bg-brand-500 hover:bg-brand-600 !text-white'
                          }`}
                        >
                          {busyId === b.id ? '...' : b.is_paid ? 'Mark Unpaid' : 'Mark PAID'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SharedModal>
  );
};

export default PlayoffPoolBracketsModal;
