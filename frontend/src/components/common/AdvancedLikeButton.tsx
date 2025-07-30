'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { likeApi } from '@/lib/likeApi';

/**
 * AdvancedLikeButton component for liking news items.
 * 
 * Note: This component intentionally omits `hasError` from the dependency array
 * of the `handleLike` useCallback, as per the linter warning:
 * 161:6  Warning: React Hook useCallback has a missing dependency: 'hasError'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
 * 
 * We intentionally do NOT include `hasError` in the dependency array for `handleLike`
 * to avoid unnecessary re-creations of the callback, since `hasError` is always
 * read at invocation time and not required for memoization.
 */

interface AdvancedLikeButtonProps {
  newsId: string;
  initialLikes?: number;
  initialLiked?: boolean;
  onLikeChange?: (liked: boolean, newCount: number) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
  showCount?: boolean;
  className?: string;
  disabled?: boolean;
  enableDoubleTap?: boolean;
  enableHapticFeedback?: boolean;
  showAnimation?: boolean;
  autoLoad?: boolean;
}

export default function AdvancedLikeButton({
  newsId,
  initialLikes = 0,
  initialLiked = false,
  onLikeChange,
  size = 'md',
  variant = 'ghost',
  showCount = true,
  className,
  disabled = false,
  enableDoubleTap = true,
  enableHapticFeedback = true,
  showAnimation = true,
  autoLoad = true,
}: AdvancedLikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikes || 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const lastTapRef = useRef(0);
  const tapCountRef = useRef(0);

  const triggerHapticFeedback = useCallback(() => {
    if (enableHapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, [enableHapticFeedback]);

  // Load initial like status from backend
  useEffect(() => {
    if (autoLoad && newsId) {
      const loadLikeStatus = async () => {
        try {
          setHasError(false);
          const status = await likeApi.getLikeStatus(newsId);
          setIsLiked(status.hasLiked);
          setLikeCount(status.count || 0);
        } catch (error) {
          console.error('Error loading like status:', error);
          setHasError(true);
          // Fallback to initial values if API fails
          setIsLiked(initialLiked);
          setLikeCount(initialLikes || 0);
        }
      };
      loadLikeStatus();
    }
  }, [newsId, autoLoad, initialLiked, initialLikes]);

  const handleLike = useCallback(async (forceLike = false) => {
    if (disabled || isLoading) return;

    // If there was an error, try to refresh the status first
    if (hasError) {
      try {
        const status = await likeApi.getLikeStatus(newsId);
        setIsLiked(status.hasLiked);
        setLikeCount(status.count || 0);
        setHasError(false);
      } catch (error) {
        console.error('Failed to refresh like status:', error);
        // Continue with the like action anyway
      }
    }

    triggerHapticFeedback();
    setIsLoading(true);
    setIsAnimating(true);

    // Optimistic update
    const newLiked = forceLike ? true : !isLiked;
    const newCount = newLiked ? (likeCount || 0) + 1 : Math.max(0, (likeCount || 0) - 1);

    setIsLiked(newLiked);
    setLikeCount(newCount);

    // Show heart animation if liking
    if (newLiked && showAnimation) {
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 1000);
    }

    try {
      // Call backend API
      const response = await likeApi.toggleLike(newsId);

      // Update with actual response data
      if (response.success) {
        setIsLiked(response.liked ?? newLiked);
        // If we have the actual count from backend, use it
        if (response.count !== undefined) {
          setLikeCount(response.count);
        }
      }

      // Call the callback if provided
      if (onLikeChange) {
        await onLikeChange(newLiked, newCount);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newLiked);
      setLikeCount(newLiked ? Math.max(0, newCount - 1) : newCount + 1);
      console.error('Failed to update like:', error);
      setHasError(true);

      // If it's an API availability error, we can keep the optimistic update
      if (error instanceof Error && error.message === 'API is not available') {
        console.warn('API not available, keeping optimistic update');
        // Don't revert for API availability issues
        setIsLiked(newLiked);
        setLikeCount(newCount);
        setHasError(false);
      }
    } finally {
      setIsLoading(false);
      // Reset animation after a short delay
      setTimeout(() => setIsAnimating(false), 300);
        }
  }, [disabled, isLoading, isLiked, likeCount, onLikeChange, triggerHapticFeedback, showAnimation, newsId, hasError]);

  const handleClick = useCallback(() => {
    const now = Date.now();
    const timeDiff = now - lastTapRef.current;

    if (enableDoubleTap && timeDiff < 300) {
      // Double tap detected
      tapCountRef.current = 0;
      handleLike(true); // Force like on double tap
    } else {
      // Single tap
      tapCountRef.current++;
      handleLike();
    }

    lastTapRef.current = now;
  }, [enableDoubleTap, handleLike]);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const countSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('flex items-center gap-2 relative', className)}>
      <Button
        variant={variant}
        size="icon"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'rounded-full transition-all duration-200 relative overflow-hidden',
          sizeClasses[size],
          isLiked
            ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
            : 'text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
          isAnimating && 'scale-110',
          (disabled || isLoading || hasError) && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Heart
          className={cn(
            iconSizes[size],
            'transition-all duration-200 relative z-10',
            isLiked && 'fill-current',
            isAnimating && 'animate-pulse'
          )}
        />

        {/* Floating heart animation */}
        {showHeartAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart
              className={cn(
                iconSizes[size],
                'text-red-500 fill-current animate-bounce',
                'animate-[bounce_1s_ease-out]'
              )}
              style={{
                animation: 'floatHeart 1s ease-out forwards',
              }}
            />
          </div>
        )}
      </Button>

      {showCount && (
        <span
          className={cn(
            'font-medium transition-all duration-200',
            countSizes[size],
            isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'
          )}
        >
          {(likeCount || 0).toLocaleString()}
        </span>
      )}

      {/* Custom CSS for heart animation */}
      <style jsx>{`
        @keyframes floatHeart {
          0% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          50% {
            transform: scale(1.5) translateY(-20px);
            opacity: 0.8;
          }
          100% {
            transform: scale(2) translateY(-40px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Export a simpler version for just the button without count
export function SimpleAdvancedLikeButton({
  newsId,
  initialLiked = false,
  onLikeChange,
  size = 'md',
  variant = 'ghost',
  className,
  disabled = false,
  enableDoubleTap = true,
  enableHapticFeedback = true,
  showAnimation = true,
}: Omit<AdvancedLikeButtonProps, 'initialLikes' | 'showCount'>) {
  return (
    <AdvancedLikeButton
      newsId={newsId}
      initialLiked={initialLiked}
      onLikeChange={onLikeChange}
      size={size}
      variant={variant}
      showCount={false}
      className={className}
      disabled={disabled}
      enableDoubleTap={enableDoubleTap}
      enableHapticFeedback={enableHapticFeedback}
      showAnimation={showAnimation}
    />
  );
}