import React from 'react';

const statusStyles = {
  upcoming: 'bg-[#121214] dark:bg-[#121214] text-[#f9f0d7]/30 ',
  active: 'bg-[#121214] dark:bg-[#121214] text-[#f3e0ae]/30',
  completed: 'bg-[#121214] dark:bg-[#121214] text-[#f9f0d7] ',
  cancelled: 'bg-[#e7c588] text-[#e7c588]/30',
  pending: 'bg-[#121214] dark:bg-[#121214] text-[#f3e0ae]/30',
  paid: 'bg-[#121214] dark:bg-[#121214] text-[#f3e0ae]/30',
  available: 'bg-[#121214] dark:bg-[#121214] text-[#f3e0ae]/30',
  booked: 'bg-[#121214] dark:bg-[#121214] text-[#f9f0d7]/30 ',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

const defaultStyle = 'bg-[#121214] dark:bg-[#121214] text-[#f9f0d7] ';

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
