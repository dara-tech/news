'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Article } from '@/types';
import { useOptimizedLanguage } from '@/hooks/useOptimizedLanguage';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { newsService } from '@/lib/newsService';
import { likeApi } from '@/lib/likeApi';
import { commentApi } from '@/lib/commentApi';
import { saveApi } from '@/lib/saveApi';
import { useWebSocket } from '@/hooks/useWebSocket';
import { config } from '@/lib/config';
import { useAuth } from '@/context/AuthContext';
import { 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  ThumbsUp,
  Camera,
  Globe,
  CheckCircle
} from 'lucide-react';
import Image from 'next/image';
import NextLink from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import LoadingSkeleton from './LoadingSkeleton';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';
import ScrollToTopButton from './ScrollToTopButton';

interface InfiniteScrollFeedProps {
  initialArticles: Article[];
  locale: 'en' | 'kh';
  onLoadMore?: (page: number) => Promise<Article[]>;
  hasMore?: boolean;
  className?: string;
  categoryId?: string;
  searchQuery?: string;
  sortBy?: 'createdAt' | 'views' | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
}


// Hybrid Social Media Post Component
interface HybridPostProps {
  article: Article;
  locale: 'en' | 'kh';
  index: number;
  isLast?: boolean;
}

const HybridPost = ({ article, locale, index, isLast }: HybridPostProps) => {
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(article.likes || 0);
  const [showFullContent, setShowFullContent] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentCount, setCommentCount] = useState(article.comments || 0);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Get author information with comprehensive fallbacks
  const getAuthorInfo = () => {
    const author = article.author;
    
    // Debug logging for first 8 posts
    if (index < 8) {
      console.log(`Post ${index + 1} author data`, {
        author,
        profileImage: (author as any)?.profileImage,
        avatar: author?.avatar,
        hasId: !!author?._id,
        hasName: !!author?.name,
        hasUsername: !!author?.username
      });
    }
    
    // If no author data at all
    if (!author) {
      return {
        name: 'Author',
        username: 'author',
        avatar: null,
        isVerified: false,
        initials: 'A',
        hasValidAuthor: false
      };
    }

    // Try to get a proper name from various fields
    let name = author.name;
    if (!name || name.trim() === '' || name === 'N' || name === 'News Team') {
      // Try username as fallback
      if (author.username && author.username.trim() !== '' && author.username !== '@Benjamin Linus') {
        name = author.username.replace('@', '');
      } else if (author.email) {
        // Use email prefix as fallback
        name = author.email.split('@')[0];
      } else {
        // Use a more generic fallback
        name = 'Author';
      }
    }
    
    const username = author.username || '@author';
    const avatar = (author as any).profileImage || author.avatar || null;
    const isVerified = author.role === 'admin' || author.role === 'editor' || author.role === 'moderator';
    
    // Generate initials
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
      initials,
      hasValidAuthor: true
    };
  };

  const authorInfo = getAuthorInfo();

  // Reset image states when article changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [article._id, index]);

  // Get user authentication
  const { user } = useAuth();

  // Helper function to deduplicate comments
  const deduplicateComments = (comments: any[]) => {
    const seen = new Set();
    return comments.filter(comment => {
      if (seen.has(comment._id)) {
        return false;
      }
      seen.add(comment._id);
      return true;
    });
  };

  // WebSocket options for real-time comments
  const wsOptions = useMemo(() => ({
    onCommentCreated: (newComment: any) => {
      setComments((prev: any[]) => {
        const updatedComments = [newComment, ...prev];
        return deduplicateComments(updatedComments);
      });
      setCommentCount(prev => prev + 1);
    },
    onCommentUpdated: (updatedComment: any) => {
      setComments((prev: any[]) => {
        const updatedComments = prev.map(comment => 
          comment._id === updatedComment._id ? updatedComment : comment
        );
        return deduplicateComments(updatedComments);
      });
    },
    onCommentDeleted: (commentId: string) => {
      setComments((prev: any[]) => {
        const updatedComments = prev.filter(comment => comment._id !== commentId);
        return deduplicateComments(updatedComments);
      });
      setCommentCount(prev => Math.max(0, prev - 1));
    },
    onCommentLiked: (updatedComment: any) => {
      setComments((prev: any[]) => {
        const updatedComments = prev.map(comment => 
          comment._id === updatedComment._id ? updatedComment : comment
        );
        return deduplicateComments(updatedComments);
      });
    },
    onStatsUpdated: (newStats: any) => {
      setCommentCount(newStats.comments || 0);
    },
    onError: (error: Error | string) => {
      setWsError(typeof error === 'string' ? error : error.message);
    }
  }), [deduplicateComments]);

  // Initialize WebSocket connection for real-time comments
  const { isConnected } = useWebSocket(article._id, wsOptions);

  // Load like status, comment count, and save status when component mounts
  useEffect(() => {
    const loadLikeStatus = async () => {
      try {
        const likeStatus = await likeApi.getLikeStatus(article._id);
        setLikeCount(likeStatus.count);
        setIsLiked(likeStatus.hasLiked);
      } catch (error) {
        console.error('Error loading like status:', error);
      }
    };

    const loadCommentCount = async () => {
      try {
        const commentStats = await commentApi.getCommentStats(article._id);
        setCommentCount(commentStats.data.totalComments);
      } catch (error) {
        console.error('Error loading comment count:', error);
      }
    };

    const loadSaveStatus = async () => {
      try {
        const saveStatus = await saveApi.getSaveStatus(article._id);
        setIsBookmarked(saveStatus.saved);
      } catch (error) {
        console.error('Error loading save status:', error);
      }
    };

    loadLikeStatus();
    loadCommentCount();
    loadSaveStatus();
  }, [article._id]);



  // Get localized content
  const getLocalizedTitle = () => {
    if (typeof article.title === 'string') return article.title;
    return article.title[locale] || article.title.en || article.title.kh || '';
  };

  const getLocalizedContent = () => {
    if (typeof article.content === 'string') return article.content;
    return article.content[locale] || article.content.en || article.content.kh || '';
  };

  const getLocalizedCategory = () => {
    if (!article.category) return '';
    if (typeof article.category.name === 'string') return article.category.name;
    return article.category.name[locale] || article.category.name.en || article.category.name.kh || '';
  };

  const getImageSrc = () => {
    let imageUrl = null;
    
    if (article.images && article.images.length > 0) {
      imageUrl = article.images[0];
    } else if (article.thumbnail) {
      imageUrl = article.thumbnail;
    }
    
    
    // If no valid image, return null
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      return null;
    }
    
    return imageUrl;
  };

  const getExcerpt = () => {
    const content = getLocalizedContent();
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText;
  };

  const getLocalizedDescription = () => {
    if (!article.description) return '';
    if (typeof article.description === 'string') return article.description;
    return article.description[locale] || article.description.en || article.description.kh || '';
  };

  const getDisplayContent = () => {
    const description = getLocalizedDescription();
    
    if (description.length <= 200) {
      return description;
    }
    
    if (showFullContent) {
      return description;
    }
    
    return description.substring(0, 200) + '...';
  };

  const shouldShowSeeMore = () => {
    const description = getLocalizedDescription();
    return description.length > 200;
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

  // Handle like functionality
  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      // Check if user is authenticated
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) {
        // Redirect to login for unauthenticated users
        window.location.href = `/${locale}/login`;
        return;
      }

      // Optimistically update UI
      const newLikeState = !isLiked;
      setIsLiked(newLikeState);
      setLikeCount(prev => newLikeState ? prev + 1 : Math.max(0, prev - 1));

      // Make API call to toggle like
      const response = await likeApi.toggleLike(article._id);
      
      // Update with actual response data
      if (response.success) {
        setLikeCount(response.count || likeCount);
        setIsLiked(response.liked || response.hasLiked || false);
      }
      
    } catch (error) {
      console.error('Error toggling like', error);
      // Revert state on error
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setIsLiking(false);
    }
  };

  // Handle save functionality
  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      // Check if user is authenticated
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) {
        // Redirect to login for unauthenticated users
        window.location.href = `/${locale}/login`;
        return;
      }

      // Optimistically update UI
      const newSaveState = !isBookmarked;
      setIsBookmarked(newSaveState);

      // Make API call to toggle save
      const response = await saveApi.toggleSave(article._id);
      
      // Update with actual response data
      if (response.success) {
        setIsBookmarked(response.saved);
      }
      
    } catch (error) {
      console.error('Error toggling save', error);
      // Revert state on error
      setIsBookmarked(!isBookmarked);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle comment functionality
  const handleCommentClick = async () => {
    if (!showComments) {
      // Load comments when opening comment section
      setIsLoadingComments(true);
      try {
        const response = await commentApi.getComments(article._id);
        const loadedComments = response.data || [];
        setComments(deduplicateComments(loadedComments));
        setCommentCount(loadedComments.length);
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setIsLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      console.log('No user found, redirecting to login');
      window.location.href = `/${locale}/login`;
      return;
    }

    if (!newComment.trim()) return;

    console.log('Submitting comment:', {
      newsId: article._id,
      content: newComment.trim(),
      user: user.username,
      userId: user._id
    });

    setIsSubmittingComment(true);
    setCommentError(null);
    try {
      const response = await commentApi.createComment(article._id, newComment.trim());
      console.log('Comment created successfully:', response);
      
      // Add comment to local state with deduplication
      setComments(prev => {
        const updatedComments = [response.data, ...prev];
        return deduplicateComments(updatedComments);
      });
      setCommentCount(prev => prev + 1);
      setNewComment('');
      setShowCommentForm(false);
    } catch (error: any) {
      console.error('Error creating comment:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Set user-friendly error message
      let errorMessage = 'Failed to create comment. Please try again.';
      let isTimeoutError = false;
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Comment created but response timed out. Please refresh to see your comment.';
        isTimeoutError = true;
        
        // For timeout errors, optimistically add the comment to local state
        // since it was likely created successfully on the backend
        const optimisticComment = {
          _id: `temp_${Date.now()}`,
          content: newComment.trim(),
          user: {
            _id: user._id,
            username: user.username,
            profileImage: user.profileImage,
            avatar: user.avatar
          },
          news: article._id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: [],
          isEdited: false,
          status: 'approved'
        };
        
        setComments(prev => {
          const updatedComments = [optimisticComment, ...prev];
          return deduplicateComments(updatedComments);
        });
        setCommentCount(prev => prev + 1);
        setNewComment('');
        setShowCommentForm(false);
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in to comment.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Comments are currently disabled.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (!isTimeoutError) {
        setCommentError(errorMessage);
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const title = getLocalizedTitle();
  const content = getLocalizedContent();
  const category = getLocalizedCategory();
  const imageSrc = getImageSrc();

  return (
    <Card className={` ${isLast ? '' : 'shadow-none p-0 border-gray-100 dark:border-gray-900  dark:bg-black rounded-none mb-none pb-none'} `}>
      <CardHeader className=" px-6 pt-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Author Avatar */}
            <div className="flex-shrink-0">
              <NextLink href={`/${locale}/author/${authorInfo.hasValidAuthor ? article.author?._id : article._id}`} className="block">
                <Avatar className="w-14 h-14 ring-2 ring-gray-100 dark:ring-gray-700 hover:ring-blue-300 dark:hover:ring-blue-600 transition-all duration-200 cursor-pointer">
                  <AvatarImage 
                    src={authorInfo.avatar} 
                    alt={authorInfo.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                    {authorInfo.initials}
                  </AvatarFallback>
                </Avatar>
              </NextLink>
            </div>
            
            {/* Author Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap mb-1">
                <NextLink href={`/${locale}/author/${authorInfo.hasValidAuthor ? article.author?._id : article._id}`} className="hover:underline">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                    {authorInfo.name}
                  </h3>
                </NextLink>
                {authorInfo.isVerified && (
                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
                <span className="text-gray-400 dark:text-gray-500 text-sm">•</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {formatTime(article.publishedAt || article.createdAt)}
                </span>
                {article.isBreaking && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {locale === 'kh' ? 'ព័ត៌មានបន្ទាន់' : 'BREAKING'}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">{category}</span>
                <span>•</span>
                <span>{article.views || 0} views</span>
                {authorInfo.hasValidAuthor && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {locale === 'kh' ? 'អ្នកសរសេរ' : 'Author'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* More Options */}
          <Button variant="ghost" size="icon" title="More options" className="w-8 h-8">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      {/* Post Content */}
      <CardContent className="pt-0 px-6 ">
        <NextLink href={`/${locale}/news/${article.slug}`} className="block group">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
            {title}
          </h2>
        </NextLink>
        
        {getDisplayContent() && (
          <div className="mb-5">
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              {getDisplayContent()}
            </p>
            {shouldShowSeeMore() && (
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-semibold mt-3 transition-colors hover:underline"
              >
                {showFullContent 
                  ? (locale === 'kh' ? 'បង្ហាញតិច' : 'See less') 
                  : (locale === 'kh' ? 'បង្ហាញបន្ថែម' : 'See more')
                }
              </button>
            )}
          </div>
        )}

        {/* Media */}
        {imageSrc && (
          <div className="relative rounded-xl overflow-hidden mb-5 bg-gray-100 dark:bg-gray-800 shadow-sm">
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm">Loading image...</span>
                </div>
              </div>
            )}
            {imageError ? (
              <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Camera className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Image not available</p>
                </div>
              </div>
            ) : (
              <Image
                src={imageSrc}
                alt={title}
                width={800}
                height={600}
                className={`w-full h-auto object-cover transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
            )}
            {/* Media type indicator */}
            <div className="absolute top-3 right-3">
              <div className="bg-black/60 backdrop-blur-sm rounded-full p-2 shadow-lg">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Category Tag */}
        {category && (
          <div className="mb-5">
            <Badge variant="secondary" className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium">
              <Globe className="w-3 h-3" />
              {category}
            </Badge>
          </div>
        )}
      </CardContent>


      {/* Action Buttons */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Like Button */}
            <Button
              onClick={handleLike}
              disabled={isLiking}
              variant="ghost"
              size="sm"
              className={`gap-2 px-3 py-2 h-8 ${isLiked ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              title={isLiked ? 'Unlike this post' : 'Like this post'}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">
                {isLiking ? '...' : likeCount > 0 ? likeCount : 'Like'}
              </span>
            </Button>

            {/* Comment Button */}
            <Button
              onClick={handleCommentClick}
              variant="ghost"
              size="sm"
              className={`gap-2 px-3 py-2 h-8 ${showComments ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              title="Add comment"
              disabled={isLoadingComments}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isLoadingComments ? '...' : commentCount > 0 ? commentCount : 'Comment'}
              </span>
            </Button>

            {/* Share Button */}
            <Button 
              variant="ghost"
              size="sm"
              className="gap-2 px-3 py-2 h-8 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={async () => {
                try {
                  if (navigator.share) {
                    await navigator.share({
                      title: title,
                      url: `${window.location.origin}/${locale}/news/${article.slug}`,
                    });
                  } else {
                    await navigator.clipboard.writeText(`${window.location.origin}/${locale}/news/${article.slug}`);
                    // You could show a toast notification here
                  }
                } catch (error) {
                  console.error('Error sharing', error);
                }
              }}
              title="Share this post"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </Button>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            variant="ghost"
            size="icon"
            className={`w-8 h-8 ${isBookmarked ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
          {isLoadingComments ? (
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <span>Loading comments...</span>
              </div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                </h4>
                {config.features.realTimeComments && (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {isConnected ? 'Live' : 'Offline'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Comment Form */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                {!showCommentForm ? (
                  <button
                    onClick={() => setShowCommentForm(true)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {user ? 'Write a comment...' : 'Sign in to comment'}
                    </span>
                  </button>
                ) : (
                  <form onSubmit={handleCommentSubmit} className="space-y-3">
                    <div className="flex space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage 
                          src={user?.profileImage || user?.avatar} 
                          alt={user?.username || 'User'}
                        />
                        <AvatarFallback className="text-xs">
                          {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                          rows={3}
                          disabled={isSubmittingComment}
                        />
                      </div>
                    </div>
                    {commentError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          {commentError}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowCommentForm(false);
                          setNewComment('');
                          setCommentError(null);
                        }}
                        disabled={isSubmittingComment}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!newComment.trim() || isSubmittingComment}
                      >
                        {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments.map((comment, index) => (
                  <div key={`${comment._id}-${index}`} className="flex space-x-3">
                    <Avatar className="w-7 h-7">
                      <AvatarImage 
                        src={comment.user.profileImage || comment.user.avatar} 
                        alt={comment.user.username}
                      />
                      <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
                        {comment.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {comment.user.username}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-4">
                <MessageCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  No comments yet
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Be the first to share your thoughts
                </p>
              </div>
              
              {/* Comment Form for empty state */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                {!showCommentForm ? (
                  <button
                    onClick={() => setShowCommentForm(true)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {user ? 'Write a comment...' : 'Sign in to comment'}
                    </span>
                  </button>
                ) : (
                  <form onSubmit={handleCommentSubmit} className="space-y-3">
                    <div className="flex space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage 
                          src={user?.profileImage || user?.avatar} 
                          alt={user?.username || 'User'}
                        />
                        <AvatarFallback className="text-xs">
                          {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                          rows={3}
                          disabled={isSubmittingComment}
                        />
                      </div>
                    </div>
                    {commentError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          {commentError}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowCommentForm(false);
                          setNewComment('');
                          setCommentError(null);
                        }}
                        disabled={isSubmittingComment}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!newComment.trim() || isSubmittingComment}
                      >
                        {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
          
          {/* WebSocket Error Display */}
          {wsError && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                {wsError}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};


const InfiniteScrollFeed = ({
  initialArticles,
  locale,
  onLoadMore,
  hasMore = true,
  className = '',
  categoryId,
  searchQuery,
  sortBy = 'createdAt' as const,
  sortOrder = 'desc' as const
}: InfiniteScrollFeedProps) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { language } = useOptimizedLanguage();
  
  // Use the optimized language for consistency
  const effectiveLocale = language as 'en' | 'kh';

  // Create fetch function for infinite scroll
  const fetchMore = useCallback(async (page: number): Promise<Article[]> => {
    if (onLoadMore) {
      return onLoadMore(page);
    }

    try {
      // Clear cache for first page to ensure fresh data
      if (page === 1) {
        newsService.clearCache();
      }
      
      let response;
      if (searchQuery) {
        response = await newsService.searchNews(searchQuery, effectiveLocale, page);
      } else if (categoryId) {
        response = await newsService.getNewsByCategory(categoryId, effectiveLocale, page);
      } else {
        response = await newsService.getNews({
          lang: effectiveLocale,
          page,
          limit: 20, // Increased limit for better performance
          sortBy,
          sortOrder
        });
      }
      
      // Update hasMore based on API response
      if (response.hasMore !== undefined) {
        // The hasMore logic is now handled in newsService
        console.log('API response hasMore', response.hasMore, 'for page', page);
      }
      
      return response.news;
    } catch (error) {
      console.error('Error fetching more articles', error);
      return [];
    }
  }, [onLoadMore, searchQuery, categoryId, effectiveLocale, sortBy, sortOrder]);

  // Use infinite scroll hook - always allow infinite loading
  const {
    data: articles,
    loading,
    error,
    hasMore: hasMoreData,
    loadMore,
    refresh,
    loadingRef
  } = useInfiniteScroll({
    initialData: initialArticles,
    fetchMore,
    hasMore: true // Always true for infinite scroll
  });


  // Scroll to top handler
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 1000);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Clear cache and debug initial articles
  useEffect(() => {
    // Clear cache on component mount to ensure fresh data
    newsService.clearCache();
    
    if (articles.length > 0) {
      console.log('Initial articles loaded', articles.length);
      
      // Debug first 8 articles
      articles.slice(0, 8).forEach((article, index) => {
        console.log(`Article ${index + 1} author data`, {
          id: article._id,
          author: article.author,
          profileImage: (article.author as any)?.profileImage,
          avatar: article.author?.avatar,
          hasAuthor: !!article.author,
          hasAuthorId: !!article.author?._id
        });
      });
    }
  }, [articles]);

  // Memoize hybrid posts to prevent unnecessary re-renders
  const hybridPosts = useMemo(() => 
    articles.map((article, index) => (
      <HybridPost
        key={`${article._id}-${index}`}
              article={article}
        locale={effectiveLocale}
              index={index}
              isLast={index === articles.length - 1}
            />
    )), [articles, effectiveLocale]
  );


  return (
    <div className={` ${className}`}>
      {/* Error State */}
      {error && (
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
            <ErrorState
              error={error}
              onRetry={refresh}
            />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Social Media Feed */}
      <div className="space-y-4">
        {articles.length > 0 ? (
          <>
            {/* Posts Feed */}
            <div className="space-y-4">
              {hybridPosts}
            </div>
            
            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {effectiveLocale === 'kh' ? 'កំពុងផ្ទុកបន្ថែម...' : 'Loading more posts...'}
                  </span>
                </div>
              </div>
            )}
          </>
        ) : !loading ? (
          <Card>
            <CardContent className="p-8">
            <EmptyState
              searchQuery={searchQuery}
              onRefresh={refresh}
            />
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Loading Trigger */}
      <div ref={loadingRef} className="mt-6">
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-3">
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
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTopButton
        show={showScrollTop}
        onClick={scrollToTop}
      />

    </div>
  );
};

export default InfiniteScrollFeed;
