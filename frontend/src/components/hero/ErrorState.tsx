'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOptimizedLanguage } from '@/hooks/useOptimizedLanguage';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  const { language } = useOptimizedLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6"
    >
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-destructive" />
        <div>
          <h3 className="font-semibold text-destructive">
            {language === 'kh' ? 'មានបញ្ហាក្នុងការផ្ទុក' : 'Error Loading Articles'}
          </h3>
          <p className="text-sm text-destructive/80">{error}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="ml-auto"
        >
          {language === 'kh' ? 'ព្យាយាមម្តងទៀត' : 'Try Again'}
        </Button>
      </div>
    </motion.div>
  );
};

export default ErrorState;
