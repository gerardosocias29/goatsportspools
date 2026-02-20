import React, { useState, useEffect } from 'react';
import PageBreadcrumb from '../../components/admin/common/PageBreadcrumb';
import Modal from '../../components/admin/common/Modal';
import ConfirmModal from '../../components/admin/common/ConfirmModal';
import { useAxios } from '../../../app/contexts/AxiosContext';

const VARIANTS = ['primary', 'success', 'warning', 'info', 'promo'];
const PAGES = ['all', 'home', 'squares', 'auction', 'leagues', 'betting'];

const VARIANT_COLORS = {
  primary: 'border-brand-200 bg-brand-50 dark:border-brand-500/30 dark:bg-brand-500/10',
  success: 'border-green-200 bg-green-50 dark:border-green-500/30 dark:bg-green-500/10',
  warning: 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10',
  info: 'border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10',
  promo: 'border-purple-200 bg-purple-50 dark:border-purple-500/30 dark:bg-purple-500/10',
};

const VARIANT_BADGE = {
  primary: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
  success: 'bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  info: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  promo: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
};

const emptyForm = {
  title: '',
  description: '',
  icon: '',
  variant: 'primary',
  page: 'all',
  start_date: '',
  end_date: '',
  status: 'active',
  priority: 0,
  dismissible: false,
  action_text: '',
  action_url: '',
};

const ManageBanners = () => {
  const { get, post, put, patch, delete: del } = useAxios();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await get('/api/banners/manage');
      setBanners(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const filtered = banners.filter((b) => {
    if (!statusFilter) return true;
    return b.status === statusFilter;
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setIsModalOpen(true);
  };

  const openEdit = (banner) => {
    setEditing(banner);
    setForm({
      title: banner.title || '',
      description: banner.description || '',
      icon: banner.icon || '',
      variant: banner.variant || 'primary',
      page: banner.page || 'all',
      start_date: banner.start_date ? banner.start_date.slice(0, 10) : '',
      end_date: banner.end_date ? banner.end_date.slice(0, 10) : '',
      status: banner.status || 'active',
      priority: banner.priority || 0,
      dismissible: banner.dismissible || false,
      action_text: banner.action_text || '',
      action_url: banner.action_url || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        priority: parseInt(form.priority) || 0,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        action_text: form.action_text || null,
        action_url: form.action_url || null,
        description: form.description || null,
        icon: form.icon || null,
      };
      if (editing) {
        await put(`/api/banners/${editing.id}`, payload);
      } else {
        await post('/api/banners', payload);
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save banner.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (banner) => {
    try {
      await patch(`/api/banners/${banner.id}/toggle-status`);
      fetchBanners();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const confirmDelete = (banner) => {
    setDeleteTarget(banner);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await del(`/api/banners/${deleteTarget.id}`);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      fetchBanners();
    } catch (err) {
      console.error('Failed to delete banner:', err);
      setIsDeleteOpen(false);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Manage Banners" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {['', 'active', 'hidden'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                statusFilter === s ? 'bg-brand-500 !text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Banner
        </button>
      </div>

      {/* Banners List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
              <div className="h-5 w-48 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-white/[0.03] text-center">
          <p className="text-gray-500 dark:text-gray-400">No banners found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((banner) => (
            <div
              key={banner.id}
              className={`rounded-2xl border p-5 transition-shadow hover:shadow-md ${
                banner.status === 'hidden' ? 'opacity-60 border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]' : VARIANT_COLORS[banner.variant] || VARIANT_COLORS.primary
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {banner.icon && <span className="text-lg">{banner.icon}</span>}
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">{banner.title}</h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${VARIANT_BADGE[banner.variant] || VARIANT_BADGE.primary}`}>
                      {banner.variant}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      banner.status === 'active' ? 'bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {banner.status}
                    </span>
                  </div>
                  {banner.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{banner.description}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>Page: <strong>{banner.page}</strong></span>
                    <span>Priority: <strong>{banner.priority}</strong></span>
                    {banner.dismissible && <span>Dismissible</span>}
                    {banner.start_date && <span>From: {new Date(banner.start_date).toLocaleDateString()}</span>}
                    {banner.end_date && <span>Until: {new Date(banner.end_date).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleStatus(banner)} className={`p-1.5 rounded-lg transition ${banner.status === 'active' ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`} title={banner.status === 'active' ? 'Hide banner' : 'Show banner'}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {banner.status === 'active' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      )}
                    </svg>
                  </button>
                  <button onClick={() => openEdit(banner)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => confirmDelete(banner)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
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

      {/* Create/Edit Banner Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Banner' : 'Create Banner'} maxWidth="max-w-3xl">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Title <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" placeholder="Banner title" />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" placeholder="Optional description..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Icon (emoji)</label>
              <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" placeholder="e.g. 🏈" maxLength={10} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Variant</label>
              <div className="relative">
                <select value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm appearance-none focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                  {VARIANTS.map((v) => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Target Page</label>
              <div className="relative">
                <select value={form.page} onChange={(e) => setForm({ ...form, page: e.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm appearance-none focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                  {PAGES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Start Date</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">End Date</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Priority (0-100)</label>
              <input type="number" min="0" max="100" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Action Text</label>
              <input type="text" value={form.action_text} onChange={(e) => setForm({ ...form, action_text: e.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" placeholder="e.g. Learn More" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Action URL</label>
              <input type="text" value={form.action_url} onChange={(e) => setForm({ ...form, action_url: e.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" placeholder="/v4/pools" />
            </div>
          </div>

          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.status === 'active'} onChange={(e) => setForm({ ...form, status: e.target.checked ? 'active' : 'hidden' })} className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20" />
              <span className="text-sm text-gray-700 dark:text-gray-400">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.dismissible} onChange={(e) => setForm({ ...form, dismissible: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20" />
              <span className="text-sm text-gray-700 dark:text-gray-400">Dismissible</span>
            </label>
          </div>

          {/* Preview */}
          {form.title && (
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Preview</label>
              <div className={`rounded-xl border p-4 ${VARIANT_COLORS[form.variant] || VARIANT_COLORS.primary}`}>
                <div className="flex items-start gap-2">
                  {form.icon && <span className="text-lg">{form.icon}</span>}
                  <div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-white/90">{form.title}</div>
                    {form.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{form.description}</p>}
                    {form.action_text && (
                      <span className="inline-block mt-2 text-sm font-medium text-brand-600 dark:text-brand-400">{form.action_text} &rarr;</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 transition">
              {saving ? 'Saving...' : editing ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} title="Delete Banner" message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`} />
    </>
  );
};

export default ManageBanners;
