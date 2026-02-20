import React from 'react';
import { Link } from 'react-router-dom';

const SidebarWidget = () => {
  return (
    <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]">
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        OKRNG Platform
      </h3>
      <p className="mb-4 text-gray-500 text-sm dark:text-gray-400">
        Manage your sports pools, auctions, and leagues.
      </p>
      <Link
        to="/v4"
        className="flex items-center justify-center p-3 font-medium !text-white rounded-lg bg-brand-500 text-sm hover:bg-brand-600"
      >
        Back to Site
      </Link>
    </div>
  );
};

export default SidebarWidget;
