import api from './api';

export interface LikeResponse {
  success: boolean;
  count?: number;
  hasLiked?: boolean;
  liked?: boolean;
  data?: unknown;
  message?: string;
}

export interface LikeStatus {
  count: number;
  hasLiked: boolean;
}

export interface PopularArticle {
  _id: string;
  title: {
    en: string;
    kh: string;
  };
  slug: string;
  thumbnail?: string;
  likeCount: number;
}

export interface UserLike {
  _id: string;
  news: {
    _id: string;
    title: {
      en: string;
      kh: string;
    };
    slug: string;
    thumbnail?: string;
    createdAt: string;
  };
  user: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  createdAt: string;
}

export interface UserLikesResponse {
  success: boolean;
  data: UserLike[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PopularArticlesResponse {
  success: boolean;
  data: PopularArticle[];
}

// Define a type for errors thrown by axios or similar libraries
type ApiError = {
  response?: {
    status?: number;
    data?: {
      count?: number;
    };
  };
  [key: string]: unknown;
};

class LikeApi {
  private baseUrl = '/likes';

  // Check if API is available
  private checkApiAvailability(): boolean {
    if (!api) {
      console.error('API is not available');
      return false;
    }
    return true;
  }

  // Get like count for a news article (public)
  async getLikeCount(newsId: string): Promise<number> {
    if (!this.checkApiAvailability()) {
      return 0;
    }

    try {
      const response = await api.get(`${this.baseUrl}/${newsId}/count`);
      return response.data.count;
    } catch (error) {
      console.error('Error getting like count:', error);
      return 0;
    }
  }

  // Check if current user has liked a news article
  async checkUserLike(newsId: string): Promise<boolean> {
    if (!this.checkApiAvailability()) {
      return false;
    }

    try {
      const response = await api.get(`${this.baseUrl}/${newsId}/check`);
      return response.data.hasLiked;
    } catch (error) {
      console.error('Error checking user like:', error);
      return false;
    }
  }

  // Get like status for a news article
  async getLikeStatus(newsId: string): Promise<LikeStatus> {
    if (!this.checkApiAvailability()) {
      return {
        count: 0,
        hasLiked: false
      };
    }

    try {
      // First try the private endpoint (for authenticated users)
      const response = await api.get(`${this.baseUrl}/${newsId}/status`);
      return {
        count: response.data.count || 0,
        hasLiked: response.data.hasLiked || false
      };
    } catch (error) {
      const err = error as ApiError;
      // If not authorized, try the public count endpoint
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        try {
          const countResponse = await api.get(`${this.baseUrl}/${newsId}/count`);
          return {
            count: countResponse.data.count || 0,
            hasLiked: false // Always false for unauthenticated users
          };
        } catch (countError) {
          console.error('Error getting like count:', countError);
          return {
            count: 0,
            hasLiked: false
          };
        }
      }
      
      // For other errors, return default values
      console.error('Error getting like status:', error);
      return {
        count: 0,
        hasLiked: false
      };
    }
  }

  // Toggle like status (like if not liked, unlike if liked)
  async toggleLike(newsId: string): Promise<LikeResponse> {
    if (!this.checkApiAvailability()) {
      throw new Error('API is not available');
    }

    try {
      const response = await api.post(`${this.baseUrl}/${newsId}/toggle`);
      return response.data;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  // Like a news article
  async likeNews(newsId: string): Promise<LikeResponse> {
    if (!this.checkApiAvailability()) {
      throw new Error('API is not available');
    }

    try {
      const response = await api.post(`${this.baseUrl}/${newsId}`);
      return response.data;
    } catch (error) {
      console.error('Error liking news:', error);
      throw error;
    }
  }

  // Unlike a news article
  async unlikeNews(newsId: string): Promise<LikeResponse> {
    if (!this.checkApiAvailability()) {
      throw new Error('API is not available');
    }

    try {
      const response = await api.delete(`${this.baseUrl}/${newsId}`);
      return response.data;
    } catch (error) {
      console.error('Error unliking news:', error);
      throw error;
    }
  }

  // Get user's liked articles
  async getUserLikes(page: number = 1, limit: number = 10): Promise<UserLikesResponse> {
    if (!this.checkApiAvailability()) {
      throw new Error('API is not available');
    }

    try {
      const response = await api.get(`${this.baseUrl}/user?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user likes:', error);
      throw error;
    }
  }

  // Get most liked articles (public)
  async getPopularArticles(limit: number = 10): Promise<PopularArticlesResponse> {
    if (!this.checkApiAvailability()) {
      throw new Error('API is not available');
    }

    try {
      const response = await api.get(`${this.baseUrl}/popular?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error getting popular articles:', error);
      throw error;
    }
  }

  // Batch get like status for multiple articles
  async getBatchLikeStatus(newsIds: string[]): Promise<Record<string, LikeStatus>> {
    if (!this.checkApiAvailability()) {
      return {};
    }

    try {
      const promises = newsIds.map(async (newsId) => {
        try {
          const status = await this.getLikeStatus(newsId);
          return { [newsId]: status };
        } catch (error) {
          console.error(`Error getting like status for ${newsId}:`, error);
          return { [newsId]: { count: 0, hasLiked: false } };
        }
      });

      const results = await Promise.all(promises);
      return results.reduce((acc, result) => ({ ...acc, ...result }), {});
    } catch (error) {
      console.error('Error getting batch like status:', error);
      return {};
    }
  }
}

export const likeApi = new LikeApi();