import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import PageLoader from '../components/common/PageLoader';
import CreatePoolForm, { STEP_LABELS } from '../components/pools/CreatePoolForm';

const CreatePool = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded, isSuperadmin, isSquareAdmin } = useUserContext();

  // Auth guard
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in', { state: { returnTo: '/pools/create' } });
    }
    if (isLoaded && isSignedIn && !isSuperadmin && !isSquareAdmin) {
      navigate('/pools');
    }
  }, [isLoaded, isSignedIn, isSuperadmin, isSquareAdmin, navigate]);

  if (!isLoaded) return <PageLoader />;

  const handleSuccess = (poolNumber) => {
    navigate(poolNumber ? `/pools/${poolNumber}` : '/pools');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Squares Pool</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Follow the steps — {STEP_LABELS.length} total
          </p>
        </div>
      </div>

      <CreatePoolForm onSuccess={handleSuccess} />
    </div>
  );
};

export default CreatePool;
