import { motion } from 'framer-motion';
import Link from 'next/link';
import NewsCard from '@/components/news/NewsCard';
import { Article, Locale } from '@/types';

interface LatestNewsSectionProps {
  latest: Article[];
  locale: Locale;
}

const LatestNewsSection = ({ latest, locale }: LatestNewsSectionProps) => {
  const translations = {
    en: { title: 'Latest News', viewAll: 'View All' },
    kh: { title: 'ព័ត៌មាន​ចុងក្រោយ', viewAll: 'មើល​ទាំងអស់' },
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{translations[locale].title}</h2>
                <Link href={`/${locale === 'kh' ? 'kh' : 'en'}/news`} className="text-blue-600 hover:underline">{translations[locale].viewAll}</Link>
      </div>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {Array.isArray(latest) && latest.map((article: Article) => (
                    <NewsCard key={article._id} article={article} locale={locale} />
        ))}
      </motion.div>
    </section>
  );
};

export default LatestNewsSection;
