import { Article } from '@/types';
import NewsCard from './NewsCard';

interface NewsGridProps {
  articles: Article[];
  locale: 'en' | 'kh';
  className?: string;
  viewMode?: 'grid' | 'list';
}

export default function NewsGrid({ articles, locale, className = '', viewMode = 'grid' }: NewsGridProps) {
  if (!articles || articles.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            No Articles Found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            There are no articles to display at the moment.
          </p>
        </div>
      </div>
    );
  }

  // Grid view (default)
  if (viewMode === 'grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {articles.map((article) => (
          <NewsCard
            key={article._id || article.id}
            article={article}
            locale={locale}
          />
        ))}
      </div>
    );
  }

  // List view
  return (
    <div className={`space-y-4 ${className}`}>
      {articles.map((article) => (
        <NewsCard
          key={article._id || article.id}
          article={article}
          locale={locale}
          viewMode="list"
        />
      ))}
    </div>
  );
}
