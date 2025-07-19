"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

import { Article } from "@/types"

interface SecondaryFeatureGridProps {
  articles: Article[];
  locale: 'en' | 'kh';
}


const SecondaryFeatureGrid: React.FC<SecondaryFeatureGridProps> = ({ articles, locale }) => {

  return (
    <div className="col-span-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-6">
      {articles.map((article, index) => (
        <motion.div
          key={article._id}
          custom={index}
        //   variants={cardVariants}
          className="bg-neutral-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden group transition-all duration-300 hover:border-white/20 hover:bg-neutral-800"
        >
          <Link href={`/${locale === 'kh' ? 'km' : 'en'}/news/${article.slug}`}>
            <div className="relative h-40">
                  {article.thumbnail && (
                          <Image
                            src={article.thumbnail}
                            alt={article.title?.[locale] || 'Secondary feature article image'}
                            fill
                            priority // Prioritize loading for LCP
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                            onError={(e) => { e.currentTarget.src = '/placeholder.jpg' }}
                          />
                        )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white/90 group-hover:text-white transition-colors">
                {article.title?.[locale]}
              </h3>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
export default SecondaryFeatureGrid
