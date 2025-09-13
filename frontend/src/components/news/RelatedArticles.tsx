'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Eye, User, Calendar } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Article, Locale } from '@/types';

interface RelatedArticlesProps {
  currentArticle: Article;
  locale: Locale;
  limit?: number;
}

// Helper function to safely get localized string
const getLocalizedString = (str: string | { [key: string]: string } | undefined, locale: Locale): string => {
  if (!str) return '';
  if (typeof str === 'string') return str;
  return str[locale] || str.en || '';
};

export default function RelatedArticles({ currentArticle, locale, limit = 6 }: RelatedArticlesProps) {
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get similar articles using the recommendation API
  const { recommendations, loading: recLoading, error: recError } = useRecommendations({
    type: 'similar',
    articleId: currentArticle._id,
    autoFetch: true,
    initialFilters: {
      limit,
      language: locale === 'kh' ? 'km' : 'en',
      excludeRead: false,
      includeBreaking: true
    }
  });

  useEffect(() => {
    if (recommendations && recommendations.length > 0) {
      // Convert RecommendationItem to Article format
      const articles = recommendations.map(rec => ({
        id: rec._id,
        _id: rec._id,
        slug: { en: rec.slug, kh: rec.slug },
        title: rec.title,
        content: { en: '', kh: '' }, // RecommendationItem doesn't have content
        description: rec.description,
        category: {
          _id: rec.category._id,
          name: { en: rec.category.name, kh: rec.category.name },
          slug: rec.slug
        },
        thumbnail: rec.thumbnail,
        createdAt: rec.publishedAt,
        publishedAt: rec.publishedAt,
        updatedAt: rec.publishedAt,
        views: rec.views,
        author: {
          _id: rec.author._id,
          username: rec.author.name,
          email: '',
          role: 'user',
          profileImage: rec.author.profileImage
        },
        tags: rec.tags || [],
        isBreaking: false,
        isFeatured: false,
        keywords: rec.tags?.join(', ') || ''
      }));
      setRelatedArticles(articles);
      setLoading(false);
    } else if (recError) {
      setError(recError);
      setLoading(false);
    } else if (!recLoading) {
      setLoading(false);
    }
  }, [recommendations, recError, recLoading]);

  if (loading) {
    return (
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-3"></span>
          {locale === 'kh' ? 'អត្ថបទពាក់ព័ន្ធ' : 'Related Articles'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || relatedArticles.length === 0) {
    return (
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-3"></span>
          {locale === 'kh' ? 'អត្ថបទពាក់ព័ន្ធ' : 'Related Articles'}
        </h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {locale === 'kh' ? 'មិនមានអត្ថបទពាក់ព័ន្ធទេ' : 'No related articles found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-3"></span>
        {locale === 'kh' ? 'អត្ថបទពាក់ព័ន្ធ' : 'Related Articles'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedArticles.map((article) => {
          const title = getLocalizedString(article.title, locale);
          const description = getLocalizedString(article.description, locale);
          const publishDate = new Date(article.publishedAt || article.createdAt);
          const timeAgo = formatDistanceToNow(publishDate, { addSuffix: true });
          const authorName = article.author?.name || article.author?.username || 
                           (article.author?.email ? article.author.email.split('@')[0] : 'Anonymous');

          return (
            <Link
              key={article._id}
              href={`/${locale}/news/${article.slug}`}
              className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                {article.thumbnail ? (
                  <Image
                    src={article.thumbnail}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {title}
                      </h4>
                    </div>
                  </div>
                )}
                
                {/* Article badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {article.isBreaking && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      🔥 Breaking
                    </span>
                  )}
                  {article.isFeatured && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      ⭐ Featured
                    </span>
                  )}
                </div>

                {/* Category badge */}
                {article.category && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 backdrop-blur-sm">
                      {getLocalizedString(article.category.name, locale)}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {title}
                </h4>
                
                {description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span className="truncate max-w-20">{authorName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{format(publishDate, 'MMM d')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {article.views && (
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{article.views.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
