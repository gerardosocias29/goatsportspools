import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import usePlayoffPool from '../hooks/usePlayoffPool';
import PicksPage from '../components/playoffs/PicksPage';
import PoolStandings from '../components/playoffs/PoolStandings';
import PageLoader from '../components/common/PageLoader';
import SiteContent from '../components/common/SiteContent';

const PlayoffPoolDetail = () => {
  const { poolNumber } = useParams();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useUserContext();
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
    { key: 'picks', label: 'My Brackets' },
    { key: 'how', label: 'How this Works' },
    { key: 'points', label: 'Points System' },
    { key: 'faq', label: 'FAQ' },
    { key: 'standings', label: 'Standings' },
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
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {pool.pool_name || '2026 NBA Playoffs'}
            </h1>
            <span className="flex-shrink-0 text-xs font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-500/20">
              {pool.pool_number}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Pool Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-brand-500 !text-white hover:bg-brand-600 transition shadow-sm shadow-brand-500/20"
          >
            {copySuccess ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="hidden lg:inline">Copy Invite Link</span>
                <span className="lg:hidden">Invite</span>
              </>
            )}
          </button>

          {participant && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-success-50 border border-success-200 dark:bg-success-500/10 dark:border-success-500/30">
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
        <div className="rounded-xl border border-error-300 bg-error-50 p-4 mb-6 flex items-center gap-3 dark:border-error-500/30 dark:bg-error-500/10">
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

      {activeTab === 'how' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <SiteContent 
            contentKey="playoff_how_this_works" 
            className="prose prose-sm dark:prose-invert max-w-none"
          />
        </div>
      )}

      {activeTab === 'points' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <SiteContent
            contentKey="playoff_points_system"
            className="prose prose-sm dark:prose-invert max-w-none"
          />
        </div>
      )}

      {activeTab === 'faq' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <SiteContent 
            contentKey="playoff_faqs" 
            className="prose prose-sm dark:prose-invert max-w-none"
          />
        </div>
      )}
    </div>
  );
};

export default PlayoffPoolDetail;
