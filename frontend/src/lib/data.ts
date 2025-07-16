import api from '@/lib/api';
import { Article, Category } from '@/types';

export async function getAllArticles(): Promise<Article[]> {
  try {
    const response = await api.get('/news');
    return response.data.data?.news || [];
  } catch (error) {
    console.error('Failed to fetch articles:', error);
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
