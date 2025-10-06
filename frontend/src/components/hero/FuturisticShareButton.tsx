'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, ExternalLink, Copy, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOptimizedLanguage } from '@/hooks/useOptimizedLanguage';

interface FuturisticShareButtonProps {
  articleTitle: string;
  articleUrl: string;
  className?: string;
  disabled?: boolean;
}

const FuturisticShareButton: React.FC<FuturisticShareButtonProps> = ({
  articleTitle,
  articleUrl,
  className = '',
  disabled = false
}) => {
  const { language } = useOptimizedLanguage();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;

    setIsAnimating(true);

    try {
      if (navigator.share) {
        await navigator.share({
          title: articleTitle,
          url: articleUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(articleUrl);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 600);
    }
  }, [disabled, articleTitle, articleUrl]);

  const handleCopyLink = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(articleUrl);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error copying link', error);
    }
  }, [articleUrl]);

  const buttonVariants = {
    idle: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.2 }
    },
    hover: {
      scale: 1.05,
      rotate: 2,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    },
    active: {
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.3 }
    }
  };

  const shareOptionsVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 10,
      transition: { duration: 0.2 }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="relative">
      <motion.div
        variants={buttonVariants}
        initial="idle"
        animate={isAnimating ? "active" : "idle"}
        whileHover="hover"
        whileTap="tap"
        className="relative"
      >
        <Button
          size="sm"
          variant="ghost"
          onClick={handleShare}
          disabled={disabled}
          className={`
            group/btn relative overflow-hidden transition-all duration-300
            text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10
            border-transparent hover:border-blue-500/30 hover:shadow-blue-500/20
            hover:shadow-lg
            ${className}
          `}
        >
          {/* Background gradient effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0"
            animate={{
              opacity: isAnimating ? [0, 0.3, 0] : 0
            }}
            transition={{ duration: 0.6 }}
          />
          
          {/* Icon with animation */}
          <motion.div
            className="relative z-10 flex items-center gap-2"
            animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {showSuccess ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            
            <span className="text-sm font-medium">
              {showSuccess 
                ? (language === 'kh' ? 'បានចម្លង' : 'Copied!')
                : (language === 'kh' ? 'ចែករំលែក' : 'Share')
              }
            </span>
          </motion.div>

          {/* Ripple effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-500 opacity-20"
            initial={{ scale: 0, opacity: 0 }}
            animate={isAnimating ? { scale: 2, opacity: 0 } : {}}
            transition={{ duration: 0.6 }}
          />
        </Button>
      </motion.div>

      {/* Success animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-2 -right-2 z-20"
          >
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
              ✓
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg shadow-blue-500/20 blur-sm -z-10"
        animate={{
          opacity: isAnimating ? [0.5, 0.8, 0.5] : 0,
          scale: isAnimating ? [1, 1.05, 1] : 1
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default FuturisticShareButton;
