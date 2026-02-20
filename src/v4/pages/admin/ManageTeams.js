import React, { useState, useEffect } from 'react';
import PageBreadcrumb from '../../components/admin/common/PageBreadcrumb';
import Modal from '../../components/admin/common/Modal';
import ConfirmModal from '../../components/admin/common/ConfirmModal';
import { useAxios } from '../../../app/contexts/AxiosContext';

const LEAGUES = ['NFL', 'NBA', 'PBA', 'NCAAF', 'NCAAB'];

const emptyForm = {
  name: '',
  league: 'NFL',
  nickname: '',
  code: '',
  conference: '',
  image_url: '',
};

const ManageTeams = () => {
  const { get, post, delete: del } = useAxios();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const url = filter ? `/api/teams?league=${filter}` : '/api/teams';
      const res = await get(url);
      setTeams(res.data);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [filter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setIsModalOpen(true);
  };

  const openEdit = (team) => {
    setEditing(team);
    setForm({
      name: team.name || '',
      league: team.league || 'NFL',
      nickname: team.nickname || '',
      code: team.code || '',
      conference: team.conference || '',
      image_url: team.image_url || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.league) {
      setError('Name and league are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, code: form.code.toUpperCase() };
      if (editing) {
        await post(`/api/teams/${editing.id}`, payload);
      } else {
        await post('/api/teams', payload);
      }
      setIsModalOpen(false);
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save team.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (team) => {
    setDeleteTarget(team);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await del(`/api/teams/${deleteTarget.id}`);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      fetchTeams();
    } catch (err) {
      console.error('Failed to delete team:', err);
      setIsDeleteOpen(false);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Manage Teams" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              !filter ? 'bg-brand-500 !text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {LEAGUES.map((l) => (
            <button
              key={l}
              onClick={() => setFilter(l)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === l ? 'bg-brand-500 !text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Team
        </button>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1">
                  <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700 mb-1" />
                  <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-white/[0.03] text-center">
          <p className="text-gray-500 dark:text-gray-400">No teams found{filter ? ` for ${filter}` : ''}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                {team.image_url ? (
                  <img src={team.image_url} alt={team.name} className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500 font-bold text-lg">
                    {(team.code || team.name.charAt(0)).charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 truncate">{team.name}</h4>
                  {team.nickname && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{team.nickname}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">{team.league}</span>
                  {team.code && <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{team.code}</span>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(team)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => confirmDelete(team)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Team' : 'Create Team'}>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" placeholder="Team name" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">League <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={form.league} onChange={(e) => setForm({ ...form, league: e.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm appearance-none focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                  {LEAGUES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nickname</label>
              <input type="text" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" placeholder="e.g. Eagles" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Code (max 10)</label>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().slice(0, 10) })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm font-mono uppercase focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" placeholder="PHI" maxLength={10} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Conference</label>
              <input type="text" value={form.conference} onChange={(e) => setForm({ ...form, conference: e.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" placeholder="NFC East" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Image URL</label>
              <input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" placeholder="https://..." />
            </div>
          </div>
          {form.image_url && (
            <div className="mb-4 flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <img src={form.image_url} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Logo preview</span>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 transition">
              {saving ? 'Saving...' : editing ? 'Update Team' : 'Create Team'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} title="Delete Team" message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`} />
    </>
  );
};

export default ManageTeams;
