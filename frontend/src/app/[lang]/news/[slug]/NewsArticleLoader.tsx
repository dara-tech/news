'use client';

import type { Article, LocalizedString } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Share2, Bookmark, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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
  const { title, content, author, createdAt, thumbnail, category } = article;

  // Safely handle localized strings with fallbacks
  const localizedTitle = getLocalizedString(title, locale);
  const localizedContent = getLocalizedString(content, locale);
  const localizedCategory = category ? getLocalizedString(category.name, locale) : 'News';
  const publishDate = new Date(createdAt);
  
  // Handle author display with fallbacks
  const getAuthorName = () => {
    if (author?.username) return author.username;
    if (author?.email) return author.email.split('@')[0]; // Use the part before @ if email exists
    return 'Anonymous';
  };
  
  const authorName = getAuthorName();
  const timeAgo = formatDistanceToNow(publishDate, { addSuffix: true });

  return (
    <div className="max-w-6xl mx-auto  sm:px-6 lg:px-8 ">
      <article className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden dark:shadow-gray-800/20 transition-all duration-300 border border-gray-100 dark:border-gray-800">
        {thumbnail && (
          <div className="relative w-full h-64 md:h-96 overflow-hidden">
            <Image
              src={thumbnail}
              alt={localizedTitle}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              priority
              sizes="(max-width: 768px) 100vw, 75vw"
            />
            {category && (
              <div className="absolute top-4 right-4 bg-primary/90 text-white text-sm font-medium px-3 py-1 rounded-full">
                {localizedCategory}
              </div>
            )}
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-col space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
                {localizedTitle}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {authorName}
                  </span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center" title={format(publishDate, 'PPPP')}>
                  <Clock className="w-4 h-4 mr-2" />
                  <time dateTime={publishDate.toISOString()}>
                    {format(publishDate, 'MMMM d, yyyy')}
                  </time>
                  <span className="ml-2 text-xs opacity-75">({timeAgo})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-4 border-t border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Share:</span>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="text-primary">
                <Bookmark className="w-4 h-4 mr-2" />
                Save for later
              </Button>
            </div>

            <div 
              className={cn(
                'prose dark:prose-invert prose-lg max-w-none',
                'prose-headings:font-semibold prose-headings:tracking-tight',
                'prose-p:text-gray-700 dark:prose-p:text-gray-300',
                'prose-a:text-primary hover:prose-a:underline',
                'prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4',
                'prose-img:rounded-lg prose-img:shadow-md',
                'prose-ul:list-disc prose-ol:list-decimal',
                'dark:prose-pre:bg-gray-800/50'
              )}
              dangerouslySetInnerHTML={{ __html: localizedContent }}
            />

            <div className="pt-6 mt-8 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-4">
                {author?.avatar && (
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={author.avatar}
                      alt={author.username || 'Author'}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {authorName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}