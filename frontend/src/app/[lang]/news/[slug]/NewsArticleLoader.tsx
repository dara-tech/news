'use client';

import { Article } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image'; // <-- Add this line back!

interface NewsArticleProps {
  article: Article;
  locale: 'en' | 'kh';
}

export default function NewsArticleLoader({ article, locale }: NewsArticleProps) {
  const { title, content, author, createdAt, thumbnail } = article;

  // Ensure localizedTitle is always a string for the 'alt' prop
  const localizedTitle = title[locale] || title.en || '';
  const localizedContent = content[locale] || content.en || '';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <article className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        {thumbnail && (
          <Image // <-- Use the Next.js Image component
            src={thumbnail}
            alt={localizedTitle}
            width={900} // Set appropriate width (or actual image width if known)
            height={506} // Set appropriate height (or actual image height if known)
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {localizedTitle}
          </h1>
          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-6">
            <p className="font-semibold">{author.name || 'Anonymous'}</p>
            <span className="mx-2">•</span>
            <time dateTime={createdAt}>
              {format(new Date(createdAt), 'MMMM d, yyyy')}
            </time>
          </div>
          <div
            className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200"
            dangerouslySetInnerHTML={{ __html: localizedContent }}
          />
        </div>
      </article>
    </div>
  );
}