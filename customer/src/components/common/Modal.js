import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const handleEscape = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50  animate-fadeIn"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizeClasses[size] || sizeClasses.md} bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-2xl shadow-2xl animate-slideUp z-10`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7c588]/25">
          <h2 className="text-lg font-semibold text-[#f9f0d7] dark:text-[#f9f0d7] ">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:bg-[#121214] dark:hover:bg-[#1c1c1f]/50 dark:bg-[#121214] :bg-[#1c1c1f] transition-colors"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
