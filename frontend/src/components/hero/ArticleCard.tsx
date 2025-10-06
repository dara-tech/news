'use client';

import React, { useState, useCallback } from 'react';
// Removed framer-motion import for static layout
import { Clock, Eye, MessageCircle, TrendingUp, Heart, Bookmark, Share2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/types';
import { useOptimizedLanguage } from '@/hooks/useOptimizedLanguage';
import { useArticleLikes } from '@/hooks/useArticleLikes';
import { useArticleComments } from '@/hooks/useArticleComments';
import CommentSection from '@/components/comments/CommentSection';

interface ArticleCardProps {
  article: Article;
  locale: 'en' | 'kh';
  index: number;
  isLast?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, locale, index, isLast }) => {
  const { language, formatTime } = useOptimizedLanguage();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCommented, setIsCommented] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  // Use the like hook for real backend integration
  const { likeCount: hookLikeCount, isLiked, isLoading: likeLoading, toggleLike, error: likeError } = useArticleLikes({
    article,
    locale: language,
    initialCount: article.likes || 0
  });

  // Use the comment hook for real backend integration
  const { commentCount: hookCommentCount, isLoading: commentLoading, error: commentError, refreshCommentCount } = useArticleComments({
    article,
    locale: language
  });

  // Check if user is authenticated to determine data source
  const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('userInfo');
  
  // For authenticated users, use hook data for real-time updates
  // For unauthenticated users, use article data for consistency
  const likeCount = isAuthenticated && hookLikeCount !== undefined ? hookLikeCount : (article.likes || 0);
  const commentCount = isAuthenticated && hookCommentCount !== undefined ? hookCommentCount : (article.comments || 0);
  
  // Local state for other interactions (not yet implemented in backend)
  const [saveCount, setSaveCount] = useState(0);

  // Removed framer-motion variants for static layout

  const handleLike = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated before attempting to like
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      // Redirect to register page for unauthenticated users
      window.location.href = `/${locale}/register`;
      return;
    }
    
    await toggleLike();
  }, [toggleLike, locale]);

  const handleComment = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated before attempting to comment
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      // Redirect to register page for unauthenticated users
      window.location.href = `/${locale}/register`;
      return;
    }
    
    // Toggle comment section visibility
    const newShowComments = !showComments;
    setShowComments(newShowComments);
    
    // If showing comments, refresh the comment count
    if (newShowComments) {
      await refreshCommentCount();
    }
  }, [showComments, locale, refreshCommentCount]);

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated before attempting to save
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      // Redirect to register page for unauthenticated users
      window.location.href = `/${locale}/register`;
      return;
    }
    
    // For now, just toggle local state - implement save API later
    setIsBookmarked(!isBookmarked);
    setSaveCount(prev => isBookmarked ? prev - 1 : prev + 1);
  }, [isBookmarked, locale]);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (navigator.share) {
        await navigator.share({
          title: typeof article.title === 'string' ? article.title : article.title.en || article.title.kh || '',
          url: `/${language}/news/${article.slug}`,
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/${language}/news/${article.slug}`);
      }
    } catch (error) {
      console.error('Error sharing', error);
    }
  }, [article.title, article.slug, language]);

  // Get localized title
  const getLocalizedTitle = () => {
    if (typeof article.title === 'string') return article.title;
    return article.title[language] || article.title.en || article.title.kh || '';
  };

  // Get localized category name
  const getLocalizedCategoryName = () => {
    if (!article.category) return '';
    if (typeof article.category.name === 'string') return article.category.name;
    return article.category.name[language] || article.category.name.en || article.category.name.kh || '';
  };

  // Get image source from available fields
  const getImageSrc = () => {
    // Check for images array first
    if (article.images && article.images.length > 0) {
      return article.images[0];
    }
    
    // Check for thumbnail field
    if (article.thumbnail) {
      return article.thumbnail;
    }
    
    // No fallback image
    return null;
  };

  // Get excerpt from content
  const getExcerpt = () => {
    if (!article.content) return '';
    
    let content = '';
    if (typeof article.content === 'string') {
      content = article.content;
    } else {
      content = article.content[language] || article.content.en || article.content.kh || '';
    }
    
    // Remove HTML tags and get first 150 characters
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };

  const imageSrc = getImageSrc();
  const title = getLocalizedTitle();
  const categoryName = getLocalizedCategoryName();
  const excerpt = getExcerpt();

  return (
    <article
      className={`group relative bg-card dark:bg-black border border-border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col ${isLast ? 'mb-20' : 'mb-4'}`}
    >
      {/* Trending Badge */}
      {index < 3 && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            #{index + 1}
          </div>
        </div>
      )}

      {/* Image */}
      <div className="relative flex-1 min-h-[500px] overflow-hidden">
        {imageSrc && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse" />
            )}
            <Image
              src={imageSrc}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-all duration-300 group-hover:scale-105"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              priority={index < 2}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">📰</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">No image</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatTime(new Date(article.createdAt))}</span>
          </div>
          {article.views && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{article.views.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <Link 
          href={`/${language}/news/${article.slug}`}
          prefetch={true}
        >
          <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-tight mb-2">
            {title}
          </h2>
        </Link>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {excerpt}
          </p>
        )}

        {/* Category */}
        {article.category && categoryName && (
          <div className="mb-3">
            <span className="inline-block bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
              {categoryName}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-1 text-xs font-medium transition-colors duration-200 ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <Heart 
                className={`w-4 h-4 ${
                  isLiked ? 'fill-current' : ''
                }`} 
              />
              <span>{likeCount}</span>
            </button>
            
            <button
              onClick={handleComment}
              className={`flex items-center gap-1 text-xs font-medium transition-colors duration-200 ${
                showComments 
                  ? 'text-blue-500 hover:text-blue-600' 
                  : 'text-muted-foreground hover:text-blue-500'
              }`}
            >
              <MessageCircle 
                className={`w-4 h-4 ${
                  showComments ? 'fill-current' : ''
                }`} 
              />
              <span>{commentCount}</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-blue-500 transition-colors duration-200"
            >
              <Share2 className="w-4 h-4" />
              <span>{language === 'kh' ? 'ចែករំលែក' : 'Share'}</span>
            </button>
          </div>

          <button
            onClick={handleSave}
            title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
            className={`transition-colors duration-200 ${
              isBookmarked 
                ? 'text-amber-500 hover:text-amber-600' 
                : 'text-muted-foreground hover:text-amber-500'
            }`}
          >
            <Bookmark 
              className={`w-4 h-4 ${
                isBookmarked ? 'fill-current' : ''
              }`} 
            />
          </button>
        </div>

        {/* Comment Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="max-h-96 overflow-y-auto scrollbar-hide">
              <CommentSection 
                newsId={article._id} 
                className=""
                onCommentCreated={refreshCommentCount}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default ArticleCard;
