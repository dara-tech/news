'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { saveApi } from '@/lib/saveApi';
import { newsService } from '@/lib/newsService';
import type { Article } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bookmark, 
  Calendar, 
  Eye, 
  ThumbsUp, 
  MessageCircle,
  RefreshCw,
  ArrowLeft,
  Globe,
  CheckCircle
} from 'lucide-react';
import Image from 'next/image';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

interface SavedArticlesPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default function SavedArticlesPage({ params }: SavedArticlesPageProps) {
  const resolvedParams = use(params);
  const { lang } = resolvedParams;
  const locale = lang as 'en' | 'kh';
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
  }, [isAuthenticated, locale, router]);

  // Load saved articles
  const loadSavedArticles = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const response = await saveApi.getSavedArticles(pageNum, 20);
      
      if (response.success) {
        const newArticles = response.data || [];
        
        if (append) {
          setArticles(prev => [...prev, ...newArticles]);
        } else {
          setArticles(newArticles);
        }
        
        setHasMore(response.pagination?.hasMore || false);
        setPage(pageNum);
      } else {
        setError('Failed to load saved articles');
      }
    } catch (error) {
      console.error('Error loading saved articles:', error);
      setError('Failed to load saved articles');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more articles
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadSavedArticles(page + 1, true);
    }
  };

  // Refresh articles
  const refresh = () => {
    loadSavedArticles(1, false);
  };

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      loadSavedArticles();
    }
  }, [isAuthenticated]);

  // Get localized content
  const getLocalizedTitle = (article: Article) => {
    if (typeof article.title === 'string') return article.title;
    return article.title[locale] || article.title.en || article.title.kh || '';
  };

  const getLocalizedDescription = (article: Article) => {
    if (!article.description) return '';
    if (typeof article.description === 'string') return article.description;
    return article.description[locale] || article.description.en || article.description.kh || '';
  };

  const getLocalizedCategory = (article: Article) => {
    if (!article.category) return '';
    if (typeof article.category.name === 'string') return article.category.name;
    return article.category.name[locale] || article.category.name.en || article.category.name.kh || '';
  };

  const getImageSrc = (article: Article) => {
    if (article.images && article.images.length > 0) {
      return article.images[0];
    } else if (article.thumbnail) {
      return article.thumbnail;
    }
    return null;
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return postDate.toLocaleDateString();
  };

  const getAuthorInfo = (article: Article) => {
    const author = article.author;
    
    if (!author) {
      return {
        name: 'Author',
        username: 'author',
        avatar: null,
        isVerified: false,
        initials: 'A'
      };
    }

    let name = author.name;
    if (!name || name.trim() === '' || name === 'N' || name === 'News Team') {
      if (author.username && author.username.trim() !== '') {
        name = author.username.replace('@', '');
      } else if (author.email) {
        name = author.email.split('@')[0];
      } else {
        name = 'Author';
      }
    }
    
    const username = author.username || '@author';
    const avatar = (author as any).profileImage || author.avatar || null;
    const isVerified = author.role === 'admin' || author.role === 'editor' || author.role === 'moderator';
    
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return {
      name,
      username,
      avatar,
      isVerified,
      initials
    };
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {locale === 'kh' ? 'ត្រលប់' : 'Back'}
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full">
              <Bookmark className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {locale === 'kh' ? 'អត្ថបទដែលបានរក្សាទុក' : 'Saved Articles'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {locale === 'kh' 
                  ? 'អត្ថបទទាំងអស់ដែលអ្នកបានរក្សាទុក' 
                  : 'All articles you have saved for later reading'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[80%]" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <Bookmark className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {locale === 'kh' ? 'មានបញ្ហាក្នុងការផ្ទុក' : 'Error Loading Articles'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={refresh} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                {locale === 'kh' ? 'ព្យាយាមម្តងទៀត' : 'Try Again'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Articles List */}
        {!loading && !error && (
          <>
            {articles.length > 0 ? (
              <div className="space-y-6">
                {articles.map((article, index) => {
                  const title = getLocalizedTitle(article);
                  const description = getLocalizedDescription(article);
                  const category = getLocalizedCategory(article);
                  const imageSrc = getImageSrc(article);
                  const authorInfo = getAuthorInfo(article);

                  return (
                    <Card key={`${article._id}-${index}`} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {/* Article Image */}
                          {imageSrc && (
                            <div className="flex-shrink-0">
                              <NextLink href={`/${locale}/news/${article.slug}`}>
                                <div className="relative w-32 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                  <Image
                                    src={imageSrc}
                                    alt={title}
                                    fill
                                    className="object-cover hover:scale-105 transition-transform"
                                  />
                                </div>
                              </NextLink>
                            </div>
                          )}

                          {/* Article Content */}
                          <div className="flex-1 min-w-0">
                            {/* Author Info */}
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={authorInfo.avatar} alt={authorInfo.name} />
                                <AvatarFallback className="text-xs">
                                  {authorInfo.initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {authorInfo.name}
                              </span>
                              {authorInfo.isVerified && (
                                <CheckCircle className="w-3 h-3 text-blue-500" />
                              )}
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatTime(article.publishedAt || article.createdAt)}
                              </span>
                            </div>

                            {/* Title */}
                            <NextLink href={`/${locale}/news/${article.slug}`}>
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                                {title}
                              </h2>
                            </NextLink>

                            {/* Description */}
                            {description && (
                              <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {description}
                              </p>
                            )}

                            {/* Meta Info */}
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              {category && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {category}
                                </Badge>
                              )}
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {article.views || 0}
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                {article.likes || 0}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {article.comments || 0}
                              </div>
                              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                <Bookmark className="w-3 h-3 fill-current" />
                                {locale === 'kh' ? 'បានរក្សាទុក' : 'Saved'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center pt-6">
                    <Button
                      onClick={loadMore}
                      disabled={loadingMore}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          {locale === 'kh' ? 'កំពុងផ្ទុក...' : 'Loading...'}
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          {locale === 'kh' ? 'ផ្ទុកបន្ថែម' : 'Load More'}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State */
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-amber-500 mb-4">
                    <Bookmark className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {locale === 'kh' ? 'មិនមានអត្ថបទដែលរក្សាទុក' : 'No Saved Articles'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {locale === 'kh' 
                      ? 'អ្នកមិនទាន់បានរក្សាទុកអត្ថបទណាមួយទេ។ ចាប់ផ្តើមរក្សាទុកអត្ថបទដែលអ្នកចូលចិត្ត!'
                      : "You haven't saved any articles yet. Start bookmarking articles you like!"
                    }
                  </p>
                  <Button asChild>
                    <NextLink href={`/${locale}`}>
                      {locale === 'kh' ? 'ចាប់ផ្តើមអាន' : 'Start Reading'}
                    </NextLink>
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
