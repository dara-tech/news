'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { Article, Locale } from '@/types';
import { FiArrowUpRight } from 'react-icons/fi';
import { getArticleImageUrl } from '@/hooks/useImageLoader';

interface NewsCardProps {
  article: Article;
  locale: Locale;
  viewMode?: 'grid' | 'list';
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

function getLocalizedText(
  text: string | { [key: string]: string | undefined } | undefined,
  locale: string
): string {
  const safeLocale = locale === 'kh' ? 'kh' : 'en';
  if (!text) return '';
  if (typeof text === 'string') return text;
  if (typeof text === 'object') {
    if (typeof text[safeLocale] === 'string') return text[safeLocale]!;
    const values = Object.values(text).filter(Boolean);
    if (values.length > 0) return values[0] as string;
  }
  return '';
}

const NewsCard = ({ article, locale, viewMode = 'grid' }: NewsCardProps) => {
  const langPath = locale === 'kh' ? 'kh' : 'en';
  const articleSlug =
    typeof article.slug === 'string'
      ? article.slug
      : article.slug?.[locale] || article.slug?.en || article._id;
  const categorySlug = typeof article.category?.slug === 'string' ? article.category.slug : 
                      typeof article.category?._id === 'string' ? article.category._id : 
                      '';
  const title = getLocalizedText(article.title, locale) || 'News article';
  const categoryName = getLocalizedText(article.category?.name, locale);

  // List view layout
  if (viewMode === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
      >
        <Link
          href={`/${langPath}/news/${articleSlug}`}
          className="block"
          prefetch={true}
        >
          <div className="flex gap-4 p-4">
            {/* Image - Smaller for list view */}
            {getArticleImageUrl(article) && (
              <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  fill
                  src={getArticleImageUrl(article) || ''}
                  alt={title || 'News article thumbnail'}
                  sizes="96px"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.warn('NewsCard image failed to load:', getArticleImageUrl(article));
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              {article.category && categorySlug && (
                <div className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                  {categoryName}
                </div>
              )}
              
              <h3 className="text-lg font-semibold text-foreground leading-tight mb-2 line-clamp-2">
                {title}
              </h3>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {new Date(article.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <FiArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Grid view layout (default)
  return (
    <motion.div
      variants={cardVariants}
      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 group"
    >
      <Link
        href={`/${langPath}/news/${articleSlug}`}
        className="block"
        prefetch={true}
      >
        {getArticleImageUrl(article) && (
          <div className="relative aspect-video overflow-hidden">
            <Image
              fill
              src={getArticleImageUrl(article) || ''}
              alt={title || 'News article thumbnail'}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                console.warn('NewsCard image failed to load:', getArticleImageUrl(article));
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="p-4">
          {article.category && categorySlug && (
            <div className="text-xs font-medium text-primary uppercase tracking-wide mb-2">
              {categoryName}
            </div>
          )}
          
          <h3 className="text-lg font-semibold text-foreground leading-tight mb-2 line-clamp-2">
            {title}
          </h3>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {new Date(article.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
            <FiArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default NewsCard;