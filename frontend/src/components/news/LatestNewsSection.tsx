import { motion } from 'framer-motion';
import NewsCard from '@/components/news/NewsCard';

interface Article {
  _id: string;
  slug: string;
  title: { en: string; kh: string };
  category: string;
  thumbnail?: string;
}

interface LatestNewsSectionProps {
  latest: Article[];
}

const LatestNewsSection = ({ latest }: LatestNewsSectionProps) => {
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
        <h2 className="text-3xl font-bold text-gray-800">Latest News</h2>
        <a href="/news" className="text-blue-600 hover:underline">View All</a>
      </div>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {Array.isArray(latest) && latest.map((article: Article) => (
          <NewsCard key={article._id} article={article} />
        ))}
      </motion.div>
    </section>
  );
};

export default LatestNewsSection;
