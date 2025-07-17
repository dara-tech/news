import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/data';
import { Article } from '@/types';

const URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';

// Default last modified date (current time)
const lastModified = new Date().toISOString();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Always include static routes
  const staticRoutes = ['', '/login', '/profile'].map((route) => ({
    url: `${URL}${route}`,
    lastModified,
  }));

  try {
    // Try to fetch dynamic routes
    const articles = await getAllArticles();
    
    // Only include news routes if we successfully fetched articles
    if (Array.isArray(articles) && articles.length > 0) {
      const newsRoutes = articles.map((article: Article) => ({
        url: `${URL}/news/${article.slug}`,
        lastModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : lastModified,
      }));
      
      return [...staticRoutes, ...newsRoutes];
    }
    
    // If no articles or empty array, return just static routes
    return staticRoutes;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // In case of error, return at least the static routes
    return staticRoutes;
  }
}

