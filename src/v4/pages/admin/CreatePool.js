import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/admin/common/PageBreadcrumb';
import PlayoffCreateModal from '../../components/playoffs/PlayoffCreateModal';
import SquaresCreateModal from '../../components/pools/SquaresCreateModal';

const CreatePool = () => {
  const navigate = useNavigate();
  const [playoffModalOpen, setPlayoffModalOpen] = useState(false);
  const [squaresModalOpen, setSquaresModalOpen] = useState(false);

  // On any successful creation, bring the admin back to the All Pools list
  const handleCreated = () => {
    navigate('/admin/pools');
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Create Pool" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              What kind of pool?
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose the type of pool you want to create.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Squares Pool Card */}
            <button
              onClick={() => setSquaresModalOpen(true)}
              className="group text-left rounded-2xl border border-gray-200 bg-white p-6 hover:border-brand-300 hover:shadow-md transition dark:border-gray-800 dark:bg-white/[0.02] dark:hover:border-brand-500/40"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-100 dark:group-hover:bg-brand-500/20 transition">
                <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                Squares Pool
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Classic 100-square grid for a single game. Pick squares, assign numbers, and pay out winners by quarter.
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 group-hover:text-brand-600">
                Create Squares Pool
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>

            {/* NBA Playoff Pool Card */}
            <button
              onClick={() => setPlayoffModalOpen(true)}
              className="group text-left rounded-2xl border border-gray-200 bg-white p-6 hover:border-brand-300 hover:shadow-md transition dark:border-gray-800 dark:bg-white/[0.02] dark:hover:border-brand-500/40"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-100 dark:group-hover:bg-brand-500/20 transition">
                <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                NBA Playoff Pool
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Full bracket pool for the NBA Playoffs. Players submit up to 8 brackets, picking winners and series length.
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 group-hover:text-brand-600">
                Create Playoff Pool
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Create Modals — neither navigates; both return control to /admin/pools on success */}
      <SquaresCreateModal
        isOpen={squaresModalOpen}
        onClose={() => setSquaresModalOpen(false)}
        onCreated={handleCreated}
      />
      <PlayoffCreateModal
        isOpen={playoffModalOpen}
        onClose={() => setPlayoffModalOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
};

export default CreatePool;
