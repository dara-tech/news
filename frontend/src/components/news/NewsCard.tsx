'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { FiArrowUpRight } from 'react-icons/fi';

interface NewsCardProps {
  article: {
    _id: string;
    slug: string;
    title: { en: string; kh: string };
    category: string;
    thumbnail?: string;
    [key: string]: any; // Allow additional properties
  };
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

const NewsCard = ({ article }: NewsCardProps) => {
  const { language } = useLanguage();

  return (
    <motion.div variants={cardVariants}>
      <Link href={`/news/${article.slug}`} className="block group relative overflow-hidden rounded-2xl" prefetch={false}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />

        {article.thumbnail && (
          <img
            src={article.thumbnail}
            alt={article.title[language]}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
          />
        )}
        <div className="absolute inset-0 bg-gray-900 opacity-20 group-hover:opacity-0 transition-opacity duration-300" />


        <div className="absolute bottom-0 left-0 p-6 z-20">
          <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-white/30">
            {article.category}
          </span>
          <h3 className="text-xl font-bold text-white leading-tight">
            {article.title[language]}
          </h3>
        </div>

        <div className="absolute top-4 right-4 z-20 p-2 bg-white/20 backdrop-blur-md rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300 ease-in-out">
          <FiArrowUpRight className="text-white h-5 w-5" />
        </div>
      </Link>
    </motion.div>
  );
};

export default NewsCard;