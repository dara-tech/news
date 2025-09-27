'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useOptimizedLanguage } from '@/hooks/useOptimizedLanguage';

const EndOfContent: React.FC = () => {
  const { language } = useOptimizedLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <div className="inline-flex items-center gap-2 px-6 py-3 bg-muted rounded-full text-muted-foreground">
        <span>✨</span>
        <span>{language === 'kh' ? 'អស់ព័ត៌មានហើយ' : 'You\'ve reached the end'}</span>
        <span>✨</span>
      </div>
    </motion.div>
  );
};

export default EndOfContent;
