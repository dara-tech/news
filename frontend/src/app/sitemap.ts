import { MetadataRoute } from 'next';
import api from '@/lib/api';

const URL = 'https://your-domain.com';

interface Article {
  slug: string;
  updatedAt: string;
}

interface Category {
  name: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/login', '/profile'].map((route) => ({
    url: `${URL}${route}`,
    lastModified: new Date().toISOString(),
  }));

  try {
    const { data: articlesData } = await api.get('/news');
    const articles: Article[] = articlesData.data?.news || [];

    const { data: categoriesData } = await api.get('/categories');
    const categories: Category[] = categoriesData.categories || [];

    const newsRoutes = articles.map((article) => ({
      url: `${URL}/news/${article.slug}`,
      lastModified: new Date(article.updatedAt).toISOString(),
    }));

    const categoryRoutes = categories.map((category) => ({
      url: `${URL}/category/${encodeURIComponent(category.name)}`,
      lastModified: new Date().toISOString(),
    }));

    return [...staticRoutes, ...newsRoutes, ...categoryRoutes];
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    return staticRoutes;
  }
}
