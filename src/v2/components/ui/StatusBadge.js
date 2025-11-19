import React from 'react';
import { FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

/**
 * Reusable Status Badge Component
 * Used for displaying status indicators (pending, approved, denied)
 */
const StatusBadge = ({ status }) => {
  const badges = {
    pending: {
      icon: FiClock,
      className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      text: 'Pending'
    },
    approved: {
      icon: FiCheckCircle,
      className: 'bg-green-500/20 text-green-300 border-green-500/30',
      text: 'Approved'
    },
    denied: {
      icon: FiXCircle,
      className: 'bg-red-500/20 text-red-300 border-red-500/30',
      text: 'Denied'
    },
  };

  const badge = badges[status] || badges.pending;
  const Icon = badge.icon;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${badge.className}`}>
      <Icon className="text-sm" />
      {badge.text}
    </span>
  );
};

export default StatusBadge;
