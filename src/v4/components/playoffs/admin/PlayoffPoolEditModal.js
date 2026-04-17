import React, { useState, useEffect } from 'react';
import SharedModal from '../../admin/common/Modal';
import { useAxios } from '../../../../app/contexts/AxiosContext';

const inputClass =
  'h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500';

const emptyForm = {
  pool_name: '',
  pool_description: '',
  password: '',
  initial_credits: 0,
  close_datetime: '',
};

const PlayoffPoolEditModal = ({ isOpen, pool, onClose, onSaved, onError }) => {
  const { patch } = useAxios();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Sync form when a new pool is passed in (lazy useState doesn't re-run on prop change).
  useEffect(() => {
    if (!isOpen || !pool) {
      setForm(emptyForm);
      setError('');
      return;
    }
    setForm({
      pool_name: pool.pool_name || '',
      pool_description: pool.pool_description || '',
      password: '',
      initial_credits: pool.initial_credits ?? 0,
      close_datetime: pool.close_datetime ? pool.close_datetime.substring(0, 16) : '',
    });
    setError('');
  }, [isOpen, pool]);

  if (!isOpen || !pool) return null;

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const save = async () => {
    if (!form.pool_name.trim()) {
      setError('Pool name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      // Payload mirrors Create: cost_per_bracket and max_brackets_per_user are fixed and omitted.
      const payload = {
        pool_name: form.pool_name,
        pool_description: form.pool_description || null,
        initial_credits: Number(form.initial_credits) || 0,
        close_datetime: form.close_datetime || null,
      };
      if (form.password) payload.password = form.password;

      const res = await patch(`/api/admin/playoffs/pools/${pool.pool_number}`, payload);
      if (res?.data?.status) {
        onSaved?.(res.data.data || form);
      } else {
        setError(res?.data?.message || 'Failed to update pool');
        onError?.(res?.data?.message || 'Failed to update pool');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.pool_name?.[0] ||
        'Failed to update pool';
      setError(msg);
      onError?.(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Pool #${pool.pool_number}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Pool Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Pool Name *
          </label>
          <input
            type="text"
            value={form.pool_name}
            onChange={(e) => handleChange('pool_name', e.target.value)}
            placeholder="e.g. Office Bracket Challenge"
            className={inputClass}
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Description
          </label>
          <textarea
            value={form.pool_description}
            onChange={(e) => handleChange('pool_description', e.target.value)}
            placeholder="Optional pool description..."
            rows={2}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500 resize-none"
            maxLength={500}
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Password (optional)
          </label>
          <input
            type="text"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder={pool.password ? 'Leave blank to keep current password' : 'Leave blank for no password'}
            className={inputClass}
          />
        </div>

        {/* Credits + Cost/Max Row */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Initial Credits
            </label>
            <input
              type="number"
              value={form.initial_credits}
              onChange={(e) => handleChange('initial_credits', e.target.value)}
              min={0}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Cost / Bracket
            </label>
            <input
              type="number"
              value={pool.credit_cost_per_bracket ?? 0}
              disabled
              className={`${inputClass} cursor-not-allowed opacity-60`}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Max Brackets
            </label>
            <input
              type="number"
              value={pool.max_brackets_per_user ?? 8}
              disabled
              className={`${inputClass} cursor-not-allowed opacity-60`}
            />
          </div>
        </div>

        {/* Close Date */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Close Date/Time
          </label>
          <input
            type="datetime-local"
            value={form.close_datetime}
            onChange={(e) => handleChange('close_datetime', e.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-error-300 bg-error-50 p-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? 'Saving...' : 'Save Pool'}
          </button>
        </div>
      </div>
    </SharedModal>
  );
};

export default PlayoffPoolEditModal;
