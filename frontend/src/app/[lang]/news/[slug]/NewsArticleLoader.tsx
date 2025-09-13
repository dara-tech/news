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
import { Badge } from '@/components/ui/badge';
import { formatArticleContent, extractContentInfo } from '@/lib/contentFormatter';
import { useState, useEffect } from 'react';

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

      <div className="min-h-screen">
        {/* Enterprise Analytics */}
        <ArticleAnalytics 
          articleId={article._id} 
          articleTitle={localizedTitle} 
          locale={locale} 
        />
        

      <div className="max-w-4xl mx-auto px-4 sm:px-4 lg:px-8">
        {/* Back Navigation */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="group hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to News
          </Button>
        </div>

        <article className="overflow-hidden">
        {/* Hero Section with Enhanced Thumbnail */}
        <div className="relative w-full h-80 md:h-[500px] overflow-hidden mb-8 rounded-2xl shadow-2xl">
          {thumbnail && !imageError ? (
            <Image
              src={thumbnail}
              alt={localizedTitle}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
              sizes="(max-width: 768px) 100vw, 75vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-600 dark:text-gray-400">{localizedTitle}</h2>
                <p className="text-gray-500 dark:text-gray-500">Article Image</p>
              </div>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Floating Action Bar */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white text-gray-800 backdrop-blur-sm"
            >
              <Bookmark className="w-4 h-4 mr-1" />
              Save
            </Button>
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
          </div>
        </div>

          {/* Content Section */}
          <div className="space-y-8">
            {/* Title Section */}
            <div className="relative">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {localizedTitle}
              </h1>
              
              {/* Article Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {article.isBreaking && (
                  <Badge variant="destructive">
                     Breaking News
                  </Badge>
                )}
                {article.isFeatured && (
                  <Badge variant="default">
                     Featured
                  </Badge>
                )}
                {article.category && (
                  <Badge variant="secondary">
                    {getLocalizedString(article.category.name, locale)}
                  </Badge>
                )}
              </div>
              
              {/* Enhanced Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {authorName}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <time dateTime={publishDate.toISOString()} className="font-medium text-gray-700 dark:text-gray-300">
                    {format(publishDate, 'MMMM d, yyyy')}
                  </time>
                  <span className="text-xs opacity-75">({timeAgo})</span>
                </div>

                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">5 min read</span>
                </div>

                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {article.views?.toLocaleString() || '0'} views
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <LikeButton 
                    newsId={article._id}
                    size="sm"
                    variant="ghost"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    onLikeChange={(liked, newCount) => {
                      // Track like behavior
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Enterprise Action Bar */}
            <div className="sticky top-20 z-40 flex items-center justify-between py-4 px-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {locale === 'kh' ? 'ចែករំលែក' : 'Share this article'}:
                </span>
                <AdvancedShareComponent
                  url={currentUrl}
                  title={localizedTitle}
                  description={rawContent.substring(0, 160)}
                  image={thumbnail}
                  variant="minimal"
                  size="sm"
                  showSocialCounts={true}
                  showQRCode={true}
                  showAnalytics={true}
                  platforms={['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'email']}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <LikeButton 
                  newsId={article._id}
                  size="sm"
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onLikeChange={(liked, newCount) => {
                    // Track like behavior
                    fetch('/api/recommendations/track-behavior', {
                      method: 'POST',
                      credentials: 'include',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'article_like',
                        data: { articleId: article._id, liked, count: newCount }
                      })
                    }).catch(console.error);
                  }}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                  onClick={() => {
                    // Track save behavior
                    fetch('/api/recommendations/track-behavior', {
                      method: 'POST',
                      credentials: 'include',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'article_save',
                        data: { articleId: article._id, timestamp: new Date().toISOString() }
                      })
                    }).catch(console.error);
                  }}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  {locale === 'kh' ? 'រក្សាទុក' : 'Save'}
                </Button>
                
                {/* Reading Stats */}
                <div className="hidden md:flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 ml-4 pl-4 border-l border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{article.views?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{Math.ceil(rawContent.split(/\s+/).length / 200)} {locale === 'kh' ? 'នាទី' : 'min'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="relative">
              <div 
                className={cn(
                  'prose dark:prose-invert prose-lg max-w-none',
                  'prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-white',
                  'prose-h1:text-3xl prose-h1:mb-8 prose-h1:mt-12 prose-h1:bg-gradient-to-r prose-h1:from-gray-900 prose-h1:to-gray-700 prose-h1:dark:from-white prose-h1:dark:to-gray-300 prose-h1:bg-clip-text prose-h1:text-transparent',
                  'prose-h2:text-2xl prose-h2:mb-6 prose-h2:mt-10 prose-h2:text-gray-800 dark:prose-h2:text-gray-200',
                  'prose-h3:text-xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-gray-700 dark:prose-h3:text-gray-300',
                  'prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-lg prose-p:mb-6',
                  'prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline prose-a:font-medium prose-a:transition-colors',
                  'prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:dark:bg-blue-900/20 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:my-8',
                  'prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-gray-200 dark:prose-img:border-gray-700 prose-img:my-8',
                  'prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-blue-500 prose-li:mb-2',
                  'prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono',
                  'prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700 prose-pre:rounded-lg prose-pre:overflow-x-auto',
                  'prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold',
                  'prose-em:text-gray-600 dark:prose-em:text-gray-400'
                )}
                dangerouslySetInnerHTML={{ __html: formattedContent.html }}
              />
              
              {/* Content End Marker */}
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Author Card Section */}
            <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <AuthorMiniCard author={author} locale={locale} />
              </div>
            </div>

            {/* Real Related Articles Section */}
            <RelatedArticles 
              currentArticle={article} 
              locale={locale} 
              limit={6} 
            />
          </div>
        </article>

        {/* Enhanced Comment Section */}
        <div className="mt-12">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
                {locale === 'kh' ? 'មតិយោបល់' : 'Comments'}
              </h3>
            </div>
            <div className="p-6">
              <CommentSection newsId={article._id} />
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            size="sm"
          >
            <ArrowLeft className="w-5 h-5 rotate-90" />
          </Button>
        </div>
      </div>
      </div>
    </>
  );
}