'use client';

import type { Article, LocalizedString } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Bookmark, User, Calendar, Eye, MessageCircle, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LikeButton from '@/components/common/LikeButton';
import CommentSection from '@/components/comments/CommentSection';
import AdvancedShareComponent from '@/components/common/AdvancedShareComponent';
import AuthorMiniCard from '@/components/news/AuthorMiniCard';
import RelatedArticles from '@/components/news/RelatedArticles';
import ArticleAnalytics from '@/components/news/ArticleAnalytics';
import ArticleTableOfContents from '@/components/news/ArticleTableOfContents';
import { Badge } from '@/components/ui/badge';
import { formatArticleContent, extractContentInfo } from '@/lib/contentFormatter';
import { useState, useEffect } from 'react';
import { useId } from 'react';

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
  const shareId = useId();

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
  const contentInfo = extractContentInfo(rawContent);
  
  // Handle author display with fallbacks
  const getAuthorName = () => {
    if (author?.username) return author.username;
    if (author?.email) return author.email.split('@')[0]; // Use the part before @ if email exists
    return 'Anonymous';
  };
  
  const authorName = getAuthorName();
  const timeAgo = formatDistanceToNow(publishDate, { addSuffix: true });


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
              "inLanguage": locale === 'kh' ? 'km' : 'en',
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

      <div className="min-h-screen bg-white dark:bg-black">
        {/* Enterprise Analytics */}
        <ArticleAnalytics 
          articleId={article._id} 
          articleTitle={localizedTitle} 
          locale={locale} 
        />
        
        {/* Main Layout with Sidebar */}
        <div className="max-w-7xl mx-auto lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Back Navigation */}
              <div className="mb-6">
                <Button 
                  variant="ghost" 
                  className="text-gray-600 dark:text-gray-400"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to News
                </Button>
              </div>

              <article className="bg-white dark:bg-black rounded-lg overflow-hidden">
                {/* Hero Section */}
                <div className="relative w-full h-64 md:h-80 overflow-hidden">
                  {thumbnail && !imageError ? (
                    <Image
                      src={thumbnail}
                      alt={localizedTitle}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, 75vw"
                      onError={() => {
                        console.warn('Image failed to load:', thumbnail);
                        setImageError(true);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-black flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-600 dark:text-gray-400">{localizedTitle}</h2>
                      </div>
                    </div>
                  )}
                </div>

                {/* Article Header */}
                <div className=" py-6 border-b border-gray-200 dark:border-gray-700">
                  {/* Article Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.isBreaking && (
                      <Badge variant="destructive" className="text-xs">
                        Breaking News
                      </Badge>
                    )}
                    {article.isFeatured && (
                      <Badge variant="default" className="text-xs">
                        Featured
                      </Badge>
                    )}
                    {article.category && (
                      <Badge variant="secondary" className="text-xs">
                        {getLocalizedString(article.category.name, locale)}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-gray-900 dark:text-white">
                    {localizedTitle}
                  </h1>
                  
                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{authorName}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={publishDate.toISOString()}>
                        {format(publishDate, 'MMM d, yyyy')}
                      </time>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{Math.ceil(rawContent.split(/\s+/).length / 200)} min read</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>{article.views?.toLocaleString() || '0'} views</span>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {isClient && (
                        <LikeButton 
                          newsId={article._id}
                          size="sm"
                          variant="outline"
                          className="border-gray-300 dark:border-gray-600"
                        />
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-gray-300 dark:border-gray-600"
                      >
                        <Bookmark className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                    
                    {isClient && (
                      <AdvancedShareComponent
                        url={currentUrl}
                        title={localizedTitle}
                        description={rawContent.substring(0, 160)}
                        image={thumbnail}
                        variant="minimal"
                        size="sm"
                        showSocialCounts={false}
                        showQRCode={false}
                        showAnalytics={false}
                        platforms={['facebook', 'twitter', 'linkedin', 'whatsapp']}
                      />
                    )}
                  </div>
                </div>

                {/* Article Content */}
                <div className="py-6">
                  <div 
                    dangerouslySetInnerHTML={{ __html: formattedContent.html }}
                  />
                </div>

                {/* Author Section */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <AuthorMiniCard author={author} locale={locale} />
                </div>
              </article>

              {/* Comments Section */}
              <div className="mt-8 bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-red-600" />
                    Comments
                  </h3>
                </div>
                <div className="p-6">
                  {isClient && <CommentSection newsId={article._id} />}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                {/* Table of Contents */}
                {isClient && <ArticleTableOfContents content={rawContent} locale={locale} />}

                {/* Related Articles */}
                <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Articles</h3>
                  {isClient && (
                    <RelatedArticles 
                      currentArticle={article} 
                      locale={locale} 
                      limit={4} 
                    />
                  )}
                </div>

                {/* Share Section */}
                <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Share</h3>
                  {isClient && (
                    <AdvancedShareComponent
                      url={currentUrl}
                      title={localizedTitle}
                      description={rawContent.substring(0, 160)}
                      image={thumbnail}
                      variant="minimal"
                      size="sm"
                      showSocialCounts={true}
                      showQRCode={false}
                      showAnalytics={false}
                      platforms={['facebook', 'twitter', 'linkedin', 'whatsapp']}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}