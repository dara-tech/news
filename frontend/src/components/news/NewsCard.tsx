'use client';

import Link from 'next/link';
import Image from 'next/image'; // 1. Import next/image
import { motion, Variants } from 'framer-motion';
import { Article, Locale } from '@/types';
import { FiArrowUpRight } from 'react-icons/fi';

interface NewsCardProps {
  article: Article;
  locale: Locale;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

const NewsCard = ({ article, locale }: NewsCardProps) => {

  return (
    <motion.div variants={cardVariants} className="group relative overflow-hidden rounded-2xl aspect-video bg-slate-800">
      <Link href={`/${locale === 'kh' ? 'km' : 'en'}/news/${article.slug?.[locale] || article._id}`} className="absolute inset-0 z-0" prefetch={false}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
        {article.thumbnail && (
          <Image
            fill
            src={article.thumbnail}
            alt={article.title?.[locale] || 'News article thumbnail'}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
          />
        )}
      </Link>
      
      <div className="relative z-20 flex flex-col justify-end h-full p-6">
        {article.category && (
          <Link 
            href={`/${locale === 'kh' ? 'km' : 'en'}/category/${article.category.slug?.[locale] || article.category._id}`}
            className="inline-block self-start bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-white/30 capitalize hover:bg-white/30 transition-colors"
          >
            {article.category.name?.[locale]}
          </Link>
        )}
        <h3 className="text-xl font-bold text-white leading-tight line-clamp-2">
          <Link href={`/${locale === 'kh' ? 'km' : 'en'}/news/${article.slug?.[locale] || article._id}`} className="hover:underline" prefetch={false}>
            {article.title?.[locale]}
          </Link>
        </h3>
      </div>

      <Link href={`/${locale === 'kh' ? 'km' : 'en'}/news/${article.slug?.[locale] || article._id}`} className="absolute top-4 right-4 z-20 p-2 bg-white/20 backdrop-blur-md rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300 ease-in-out" prefetch={false}>
        <FiArrowUpRight className="text-white h-5 w-5" />
      </Link>
    </motion.div>
  );
};

export default NewsCard;