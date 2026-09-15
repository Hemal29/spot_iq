import React from 'react';

const statusStyles = {
  active: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  pending: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  paid: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  upcoming: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  completed: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
  available: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  booked: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  maintenance: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  approved: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  rejected: 'bg-red-100 text-red-700',
};

const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();
  const style = statusStyles[normalized] || 'bg-gray-100 dark:bg-gray-800 text-gray-600';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}
    >
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
