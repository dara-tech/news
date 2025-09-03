'use client';

import type { Article, LocalizedString } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Bookmark, User, Calendar, Eye, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LikeButton from '@/components/common/LikeButton';
import CommentSection from '@/components/comments/CommentSection';
import AdvancedShareComponent from '@/components/common/AdvancedShareComponent';
import AuthorMiniCard from '@/components/news/AuthorMiniCard';
import { formatArticleContent, extractContentInfo } from '@/lib/contentFormatter';
import { useState } from 'react';

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
    <div className="min-h-screen">
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
          {/* Hero Section with Clean Thumbnail */}
          <div className="relative w-full h-80 md:h-[500px] overflow-hidden mb-8">
            {thumbnail && !imageError ? (
              <Image
                src={thumbnail}
                alt={localizedTitle}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 75vw"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4 text-gray-600 dark:text-gray-400">{localizedTitle}</h2>
                  <p className="text-gray-500 dark:text-gray-500">Article Image</p>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="space-y-8">
            {/* Title Section */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6 tracking-tight">
                {localizedTitle}
              </h1>
              
              {/* Clean Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
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
                      console.log(`Article ${liked ? 'liked' : 'unliked'}, new count: ${newCount}`);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Clean Action Bar */}
            <div className="flex items-center justify-between py-6 p-4 rounded border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share this article:</span>
                <AdvancedShareComponent
                  url={typeof window !== 'undefined' ? window.location.href : ''}
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
              
              <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                <Bookmark className="w-4 h-4 mr-2" />
                Save for later
              </Button>
            </div>

            {/* Article Content */}
            <div 
              className={cn(
                'prose dark:prose-invert prose-lg max-w-none',
                'prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-white',
                'prose-h1:text-3xl prose-h1:mb-8 prose-h1:mt-12',
                'prose-h2:text-2xl prose-h2:mb-6 prose-h2:mt-10',
                'prose-h3:text-xl prose-h3:mb-4 prose-h3:mt-8',
                'prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-lg',
                'prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline prose-a:font-medium',
                'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600 prose-blockquote:pl-6 prose-blockquote:py-4',
                'prose-img:rounded-lg prose-img:border prose-img:border-gray-200 dark:prose-img:border-gray-700',
                'prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-gray-400',
                'prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm',
                'prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700',
                'prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold',
                'prose-em:text-gray-600 dark:prose-em:text-gray-400'
              )}
              dangerouslySetInnerHTML={{ __html: formattedContent.html }}
            />

            {/* Minimalist Author Card Section */}
            <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
              <AuthorMiniCard author={author} locale={locale} />
            </div>
          </div>
        </article>

        {/* Comment Section */}
        <div className="mt-12">
          <CommentSection newsId={article._id} />
        </div>
      </div>
    </div>
  );
}