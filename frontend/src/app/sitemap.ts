import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/data';
import { Article } from '@/types';

const URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/login', '/profile'].map((route) => ({
    url: `${URL}${route}`,
    lastModified: new Date().toISOString(),
  }));

  // Fetch dynamic routes
  const articles = await getAllArticles();

  const newsRoutes = articles.map((article: Article) => ({
    url: `${URL}/news/${article.slug}`,
    lastModified: new Date(article.updatedAt).toISOString(),
  }));

  return [...staticRoutes, ...newsRoutes];
}

