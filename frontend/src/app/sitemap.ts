import { MetadataRoute } from 'next';

// Use a static URL or fallback to a default
const URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.razewire.online";

// Default last modified date (current time)
const lastModified = new Date().toISOString();

// Enhanced static routes with better SEO optimization
const staticRoutes = [
  // High Priority Pages (Priority 1.0 - 0.9)
  { route: '', priority: 1.0, changeFreq: 'daily' as const, description: 'Homepage' },
  { route: '/news', priority: 0.9, changeFreq: 'daily' as const, description: 'All News' },
  
  // Important Content Pages (Priority 0.8)
  { route: '/categories', priority: 0.8, changeFreq: 'weekly' as const, description: 'News Categories' },
  { route: '/newsletter', priority: 0.8, changeFreq: 'weekly' as const, description: 'Newsletter Subscription' },
  { route: '/archive', priority: 0.8, changeFreq: 'weekly' as const, description: 'News Archive' },
  { route: '/search', priority: 0.8, changeFreq: 'daily' as const, description: 'Search News' },
  
  // User Engagement Pages (Priority 0.7)
  { route: '/contact', priority: 0.7, changeFreq: 'monthly' as const, description: 'Contact Us' },
  { route: '/about', priority: 0.7, changeFreq: 'monthly' as const, description: 'About Razewire' },
  { route: '/faq', priority: 0.7, changeFreq: 'monthly' as const, description: 'Frequently Asked Questions' },
  { route: '/sitemap-page', priority: 0.7, changeFreq: 'monthly' as const, description: 'Sitemap' },
  { route: '/profile', priority: 0.7, changeFreq: 'monthly' as const, description: 'User Profile' },
  { route: '/notifications', priority: 0.7, changeFreq: 'daily' as const, description: 'User Notifications' },
  
  // Legal & Auth Pages (Priority 0.6)
  { route: '/privacy', priority: 0.6, changeFreq: 'yearly' as const, description: 'Privacy Policy' },
  { route: '/terms', priority: 0.6, changeFreq: 'yearly' as const, description: 'Terms of Service' },
  { route: '/login', priority: 0.6, changeFreq: 'monthly' as const, description: 'User Login' },
  { route: '/register', priority: 0.6, changeFreq: 'monthly' as const, description: 'User Registration' },
  { route: '/unauthorized', priority: 0.6, changeFreq: 'yearly' as const, description: 'Unauthorized Access' },
  
  // Special Content Pages (Priority 0.7)
  { route: '/maintenance', priority: 0.7, changeFreq: 'yearly' as const, description: 'Maintenance Page' },
].map(({ route, priority, changeFreq, description }) => ({
  url: `${URL}${route}`,
  lastModified,
  changeFrequency: changeFreq,
  priority,
}));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Dynamically import to prevent loading issues
    const { default: api } = await import('@/lib/api');
    
    // Set a timeout for the API request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased to 15 seconds
    
    try {
      // Fetch categories with more comprehensive data
      const categoriesResponse = await api.get('/categories', { 
        signal: controller.signal,
        params: { limit: 100, sort: 'updatedAt' } // Get more categories, sorted by update time
      });
      
      // Fetch articles with better filtering
      const articlesResponse = await api.get('/news', { 
        signal: controller.signal,
        params: { 
          limit: 500, // Increased limit for better coverage
          sort: 'publishedAt',
          status: 'published' // Only published articles
        }
      });
      
      clearTimeout(timeoutId);
      
      const categories = categoriesResponse.data?.data?.categories || [];
      const articles = articlesResponse.data?.data?.news || [];
      
      // Create enhanced category routes with better SEO
      const categoryRoutes = categories.map((category: {
        slug: string;
        updatedAt?: string;
        name?: string;
        articleCount?: number;
      }) => ({
        url: `${URL}/category/${category.slug}`,
        lastModified: category.updatedAt ? new Date(category.updatedAt).toISOString() : lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.8, // High priority for category pages
      }));
      
      // Create enhanced news article routes with better SEO
      const newsRoutes = articles.map((article: {
        slug: string;
        updatedAt?: string;
        publishedAt?: string;
        title?: string;
        category?: string;
      }) => {
        // Determine priority based on recency and category
        let priority = 0.7;
        const publishDate = article.publishedAt ? new Date(article.publishedAt) : new Date();
        const daysSincePublished = (Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
        
        // Higher priority for recent articles
        if (daysSincePublished < 7) priority = 0.9;
        else if (daysSincePublished < 30) priority = 0.8;
        
        // Higher priority for breaking news or important categories
        if (article.category === 'breaking-news' || article.category === 'technology') {
          priority = Math.min(priority + 0.1, 0.9);
        }
        
        return {
          url: `${URL}/news/${article.slug}`,
          lastModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : 
                       article.publishedAt ? new Date(article.publishedAt).toISOString() : lastModified,
          changeFrequency: 'daily' as const,
          priority,
        };
      });
      
      // Add language-specific routes for better international SEO
      const languageRoutes = [
        { lang: 'en', priority: 0.8 },
        { lang: 'km', priority: 0.8 },
      ].map(({ lang, priority }) => ({
        url: `${URL}/${lang}`,
        lastModified,
        changeFrequency: 'daily' as const,
        priority,
      }));
      
      // Add language-specific news routes
      const languageNewsRoutes = [
        { lang: 'en', priority: 0.9 },
        { lang: 'km', priority: 0.9 },
      ].map(({ lang, priority }) => ({
        url: `${URL}/${lang}/news`,
        lastModified,
        changeFrequency: 'daily' as const,
        priority,
      }));
      
      // Add only basic search routes (avoid query parameters that might cause 404s)
      const searchRoutes = [
        '/search',
      ].map((route) => ({
        url: `${URL}${route}`,
        lastModified,
        changeFrequency: 'daily' as const,
        priority: 0.6,
      }));
      
      // Add user profile and activity routes
      const userRoutes = [
        '/profile',
        '/profile/activity',
        '/profile/follow-network',
        '/notifications',
      ].map((route) => ({
        url: `${URL}${route}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.5, // Lower priority for user-specific pages
      }));
      
      // Remove demo and test pages from sitemap to avoid SEO issues
      const demoRoutes: any[] = [];
      
      // Add author pages (if you have author profiles)
      const authorRoutes = articles
        .filter((article: { author?: { slug?: string } }) => article.author?.slug)
        .map((article: { author: { slug: string } }) => ({
          url: `${URL}/author/${article.author.slug}`,
          lastModified,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }));
      
      // Remove pagination routes to avoid 404s - only include if pages actually exist
      const paginationRoutes: any[] = [];
      
      // Remove category pagination to avoid 404s - only include if pages actually exist
      const categoryNewsRoutes: any[] = [];
      
      // Combine all routes with proper ordering
      const allRoutes = [
        ...staticRoutes,
        ...languageRoutes,
        ...languageNewsRoutes,
        ...categoryRoutes,
        ...newsRoutes,
        ...searchRoutes,
        ...userRoutes,
        ...authorRoutes,
        // Removed paginationRoutes, categoryNewsRoutes, and demoRoutes to avoid 404s
      ];
      
      // Sort by priority (highest first) and then by URL
      allRoutes.sort((a, b) => {
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        return a.url.localeCompare(b.url);
      });
      
      return allRoutes;
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.log('Sitemap: Using static routes only due to API timeout or error:', error instanceof Error ? error.message : 'Unknown error');
      return staticRoutes;
    }
    
  } catch (error) {
    console.log('Sitemap: Using static routes only due to import error:', error instanceof Error ? error.message : 'Unknown error');
    return staticRoutes;
  }
}
