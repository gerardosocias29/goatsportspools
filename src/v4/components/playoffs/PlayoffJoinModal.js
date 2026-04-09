import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../../../app/contexts/AxiosContext';
import Modal from '../admin/common/Modal';

const PlayoffJoinModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const axios = useAxios();

  const [poolCode, setPoolCode] = useState('');
  const [password, setPassword] = useState('');
  const [poolPreview, setPoolPreview] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  // Auto-lookup when pool code is 6+ chars
  useEffect(() => {
    if (poolCode.length < 6) {
      setPoolPreview(null);
      setError('');
      return;
    }

    const timer = setTimeout(async () => {
      setLookupLoading(true);
      setError('');
      try {
        const response = await axios.get(`/api/playoff-pools/by-number/${poolCode}`);
        const data = response.data.data || response.data;
        setPoolPreview(data);

        if (data.already_joined) {
          onClose();
          navigate(`/playoffs/${data.pool_number}`);
        }
      } catch (err) {
        setPoolPreview(null);
        if (err.response?.status === 404) {
          setError('Pool not found. Check the code and try again.');
        } else {
          setError(err.response?.data?.message || 'Error looking up pool');
        }
      } finally {
        setLookupLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [poolCode]);

  useEffect(() => {
    if (!isOpen) {
      setPoolCode('');
      setPassword('');
      setPoolPreview(null);
      setError('');
    }
  }, [isOpen]);

  const handleJoin = async () => {
    if (!poolPreview) return;
    setJoining(true);
    setError('');
    try {
      await axios.post('/api/playoff-pools/join', {
        pool_number: poolCode,
        password: password || undefined,
      });
      onClose();
      navigate(`/playoffs/${poolPreview.pool_number}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join pool');
    } finally {
      setJoining(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'open') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">Open</span>;
    }
    if (status === 'locked' || status === 'completed') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500">{status === 'locked' ? 'Locked' : 'Completed'}</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">{status}</span>;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Playoff Pool" maxWidth="max-w-md">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Pool Code
          </label>
          <input
            type="text"
            value={poolCode}
            onChange={(e) => setPoolCode(e.target.value.toUpperCase().slice(0, 10))}
            placeholder="Enter pool code (e.g. ABC123)"
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm uppercase tracking-widest font-mono shadow-theme-xs placeholder:normal-case placeholder:tracking-normal placeholder:font-sans focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
            autoFocus
          />
        </div>

        {lookupLoading && (
          <div className="flex items-center justify-center py-3">
            <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Looking up pool...</span>
          </div>
        )}

        {poolPreview && !lookupLoading && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {poolPreview.pool_name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  #{poolPreview.pool_number}
                </p>
              </div>
              {getStatusBadge(poolPreview.pool_status)}
            </div>

            {poolPreview.pool_description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {poolPreview.pool_description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-3">
              <span>{poolPreview.participant_count || 0} participants</span>
              <span>Up to {poolPreview.max_brackets_per_user} brackets</span>
              <span>{poolPreview.credit_cost_per_bracket > 0 ? `${poolPreview.credit_cost_per_bracket} credits/bracket` : 'Free brackets'}</span>
            </div>

            {poolPreview.has_password && (
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Password Required
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter pool password"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>
            )}
          </div>
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
            onClick={handleJoin}
            disabled={!poolPreview || joining || poolPreview?.is_locked}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {joining ? 'Joining...' : 'Join Pool'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PlayoffJoinModal;
