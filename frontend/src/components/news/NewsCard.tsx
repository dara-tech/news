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

const NewsCard = ({ article, locale }: NewsCardProps) => {
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

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
    >
      <Link
        href={`/${langPath}/news/${articleSlug}`}
        className="block"
        prefetch={false}
      >
        {getArticleImageUrl(article) && (
          <div className="relative aspect-video overflow-hidden">
            <Image
              fill
              src={getArticleImageUrl(article) || ''}
              alt={title || 'News article thumbnail'}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="w-full h-full object-cover"
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
            <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-2">
              {categoryName}
            </div>
          )}
          
          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2">
            {title}
          </h3>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(article.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default NewsCard;