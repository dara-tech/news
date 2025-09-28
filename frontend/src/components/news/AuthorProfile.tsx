'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

  

  return (
    <div className="w-full sm:py-0 lg:py-6">
      {/* Header Section - Twitter-style Profile */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border/50 p-4 z-10">
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
              {author?.role === 'admin' ? 'Senior Editor' : 
               author?.role === 'editor' ? 'Editor' : 'Contributor'} • 
              Joined {format(authorStats.joinDate, 'MMM yyyy')}
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
              Contact
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section - Twitter-style */}
      <div className="p-4 border-b border-border/50">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {authorStats.totalArticles}
            </div>
            <div className="text-xs text-muted-foreground">Articles</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {authorStats.totalViews.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Views</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {authorStats.totalLikes.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Likes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {authorStats.totalComments.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Comments</div>
          </div>
        </div>
      </div>

      {/* Recent Articles - Twitter Feed Style */}
      <div className="divide-y divide-border/50">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Articles
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllArticles(!showAllArticles)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showAllArticles ? 'Show Less' : `View All (${authorArticles.length})`}
            </Button>
          </div>
        </div>
        
        <div className="divide-y divide-border/50">
          {displayArticles.map((article) => (
            <div
              key={article._id}
              className={`group p-4 hover:bg-muted/30 transition-colors ${
                article._id === currentArticleId ? 'bg-primary/5 border-l-4 border-l-primary' : ''
              }`}
            >
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
                        Current
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
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{article.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{article.comments.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Links - Twitter-style */}
      <div className="p-4 border-t border-border/50">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Connect
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1 px-3 py-1.5 text-xs">
            <Twitter className="w-3 h-3" />
            <span>Twitter</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1 px-3 py-1.5 text-xs">
            <Linkedin className="w-3 h-3" />
            <span>LinkedIn</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1 px-3 py-1.5 text-xs">
            <Globe className="w-3 h-3" />
            <span>Website</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 