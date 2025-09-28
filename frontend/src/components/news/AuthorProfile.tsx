'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
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
  Clock,
  ExternalLink,
  MapPin,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import FollowButton from '@/components/common/FollowButton';
import { format } from 'date-fns';
import Image from 'next/image';
import { getArticleImageUrl } from '@/hooks/useImageLoader';
// Helper function for localized text
const getLocalizedText = (en: string, kh: string, locale: 'en' | 'kh'): string => {
  return locale === 'kh' ? kh : en;
};

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
  comments: number ;
  category?: string;
  slug?: string | { en: string; kh: string };
}

export default function AuthorProfile({ 
  author, 
  currentArticleId, 
  authorStats: providedStats,
  authorArticles: providedArticles,
}: AuthorProfileProps) {
  // Get language from URL params
  const params = useParams();
  const locale = (params?.lang === 'kh' ? 'kh' : 'en') as 'en' | 'kh';
  const { user } = useAuth();
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());
  const [articleLikes, setArticleLikes] = useState<Record<string, number>>({});
  const [authorStats, setAuthorStats] = useState<AuthorStats>({
    totalArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    joinDate: new Date()
  });
  const [authorArticles, setAuthorArticles] = useState<AuthorArticle[]>([]);

  useEffect(() => {
    if (providedStats && providedArticles) {
      setAuthorStats(providedStats);
      setAuthorArticles(providedArticles);
      
      // Initialize likes data
      const initialLikes: Record<string, number> = {};
      providedArticles.forEach(article => {
        initialLikes[article._id] = article.likes;
      });
      setArticleLikes(initialLikes);
    } else {
      setTimeout(() => {
        setAuthorStats({
          totalArticles: 24,
          totalViews: 156000,
          totalLikes: 3200,
          totalComments: 890,
          joinDate: new Date('2023-01-15')
        });
        
        const mockArticles = [
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
        ];
        
        setAuthorArticles(mockArticles);
        
        // Initialize likes data for mock articles
        const initialLikes: Record<string, number> = {};
        mockArticles.forEach(article => {
          initialLikes[article._id] = article.likes;
        });
        setArticleLikes(initialLikes);
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

  // Like functionality
  const handleLike = async (articleId: string) => {
    if (!user) {
      // Redirect to login or show login modal
      return;
    }

    try {
      const isLiked = likedArticles.has(articleId);
      const currentLikes = articleLikes[articleId] || 0;
      
      // Optimistic update
      setLikedArticles(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.delete(articleId);
        } else {
          newSet.add(articleId);
        }
        return newSet;
      });
      
      setArticleLikes(prev => ({
        ...prev,
        [articleId]: isLiked ? currentLikes - 1 : currentLikes + 1
      }));

      // API call
      const response = await fetch(`/api/articles/${articleId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        // Revert optimistic update
        setLikedArticles(prev => {
          const newSet = new Set(prev);
          if (isLiked) {
            newSet.add(articleId);
          } else {
            newSet.delete(articleId);
          }
          return newSet;
        });
        
        setArticleLikes(prev => ({
          ...prev,
          [articleId]: isLiked ? currentLikes + 1 : currentLikes - 1
        }));
      }
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  // Comment functionality
  const handleComment = (articleId: string) => {
    // Navigate to article with comment section focused
    const articleSlug = authorArticles.find(a => a._id === articleId)?.slug;
    const slug = typeof articleSlug === 'string' ? articleSlug : 
                 typeof articleSlug === 'object' ? getLocalizedString(articleSlug) : articleId;
    window.location.href = `/${locale}/news/${slug}#comments`;
  };

  const authorName = getAuthorName();
  const displayArticles = showAllArticles ? authorArticles : authorArticles.slice(0, 3);

  return (
    <div className="w-full sm:py-0 lg:py-6">
      {/* Header Section - Twitter-style Profile */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border/50 py-4  z-10">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage 
              src={author.profileImage || author.avatar} 
              alt={authorName}
              className="object-cover"
              onError={() => setImageError(true)}
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {authorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">
              {authorName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {getLocalizedText(
                author?.role === 'admin' ? 'Senior Editor' : 
                author?.role === 'editor' ? 'Editor' : 'Contributor',
                author?.role === 'admin' ? 'អ្នកនិពន្ធជាន់ខ្ពស់' : 
                author?.role === 'editor' ? 'អ្នកនិពន្ធ' : 'អ្នកចូលរួម',
                locale
              )} • 
              {getLocalizedText(
                `Joined ${format(authorStats.joinDate, 'MMM yyyy')}`,
                `ចូលរួម ${format(authorStats.joinDate, 'MMM yyyy')}`,
                locale
              )}
            </p>
          </div>
          
          <div className="flex gap-2">
            <FollowButton
              userId={author._id}
              size="sm"
              className="px-3 py-1.5 text-sm font-medium"
            />
            <Button 
              variant="outline" 
              size="sm"
              className="px-3 py-1.5 text-sm font-medium"
            >
              <Mail className="w-3 h-3 mr-1" />
{getLocalizedText("Contact", "ទំនាក់ទំនង", locale)}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section - Twitter-style */}
      <div className="py-4 border-b border-border/50">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {authorStats.totalArticles}
            </div>
            <div className="text-xs text-muted-foreground">
              {getLocalizedText("Articles", "អត្ថបទ", locale)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {authorStats.totalViews.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {getLocalizedText("Views", "មើល", locale)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {authorStats.totalLikes.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {getLocalizedText("Likes", "ចូលចិត្ត", locale)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {authorStats.totalComments.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {getLocalizedText("Comments", "មតិ", locale)}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Articles - Twitter Feed Style */}
      <div className="divide-y divide-border/50">
        <div className="py-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {getLocalizedText("Recent Articles", "អត្ថបទថ្មីៗ", locale)}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllArticles(!showAllArticles)}
              className="text-muted-foreground hover:text-foreground"
            >
{showAllArticles ? 
                getLocalizedText("Show Less", "បង្ហាញតិច", locale) : 
                getLocalizedText(`View All (${authorArticles.length})`, `មើលទាំងអស់ (${authorArticles.length})`, locale)
              }
            </Button>
          </div>
        </div>
        
        <div className="divide-y divide-border/50">
          {displayArticles.map((article) => (
            <Link href={`/${locale}/news/${getLocalizedString(article.slug) || article._id}`} prefetch={true} key={article._id}>
              <div className={`group block py-4 hover:bg-muted/30 transition-colors ${
                article._id === currentArticleId ? 'bg-primary/5 border-l-4 border-l-primary' : ''
              }`}>
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    <Image
                      src={getArticleImageUrl(article) || '/placeholder.jpg'}
                      alt={getLocalizedString(article.title)}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm">
                        {getLocalizedString(article.title)}
                      </h3>
                      {article._id === currentArticleId && (
                        <Badge className="ml-2 bg-primary/10 text-primary text-xs">
                          {getLocalizedText("Current", "បច្ចុប្បន្ន", locale)}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(article.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                      {article.category && (
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{article.views.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLike(article._id);
                        }}
                        className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                          likedArticles.has(article._id) ? 'text-red-500' : ''
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${likedArticles.has(article._id) ? 'fill-current' : ''}`} />
                        <span>{(articleLikes[article._id] || article.likes).toLocaleString()}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleComment(article._id);
                        }}
                        className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>{article.comments.toLocaleString()}</span>
                      </button>
                    </div>
                  </div>
                  
                  <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Social Links - Twitter-style */}
      <div className="py-4 border-t border-border/50">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          {getLocalizedText("Connect", "តភ្ជាប់", locale)}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1 px-3 py-1.5 text-xs">
            <Twitter className="w-3 h-3" />
            <span>{getLocalizedText("Twitter", "Twitter", locale)}</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1 px-3 py-1.5 text-xs">
            <Linkedin className="w-3 h-3" />
            <span>{getLocalizedText("LinkedIn", "LinkedIn", locale)}</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1 px-3 py-1.5 text-xs">
            <Globe className="w-3 h-3" />
            <span>{getLocalizedText("Website", "គេហទំព័រ", locale)}</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 