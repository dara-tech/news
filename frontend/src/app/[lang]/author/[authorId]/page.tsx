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
  const locale = (lang as string) === 'km' ? 'kh' : 'en';
  
  const [data, setData] = useState<AuthorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getAuthorProfile(authorId as string);
        console.log('🔍 Author API Response:', response);
        console.log('🔍 Author Data:', response.author);
        setData(response);
      } catch (err) {
        const errorObj = err as FetchError;
        console.error('Error fetching author data:', errorObj);
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
    return (
      <div className="min-h-screen  ">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8  rounded animate-pulse w-32" />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-64" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link href={`/${lang}`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold dark:text-white mb-2">
                Author Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}
              </p>
              <Link href={`/${lang}`}>
                <Button>
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
    <div className="min-h-screen ">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href={`/${lang}`}>
            <Button variant="ghost" className="mb-4">
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