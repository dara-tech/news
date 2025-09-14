'use client';

import { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { likeApi } from '@/lib/likeApi';

interface LikeButtonProps {
  newsId: string;
  initialLikes?: number;
  initialLiked?: boolean;
  onLikeChange?: (liked: boolean, newCount: number) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
  showCount?: boolean;
  className?: string;
  disabled?: boolean;
  autoLoad?: boolean;
}

// Define a type for the error object
type LikeApiError = {
  response?: {
    status?: number;
    data?: {
      count?: number;
    };
  };
  message?: string;
};

export default function LikeButton({
  newsId,
  initialLikes = 0,
  initialLiked = false,
  onLikeChange,
  size = 'md',
  variant = 'ghost',
  showCount = true,
  className,
  disabled = false,
  autoLoad = true,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikes || 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Debounce: prevent rapid like/unlike actions (1s)
  const lastLikeTimeRef = useRef<number>(0);

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
          const err = error as LikeApiError;
          // If not authorized, treat as not liked but show the actual count
          if (err?.response?.status === 401 || err?.response?.status === 403) {
            setIsLiked(false);
            // Use the count from the response if available, otherwise keep current count
            const responseCount = err?.response?.data?.count;
            if (responseCount !== undefined) {
              setLikeCount(responseCount);
            }
            setHasError(false);
          } else {
            setHasError(true);
            setIsLiked(initialLiked);
            setLikeCount(initialLikes || 0);
          }
        }
      };
      loadLikeStatus();
    }
  }, [newsId, autoLoad, initialLiked, initialLikes]);

  // Optionally, disable like action if not authenticated
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('userInfo');

  const handleLike = async () => {
    if (disabled || isLoading) return;

    // Debounce: prevent rapid like/unlike actions (1s)
    const now = Date.now();
    if (now - lastLikeTimeRef.current < 1000) {
      // Optionally, show a message or just ignore
      return;
    }
    lastLikeTimeRef.current = now;

    if (!isAuthenticated) {
      // Redirect directly to login without showing modal
      window.location.href = '/en/login';
      return;
    }

    // If there was an error, try to refresh the status first
    if (hasError) {
      try {
        const status = await likeApi.getLikeStatus(newsId);
        setIsLiked(status.hasLiked);
        setLikeCount(status.count || 0);
        setHasError(false);
      } catch (error) {
        // Remove unused eslint-disable directive// Continue with the like action anyway
      }
    }

    setIsLoading(true);
    setIsAnimating(true);

    // Optimistic update
    const newLiked = !isLiked;
    const newCount = newLiked ? (likeCount || 0) + 1 : Math.max(0, (likeCount || 0) - 1);

    setIsLiked(newLiked);
    setLikeCount(newCount);

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
      // Remove unused eslint-disable directivesetHasError(true);

      // If it's an API availability error, we can keep the optimistic update
      if (
        error instanceof Error &&
        error.message === 'API is not available'
      ) {
        // Remove unused eslint-disable directive// Don't revert for API availability issues
        setIsLiked(newLiked);
        setLikeCount(newCount);
        setHasError(false);
      }
    } finally {
      setIsLoading(false);
      // Reset animation after a short delay
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

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
        onClick={handleLike}
        disabled={disabled || isLoading}
        className={cn(
          'rounded-full transition-all duration-200 hover:scale-105',
          sizeClasses[size],
          isLiked
            ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm'
            : 'text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
          isAnimating && 'scale-110',
          (disabled || isLoading || hasError) && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Heart
          className={cn(
            iconSizes[size],
            'transition-all duration-200',
            isLiked && 'fill-current',
            isAnimating && 'animate-pulse'
          )}
        />
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
    </div>
  );
}

// Export a simpler version for just the button without count
export function SimpleLikeButton({
  newsId,
  initialLiked = false,
  onLikeChange,
  size = 'md',
  variant = 'ghost',
  className,
  disabled = false,
}: Omit<LikeButtonProps, 'initialLikes' | 'showCount'>) {
  return (
    <LikeButton
      newsId={newsId}
      initialLiked={initialLiked}
      onLikeChange={onLikeChange}
      size={size}
      variant={variant}
      showCount={false}
      className={className}
      disabled={disabled}
    />
  );
}