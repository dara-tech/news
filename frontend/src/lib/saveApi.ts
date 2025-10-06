import api from './api';

export interface SaveResponse {
  success: boolean;
  message: string;
  saved: boolean;
  count?: number;
}

export interface SaveStatusResponse {
  success: boolean;
  saved: boolean;
  count: number;
}

class SaveApi {
  /**
   * Toggle save status for an article
   */
  async toggleSave(articleId: string): Promise<SaveResponse> {
    try {
      const response = await api.post(`/saves/${articleId}/toggle`);
      return response.data;
    } catch (error: any) {
      console.error('Error toggling save:', error);
      throw error;
    }
  }

  /**
   * Get save status for an article
   */
  async getSaveStatus(articleId: string): Promise<SaveStatusResponse> {
    try {
      const response = await api.get(`/saves/${articleId}/status`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting save status:', error);
      throw error;
    }
  }

  /**
   * Get all saved articles for the current user
   */
  async getSavedArticles(page: number = 1, limit: number = 20) {
    try {
      const response = await api.get(`/saves/articles?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting saved articles:', error);
      throw error;
    }
  }

  /**
   * Remove an article from saved list
   */
  async removeSave(articleId: string): Promise<SaveResponse> {
    try {
      const response = await api.delete(`/saves/${articleId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error removing save:', error);
      throw error;
    }
  }
}

export const saveApi = new SaveApi();
