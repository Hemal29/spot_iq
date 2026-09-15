import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hover = true, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      whileHover={hover ? { scale: 1.02, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } : undefined}
      className={`bg-[#0a0a0b]/80   rounded-2xl border border-[#e7c588]/25  ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
