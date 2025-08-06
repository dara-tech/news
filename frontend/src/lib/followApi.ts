import api from './api';

export interface FollowResponse {
  success: boolean;
  data?: any;
  message: string;
  following?: boolean;
}

export interface FollowStatusResponse {
  success: boolean;
  isFollowing: boolean;
  userId: string;
}

export interface FollowCountResponse {
  success: boolean;
  count: number;
  userId: string;
}

export interface FollowersListResponse {
  success: boolean;
  data: Array<{
    _id: string;
    follower: {
      _id: string;
      username: string;
      profileImage?: string;
    };
    following: {
      _id: string;
      username: string;
      profileImage?: string;
    };
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Follow a user
export const followUser = async (userId: string): Promise<FollowResponse> => {
  try {
    const response = await api.post(`/follows/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to follow user');
  }
};

// Unfollow a user
export const unfollowUser = async (userId: string): Promise<FollowResponse> => {
  try {
    const response = await api.delete(`/follows/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to unfollow user');
  }
};

// Toggle follow status
export const toggleFollow = async (userId: string): Promise<FollowResponse> => {
  try {
    const response = await api.post(`/follows/${userId}/toggle`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to toggle follow status');
  }
};

// Check if current user is following another user
export const checkFollowStatus = async (userId: string): Promise<FollowStatusResponse> => {
  try {
    const response = await api.get(`/follows/${userId}/check`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to check follow status');
  }
};

// Get followers count for a user
export const getFollowersCount = async (userId: string): Promise<FollowCountResponse> => {
  try {
    console.log('🔍 Follow API - getFollowersCount called with userId:', userId);
    const response = await api.get(`/follows/${userId}/followers/count`);
    console.log('✅ Follow API - getFollowersCount response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Follow API - getFollowersCount error:', error);
    throw new Error(error.response?.data?.message || 'Failed to get followers count');
  }
};

// Get following count for a user
export const getFollowingCount = async (userId: string): Promise<FollowCountResponse> => {
  try {
    console.log('🔍 Follow API - getFollowingCount called with userId:', userId);
    const response = await api.get(`/follows/${userId}/following/count`);
    console.log('✅ Follow API - getFollowingCount response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Follow API - getFollowingCount error:', error);
    throw new Error(error.response?.data?.message || 'Failed to get following count');
  }
};

// Get followers list for a user
export const getFollowers = async (userId: string, page = 1, limit = 20): Promise<FollowersListResponse> => {
  try {
    console.log('🔍 Follow API - getFollowers called with userId:', userId, 'page:', page, 'limit:', limit);
    const response = await api.get(`/follows/${userId}/followers`, {
      params: { page, limit }
    });
    console.log('✅ Follow API - getFollowers response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Follow API - getFollowers error:', error);
    throw new Error(error.response?.data?.message || 'Failed to get followers list');
  }
};

// Get following list for a user
export const getFollowing = async (userId: string, page = 1, limit = 20): Promise<FollowersListResponse> => {
  try {
    console.log('🔍 Follow API - getFollowing called with userId:', userId, 'page:', page, 'limit:', limit);
    const response = await api.get(`/follows/${userId}/following`, {
      params: { page, limit }
    });
    console.log('✅ Follow API - getFollowing response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Follow API - getFollowing error:', error);
    throw new Error(error.response?.data?.message || 'Failed to get following list');
  }
}; 