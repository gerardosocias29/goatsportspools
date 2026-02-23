import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useUserContext } from '../contexts/UserContext';
import PageLoader from '../components/common/PageLoader';

const PoolJoin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const axios = useAxios();
  const { isSignedIn, isLoaded } = useUserContext();

  const poolCode = searchParams.get('pool') || '';

  const [poolPreview, setPoolPreview] = useState(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  // Auth guard
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate(`/sign-in?redirect_url=/pools/join?pool=${poolCode}`);
    }
  }, [isLoaded, isSignedIn, poolCode, navigate]);

  // Fetch pool info
  useEffect(() => {
    if (!poolCode || !isLoaded || !isSignedIn) return;

    const fetchPool = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`/api/squares-pools/by-number/${poolCode}`);
        const data = response.data.data || response.data;
        setPoolPreview(data);

        // Auto-redirect if already joined
        if (data.already_joined) {
          navigate(`/pools/${data.pool_number}`, { replace: true });
          return;
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Pool not found. The code may be incorrect or the pool may no longer exist.');
        } else {
          setError(err.response?.data?.message || 'Error looking up pool');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPool();
  }, [poolCode, isLoaded, isSignedIn]);

  const handleJoin = async () => {
    if (!poolPreview) return;
    setJoining(true);
    setError('');
    try {
      await axios.post('/api/squares-pools/join', {
        pool_number: poolCode,
        password: password || undefined,
      });
      navigate(`/pools/${poolPreview.pool_number}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join pool');
    } finally {
      setJoining(false);
    }
  };

  if (!isLoaded || loading) return <PageLoader />;

  if (!poolCode) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invalid Link</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No pool code was provided in this link.</p>
        <button
          onClick={() => navigate('/pools')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition"
        >
          Browse Pools
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-brand-500 to-brand-600 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-7 h-7 !text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold !text-white">Join Pool</h1>
          <p className="text-sm text-white/80 mt-1">You've been invited to join a square pool</p>
        </div>

        <div className="p-6">
          {error ? (
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-error-50 dark:bg-error-500/10 flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm text-error-600 dark:text-error-400 mb-4">{error}</p>
              <button
                onClick={() => navigate('/pools')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition"
              >
                Browse Pools
              </button>
            </div>
          ) : poolPreview ? (
            <div className="space-y-4">
              {/* Pool Info */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {poolPreview.pool_name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">#{poolPreview.pool_number}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    poolPreview.pool_status === 'open' || poolPreview.pool_status === 'SelectOpen'
                      ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'
                      : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500'
                  }`}>
                    {poolPreview.pool_status === 'open' || poolPreview.pool_status === 'SelectOpen' ? 'Open' : 'Closed'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <span>{poolPreview.claimed_squares || 0}/100 squares</span>
                  <span>{poolPreview.player_pool_type === 'FREE' ? 'Free Entry' : `$${poolPreview.credit_cost || 0}/sq`}</span>
                </div>

                <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{ width: `${poolPreview.claimed_squares || 0}%` }}
                  />
                </div>
              </div>

              {/* Password if needed */}
              {poolPreview.has_password && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Pool Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password to join"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>
              )}

              {/* Pool closed message */}
              {(poolPreview.pool_status === 'closed' || poolPreview.pool_status === 'SelectClosed') && (
                <div className="rounded-lg border border-error-300 bg-error-50 p-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
                  This pool is closed and no longer accepting new players.
                </div>
              )}

              {/* Join Button */}
              <button
                onClick={handleJoin}
                disabled={joining || poolPreview.pool_status === 'closed' || poolPreview.pool_status === 'SelectClosed'}
                className="w-full rounded-lg px-5 py-3 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {joining ? 'Joining...' : 'Join This Pool'}
              </button>

              <button
                onClick={() => navigate('/pools')}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
              >
                Browse other pools instead
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PoolJoin;
