import React from 'react';
import PageBreadcrumb from '../../components/admin/common/PageBreadcrumb';

const CreatePool = () => (
  <>
    <PageBreadcrumb pageTitle="Create Pool" />
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-brand-50 dark:bg-brand-500/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Create Pool</h3>
        <p className="text-gray-500 dark:text-gray-400">Pool creation form coming soon.</p>
      </div>
    </div>
  </>
);

export default CreatePool;
