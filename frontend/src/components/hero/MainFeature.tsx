"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

import { Article } from "@/types"

interface MainFeatureProps {
  article: Article;
  locale: 'en' | 'kh';
}

const MainFeature: React.FC<MainFeatureProps> = ({ article, locale }) => {

  if (!article) return null

  return (
    <motion.div
      className="col-span-1 md:col-span-2 rounded-xl overflow-hidden relative group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Link href={`/${locale === 'kh' ? 'km' : 'en'}/news/${article.slug?.[locale] || article._id}`} className="block w-full h-full">
        <div className="relative h-[450px]">
          {article.thumbnail && (
            <Image
              src={article.thumbnail}
              alt={article.title?.[locale] || 'Feature article image'}
              fill
              priority // Prioritize loading for LCP
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
              onError={(e) => { e.currentTarget.src = '/placeholder.jpg' }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
            <motion.h1
              className="text-3xl md:text-5xl font-extrabold leading-tight mb-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {article.title?.[locale]}
            </motion.h1>
            <motion.p
              className="text-base md:text-lg text-white/80 max-w-2xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {article.description?.[locale]}
            </motion.p>
            <div className="absolute top-4 right-4 p-3 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
export default MainFeature