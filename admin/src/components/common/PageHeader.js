import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaHome } from 'react-icons/fa';

const PageHeader = ({ title, subtitle, action, breadcrumbs }) => {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 mb-2">
          <Link to="/" className="hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors">
            <FaHome className="text-xs" />
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <FaChevronRight className="text-[10px]" />
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-600 dark:text-gray-400">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
