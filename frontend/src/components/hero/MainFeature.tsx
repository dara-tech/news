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

  // Extract category info (support both string and object)
  let categoryName = ""
  let categoryColor = "#222"
  if (article.category) {
    if (typeof article.category === "string") {
      categoryName = article.category
    } else {
      categoryName = article.category.name?.[locale] || article.category.name?.en || ""
      categoryColor = article.category.color || "#222"
    }
  }

  // Helper: clamp title to 2-3 lines, add ellipsis if too long
  function clampText(text: string, maxChars: number) {
    if (!text) return ""
    if (text.length <= maxChars) return text
    return text.slice(0, maxChars - 1).trim() + "…"
  }

  // Responsive max title length
  const maxTitleChars = 80

  return (
    <motion.div
      className="col-span-1 md:col-span-2 rounded-2xl overflow-hidden relative group shadow-xl bg-gradient-to-br from-neutral-900/80 via-neutral-800/60 to-neutral-900/90"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Link
        href={`/${locale === 'kh' ? 'km' : 'en'}/news/${article.slug}`}
        className="block w-full h-full focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/60 transition"
        tabIndex={0}
      >
        <div className="relative h-[420px] md:h-[480px]">
          {article.thumbnail && (
            <Image
              src={article.thumbnail}
              alt={article.title?.[locale] || 'Feature article image'}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105 group-hover:brightness-95"
              onError={(e) => { e.currentTarget.src = '/placeholder.jpg' }}
            />
          )}
          {/* Stronger, more readable gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-none z-10" />
          {/* Category badge, styled as a modern pill */}
          {categoryName && (
            <div className="absolute top-6 left-6 z-20">
              <span
                className="inline-block text-xs font-bold px-4 py-1 rounded-full shadow-lg tracking-widest uppercase border border-white/10 backdrop-blur-sm"
                style={{
                  background: categoryColor,
                  color: "#fff",
                  letterSpacing: "0.15em"
                }}
                aria-label="Category"
              >
                {categoryName}
              </span>
            </div>
          )}
          {/* Main content */}
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-20 flex flex-col gap-3">
            <motion.h1
              className="text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-2 line-clamp-3 break-words text-white"
              style={{
                textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                maxWidth: "100%",
              }}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              title={article.title?.[locale]}
            >
              {clampText(article.title?.[locale] || "", maxTitleChars)}
            </motion.h1>
            {article.description?.[locale] && (
              <motion.p
                className="text-base md:text-lg text-white/90 max-w-2xl mb-2 drop-shadow line-clamp-2"
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.5 }}
              >
                {article.description?.[locale]}
              </motion.p>
            )}
            {/* Read more button */}
            <motion.div
              className="mt-2"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/90 text-neutral-900 font-semibold rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors duration-200 group-hover:bg-primary group-hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70">
                <span>Read More</span>
                <ArrowUpRight className="w-5 h-5" />
              </span>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
export default MainFeature