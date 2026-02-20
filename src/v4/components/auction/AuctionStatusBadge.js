import React from 'react';

const statusConfig = {
  pending: {
    label: 'Pending',
    classes: 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400',
    dot: 'bg-warning-500',
  },
  live: {
    label: 'Live',
    classes: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400',
    dot: 'bg-error-500 animate-pulse',
  },
  completed: {
    label: 'Completed',
    classes: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    dot: 'bg-gray-400',
  },
  cancelled: {
    label: 'Cancelled',
    classes: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400',
    dot: 'bg-error-500',
  },
};

const AuctionStatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default AuctionStatusBadge;
