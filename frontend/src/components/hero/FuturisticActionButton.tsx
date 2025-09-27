'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FuturisticActionButtonProps {
  type: 'like' | 'comment' | 'save';
  count: number;
  isActive: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
}

const FuturisticActionButton: React.FC<FuturisticActionButtonProps> = ({
  type,
  count,
  isActive,
  onClick,
  className = '',
  disabled = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4" />;
      case 'save':
        return <Bookmark className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'like':
        return {
          active: 'text-red-500',
          bgActive: 'bg-red-500/10',
          borderActive: 'border-red-500/30',
          glowActive: 'shadow-red-500/20',
          gradient: 'from-red-500/20 to-pink-500/20'
        };
      case 'comment':
        return {
          active: 'text-blue-500',
          bgActive: 'bg-blue-500/10',
          borderActive: 'border-blue-500/30',
          glowActive: 'shadow-blue-500/20',
          gradient: 'from-blue-500/20 to-cyan-500/20'
        };
      case 'save':
        return {
          active: 'text-amber-500',
          bgActive: 'bg-amber-500/10',
          borderActive: 'border-amber-500/30',
          glowActive: 'shadow-amber-500/20',
          gradient: 'from-amber-500/20 to-orange-500/20'
        };
      default:
        return {
          active: 'text-gray-500',
          bgActive: 'bg-gray-500/10',
          borderActive: 'border-gray-500/30',
          glowActive: 'shadow-gray-500/20',
          gradient: 'from-gray-500/20 to-gray-500/20'
        };
    }
  };

  const colors = getColors();

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    setIsAnimating(true);
    setShowSparkles(true);
    
    // Reset animation states
    setTimeout(() => {
      setIsAnimating(false);
      setShowSparkles(false);
    }, 600);

    onClick(e);
  }, [disabled, onClick]);

  const buttonVariants = {
    idle: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.2 }
    },
    hover: {
      scale: 1.05,
      rotate: isActive ? 0 : 2,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    },
    active: {
      scale: 1.1,
      rotate: type === 'like' ? [0, -10, 10, 0] : 0,
      transition: { duration: 0.3 }
    }
  };

  const countVariants = {
    idle: { scale: 1, y: 0 },
    change: { 
      scale: [1, 1.2, 1],
      y: [0, -2, 0],
      transition: { duration: 0.3 }
    }
  };

  const sparkleVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0,
      rotate: 0
    },
    visible: {
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      rotate: [0, 180, 360],
      transition: { duration: 0.6 }
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
          onClick={handleClick}
          disabled={disabled}
          className={`
            group/btn relative overflow-hidden transition-all duration-300
            ${isActive ? colors.active : 'text-muted-foreground hover:text-foreground'}
            ${isActive ? colors.bgActive : 'hover:bg-muted/50'}
            ${isActive ? colors.borderActive : 'border-transparent'}
            ${isActive ? colors.glowActive : ''}
            ${isActive ? 'shadow-lg' : ''}
            ${className}
          `}
        >
          {/* Background gradient effect */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-0`}
            animate={{
              opacity: isActive ? [0, 0.3, 0] : 0
            }}
            transition={{ duration: 0.6 }}
          />
          
          {/* Icon with animation */}
          <motion.div
            className="relative z-10 flex items-center gap-2"
            animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {getIcon()}
            
            {/* Count with animation */}
            <motion.span
              key={count}
              variants={countVariants}
              initial="idle"
              animate="change"
              className="text-sm font-medium"
            >
              {count}
            </motion.span>
          </motion.div>

          {/* Ripple effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-current opacity-20"
            initial={{ scale: 0, opacity: 0 }}
            animate={isAnimating ? { scale: 2, opacity: 0 } : {}}
            transition={{ duration: 0.6 }}
          />
        </Button>
      </motion.div>

      {/* Sparkles animation */}
      <AnimatePresence>
        {showSparkles && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                variants={sparkleVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="absolute"
                style={{
                  left: `${20 + (i * 15)}%`,
                  top: `${20 + (i * 10)}%`,
                }}
              >
                <Sparkles 
                  className={`w-3 h-3 ${colors.active}`}
                  style={{
                    transform: `rotate(${i * 60}deg)`
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Glow effect for active state */}
      {isActive && (
        <motion.div
          className={`absolute inset-0 rounded-lg ${colors.glowActive} blur-sm -z-10`}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
};

export default FuturisticActionButton;
