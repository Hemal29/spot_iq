import React from 'react';

const variantClasses = {
  primary:
    'bg-primary-400 text-[#f9f0d7] hover:bg-primary-500 focus:ring-primary-400 active:bg-primary-600',
  secondary:
    'bg-[#0a0a0b]0 text-[#f9f0d7] hover:bg-primary-400 focus:ring-primary-400 active:bg-primary-500',
  outline:
    'border-2 border-[#e7c588]/40 text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:bg-[#0a0a0b] dark:hover:bg-[#121214] dark:bg-[#121214] focus:ring-primary-400',
  ghost:
    'text-[#f3e0ae] dark:text-[#e7c588]/80 hover:bg-[#121214] dark:hover:bg-[#1c1c1f]/50 dark:bg-[#121214] :bg-[#1c1c1f] focus:ring-gray-500',
  danger:
    'bg-[#e7c588] text-[#f9f0d7] hover:bg-[#e7c588] focus:ring-[#e7c588]/40 active:bg-[#e7c588]',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  children,
  onClick,
  type = 'button',
  fullWidth = false,
  className = '',
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2:ring-offset-gray-900 ${
        variantClasses[variant] || variantClasses.primary
      } ${sizeClasses[size] || sizeClasses.md} ${
        fullWidth ? 'w-full' : ''
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : Icon ? (
        <Icon className="text-lg" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
