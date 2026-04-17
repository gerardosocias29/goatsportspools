import React, { useState } from 'react';
import SharedModal from '../../admin/common/Modal';
import { useAxios } from '../../../../app/contexts/AxiosContext';

const inputCls =
  'h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500';

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">{label}</label>
    {children}
  </div>
);

const PlayoffPoolEditModal = ({ isOpen, pool, onClose, onSaved, onError }) => {
  const { patch } = useAxios();
  const [form, setForm] = useState(() => ({
    pool_name: pool?.pool_name || '',
    pool_description: pool?.pool_description || '',
    initial_credits: pool?.initial_credits ?? 0,
    credit_cost_per_bracket: pool?.credit_cost_per_bracket ?? 0,
    max_brackets_per_user: pool?.max_brackets_per_user ?? 8,
    close_datetime: pool?.close_datetime ? pool.close_datetime.substring(0, 16) : '',
    password: pool?.password || '',
  }));
  const [saving, setSaving] = useState(false);

  if (!isOpen || !pool) return null;

  const save = async () => {
    setSaving(true);
    try {
      const res = await patch(`/api/admin/playoffs/pools/${pool.pool_number}`, {
        ...form,
        close_datetime: form.close_datetime || null,
        password: form.password || null,
      });
      if (res?.data?.status) onSaved?.(res.data.data || form);
      else onError?.(res?.data?.message || 'Failed to update pool');
    } catch (err) {
      onError?.(err?.response?.data?.message || 'Failed to update pool');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Pool #${pool.pool_number}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Pool Name">
            <input
              type="text"
              value={form.pool_name}
              onChange={(e) => setForm((f) => ({ ...f, pool_name: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="Password (optional)">
            <input
              type="text"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Leave blank for open"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Description">
          <textarea
            rows={2}
            value={form.pool_description}
            onChange={(e) => setForm((f) => ({ ...f, pool_description: e.target.value }))}
            className={`${inputCls} h-auto py-2`}
          />
        </Field>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Initial Credits">
            <input
              type="number"
              value={form.initial_credits}
              onChange={(e) => setForm((f) => ({ ...f, initial_credits: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="Cost per Bracket">
            <input
              type="number"
              value={form.credit_cost_per_bracket}
              onChange={(e) => setForm((f) => ({ ...f, credit_cost_per_bracket: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="Max Brackets / User">
            <input
              type="number"
              value={form.max_brackets_per_user}
              onChange={(e) => setForm((f) => ({ ...f, max_brackets_per_user: e.target.value }))}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Close Date/Time">
          <input
            type="datetime-local"
            value={form.close_datetime}
            onChange={(e) => setForm((f) => ({ ...f, close_datetime: e.target.value }))}
            className={inputCls}
          />
        </Field>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-brand-500 hover:bg-brand-600 !text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Pool'}
          </button>
        </div>
      </div>
    </SharedModal>
  );
};

export default PlayoffPoolEditModal;
