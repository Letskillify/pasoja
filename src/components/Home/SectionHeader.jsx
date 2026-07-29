import React from 'react';
import { motion } from 'framer-motion';

const SectionHeader = ({ subtitle, title, description, action, border = true, center = false }) => {
  return (
    <div className={`flex flex-col ${center ? 'items-center text-center' : 'md:flex-row md:items-end justify-between'} mb-16 ${border ? 'border-b border-white/[0.06] pb-8' : ''}`}>
      <div className={center ? 'flex flex-col items-center' : ''}>
        {subtitle && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold block mb-4"
          >
            {subtitle}
          </motion.span>
        )}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-widest uppercase leading-none"
        >
          {title}
        </motion.h2>
      </div>
      {(description || action) && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`flex flex-col ${center ? 'items-center mt-6 text-center' : 'md:items-end md:mt-0 mt-6'} max-w-sm`}
        >
          {description && (
            <p className="text-white/50 text-sm md:text-[15px] font-light leading-relaxed mb-4 md:mb-0 md:text-right">
              {description}
            </p>
          )}
          {action && (
            <div className="w-full flex md:justify-end">
              {action}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default SectionHeader;
