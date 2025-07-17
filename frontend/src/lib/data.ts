import api from '@/lib/api';
import { Article, Category } from '@/types';

export async function getAllArticles(): Promise<Article[]> {
  // Don't attempt to fetch in production build if we don't have a base URL
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
    return [];
  }

  try {
    const response = await api.get('/news');
    return response.data.data?.news || [];
  } catch (error: unknown) {
    // Only log detailed error in development
    if (process.env.NODE_ENV === 'development') {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Create a type-safe error object
      const errorObj: Record<string, unknown> = { message: errorMessage };
      
      // Add code if it exists
      if (error && typeof error === 'object' && 'code' in error) {
        errorObj.code = (error as { code?: unknown }).code;
      }
      
      // Add config if it exists and has the expected structure
      if (
        error && 
        typeof error === 'object' && 
        'config' in error && 
        error.config && 
        typeof error.config === 'object' &&
        'url' in error.config &&
        'baseURL' in error.config
      ) {
        const config = error.config as { url?: unknown; baseURL?: unknown };
        errorObj.config = {
          url: config.url,
          baseURL: config.baseURL
        };
      }
      
      console.error('Failed to fetch articles:', errorObj);
    }
    return [];
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const response = await api.get('/categories');
    return response.data.categories || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}
