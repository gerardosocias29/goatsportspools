import React, { useState, useEffect } from 'react';
import PageBreadcrumb from '../../components/admin/common/PageBreadcrumb';
import ConfirmModal from '../../components/admin/common/ConfirmModal';
import { useAxios } from '../../../app/contexts/AxiosContext';

const ROLE_LABELS = {
  1: 'Superadmin',
  2: 'League Admin',
  3: 'Player',
};

const ROLE_COLORS = {
  1: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
  2: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
  3: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const ManageUsers = () => {
  const { get, post } = useAxios();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [promoteTarget, setPromoteTarget] = useState(null);
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await get('/api/users/all');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q)
    );
  });

  const confirmPromote = (user) => {
    setPromoteTarget(user);
    setIsPromoteOpen(true);
  };

  const handlePromote = async () => {
    if (!promoteTarget) return;
    try {
      await post(`/api/users/update-role/${promoteTarget.id}`);
      setIsPromoteOpen(false);
      setPromoteTarget(null);
      fetchUsers();
    } catch (err) {
      console.error('Failed to promote user:', err);
      setIsPromoteOpen(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Manage Users" />

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or username..."
          className="h-11 w-full max-w-md rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="animate-pulse p-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1">
                  <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700 mb-1" />
                  <div className="h-3 w-48 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-white/[0.03] text-center">
          <p className="text-gray-500 dark:text-gray-400">No users found{search ? ` matching "${search}"` : ''}.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">User</th>
                  <th className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Email</th>
                  <th className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Role</th>
                  <th className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Joined</th>
                  <th className="px-5 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500 text-sm font-bold">
                            {(user.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-800 dark:text-white/90">{user.name || 'Unknown'}</div>
                          {user.username && <div className="text-xs text-gray-400 dark:text-gray-500">@{user.username}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role_id] || ROLE_COLORS[3]}`}>
                        {ROLE_LABELS[user.role_id] || 'Player'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(user.created_at)}</td>
                    <td className="px-5 py-3 text-right">
                      {user.role_id === 3 && (
                        <button
                          onClick={() => confirmPromote(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20 transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          Promote
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isPromoteOpen}
        onClose={() => setIsPromoteOpen(false)}
        onConfirm={handlePromote}
        title="Promote User"
        message={`Are you sure you want to promote "${promoteTarget?.name || promoteTarget?.email}" to League Admin?`}
        confirmLabel="Promote"
        variant="warning"
      />
    </>
  );
};

export default ManageUsers;
