import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toggleFollow, checkFollowStatus, FollowResponse } from '@/lib/followApi';
import { toast } from 'sonner';

interface UseFollowProps {
  userId: string;
  initialFollowing?: boolean;
}

interface UseFollowReturn {
  isFollowing: boolean;
  isLoading: boolean;
  toggleFollowStatus: () => Promise<void>;
  checkStatus: () => Promise<void>;
}

export const useFollow = ({ userId, initialFollowing = false }: UseFollowProps): UseFollowReturn => {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const checkStatus = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await checkFollowStatus(userId);
      setIsFollowing(response.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, user]);

  const toggleFollowStatus = useCallback(async () => {
    if (!user) {
      toast.error('Please log in to follow users');
      return;
    }

    if (user._id === userId) {
      toast.error('You cannot follow yourself');
      return;
    }

    try {
      setIsLoading(true);
      const response: FollowResponse = await toggleFollow(userId);
      
      setIsFollowing(response.following || false);
      
      if (response.following) {
        toast.success('User followed successfully');
      } else {
        toast.success('User unfollowed successfully');
      }
    } catch (error: any) {
      console.error('Error toggling follow status:', error);
      toast.error(error.message || 'Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  }, [userId, user]);

  return {
    isFollowing,
    isLoading,
    toggleFollowStatus,
    checkStatus
  };
}; 