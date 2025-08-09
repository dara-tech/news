'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Loader2, UserCheck, UserPlus } from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface FollowButtonProps {
  userId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showIcon?: boolean;
  children?: React.ReactNode;
  showToast?: boolean;
  showFollowerCount?: boolean;
  animated?: boolean;
}

export default function FollowButton({
  userId,
  className = '',
  size = 'sm',
  variant = 'default',
  showIcon = true,
  children,
  showToast = true,
  showFollowerCount = false,
  animated = true
}: FollowButtonProps) {
  const { user } = useAuth();
  const { isFollowing, isLoading, toggleFollowStatus, checkStatus } = useFollow({
    userId,
    initialFollowing: false
  });
  const [isHovered, setIsHovered] = useState(false);
  const [followerCount, setFollowerCount] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      checkStatus();
    }
  }, [user, userId, checkStatus]);

  useEffect(() => {
    if (showFollowerCount) {
      // Fetch follower count
      const fetchFollowerCount = async () => {
        try {
          const response = await fetch(`/api/follows/${userId}/followers/count`);
          const data = await response.json();
          setFollowerCount(data.count);
        } catch (error) {
          console.error('Error fetching follower count:', error);
        }
      };
      fetchFollowerCount();
    }
  }, [userId, showFollowerCount, isFollowing]);

  // Don't show button if user is not logged in or trying to follow themselves
  if (!user || user._id === userId) {
    return null;
  }

  const handleClick = async () => {
    const wasFollowing = isFollowing;
    
    try {
      const response = await toggleFollowStatus();
      
      if (showToast && response) {
        if (response.following) {
          toast.success('Successfully followed user!', {
            icon: <UserCheck className="w-4 h-4" />,
            duration: 2000
          });
        } else {
          toast.info('Unfollowed user', {
            icon: <UserPlus className="w-4 h-4" />,
            duration: 2000
          });
        }
      }
    } catch (error) {
      if (showToast) {
        toast.error('Failed to update follow status. Please try again.');
      }
    }
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
      const icon = showIcon && (
        isHovered ? 
          <Minus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 transition-transform duration-200" /> :
          <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 transition-transform duration-200" />
      );
      
      return (
        <>
          {icon}
          {children || (isHovered ? 'Unfollow' : 'Following')}
          {showFollowerCount && followerCount !== null && (
            <span className="ml-2 text-xs opacity-75">
              ({followerCount})
            </span>
          )}
        </>
      );
    }

    return (
      <>
        {showIcon && <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 transition-transform duration-200 group-hover:scale-110" />}
        {children || 'Follow'}
        {showFollowerCount && followerCount !== null && (
          <span className="ml-2 text-xs opacity-75">
            ({followerCount})
          </span>
        )}
      </>
    );
  };

  const getButtonVariant = () => {
    if (isLoading) return variant;
    if (isFollowing) {
      return isHovered ? 'destructive' : 'outline';
    }
    return variant;
  };

  const getButtonClassName = () => {
    const baseClasses = `
      relative overflow-hidden transition-all duration-300 group text-sm sm:text-base
      ${animated ? 'transform hover:scale-105 active:scale-95' : ''}
    `;
    
    if (isFollowing) {
      const hoverClasses = isHovered ? 
        'border-red-500 text-red-600 bg-red-50 dark:bg-red-950 dark:border-red-400 dark:text-red-300' :
        'border-green-300 text-green-700 bg-green-50 dark:border-green-600 dark:text-green-400 dark:bg-green-950';
      
      return `${baseClasses} ${hoverClasses} ${className}`;
    }
    
    return `
      ${baseClasses} 
      bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700
      dark:bg-blue-700 dark:hover:bg-blue-600 dark:border-blue-700 dark:hover:border-blue-600
      shadow-lg hover:shadow-xl
      ${className}
    `;
  };

  return (
    <Button
      onClick={handleClick}
      variant={getButtonVariant()}
      size={size}
      disabled={isLoading}
      className={getButtonClassName()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {animated && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      )}
      {getButtonContent()}
    </Button>
  );
} 