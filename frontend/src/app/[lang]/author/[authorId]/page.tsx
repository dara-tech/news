'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAuthorProfile } from '@/lib/api';
import AuthorProfile from '@/components/news/AuthorProfile';
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
  const { authorId, lang } = params;
  const locale = (lang as string) === 'kh' ? 'kh' : 'en';
  
  const [data, setData] = useState<AuthorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getAuthorProfile(authorId as string);setData(response);
      } catch (err) {
        const errorObj = err as FetchError;setError(
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
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto space-y-3 sm:space-y-6 px-3 sm:px-0">
          {/* Back Button Skeleton */}
          <div className="mb-2">
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          
          {/* Hero Section Skeleton - Mobile Optimized */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg sm:rounded-2xl p-4 sm:p-8">
            <div className="flex flex-col items-center gap-4 sm:gap-8 sm:flex-row sm:items-start">
              <div className="w-20 h-20 sm:w-32 sm:h-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              <div className="flex-1 text-center sm:text-left space-y-3 sm:space-y-4 w-full">
                <div className="h-5 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40 sm:w-64 mx-auto sm:mx-0" />
                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full max-w-md mx-auto sm:mx-0" />
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-5 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-16 sm:w-24" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid Skeleton - Mobile Optimized */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-black rounded-lg sm:rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-gray-700">
                <div className="h-6 w-6 sm:h-12 sm:w-12 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-xl mx-auto mb-2 sm:mb-4 animate-pulse" />
                <div className="h-4 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-10 sm:w-16 mx-auto mb-1 sm:mb-2" />
                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12 sm:w-20 mx-auto" />
              </div>
            ))}
          </div>

          {/* Content Tabs Skeleton - Mobile Optimized */}
          <div className="bg-white dark:bg-black rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="h-4 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32 sm:w-48" />
            </div>
            <div className="p-3 sm:p-6">
              <div className="space-y-2 sm:space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4 p-2 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="w-12 h-12 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                      <div className="flex gap-2 sm:gap-4">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-10 sm:w-16" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-10 sm:w-16" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-10 sm:w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Connections Skeleton - Mobile Optimized */}
          <div className="bg-white dark:bg-black rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="h-4 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40 sm:w-48" />
            </div>
            <div className="p-3 sm:p-6">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto sm:px-0">
          <div className="mb-2">
            <Link href={`/${lang}`}>
              <Button variant="ghost" className="mb-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-6 sm:p-8 text-center">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold dark:text-white mb-2">
                Author Not Found
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                {error}
              </p>
              <Link href={`/${lang}`}>
                <Button className="w-full sm:w-auto">
                  Go Back Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
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
    profileImage: data.author.profileImage,  // ✅ Add profileImage field
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

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto sm:px-0">
        <div className="mb-2">
          <Link href={`/${lang}`}>
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
    </div>
  );
} 