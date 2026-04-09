import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import usePlayoffPool from '../hooks/usePlayoffPool';
import PicksPage from '../components/playoffs/PicksPage';
import PoolStandings from '../components/playoffs/PoolStandings';
import PageLoader from '../components/common/PageLoader';

const PlayoffPoolDetail = () => {
  const { poolNumber } = useParams();
  const navigate = useNavigate();
  const { user, isSignedIn, isLoaded } = useUserContext();
  const [activeTab, setActiveTab] = useState('picks');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/playoffs/join?pool=${pool?.pool_number || poolNumber}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const hook = usePlayoffPool(poolNumber);
  const { pool, participant, loading, error } = hook;

  // Auth redirect — with loop protection
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      const currentPath = `/playoffs/${poolNumber}`;
      // Only redirect if we're not already on sign-in to prevent loops
      if (!window.location.pathname.startsWith('/sign-in')) {
        navigate(`/sign-in?redirect_url=${encodeURIComponent(currentPath)}`);
      }
    }
  }, [isLoaded, isSignedIn, poolNumber, navigate]);

  if (loading || !isLoaded) return <PageLoader />;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-error-50 dark:bg-error-500/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pool Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button onClick={() => navigate('/playoffs')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition">
          Back to Playoffs
        </button>
      </div>
    );
  }

  if (!pool) return null;

  const tabs = [
    { key: 'picks', label: 'My Picks' },
    { key: 'standings', label: 'Standings' },
    { key: 'info', label: 'Pool Info' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate('/playoffs')}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
            {pool.pool_name || '2026 NBA Playoffs'}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">#{pool.pool_number}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Share / Copy Link */}
          <button
            onClick={handleCopyLink}
            title="Copy invite link"
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
          >
            {copySuccess ? (
              <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}
          </button>
          {participant && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-50 border border-success-200 dark:bg-success-500/10 dark:border-success-500/30">
              <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-success-600 dark:text-success-400">Joined</span>
            </div>
          )}
        </div>
      </div>

      {/* Lock banner */}
      {hook.isLocked && (
        <div className="rounded-xl border border-error-300 bg-error-50 p-4 mb-5 flex items-center gap-3 dark:border-error-500/30 dark:bg-error-500/10">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-error-100 dark:bg-error-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-error-700 dark:text-error-400">Picks Locked</h3>
            <p className="text-xs text-error-600 dark:text-error-400/80">This pool is locked. Brackets are read-only.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'picks' && <PicksPage hook={hook} />}
      {activeTab === 'standings' && <PoolStandings poolNumber={poolNumber} />}
      {activeTab === 'info' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pool Info</h3>
          {/* Share box */}
          <div className="rounded-lg border border-dashed border-brand-300 bg-brand-50/50 dark:border-brand-500/30 dark:bg-brand-500/5 p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Pool Code</p>
              <p className="text-lg font-mono font-bold text-brand-600 dark:text-brand-400 tracking-wider">{pool.pool_number}</p>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-brand-500 !text-white hover:bg-brand-600 transition"
            >
              {copySuccess ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Invite Link
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Pool Name</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{pool.pool_name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Status</p>
              <p className="text-sm font-semibold capitalize text-gray-900 dark:text-white">{pool.pool_status || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Max Brackets</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{pool.max_brackets_per_user || 8}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Credits Per Bracket</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{pool.credit_cost_per_bracket === 0 ? 'Free' : pool.credit_cost_per_bracket}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Initial Credits</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{pool.initial_credits || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Participants</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{pool.participants?.length || 0}</p>
            </div>
          </div>
          {pool.pool_description && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{pool.pool_description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayoffPoolDetail;
