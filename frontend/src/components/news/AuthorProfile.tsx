'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  FileText, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Twitter,
  Linkedin,
  Globe,
  Mail,
  Award,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import FollowButton from '@/components/common/FollowButton';
import FollowStats from '@/components/common/FollowStats';
import { format } from 'date-fns';
import Image from 'next/image';

interface AuthorProfileProps {
  author: {
    _id: string;
    avatar?: string;
    profileImage?: string;
    name?: string;
    username?: string;
    email?: string;
    role?: string;
  };
  currentArticleId?: string;
  locale: 'en' | 'kh';
  authorStats?: AuthorStats;
  authorArticles?: AuthorArticle[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalArticles: number;
  };
}

interface AuthorStats {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  joinDate: Date;
}

interface AuthorArticle {
  _id: string;
  title: string | { en: string; kh: string };
  thumbnail?: string;
  createdAt: string;
  views: number;
  likes: number;
  comments: number;
  category?: string;
}

export default function AuthorProfile({ 
  author, 
  currentArticleId, 
  locale,
  authorStats: providedStats,
  authorArticles: providedArticles,
}: AuthorProfileProps) {
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [authorStats, setAuthorStats] = useState<AuthorStats>({
    totalArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    joinDate: new Date()
  });
  const [authorArticles, setAuthorArticles] = useState<AuthorArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log('🔍 AuthorProfile Debug:', {
    author,
    profileImage: author.profileImage,
    avatar: author.avatar,
    hasProfileImage: !!author.profileImage,
    hasAvatar: !!author.avatar,
    imageError
  });

  useEffect(() => {
    if (providedStats && providedArticles) {
      setAuthorStats(providedStats);
      setAuthorArticles(providedArticles);
      setIsLoading(false);
    } else {
      setTimeout(() => {
        setAuthorStats({
          totalArticles: 24,
          totalViews: 156000,
          totalLikes: 3200,
          totalComments: 890,
          joinDate: new Date('2023-01-15')
        });
        
        setAuthorArticles([
          {
            _id: '1',
            title: { en: 'Breaking News: Technology Advances', kh: 'ព័ត៌មានថ្មី៖ ការវិវត្តន៍បច្ចេកវិទ្យា' },
            thumbnail: '/placeholder.jpg',
            createdAt: '2024-01-15T10:30:00Z',
            views: 12500,
            likes: 234,
            comments: 45,
            category: 'Technology'
          },
          {
            _id: '2',
            title: { en: 'Economic Analysis: Market Trends', kh: 'ការវិភាគសេដ្ឋកិច្ច៖ ការវិវត្តន៍ទីផ្សារ' },
            thumbnail: '/placeholder.jpg',
            createdAt: '2024-01-10T14:20:00Z',
            views: 8900,
            likes: 156,
            comments: 32,
            category: 'Business'
          },
          {
            _id: '3',
            title: { en: 'Health & Wellness Guide', kh: 'មគ្គុទ្ទេសក៍សុខភាព និងសុខុមាលភាព' },
            thumbnail: '/placeholder.jpg',
            createdAt: '2024-01-05T09:15:00Z',
            views: 6700,
            likes: 189,
            comments: 28,
            category: 'Health'
          }
        ]);
        setIsLoading(false);
      }, 1000);
    }
  }, [providedStats, providedArticles]);

  const getLocalizedString = (str: string | { en: string; kh: string } | undefined): string => {
    if (!str) return '';
    if (typeof str === 'string') return str;
    return str[locale] || str.en || '';
  };

  const getAuthorName = () => {
    if (author?.username) return author.username;
    if (author?.email) return author.email.split('@')[0];
    return 'Anonymous';
  };

  const authorName = getAuthorName();
  const displayArticles = showAllArticles ? authorArticles : authorArticles.slice(0, 3);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-4 ">
        {/* Hero Section Skeleton */}
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-8">
          <div className="flex flex-col items-center gap-4 sm:gap-8 sm:flex-row sm:items-start">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="flex-1 text-center sm:text-left space-y-3 sm:space-y-4 w-full">
              <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48 sm:w-64 mx-auto sm:mx-0" />
              <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full max-w-md mx-auto sm:mx-0" />
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-20 sm:w-24" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-black rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="h-8 w-8 sm:h-12 sm:w-12 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-xl mx-auto mb-3 sm:mb-4 animate-pulse" />
              <div className="h-4 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12 sm:w-16 mx-auto mb-2" />
              <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16 sm:w-20 mx-auto" />
            </div>
          ))}
        </div>

        {/* Content Tabs Skeleton */}
        <div className="bg-white dark:bg-black rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40 sm:w-48" />
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                    <div className="flex gap-2 sm:gap-4">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12 sm:w-16" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12 sm:w-16" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12 sm:w-16" />
                    </div>
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
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6  sm:px-0">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-black dark:bg-white rounded-full -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-black dark:bg-white rounded-full translate-y-8 -translate-x-8 sm:translate-y-12 sm:-translate-x-12"></div>
        </div>
        
        <div className="relative flex flex-col items-center gap-4 sm:gap-8 sm:flex-row sm:items-start">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="relative">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-2 sm:border-4 border-white dark:border-gray-800 shadow-lg sm:shadow-2xl">
                <AvatarImage 
                  src={author.profileImage || author.avatar} 
                  alt={authorName}
                  className="object-cover"
                  onError={() => {
                    console.log('🚨 Avatar image failed to load:', author.profileImage || author.avatar);
                    setImageError(true);
                  }}
                />
                <AvatarFallback className="bg-black text-white text-2xl sm:text-4xl font-bold">
                  {authorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Status Indicator */}
              <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full border-2 sm:border-4 border-white dark:border-gray-800 shadow-lg"></div>
              
              {/* Role Badge */}
              {author?.role && (
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                  <Badge 
                    className={`
                      px-2 py-1 sm:px-3 sm:py-1 text-xs font-bold shadow-lg border-0
                      ${author.role === 'admin' ? 'bg-red-500 text-white' : ''}
                      ${author.role === 'editor' ? 'bg-blue-500 text-white' : ''}
                      ${author.role === 'user' ? 'bg-green-500 text-white' : ''}
                    `}
                  >
                    {author.role.charAt(0).toUpperCase() + author.role.slice(1)}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          {/* Author Info */}
          <div className="flex-1 text-center sm:text-left space-y-4 sm:space-y-6 w-full">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col gap-3 sm:gap-3 sm:flex-row sm:justify-between sm:items-start">
                <div className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                  {authorName}
                </div>
                {/* Action Buttons */}
                <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:justify-center lg:justify-start order-first sm:order-last">
                  <FollowButton
                    userId={author._id}
                    size="sm"
                    className="px-4 py-2 sm:px-8 sm:py-3 text-sm sm:text-base font-semibold bg-black hover:bg-gray-900 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="px-4 py-2 sm:px-8 sm:py-3 text-sm sm:text-base border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all duration-300"
                  >
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Contact Author
                  </Button>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
                <div className="inline-flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white dark:bg-black rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    Joined {format(authorStats.joinDate, 'MMM yyyy')}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white dark:bg-black rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    {authorStats.totalArticles} articles
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white dark:bg-black rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    {authorStats.totalViews.toLocaleString()} views
                  </span>
                </div>
              </div>
              
              {/* Follow Stats */}
              <FollowStats userId={author._id} className="pt-2" showDetails={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-blue-500 rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="text-xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1 sm:mb-2">
              {authorStats.totalArticles}
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Articles Published</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-emerald-500 rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
              <Eye className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="text-xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1 sm:mb-2">
              {authorStats.totalViews.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-rose-500 rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="text-xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 mb-1 sm:mb-2">
              {authorStats.totalLikes.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Likes</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-violet-500 rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="text-xl sm:text-3xl font-bold text-violet-600 dark:text-violet-400 mb-1 sm:mb-2">
              {authorStats.totalComments.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Comments</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Articles by {authorName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10 sm:h-12 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="recent" className="text-xs sm:text-sm font-medium">Recent Articles</TabsTrigger>
              <TabsTrigger value="popular" className="text-xs sm:text-sm font-medium">Popular Articles</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
              <div className="grid gap-3 sm:gap-4">
                {displayArticles.map((article) => (
                  <div
                    key={article._id}
                    className={`p-4 sm:p-6 border rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-lg ${
                      article._id === currentArticleId
                        ? 'border-black bg-gray-50 dark:bg-gray-900'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-black'
                    }`}
                  >
                    <div className="flex gap-3 sm:gap-6">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                        <Image
                          src={article.thumbnail || '/placeholder.jpg'}
                          alt={getLocalizedString(article.title)}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <h3 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white line-clamp-2">
                            {getLocalizedString(article.title)}
                          </h3>
                          {article._id === currentArticleId && (
                            <Badge variant="secondary" className="ml-2 sm:ml-3 text-xs hidden sm:block">
                              Current Article
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1 sm:gap-2 sm:flex-row sm:items-center sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{format(new Date(article.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                          {article.category && (
                            <Badge variant="outline" className="text-xs w-fit">
                              {article.category}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-medium">{article.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-medium">{article.likes.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-medium">{article.comments.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {authorArticles.length > 3 && (
                <div className="text-center pt-4 sm:pt-6">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowAllArticles(!showAllArticles)}
                    className="px-6 py-2 sm:px-8 sm:py-3 text-sm sm:text-base"
                  >
                    {showAllArticles ? 'Show Less' : `View All ${authorArticles.length} Articles`}
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="popular" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
              <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-base sm:text-lg">Popular articles will be displayed here</p>
                <p className="text-sm mt-2">Coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Social Connections */}
      <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl">
            <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Connect with {authorName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Button variant="outline" size="lg" className="flex items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 h-auto">
              <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Twitter</span>
            </Button>
            <Button variant="outline" size="lg" className="flex items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 h-auto">
              <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">LinkedIn</span>
            </Button>
            <Button variant="outline" size="lg" className="flex items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 h-auto">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Website</span>
            </Button>
            <Button variant="outline" size="lg" className="flex items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 h-auto">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Email</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 