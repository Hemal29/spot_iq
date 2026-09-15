import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const SearchBar = ({ value, onChange, onSearch, placeholder = 'Search...', className = '' }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange('');
    }
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80 text-sm" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-[#0a0a0b] dark:bg-[#0a0a0b] border border-[#e7c588]/25 rounded-xl text-sm text-[#f9f0d7] dark:text-[#f9f0d7]  placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 transition-colors"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
