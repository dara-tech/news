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
import { getArticleImageUrl } from '@/hooks/useImageLoader';

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
  const [isLoading, setIsLoading] = useState(true);useEffect(() => {
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
      <div className="max-w-6xl mx-auto space-y-6 px-3 sm:px-0">
        {/* Hero Section Skeleton - Enterprise Design */}
        <div className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-black dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-8">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
            <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse shadow-lg" />
            <div className="flex-1 text-center lg:text-left space-y-6 w-full">
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-64 mx-auto lg:mx-0" />
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-full max-w-md mx-auto lg:mx-0" />
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse w-24" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton - Enterprise Design */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
              <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-xl mx-auto mb-4 animate-pulse" />
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-16 mx-auto mb-2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-20 mx-auto" />
            </div>
          ))}
        </div>

        {/* Content Tabs Skeleton - Enterprise Design */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-48" />
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-full" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                    <div className="flex gap-4">
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-16" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-16" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-16" />
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
    <div className="max-w-6xl mx-auto space-y-8 sm:px-0">
      {/* Hero Section - Enterprise Design */}
      <div className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-black dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 overflow-hidden">
        {/* Sophisticated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900 dark:bg-slate-100 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-900 dark:bg-slate-100 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-slate-900 dark:bg-slate-100 rounded-full -translate-x-8 -translate-y-8 opacity-30"></div>
        </div>
        
        <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:items-start">
          {/* Professional Avatar Section */}
          <div className="relative group">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-800 shadow-2xl">
                <AvatarImage 
                  src={author.profileImage || author.avatar} 
                  alt={authorName}
                  className="object-cover"
                  onError={() => {setImageError(true);
                  }}
                />
                <AvatarFallback className="bg-slate-900 text-white text-4xl font-bold">
                  {authorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Professional Status Indicator */}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              
              {/* Executive Role Badge */}
              {author?.role && (
                <div className="absolute -top-3 -right-3">
                  <Badge 
                    className={`
                      px-4 py-2 text-xs font-bold shadow-lg border-0 rounded-full
                      ${author.role === 'admin' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' : ''}
                      ${author.role === 'editor' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : ''}
                      ${author.role === 'user' ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white' : ''}
                    `}
                  >
                    {author.role.charAt(0).toUpperCase() + author.role.slice(1)}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          {/* Executive Author Information */}
          <div className="flex-1 text-center lg:text-left space-y-6 w-full">
            <div className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start">
                <div className="text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent leading-tight">
                  {authorName}
                </div>
                {/* Executive Action Buttons */}
                <div className="flex flex-col gap-3 lg:flex-row lg:justify-center xl:justify-start">
                  <FollowButton
                    userId={author._id}
                    size="lg"
                    className="px-8 py-3 text-base font-semibold bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0"
                  />
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="px-8 py-3 text-base border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 rounded-xl font-semibold"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Contact
                  </Button>
                </div>
              </div>
              
              {/* Professional Quick Stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all duration-300">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                    Joined {format(authorStats.joinDate, 'MMM yyyy')}
                  </span>
                </div>
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all duration-300">
                  <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                    {authorStats.totalArticles} Publications
                  </span>
                </div>
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all duration-300">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                    {authorStats.totalViews.toLocaleString()} Total Reach
                  </span>
                </div>
              </div>
              
              {/* Executive Follow Stats */}
              <FollowStats userId={author._id} className="pt-0" showDetails={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Executive Analytics Dashboard */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer rounded-xl overflow-hidden">
          <CardContent className="p-6 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {authorStats.totalArticles}
              </div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Publications
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer rounded-xl overflow-hidden">
          <CardContent className="p-6 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-950 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                {authorStats.totalViews.toLocaleString()}
              </div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Total Reach
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer rounded-xl overflow-hidden">
          <CardContent className="p-6 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-transparent dark:from-rose-950 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-2">
                {authorStats.totalLikes.toLocaleString()}
              </div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Engagement
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer rounded-xl overflow-hidden">
          <CardContent className="p-6 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-transparent dark:from-violet-950 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-2">
                {authorStats.totalComments.toLocaleString()}
              </div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Discussions
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Content Portfolio */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl font-bold">
            <div className="p-1.5 sm:p-2 bg-slate-900 dark:bg-white rounded-lg">
              <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-white dark:text-slate-900" />
            </div>
            <span className="truncate">Portfolio of {authorName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <TabsTrigger value="recent" className="text-sm font-semibold px-6 rounded-lg">Recent Work</TabsTrigger>
              <TabsTrigger value="popular" className="text-sm font-semibold px-6 rounded-lg">Top Performing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent" className="space-y-4 mt-6">
              <div className="grid gap-4">
                {displayArticles.map((article) => (
                  <div
                    key={article._id}
                    className={`p-6 border rounded-xl transition-all duration-300 hover:shadow-lg ${
                      article._id === currentArticleId
                        ? 'border-slate-900 dark:border-slate-400 bg-slate-50 dark:bg-slate-800 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex gap-6">
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 shadow-md">
                        <Image
                          src={getArticleImageUrl(article) || '/placeholder.jpg'}
                          alt={getLocalizedString(article.title)}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 leading-tight">
                            {getLocalizedString(article.title)}
                          </h3>
                          {article._id === currentArticleId && (
                            <Badge className="ml-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full">
                              Current Article
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-6 text-sm text-slate-600 dark:text-slate-400 mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{format(new Date(article.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                          {article.category && (
                            <Badge variant="outline" className="text-xs w-fit border-slate-300 dark:border-slate-600 rounded-full">
                              {article.category}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-500">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span className="font-semibold">{article.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            <span className="font-semibold">{article.likes.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            <span className="font-semibold">{article.comments.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {authorArticles.length > 3 && (
                <div className="text-center pt-6">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowAllArticles(!showAllArticles)}
                    className="px-8 py-3 text-base border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 rounded-xl font-semibold"
                  >
                    {showAllArticles ? 'Show Less' : `View Complete Portfolio (${authorArticles.length} Articles)`}
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="popular" className="space-y-4 mt-6">
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                  <FileText className="w-10 h-10 opacity-50" />
                </div>
                <p className="text-lg font-semibold">Performance Analytics</p>
                <p className="text-sm mt-2">Top performing content analysis coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Professional Network */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-slate-900 dark:bg-white rounded-lg">
              <Share2 className="w-6 h-6 text-white dark:text-slate-900" />
            </div>
            <span className="truncate">Professional Network</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Button variant="outline" size="lg" className="flex items-center justify-center gap-3 p-6 h-auto border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 rounded-xl">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Twitter className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-base">Twitter</span>
            </Button>
            <Button variant="outline" size="lg" className="flex items-center justify-center gap-3 p-6 h-auto border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 rounded-xl">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Linkedin className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-base">LinkedIn</span>
            </Button>
            <Button variant="outline" size="lg" className="flex items-center justify-center gap-3 p-6 h-auto border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 rounded-xl">
              <div className="p-2 bg-slate-600 rounded-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-base">Website</span>
            </Button>
            <Button variant="outline" size="lg" className="flex items-center justify-center gap-3 p-6 h-auto border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 rounded-xl">
              <div className="p-2 bg-slate-700 rounded-lg">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-base">Contact</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 