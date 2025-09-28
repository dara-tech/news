'use client';

import api from './api';
import type { Article } from '@/types';

interface NewsResponse {
  news: Article[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface NewsParams {
  lang: 'en' | 'kh';
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'createdAt' | 'views' | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
}

class NewsService {
  private baseUrl = '/news';

  async getNews(params: NewsParams): Promise<NewsResponse> {
    try {
      console.log('Fetching news with params:', params);
      
      const response = await api.get(this.baseUrl, {
        params: {
          page: params.page || 1,
          limit: params.limit || 20, // Increased default limit
          lang: params.lang,
          category: params.category,
          search: params.search,
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || 'desc'
        }
      });

      const data = response.data;
      console.log('News API response:', data);
      
      const news = Array.isArray(data.news) ? data.news : Array.isArray(data.data) ? data.data : [];
      
      const currentPage = data.page || 1;
      const limit = data.limit || 20;
      const total = data.total || 0;
      
      // Always return hasMore: true for infinite scroll
      // The actual stopping will be handled by the frontend when no more data is available
      return {
        news,
        total,
        page: currentPage,
        limit,
        hasMore: true // Always true for infinite scroll
      };
    } catch (error) {
      console.error('Error fetching news:', error);
      throw new Error('Failed to fetch news');
    }
  }

  async getBreakingNews(lang: 'en' | 'kh'): Promise<Article[]> {
    try {
      const response = await api.get('/news/breaking', {
        params: { lang }
      });
      
      const data = response.data;
      return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching breaking news:', error);
      return [];
    }
  }

  async getFeaturedNews(lang: 'en' | 'kh'): Promise<Article[]> {
    try {
      const response = await api.get('/news/featured', {
        params: { lang }
      });
      
      const data = response.data;
      return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching featured news:', error);
      return [];
    }
  }

  async getCategories(): Promise<any[]> {
    try {
      const response = await api.get('/categories');
      
      const data = response.data;
      return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async searchNews(query: string, lang: 'en' | 'kh', page: number = 1): Promise<NewsResponse> {
    try {
      const response = await api.get('/news/search', {
        params: {
          q: query,
          lang,
          page,
          limit: 20 // Increased limit for search
        }
      });

      const data = response.data;
      const currentPage = data.page || 1;
      const limit = data.limit || 20;
      const total = data.total || 0;
      
      return {
        news: Array.isArray(data.news) ? data.news : Array.isArray(data.data) ? data.data : [],
        total,
        page: currentPage,
        limit,
        hasMore: true // Always true for infinite scroll
      };
    } catch (error) {
      console.error('Error searching news:', error);
      throw new Error('Failed to search news');
    }
  }

  async getNewsByCategory(categoryId: string, lang: 'en' | 'kh', page: number = 1): Promise<NewsResponse> {
    try {
      const response = await api.get(`/categories/${categoryId}/news`, {
        params: {
          lang,
          page,
          limit: 20 // Increased limit for category
        }
      });

      const data = response.data;
      const currentPage = data.page || 1;
      const limit = data.limit || 20;
      const total = data.total || 0;
      
      return {
        news: Array.isArray(data.news) ? data.news : Array.isArray(data.data) ? data.data : [],
        total,
        page: currentPage,
        limit,
        hasMore: true // Always true for infinite scroll
      };
    } catch (error) {
      console.error('Error fetching news by category:', error);
      throw new Error('Failed to fetch news by category');
    }
  }
}

export const newsService = new NewsService();
export default newsService;
