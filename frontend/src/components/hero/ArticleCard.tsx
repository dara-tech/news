'use client';

import React, { useState, useCallback } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Clock, Eye, MessageCircle, TrendingUp, Heart, Bookmark, Share2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOptimizedLanguage } from '@/hooks/useOptimizedLanguage';
import { useArticleLikes } from '@/hooks/useArticleLikes';

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
  
  // Use the like hook for real backend integration
  const { likeCount, isLiked, isLoading: likeLoading, toggleLike, error: likeError } = useArticleLikes({
    article,
    locale: language
  });
  
  // Local state for other interactions (not yet implemented in backend)
  const [commentCount, setCommentCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);

  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut"
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

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

  const handleComment = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated before attempting to comment
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      // Redirect to register page for unauthenticated users
      window.location.href = `/${locale}/register`;
      return;
    }
    
    // For now, just toggle local state - implement comment API later
    setIsCommented(!isCommented);
    setCommentCount(prev => isCommented ? prev - 1 : prev + 1);
  }, [isCommented, locale]);

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
      console.error('Error sharing:', error);
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
    
    // Fallback test image for debugging
    return `https://picsum.photos/800/600?random=${article._id || Math.random()}`;
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
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`group relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${isLast ? 'mb-20' : 'mb-6'}`}
    >
      {/* Trending Badge */}
      {index < 3 && (
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
            <TrendingUp className="w-3 h-3 mr-1" />
            {language === 'kh' ? 'ពេញនិយម' : 'Trending'}
          </Badge>
        </div>
      )}

      {/* Image Section - Full Width */}
      <div className="relative w-full h-80 overflow-hidden bg-muted">
        {imageSrc && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-muted/80 to-muted animate-pulse" />
            )}
            <Image
              src={imageSrc}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-all duration-700 group-hover:scale-105"
              onLoad={() => {
                console.log('Image loaded successfully:', imageSrc);
                setImageLoaded(true);
              }}
              onError={(e) => {
                console.error('Image failed to load:', imageSrc, e);
                setImageError(true);
              }}
              priority={index < 2}
              unoptimized={true}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-muted/50 to-secondary/20 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-2 bg-muted rounded-full flex items-center justify-center">
                📰
              </div>
              <p className="text-sm">{language === 'kh' ? 'គ្មានរូបភាព' : 'No Image'}</p>
              {imageSrc && (
                <p className="text-xs mt-1 opacity-60 break-all max-w-xs">
                  {imageSrc}
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Category Badge */}
        {article.category && categoryName && (
          <div className="absolute bottom-4 left-4">
            <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30">
              {categoryName}
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Meta Information */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <time>{formatTime(new Date(article.createdAt))}</time>
          </div>
          {article.views && (
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{article.views.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{Math.floor(Math.random() * 50)}</span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/${language}/news/${article.slug}`}>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-3 leading-tight">
            {title}
          </h2>
        </Link>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-muted-foreground line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag, tagIndex) => (
              <Badge
                key={tagIndex}
                variant="outline"
                className="text-xs hover:bg-primary/10 hover:border-primary/50 transition-colors cursor-pointer"
              >
                #{tag}
              </Badge>
            ))}
            {article.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{article.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Minimal Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLike}
              disabled={likeLoading}
              title={likeError || (isLiked ? 'Unlike this article' : 'Like this article')}
              className={`group transition-all duration-200 ${
                isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'
              } ${likeError ? 'opacity-50' : ''}`}
            >
              <Heart 
                className={`w-4 h-4 mr-1.5 transition-all duration-200 ${
                  isLiked ? 'fill-current' : ''
                }`} 
              />
              <span className="text-sm font-medium">{likeCount}</span>
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleComment}
              className={`group transition-all duration-200 ${
                isCommented ? 'text-blue-500 hover:text-blue-600' : 'text-muted-foreground hover:text-blue-500'
              }`}
            >
              <MessageCircle 
                className={`w-4 h-4 mr-1.5 transition-all duration-200 ${
                  isCommented ? 'fill-current' : ''
                }`} 
              />
              <span className="text-sm font-medium">{commentCount}</span>
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleShare}
              className="text-muted-foreground hover:text-blue-500 transition-colors duration-200 group"
            >
              <Share2 className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm font-medium">
                {language === 'kh' ? 'ចែករំលែក' : 'Share'}
              </span>
            </Button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            className={`transition-all duration-200 ${
              isBookmarked ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground hover:text-amber-500'
            }`}
          >
            <Bookmark 
              className={`w-4 h-4 transition-all duration-200 ${
                isBookmarked ? 'fill-current' : ''
              }`} 
            />
          </Button>
        </div>
      </div>
    </motion.article>
  );
};

export default ArticleCard;
