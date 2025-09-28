'use client';

import React, { useState, useEffect } from 'react';
import { User, TrendingUp, Eye, Heart, MessageCircle, Search, Filter } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import api from '@/lib/api';

interface Author {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  profileImage?: string;
  role: string;
  createdAt: string;
  articleCount: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgViews: number;
  latestArticle: string;
  engagementScore: number;
  recentArticles: Array<{
    id: string;
    title: any;
    description: any;
    thumbnail?: string;
    publishedAt: string;
    views: number;
    likes: number;
    comments: number;
    category: {
      _id: string;
      name: any;
      color?: string;
      slug?: string;
    };
  }>;
}

interface AuthorsPageClientProps {
  locale: 'en' | 'kh';
}

const AuthorsPageClient: React.FC<AuthorsPageClientProps> = ({ locale }) => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'engagement' | 'articles' | 'views' | 'likes'>('engagement');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchAuthors = async (page: number = 1, search: string = '', sort: string = 'engagement') => {
    try {
      setLoading(true);
      const response = await api.get('/news/top-authors', {
        params: {
          limit: 20,
          lang: locale,
          page,
          search,
          sortBy: sort
        }
      });

      if (response.data?.success && Array.isArray(response.data?.data)) {
        const newAuthors = response.data.data;
        if (page === 1) {
          setAuthors(newAuthors);
        } else {
          setAuthors(prev => [...prev, ...newAuthors]);
        }
        // Use pagination info from API response
        setHasMore(response.data.pagination?.hasMore ?? false);
      } else {
        setError('Failed to fetch authors');
      }
    } catch (err) {
      console.error('Error fetching authors:', err);
      setError('Failed to fetch authors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors(1, searchQuery, sortBy);
  }, [locale, searchQuery, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAuthors(1, searchQuery, sortBy);
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchAuthors(nextPage, searchQuery, sortBy);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getLocalizedText = (text: string | { en: string; kh: string }) => {
    if (typeof text === 'string') return text;
    return text[locale] || text.en || text.kh || '';
  };

  if (loading && authors.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-10 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg p-6 space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-24"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {locale === 'kh' ? 'អ្នកសរសេរទាំងអស់' : 'All Authors'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'kh' ? 'ស្វែងរកអ្នកសរសេរព័ត៌មានដែលអ្នកចូលចិត្ត' : 'Discover news writers you love'}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={locale === 'kh' ? 'ស្វែងរកអ្នកសរសេរ...' : 'Search authors...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="default">
              {locale === 'kh' ? 'ស្វែងរក' : 'Search'}
            </Button>
          </form>

          <div className="flex gap-2">
            <Button
              variant={sortBy === 'engagement' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('engagement')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {locale === 'kh' ? 'ពេញនិយម' : 'Engagement'}
            </Button>
            <Button
              variant={sortBy === 'articles' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('articles')}
            >
              <User className="w-4 h-4 mr-2" />
              {locale === 'kh' ? 'អត្ថបទ' : 'Articles'}
            </Button>
            <Button
              variant={sortBy === 'views' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('views')}
            >
              <Eye className="w-4 h-4 mr-2" />
              {locale === 'kh' ? 'មើល' : 'Views'}
            </Button>
            <Button
              variant={sortBy === 'likes' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('likes')}
            >
              <Heart className="w-4 h-4 mr-2" />
              {locale === 'kh' ? 'ចូលចិត្ត' : 'Likes'}
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchAuthors(1, searchQuery, sortBy)}>
              {locale === 'kh' ? 'ព្យាយាមម្តងទៀត' : 'Try Again'}
            </Button>
          </div>
        )}

        {/* Authors Grid */}
        {!error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authors.map((author, index) => (
              <div
                key={author._id}
                className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
              >
                <Link href={`/${locale}/author/${author._id}`}>
                  <div className="space-y-4">
                    {/* Author Header */}
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={author.avatar || author.profileImage}
                          alt={author.username}
                        />
                        <AvatarFallback>
                          {author.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">
                          {author.username}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {author.role}
                        </Badge>
                      </div>
                      {index < 3 && (
                        <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                          #{index + 1}
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-primary mb-1">
                          <User className="h-4 w-4" />
                          <span className="font-semibold">{author.articleCount}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {locale === 'kh' ? 'អត្ថបទ' : 'Articles'}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                          <Eye className="h-4 w-4" />
                          <span className="font-semibold">{formatNumber(author.totalViews)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {locale === 'kh' ? 'មើល' : 'Views'}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                          <Heart className="h-4 w-4" />
                          <span className="font-semibold">{formatNumber(author.totalLikes)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {locale === 'kh' ? 'ចូលចិត្ត' : 'Likes'}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                          <MessageCircle className="h-4 w-4" />
                          <span className="font-semibold">{formatNumber(author.totalComments)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {locale === 'kh' ? 'មតិ' : 'Comments'}
                        </p>
                      </div>
                    </div>

                    {/* Recent Articles */}
                    {author.recentArticles && author.recentArticles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          {locale === 'kh' ? 'អត្ថបទថ្មីៗ' : 'Recent Articles'}
                        </h4>
                        <div className="space-y-1">
                          {author.recentArticles.slice(0, 2).map((article) => (
                            <div
                              key={article.id}
                              className="text-sm text-muted-foreground line-clamp-2 hover:text-foreground transition-colors"
                            >
                              {getLocalizedText(article.title)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && !error && (
          <div className="text-center mt-8">
            <Button onClick={handleLoadMore} variant="outline">
              {locale === 'kh' ? 'មើលបន្ថែម' : 'Load More'}
            </Button>
          </div>
        )}

        {/* Loading More */}
        {loading && authors.length > 0 && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              {locale === 'kh' ? 'កំពុងផ្ទុក...' : 'Loading...'}
            </div>
          </div>
        )}

        {/* No Authors Found */}
        {!loading && !error && authors.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {locale === 'kh' ? 'រកមិនឃើញអ្នកសរសេរ' : 'No Authors Found'}
            </h3>
            <p className="text-muted-foreground">
              {locale === 'kh' 
                ? 'សូមព្យាយាមស្វែងរកជាមួយពាក្យស្វែងរកផ្សេងទៀត' 
                : 'Try searching with different keywords'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorsPageClient;
