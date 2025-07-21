'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        setAccessDenied(true);
        const timer = setTimeout(() => {
          router.push('/');
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        setShowContent(true);
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-6">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="mx-auto w-16 h-16"
          >
            <Loader2 className="w-full h-full text-primary animate-spin" />
          </motion.div>
          <motion.p 
            className="text-lg font-medium text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Verifying admin access...
          </motion.p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <motion.div 
          className="text-center max-w-md p-8 rounded-lg border border-destructive/20 bg-destructive/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="mx-auto w-16 h-16 mb-4 text-destructive">
            <ShieldAlert className="w-full h-full" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            You don&apos;t have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            className="mt-2"
          >
            Go to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {showContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminGuard;
