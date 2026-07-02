import React from 'react';

const statusStyles = {
  upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  booked: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

const defaultStyle = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

const Badge = ({ status, size = 'sm' }) => {
  const colorClass = statusStyles[status?.toLowerCase()] || defaultStyle;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full capitalize ${colorClass} ${sizeStyles[size] || sizeStyles.sm}`}
    >
      {status || 'unknown'}
    </span>
  );
};

export default Badge;
