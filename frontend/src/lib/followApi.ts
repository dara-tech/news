import api from './api';

export interface FollowResponse {
  success: boolean;
  data?: {
    following: boolean;
    userId: string;
    followerId: string;
  };
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
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Failed to follow user');
  }
};

// Unfollow a user
export const unfollowUser = async (userId: string): Promise<FollowResponse> => {
  try {
    const response = await api.delete(`/follows/${userId}`);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Failed to unfollow user');
  }
};

// Toggle follow status
export const toggleFollow = async (userId: string): Promise<FollowResponse> => {
  try {
    const response = await api.post(`/follows/${userId}/toggle`);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Failed to toggle follow status');
  }
};

// Check if current user is following another user
export const checkFollowStatus = async (userId: string): Promise<FollowStatusResponse> => {
  try {
    const response = await api.get(`/follows/${userId}/check`);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Failed to check follow status');
  }
};

// Get followers count for a user
export const getFollowersCount = async (userId: string): Promise<FollowCountResponse> => {
  try {
    const response = await api.get(`/follows/${userId}/followers/count`);
    return response.data;
  } catch (error: unknown) {const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Failed to get followers count');
  }
};

// Get following count for a user
export const getFollowingCount = async (userId: string): Promise<FollowCountResponse> => {
  try {
    const response = await api.get(`/follows/${userId}/following/count`);
    return response.data;
  } catch (error: unknown) {const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Failed to get following count');
  }
};

// Get followers list for a user
export const getFollowers = async (userId: string, page = 1, limit = 20): Promise<FollowersListResponse> => {
  try {
    const response = await api.get(`/follows/${userId}/followers`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error: unknown) {const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Failed to get followers list');
  }
};

// Get following list for a user
export const getFollowing = async (userId: string, page = 1, limit = 20): Promise<FollowersListResponse> => {
  try {
    const response = await api.get(`/follows/${userId}/following`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error: unknown) {const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Failed to get following list');
  }
}; 