import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../../../app/contexts/AxiosContext';
import Modal from '../admin/common/Modal';

const PlayoffCreateModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const axios = useAxios();

  const [playoffs, setPlayoffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    playoff_id: '',
    pool_name: '',
    pool_description: '',
    password: '',
    initial_credits: 0,
    close_datetime: '',
  });

  // Fetch available playoffs
  useEffect(() => {
    if (!isOpen) return;
    const fetchPlayoffs = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/admin/playoffs');
        const data = res.data.data || [];
        setPlayoffs(data);
        if (data.length > 0 && !form.playoff_id) {
          setForm((f) => ({ ...f, playoff_id: data[0].id }));
        }
      } catch (err) {
        console.error('Error fetching playoffs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayoffs();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setForm({
        playoff_id: '',
        pool_name: '',
        pool_description: '',
        password: '',
        initial_credits: 0,
        close_datetime: '',
      });
      setError('');
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleCreate = async () => {
    if (!form.playoff_id || !form.pool_name.trim()) {
      setError('Pool name and playoff year are required.');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const payload = {
        playoff_id: Number(form.playoff_id),
        pool_name: form.pool_name,
        initial_credits: Number(form.initial_credits) || 0,
        password: form.password || undefined,
        close_datetime: form.close_datetime || undefined,
        pool_description: form.pool_description || undefined,
      };
      const res = await axios.post('/api/admin/playoffs/pools', payload);
      const pool = res.data.data;
      onClose();
      navigate(`/playoffs/${pool.pool_number}`);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.pool_name?.[0] || 'Failed to create pool');
    } finally {
      setCreating(false);
    }
  };

  const inputClass = "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Playoff Pool" maxWidth="max-w-lg">
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Playoff Year */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Playoff Year
              </label>
              <select
                value={form.playoff_id}
                onChange={(e) => handleChange('playoff_id', e.target.value)}
                className={inputClass}
              >
                {playoffs.map((p) => (
                  <option key={p.id} value={p.id}>{p.year} — {p.name}</option>
                ))}
              </select>
            </div>

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
                placeholder="Leave blank for no password"
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
                  value={0}
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
                  value={8}
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
          </>
        )}

        {error && (
          <div className="rounded-lg border border-error-300 bg-error-50 p-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || loading}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {creating ? 'Creating...' : 'Create Pool'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PlayoffCreateModal;
