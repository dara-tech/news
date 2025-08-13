import { MetadataRoute } from 'next';

// Use a static URL or fallback to a default
const URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.razewire.online";

// Default last modified date (current time)
const lastModified = new Date().toISOString();

// Static routes that should always be included
const staticRoutes = [
  '',                    // Home
  '/news',              // All News
  '/categories',        // Categories
  '/newsletter',        // Newsletter
  '/contact',           // Contact
  '/about',             // About
  '/privacy',           // Privacy Policy
  '/terms',             // Terms of Service
  '/faq',               // FAQ
  '/sitemap-page',      // Sitemap
  '/archive',           // Archive
  '/login',             // Login
  '/register',          // Register
  '/profile',           // Profile
].map((route) => ({
  url: `${URL}${route}`,
  lastModified,
  changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
  priority: route === '' ? 1 : route === '/news' ? 0.9 : 0.8, // Higher priority for homepage and news
}));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // In production, we'll include static routes and try to fetch dynamic content
  try {
    // Dynamically import to prevent loading issues
    const { default: api } = await import('@/lib/api');
    
    // Set a timeout for the API request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      // Fetch categories
      const categoriesResponse = await api.get('/categories', { 
        signal: controller.signal,
        params: { limit: 50 }
      });
      
      // Fetch articles
      const articlesResponse = await api.get('/news', { 
        signal: controller.signal,
        params: { limit: 100 } // Limit the number of articles
      });
      
      clearTimeout(timeoutId);
      
      const categories = categoriesResponse.data?.data?.categories || [];
      const articles = articlesResponse.data?.data?.news || [];
      
      // Create category routes
      const categoryRoutes = categories.map((category: {
        slug: string;
        updatedAt?: string;
      }) => ({
        url: `${URL}/category/${category.slug}`,
        lastModified: category.updatedAt ? new Date(category.updatedAt).toISOString() : lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
      
      // Create news article routes
      const newsRoutes = articles.map((article: {
        slug: string;
        updatedAt?: string;
      }) => ({
        url: `${URL}/news/${article.slug}`,
        lastModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : lastModified,
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }));
      
      return [...staticRoutes, ...categoryRoutes, ...newsRoutes];
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.log('Sitemap: Using static routes only due to API timeout or error');
      return staticRoutes;
    }
    
  } catch (error) {
    console.log('Sitemap: Using static routes only due to import error');
    return staticRoutes;
  }
}
