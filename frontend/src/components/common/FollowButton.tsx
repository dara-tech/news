'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Loader2 } from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/context/AuthContext';

interface FollowButtonProps {
  userId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showIcon?: boolean;
  children?: React.ReactNode;
}

export default function FollowButton({
  userId,
  className = '',
  size = 'sm',
  variant = 'default',
  showIcon = true,
  children
}: FollowButtonProps) {
  const { user } = useAuth();
  const { isFollowing, isLoading, toggleFollowStatus, checkStatus } = useFollow({
    userId,
    initialFollowing: false
  });

  useEffect(() => {
    if (user) {
      checkStatus();
    }
  }, [user, userId, checkStatus]);

  // Don't show button if user is not logged in or trying to follow themselves
  if (!user || user._id === userId) {
    return null;
  }

  const handleClick = async () => {
    await toggleFollowStatus();
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" />
          {children || 'Loading...'}
        </>
      );
    }

    if (isFollowing) {
      return (
        <>
          {showIcon && <Minus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />}
          {children || 'Unfollow'}
        </>
      );
    }

    return (
      <>
        {showIcon && <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />}
        {children || 'Follow'}
      </>
    );
  };

  const getButtonVariant = () => {
    if (isLoading) return variant;
    return isFollowing ? 'outline' : variant;
  };

  const getButtonClassName = () => {
    const baseClasses = 'transition-all duration-300 group text-sm sm:text-base';
    
    if (isFollowing) {
      return `${baseClasses} border-red-300 text-red-600 hover:bg-gray-100 dark:border-red-600 dark:text-red-400 dark:hover:bg-gray-900 ${className}`;
    }
    
    return `${baseClasses} ${className}`;
  };

  return (
    <Button
      onClick={handleClick}
      variant={getButtonVariant()}
      size={size}
      disabled={isLoading}
      className={getButtonClassName()}
    >
      {getButtonContent()}
    </Button>
  );
} 