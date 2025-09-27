import api from './api';

interface ArticleIdentifier {
  _id: string;
  slug: {
    en?: string;
    kh?: string;
  };
}

/**
 * Resolves article slug to ID for API calls
 * @param slug - The article slug (can be string or localized object)
 * @param locale - The current locale
 * @returns Promise<string> - The article ID
 */
export async function resolveArticleId(slug: string | { en?: string; kh?: string }, locale: 'en' | 'kh'): Promise<string> {
  try {
    // If slug is already a string, assume it's the correct slug
    if (typeof slug === 'string') {
      return await getArticleIdBySlug(slug);
    }

    // If slug is an object, get the appropriate localized slug
    const localizedSlug = slug[locale] || slug.en || slug.kh;
    if (!localizedSlug) {
      throw new Error('No valid slug found for the given locale');
    }

    return await getArticleIdBySlug(localizedSlug);
  } catch (error) {
    console.error('Error resolving article ID:', error);
    throw new Error('Failed to resolve article ID');
  }
}

/**
 * Gets article ID by slug from the backend
 * @param slug - The article slug
 * @returns Promise<string> - The article ID
 */
async function getArticleIdBySlug(slug: string): Promise<string> {
  try {
    const response = await api.get(`/news/${slug}`);
    
    if (response.data?.success && response.data?.data?._id) {
      return response.data.data._id;
    }
    
    throw new Error('Article not found or invalid response');
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    throw new Error('Article not found');
  }
}

/**
 * Cache for resolved article IDs to avoid repeated API calls
 */
const articleIdCache = new Map<string, string>();

/**
 * Cached version of resolveArticleId
 * @param slug - The article slug
 * @param locale - The current locale
 * @returns Promise<string> - The article ID
 */
export async function resolveArticleIdCached(slug: string | { en?: string; kh?: string }, locale: 'en' | 'kh'): Promise<string> {
  const cacheKey = typeof slug === 'string' ? slug : `${slug[locale] || slug.en || slug.kh}-${locale}`;
  
  console.log('resolveArticleIdCached: Resolving slug:', slug, 'locale:', locale, 'cacheKey:', cacheKey);
  
  if (articleIdCache.has(cacheKey)) {
    const cachedId = articleIdCache.get(cacheKey)!;
    console.log('resolveArticleIdCached: Found in cache:', cachedId);
    return cachedId;
  }

  const articleId = await resolveArticleId(slug, locale);
  console.log('resolveArticleIdCached: Resolved articleId:', articleId);
  articleIdCache.set(cacheKey, articleId);
  
  return articleId;
}
