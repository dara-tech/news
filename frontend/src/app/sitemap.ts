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
      
      // Add comprehensive search and filter routes for better content discovery
      const searchRoutes = [
        // Basic search
        '/search',
        // Popular search queries
        '/search?q=technology',
        '/search?q=business',
        '/search?q=sports',
        '/search?q=breaking-news',
        '/search?q=politics',
        '/search?q=entertainment',
        '/search?q=health',
        '/search?q=cambodia',
        '/search?q=phnom-penh',
        // Search with filters
        '/search?category=technology',
        '/search?category=business',
        '/search?category=sports',
        '/search?dateRange=today',
        '/search?dateRange=week',
        '/search?dateRange=month',
        '/search?sortBy=date',
        '/search?sortBy=relevance',
        '/search?sortBy=views',
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
      
      // Add demo and test pages (lower priority)
      const demoRoutes = [
        '/share-demo',
        '/likes-demo',
        '/debug-follow',
        '/test-follow',
        '/test-debug',
      ].map((route) => ({
        url: `${URL}${route}`,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.3, // Very low priority for demo pages
      }));
      
      // Add author pages (if you have author profiles)
      const authorRoutes = articles
        .filter((article: { author?: { slug?: string } }) => article.author?.slug)
        .map((article: { author: { slug: string } }) => ({
          url: `${URL}/author/${article.author.slug}`,
          lastModified,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }));
      
      // Add pagination routes for better content discovery
      const paginationRoutes = [
        // News pagination
        '/news?page=1',
        '/news?page=2',
        '/news?page=3',
        // Archive pagination
        '/archive?page=1',
        '/archive?page=2',
        // Categories pagination
        '/categories?page=1',
      ].map((route) => ({
        url: `${URL}${route}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      }));
      
      // Add category-specific news pages
      const categoryNewsRoutes = categories.map((category: { slug: string }) => [
        `${URL}/category/${category.slug}?page=1`,
        `${URL}/category/${category.slug}?page=2`,
      ]).flat().map((url: string) => ({
        url,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
      
      // Combine all routes with proper ordering
      const allRoutes = [
        ...staticRoutes,
        ...languageRoutes,
        ...categoryRoutes,
        ...newsRoutes,
        ...searchRoutes,
        ...userRoutes,
        ...authorRoutes,
        ...paginationRoutes,
        ...categoryNewsRoutes,
        ...demoRoutes, // Demo pages last since they have lowest priority
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
