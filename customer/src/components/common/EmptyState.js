import React from 'react';
import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      {Icon && (
        <div className="w-20 h-20 rounded-full bg-[#121214] dark:bg-[#121214]  flex items-center justify-center mb-6">
          <Icon className="text-4xl text-[#e7c588]/80 dark:text-[#e7c588]/80 " />
        </div>
      )}
      {title && (
        <h3 className="text-xl font-semibold text-[#f9f0d7] dark:text-[#f9f0d7]  mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  max-w-sm mb-6 leading-relaxed">{description}</p>
      )}
      {action && <div>{action}</div>}
    </motion.div>
  );
};

export default EmptyState;
