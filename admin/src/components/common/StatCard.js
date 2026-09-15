import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const StatCard = ({ title, value, icon: Icon, color = 'blue', change, changeType }) => {
  const colorMap = {
    blue: 'bg-primary-100 text-primary-400',
    green: 'bg-primary-100 text-primary-400',
    orange: 'bg-primary-100 text-primary-400',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-primary-100 text-primary-400',
    teal: 'bg-primary-100 text-primary-400',
  };

  return (
    <div className="admin-card p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                  changeType === 'increase' ? 'text-primary-400' : 'text-red-600'
                }`}
              >
                {changeType === 'increase' ? (
                  <FaArrowUp className="text-[10px]" />
                ) : (
                  <FaArrowDown className="text-[10px]" />
                )}
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorMap[color] || colorMap.blue}`}>
            <Icon className="text-xl" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
