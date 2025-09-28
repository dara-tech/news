'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAuthorProfile } from '@/lib/api';
import AuthorProfile from '@/components/news/AuthorProfile';
import TwitterLikeLayout from '@/components/hero/TwitterLikeLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface AuthorData {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  profileImage?: string;
  role: string;
  stats: {
    totalArticles: number;
    totalViews: number;
    totalLikes: number;
    joinDate: string;
  };
}

interface AuthorArticle {
  _id: string;
  title: string | { en: string; kh: string };
  thumbnail?: string;
  createdAt: string;
  publishedAt: string;
  views: number;
  likes: number;
  category: {
    _id: string;
    name: string | { en: string; kh: string };
    color?: string;
    slug?: string;
  };
}

interface AuthorProfileData {
  success: boolean;
  author: AuthorData;
  articles: AuthorArticle[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalArticles: number;
  };
}

// Define a minimal error type for the catch block
type FetchError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

export default function AuthorProfilePage() {
  const params = useParams();
  const { authorId } = params;
  const locale = 'en'; // Default to English for non-language prefixed routes
  
  const [data, setData] = useState<AuthorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getAuthorProfile(authorId as string);
        setData(response);
      } catch (err) {
        const errorObj = err as FetchError;
        setError(
          errorObj.response?.data?.message ||
          errorObj.message ||
          'Failed to load author profile'
        );
      } finally {
        setLoading(false);
      }
    };

    if (authorId) {
      fetchAuthorData();
    }
  }, [authorId]);

  if (loading) {
    const loadingContent = (
      <div className="w-full">
        {/* Header Section Skeleton - Twitter-style Profile */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border/50 p-4 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="h-5 bg-muted rounded w-32 mb-1 animate-pulse" />
              <div className="h-3 bg-muted rounded w-48 animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 bg-muted rounded w-16 animate-pulse" />
              <div className="h-8 bg-muted rounded w-20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Stats Section Skeleton - Twitter-style */}
        <div className="p-4 border-b border-border/50">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-6 bg-muted rounded w-12 mx-auto mb-1 animate-pulse" />
                <div className="h-3 bg-muted rounded w-16 mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Articles Skeleton - Twitter Feed Style */}
        <div className="divide-y divide-border/50">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-muted rounded w-32 animate-pulse" />
              <div className="h-6 bg-muted rounded w-24 animate-pulse" />
            </div>
          </div>
          
          <div className="divide-y divide-border/50">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-muted rounded-lg animate-pulse flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                      <div className="w-12 h-4 bg-muted rounded animate-pulse ml-2" />
                    </div>
                    
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-3 bg-muted rounded w-20 animate-pulse" />
                      <div className="h-5 bg-muted rounded w-16 animate-pulse" />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="h-3 bg-muted rounded w-12 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-10 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-12 animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="w-3 h-3 bg-muted rounded animate-pulse flex-shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links Skeleton - Twitter-style */}
        <div className="p-4 border-t border-border/50">
          <div className="h-4 bg-muted rounded w-16 mb-3 animate-pulse" />
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded w-20 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );

    return (
      <TwitterLikeLayout
        breaking={[]}
        featured={[]}
        latestNews={[]}
        categories={[]}
        locale={locale}
        isLoading={true}
        customMainContent={loadingContent}
      />
    );
  }

  if (error) {
    const errorContent = (
      <div className="w-full p-8">
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-6 sm:p-8 text-center">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-destructive mx-auto mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              Author Not Found
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              {error}
            </p>
            <Link href="/">
              <Button className="w-full sm:w-auto">
                Go Back Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );

    return (
      <TwitterLikeLayout
        breaking={[]}
        featured={[]}
        latestNews={[]}
        categories={[]}
        locale={locale}
        isLoading={false}
        customMainContent={errorContent}
      />
    );
  }

  if (!data) {
    return null;
  }

  // Transform the data to match the AuthorProfile component interface
  const transformedAuthor = {
    _id: data.author._id,
    username: data.author.username,
    email: data.author.email,
    avatar: data.author.avatar,
    profileImage: data.author.profileImage,
    role: data.author.role
  };

  const transformedArticles = data.articles.map(article => ({
    _id: article._id,
    title: article.title,
    thumbnail: article.thumbnail,
    createdAt: article.publishedAt,
    views: article.views || 0,
    likes: article.likes || 0,
    comments: 0, // Not available in current API
    category: typeof article.category.name === 'string' 
      ? article.category.name 
      : article.category.name[locale] || article.category.name.en
  }));

  const authorContent = (
    <div className="w-full">
      <div className="mb-2 lg:hidden ">
        <Link href="/">
          <Button variant="ghost" className="mb-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <AuthorProfile 
        author={transformedAuthor}
        locale={locale}
        authorStats={{
          totalArticles: data.author.stats.totalArticles,
          totalViews: data.author.stats.totalViews,
          totalLikes: data.author.stats.totalLikes,
          totalComments: 0, // Not available in current API
          joinDate: new Date(data.author.stats.joinDate)
        }}
        authorArticles={transformedArticles}
        pagination={data.pagination}
      />
    </div>
  );

  return (
    <TwitterLikeLayout
      breaking={[]}
      featured={[]}
      latestNews={[]}
      categories={[]}
      locale={locale}
      isLoading={false}
      customMainContent={authorContent}
    />
  );
}
