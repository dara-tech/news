"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/context/LanguageContext"
import { useCarousel } from "@/components/hero/components/use-carousel" // Assuming hook is in this path
import { Article } from "@/types"

interface BreakingNewsTickerProps {
  articles: Article[];
}

const tickerVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({ articles }) => {
  const { language } = useLanguage()
  const { currentIndex } = useCarousel(articles.length)

  if (!articles || articles.length === 0) {
    return null // Don't render if no news
  }
  
  const currentArticle = articles[currentIndex]

  return (
    <div className="h-10 bg-red-600 text-white flex items-center overflow-hidden">
      <div className="container mx-auto flex items-center px-4">
        <span className="text-sm font-bold uppercase tracking-wider flex-shrink-0">
          Breaking:
        </span>
        <div className="ml-4 flex-grow relative h-full flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentArticle?._id}
              variants={tickerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center"
            >
              <Link
                href={`/news/${currentArticle?.slug}`}
                className="hover:underline transition-colors text-sm"
              >
                {currentArticle?.title?.[language] || "Loading..."}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}