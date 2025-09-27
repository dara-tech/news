'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOptimizedLanguage } from '@/hooks/useOptimizedLanguage';

interface EmptyStateProps {
  searchQuery?: string;
  onRefresh: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery, onRefresh }) => {
  const { language } = useOptimizedLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="text-6xl mb-4">📰</div>
      <h3 className="text-xl font-semibold mb-2">
        {searchQuery 
          ? (language === 'kh' ? 'គ្មានលទ្ធផលស្វែងរក' : 'No Search Results')
          : (language === 'kh' ? 'គ្មានព័ត៌មាន' : 'No Articles Found')
        }
      </h3>
      <p className="text-muted-foreground mb-4">
        {searchQuery 
          ? (language === 'kh' ? 'ព្យាយាមស្វែងរកពាក្យផ្សេងទៀត' : 'Try searching with different keywords')
          : (language === 'kh' ? 'មិនមានព័ត៌មានដែលអាចបង្ហាញបាននៅពេលនេះ' : 'No articles are available to display at the moment')
        }
      </p>
      <Button onClick={onRefresh} variant="outline">
        <RefreshCw className="w-4 h-4 mr-2" />
        {language === 'kh' ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}
      </Button>
    </motion.div>
  );
};

export default EmptyState;
