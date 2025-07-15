'use client';

import { useLanguage } from '@/context/LanguageContext';
import { FiCalendar, FiGrid } from 'react-icons/fi';
import { Article } from '@/types';

export interface NewsArticleProps {
  article: Article;
}

const ArticleSkeleton = () => (
  <div className="animate-pulse max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 ">
    <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-8"></div>
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-12"></div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
    </div>
  </div>
);

export default function NewsArticle({ article }: NewsArticleProps) {
  const { language } = useLanguage();

  const currentTitle = article.title?.[language] || 'Title not available';
  const currentContent = article.content?.[language] || '<p>Content not available.</p>';

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <article className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold mb-6">{currentTitle}</h1>
        <div className="mb-8">
          <span className="inline-flex items-center bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
            {article.category}
          </span>
          <time dateTime={article.createdAt} className="text-gray-500 text-sm">
            {new Date(article.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'km-KH')}
          </time>
        </div>

        {article.thumbnail && (
          <div className="mb-8">
            <img
              src={article.thumbnail}
              alt={currentTitle}
              className="w-full rounded-lg"
            />
          </div>
        )}

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{
            __html: currentContent
          }}
        />
      </article>

      {article.images && article.images.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-800/50 py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center mb-8">
              <FiGrid className="text-indigo-500 mr-3 h-6 w-6"/>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white">Image Gallery</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {article.images.map((image, index) => (
                <div key={index} className="group relative aspect-w-1 aspect-h-1 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
                  <img
                    src={image}
                    alt={`Image ${index + 1} for ${currentTitle}`}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
