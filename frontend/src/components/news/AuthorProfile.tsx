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
  Plus,
  Minus
} from 'lucide-react';
import { format } from 'date-fns';

// Import Next.js Image component for article thumbnails
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
  const [isFollowing, setIsFollowing] = useState(false);
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

  // Debug: Log what we receive in AuthorProfile
  console.log('🔍 AuthorProfile Debug:', {
    author,
    profileImage: author.profileImage,
    avatar: author.avatar,
    hasProfileImage: !!author.profileImage,
    hasAvatar: !!author.avatar,
    imageError
  });

  // Use provided data or fall back to mock data
  useEffect(() => {
    if (providedStats && providedArticles) {
      setAuthorStats(providedStats);
      setAuthorArticles(providedArticles);
      setIsLoading(false);
    } else {
      // Fallback to mock data if no real data provided
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

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // In real app, make API call to follow/unfollow
  };

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6 lg:space-y-8 px-4 sm:px-0">
        {/* Main Author Card Skeleton */}
        <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-black">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
              {/* Profile Section Skeleton */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                {/* Avatar Skeleton */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                
                {/* Info Skeleton */}
                <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                  <div>
                    <div className="h-6 sm:h-8 lg:h-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-48 mx-auto sm:mx-0" />
                    <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-full max-w-md mt-2 mx-auto sm:mx-0" />
                    <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4 max-w-sm mt-1 mx-auto sm:mx-0" />
                  </div>
                  
                  {/* Stats Pills Skeleton */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-3 pt-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-7 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse w-24" />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons Skeleton */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-full sm:w-28 lg:w-32" />
                <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-full sm:w-28 lg:w-32" />
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-black">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-800 rounded-xl mx-auto mb-2 sm:mb-3 animate-pulse" />
                <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-12 mx-auto mb-1" />
                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-16 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Articles Section Skeleton */}
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-black">
          <CardHeader className="p-4 sm:p-6">
            <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-48" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3 sm:space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-black">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-full mb-2" />
                      <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4 mb-2" />
                      <div className="flex gap-3 sm:gap-4">
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-12" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-12" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-12" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 px-4 sm:px-0">
      {/* Modern Clean Author Card */}
      <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-black">
        {/* Clean Header Section - No Background */}
        <div className="relative p-6 sm:p-8">
          {/* Role Badge - Mobile Top Right */}
          {author?.role && (
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              <Badge 
                className={`
                  px-3 py-1.5 text-xs sm:text-sm font-semibold shadow-md border-0
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
        
        <CardHeader className="relative p-6 sm:p-8 -mt-6 sm:-mt-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
            {/* Profile Section - Mobile Centered, Desktop Left */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              {/* Modern Avatar */}
              <div className="relative group">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 border-4 border-white dark:border-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105 bg-white dark:bg-gray-800">
                  <AvatarImage 
                    src={author.profileImage || author.avatar} 
                    alt={authorName}
                    className="object-contain"
                    onError={() => {
                      console.log('🚨 Avatar image failed to load:', author.profileImage || author.avatar);
                      setImageError(true);
                    }}
                  />
                  <AvatarFallback className="bg-black text-white text-xl sm:text-2xl lg:text-3xl font-bold">
                    {authorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Status Indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-3 border-white dark:border-gray-900 shadow-lg"></div>
              </div>
              
              {/* Author Info - Responsive */}
              <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {authorName}
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-none sm:max-w-2xl">
                    📝 Experienced content creator and storyteller passionate about delivering engaging insights to readers. Bringing ideas to life through compelling narratives and thought-provoking content.
                  </p>
                </div>
                
                {/* Quick Stats Pills - Clean Design */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-3 pt-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm bg-white dark:bg-black">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Joined {format(authorStats.joinDate, 'MMM yyyy')}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm bg-white dark:bg-black">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {authorStats.totalArticles} articles
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm bg-white dark:bg-black">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {authorStats.totalViews.toLocaleString()} views
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons - Mobile Full Width, Desktop Compact */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                onClick={handleFollowToggle}
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                className={`
                  w-full sm:w-auto sm:min-w-[120px] lg:min-w-[140px] font-semibold transition-all duration-300 group text-sm sm:text-base
                  ${isFollowing 
                    ? 'border-red-300 text-red-600 hover:bg-gray-100 dark:border-red-600 dark:text-red-400 dark:hover:bg-gray-900' 
                    : 'bg-black hover:bg-gray-900 text-white shadow-md hover:shadow-lg'
                  }
                `}
              >
                {isFollowing ? (
                  <>
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 group-hover:scale-110 transition-transform" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 group-hover:scale-110 transition-transform" />
                    Follow
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="w-full sm:w-auto sm:min-w-[120px] lg:min-w-[140px] border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all duration-300 group text-sm sm:text-base bg-white dark:bg-black"
              >
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 group-hover:scale-110 transition-transform" />
                Contact
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Modern Stats Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer bg-white dark:bg-black">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {authorStats.totalArticles}
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Articles</div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer bg-white dark:bg-black">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-xl mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              {authorStats.totalViews.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Views</div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer bg-white dark:bg-black">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-rose-500 rounded-xl mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-rose-600 dark:text-rose-400 mb-1">
              {authorStats.totalLikes.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Likes</div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer bg-white dark:bg-black">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-violet-500 rounded-xl mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-violet-600 dark:text-violet-400 mb-1">
              {authorStats.totalComments.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Comments</div>
          </CardContent>
        </Card>
      </div>

      {/* Author's Articles - Mobile Optimized */}
      <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-black">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-base sm:text-lg">Recent Articles by {authorName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10 bg-white dark:bg-black">
              <TabsTrigger value="recent" className="text-xs sm:text-sm">Recent</TabsTrigger>
              <TabsTrigger value="popular" className="text-xs sm:text-sm">Popular</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent" className="space-y-3 sm:space-y-4">
              <div className="grid gap-3 sm:gap-4">
                {displayArticles.map((article) => (
                  <div
                    key={article._id}
                    className={`p-3 sm:p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
                      article._id === currentArticleId
                        ? 'border-black bg-gray-100 dark:bg-gray-900'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-black'
                    }`}
                  >
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white dark:bg-black">
                        <Image
                          src={article.thumbnail || '/placeholder.jpg'}
                          alt={getLocalizedString(article.title)}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2">
                            {getLocalizedString(article.title)}
                          </h3>
                          {article._id === currentArticleId && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span>{format(new Date(article.createdAt), 'MMM d, yyyy')}</span>
                          {article.category && (
                            <Badge variant="outline" className="text-xs w-fit bg-white dark:bg-black">
                              {article.category}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500 dark:text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span className="text-xs">{article.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span className="text-xs">{article.likes.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span className="text-xs">{article.comments.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {authorArticles.length > 3 && (
                <div className="text-center pt-3 sm:pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllArticles(!showAllArticles)}
                    className="text-xs sm:text-sm bg-white dark:bg-black"
                  >
                    {showAllArticles ? 'Show Less' : `Show All ${authorArticles.length} Articles`}
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="popular" className="space-y-4">
              <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-black rounded-lg">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Popular articles will be displayed here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Social Links - Mobile Optimized */}
      <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-black">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-base sm:text-lg">Connect with {authorName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="flex items-center justify-center gap-2 text-xs sm:text-sm bg-white dark:bg-black">
              <Twitter className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Twitter</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center justify-center gap-2 text-xs sm:text-sm bg-white dark:bg-black">
              <Linkedin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">LinkedIn</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center justify-center gap-2 text-xs sm:text-sm bg-white dark:bg-black">
              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Website</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center justify-center gap-2 text-xs sm:text-sm bg-white dark:bg-black">
              <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Email</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 