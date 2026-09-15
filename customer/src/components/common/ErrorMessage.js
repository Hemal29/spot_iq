import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 p-4 bg-[#e7c588] border border-[#e7c588]/40 rounded-xl" role="alert">
      <FaExclamationTriangle className="text-[#e7c588] mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#e7c588]">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-[#e7c588] bg-[#e7c588] hover:bg-[#e7c588] rounded-lg transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
