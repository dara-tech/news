import { MetadataRoute } from 'next';

// Use a static URL or fallback to a default
const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

// Default last modified date (current time)
const lastModified = new Date().toISOString();

// Static routes that should always be included
const staticRoutes = [
  '',           // Home
  '/login',
  '/profile',
  '/admin/dashboard',
  '/admin/news',
  '/admin/users',
  '/unauthorized'
].map((route) => ({
  url: `${URL}${route}`,
  lastModified,
  changeFrequency: 'weekly' as const,
  priority: route === '' ? 1 : 0.8, // Higher priority for homepage
}));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // In production, we'll only include static routes to prevent build timeouts
  if (process.env.NODE_ENV === 'production') {
    return staticRoutes;
  }

  // In development, we can try to include dynamic routes
  try {
    // Dynamically import to prevent loading in production
    const { default: api } = await import('@/lib/api');
    
    // Set a timeout for the API request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      // Try to fetch articles with timeout
      const response = await api.get('/news', { 
        signal: controller.signal,
        params: { limit: 100 } // Limit the number of articles
      });
      clearTimeout(timeoutId);
      
      const articles = response.data?.data?.news || [];
      
      if (Array.isArray(articles) && articles.length > 0) {
        const newsRoutes = articles.map((article: {
          slug: string;
          updatedAt?: string;
        }) => ({
          url: `${URL}/news/${article.slug}`,
          lastModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : lastModified,
          changeFrequency: 'daily' as const,
          priority: 0.7,
        }));
        
        return [...staticRoutes, ...newsRoutes];
      }
    } catch (error) {
      console.error('Error fetching articles for sitemap:', error);
      clearTimeout(timeoutId);
    }
    
    return staticRoutes;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticRoutes;
  }
}

