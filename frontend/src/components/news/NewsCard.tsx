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
  const safeLocale = locale === 'km' ? 'km' : 'en';
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
  const categorySlug = article.category?.slug || '';
  const title = getLocalizedText(article.title, locale) || 'News article';
  const categoryName = getLocalizedText(article.category?.name, locale);

  return (
    <motion.div
      variants={cardVariants}
      className="group relative overflow-hidden rounded-2xl aspect-video bg-slate-800"
    >
      <Link
        href={`/${langPath}/news/${articleSlug}`}
        className="absolute inset-0 z-0"
        prefetch={false}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
        {getArticleImageUrl(article) && (
          <Image
            fill
            src={getArticleImageUrl(article) || ''}
            alt={title || 'News article thumbnail'}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
          />
        )}
      </Link>

      <div className="relative z-20 flex flex-col justify-end h-full p-6">
        {article.category && categorySlug && (
          <Link
            href={`/${langPath}/category/${categorySlug}`}
            className="inline-flex items-center gap-2 self-start bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-white/30 capitalize hover:bg-white/30 transition-colors"
          >
            {/* Category color badge */}
            {article.category.color && (
              <span
                className="inline-block w-3 h-3 rounded-full border border-white/50"
                style={{ backgroundColor: article.category.color }}
                aria-label="Category color"
              />
            )}
            {categoryName}
          </Link>
        )}
        <h3 className="text-xl font-bold text-white leading-tight line-clamp-2">
          <Link
            href={`/${langPath}/news/${articleSlug}`}
            className="hover:underline"
            prefetch={false}
          >
            {title}
          </Link>
        </h3>
      </div>

      <Link
        href={`/${langPath}/news/${articleSlug}`}
        className="absolute top-4 right-4 z-20 p-2 bg-white/20 backdrop-blur-md rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300 ease-in-out"
        prefetch={false}
        aria-label={title}
      >
        <FiArrowUpRight className="text-white h-5 w-5" />
      </Link>
    </motion.div>
  );
};

export default NewsCard;