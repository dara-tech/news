'use client';

import React, { useState, useEffect } from 'react';
import type { Article, LocalizedString } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Bookmark, User, Calendar, Eye, MessageCircle, ArrowLeft, Clock, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CommentSection from '@/components/comments/CommentSection';
import AuthorMiniCard from '@/components/news/AuthorMiniCard';
import ArticleAnalytics from '@/components/news/ArticleAnalytics';
import { formatArticleContent } from '@/lib/contentFormatter';
import TwitterLikeLayout from '@/components/hero/TwitterLikeLayout';
import { useArticleLikes } from '@/hooks/useArticleLikes';

interface NewsArticleProps {
  article: Article;
  locale: 'en' | 'kh';
}

// Helper function to safely get localized string
const getLocalizedString = (str: string | LocalizedString | undefined, locale: 'en' | 'kh'): string => {
  if (!str) return '';
  if (typeof str === 'string') return str;
  return str[locale] || str.en || '';
};

export default function NewsArticleLoader({ article, locale }: NewsArticleProps) {
  const { title, content, author, createdAt, thumbnail } = article;
  const [imageError, setImageError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isClient, setIsClient] = useState(false);
  // Use the like hook for real backend integration
  const { likeCount, isLiked, isLoading: likeLoading, toggleLike } = useArticleLikes({
    article,
    locale
  });

  // Set client-side values after hydration
  useEffect(() => {
    setIsClient(true);
    setCurrentUrl(window.location.href);
  }, []);

  // Safely handle localized strings with fallbacks
  const localizedTitle = getLocalizedString(title, locale);
  const rawContent = getLocalizedString(content, locale);
  const publishDate = new Date(createdAt);
  
  // Format content for better readability
  const formattedContent = formatArticleContent(rawContent);
  
  // Handle author display with fallbacks
  const getAuthorName = () => {
    if (author?.username) return author.username;
    if (author?.email) return author.email.split('@')[0]; // Use the part before @ if email exists
    return 'Anonymous';
  };
  
  const authorName = getAuthorName();

  // Create a custom main content component for the article
  const ArticleMainContent = () => (
    <div className="px-1">
      {/* Minimal Header Navigation */}
      <div className="lg:hidden ">
        <Button 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground hover:text-foreground -ml-3"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {locale === 'kh' ? 'ត្រលប់' : 'Back'}
        </Button>
      </div>

      <article className="space-y-8 lg:py-8">
        {/* Article Metadata */}
        <div className="space-y-6">
          {/* Category & Badges */}
          {(article.category || article.isBreaking || article.isFeatured) && (
            <div className="flex items-center gap-3">
              {article.category && (
                <span className="text-sm font-medium text-primary">
                  {getLocalizedString(article.category.name, locale)}
                </span>
              )}
              {article.isBreaking && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                  {locale === 'kh' ? 'ពិសេស' : 'Breaking'}
                </span>
              )}
              {article.isFeatured && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {locale === 'kh' ? 'លេចធ្លោ' : 'Featured'}
                </span>
              )}
            </div>
          )}
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-foreground">
            {localizedTitle}
          </h1>
          
          {/* Byline */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{authorName}</span>
            <span>•</span>
            <time dateTime={publishDate.toISOString()}>
              {format(publishDate, 'MMM d, yyyy')}
            </time>
            <span>•</span>
            <span>{Math.ceil(rawContent.split(/\s+/).length / 200)} {locale === 'kh' ? 'នាទីអាន' : 'min read'}</span>
          </div>
        </div>

        {/* Hero Image */}
        {thumbnail && !imageError && (
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
            <Image
              src={thumbnail}
              alt={localizedTitle}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 896px"
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
          <div dangerouslySetInnerHTML={{ __html: formattedContent.html }} />
        </div>

        {/* Article Actions */}
        <div className="flex items-center justify-between py-6 border-t border-border">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleLike}
              disabled={likeLoading}
              className={`px-3 py-2 rounded-full transition-colors ${
                isLiked 
                  ? 'text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900' 
                  : 'text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950'
              }`}
            >
              <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {likeCount}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="px-3 py-2 rounded-full text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {locale === 'kh' ? 'មតិយោបល់' : 'Comment'}
            </Button>

            <Button 
              variant="ghost" 
              size="sm"
              className="px-3 py-2 rounded-full text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              {locale === 'kh' ? 'រក្សាទុក' : 'Save'}
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="px-3 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {locale === 'kh' ? 'ចែករំលែក' : 'Share'}
          </Button>
        </div>

        {/* Author Card */}
        <div className="py-6 border-t border-border">
          <AuthorMiniCard author={author} locale={locale} />
        </div>

        {/* Comments */}
        <div className="py-6 border-t border-border">
          {isClient && <CommentSection newsId={article._id} />}
        </div>
      </article>
    </div>
  );

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: localizedTitle,
          url: currentUrl,
        });
      } else {
        await navigator.clipboard.writeText(currentUrl);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <>
      {/* Enterprise SEO Structured Data */}
      {isClient && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": localizedTitle,
              "description": getLocalizedString(article.description, locale),
              "image": thumbnail ? [thumbnail] : [],
              "datePublished": publishDate.toISOString(),
              "dateModified": new Date(article.updatedAt).toISOString(),
              "author": {
                "@type": "Person",
                "name": authorName,
                "url": author?.email ? `mailto:${author.email}` : undefined
              },
              "publisher": {
                "@type": "Organization",
                "name": "Razewire",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${window.location.origin}/logo.png`
                }
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": currentUrl
              },
              "articleSection": getLocalizedString(article.category?.name, locale),
              "keywords": article.keywords || article.tags?.join(', '),
              "wordCount": rawContent.split(/\s+/).length,
              "timeRequired": `PT${Math.ceil(rawContent.split(/\s+/).length / 200)}M`,
              "inLanguage": locale === 'kh' ? 'kh' : 'en',
              "isAccessibleForFree": true,
              "genre": "News",
              "about": {
                "@type": "Thing",
                "name": getLocalizedString(article.category?.name, locale)
              }
            })
          }}
        />
      )}

        {/* Enterprise Analytics */}
        <ArticleAnalytics 
          articleId={article._id} 
          articleTitle={localizedTitle} 
          locale={locale} 
        />
        
      {/* Use TwitterLikeLayout with custom main content */}
      <TwitterLikeLayout
        breaking={[]}
        featured={[]}
        latestNews={[]}
        categories={[]}
                      locale={locale} 
        customMainContent={<ArticleMainContent />}
      />
    </>
  );
}