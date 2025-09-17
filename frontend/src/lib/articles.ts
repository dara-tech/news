import api from '@/lib/api';

import { Article } from '@/types';

export async function getArticle(slug: string): Promise<Article | null> {
  try {
    const response = await api.get(`/news/${slug}`);
    
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}