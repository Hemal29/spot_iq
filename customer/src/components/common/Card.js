import React from 'react';

const Card = ({ children, className = '', hover = false, onClick }) => {
  const hoverStyles = hover
    ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer transition-all duration-200'
    : '';

  const clickHandler = onClick || (() => {});

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md ${hoverStyles} ${className}`}
      onClick={onClick ? clickHandler : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {children}
    </div>
  );
};

export default Card;
