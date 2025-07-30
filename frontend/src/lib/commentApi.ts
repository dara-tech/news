import api from './api';

export interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    username: string;
    profileImage?: string;
    avatar?: string;
  };
  news: string;
  parentComment?: string;
  isEdited: boolean;
  editedAt?: string;
  likes: string[];
  replies?: Comment[];
  repliesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentResponse {
  success: boolean;
  data: Comment;
  message?: string;
}

export interface CommentsResponse {
  success: boolean;
  data: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CommentStats {
  totalComments: number;
  totalReplies: number;
  totalLikes: number;
}

export interface CommentStatsResponse {
  success: boolean;
  data: CommentStats;
}

class CommentApi {
  private baseUrl = '/comments';

  // Check if API is available
  private checkApiAvailability(): boolean {
    if (!api) {
      console.error('API is not available');
      return false;
    }
    return true;
  }

  // Get comments for a news article
  async getComments(newsId: string, page: number = 1, limit: number = 10, sort: string = 'newest'): Promise<CommentsResponse> {
    if (!this.checkApiAvailability()) {
      throw new Error('API is not available');
    }

    try {
      const response = await api.get(`${this.baseUrl}/${newsId}`, {
        params: { page, limit, sort }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  }

  // Create a new comment
  async createComment(newsId: string, content: string, parentCommentId?: string): Promise<CommentResponse> {
    if (!this.checkApiAvailability()) {
      throw new Error('API is not available');
    }

    try {
      const response = await api.post(`${this.baseUrl}/${newsId}`, {
        content,
        parentCommentId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  // Update a comment
  async updateComment(commentId: string, content: string): Promise<CommentResponse> {
    if (!this.checkApiAvailability()) {
      throw new Error('API is not available');
    }

    try {
      const response = await api.put(`${this.baseUrl}/${commentId}`, {
        content
      });
      return response.data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  // Delete a comment
  async deleteComment(commentId: string): Promise<{ success: boolean; message: string }> {
    if (!this.checkApiAvailability()) {
      throw new Error('API is not available');
    }

    try {
      const response = await api.delete(`${this.baseUrl}/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Like/unlike a comment
  async toggleCommentLike(commentId: string): Promise<CommentResponse> {
    if (!this.checkApiAvailability()) {
      throw new Error('API is not available');
    }

    try {
      const response = await api.post(`${this.baseUrl}/${commentId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  }

  // Get comment statistics
  async getCommentStats(newsId: string): Promise<CommentStatsResponse> {
    if (!this.checkApiAvailability()) {
      throw new Error('API is not available');
    }

    try {
      const response = await api.get(`${this.baseUrl}/${newsId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error getting comment stats:', error);
      throw error;
    }
  }
}

export const commentApi = new CommentApi(); 