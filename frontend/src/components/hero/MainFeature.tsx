"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight, Clock, User } from "lucide-react"
import type { Article } from "@/types"

interface MainFeatureProps {
  article: Article
  locale: "en" | "kh"
}

const MainFeature: React.FC<MainFeatureProps> = ({ article, locale }) => {
  if (!article) return null

  // Extract category info (support both string and object)
  let categoryName = ""
  let categoryColor = "#3b82f6"
  if (article.category) {
    if (typeof article.category === "string") {
      categoryName = article.category
    } else {
      categoryName = article.category.name?.[locale] || article.category.name?.en || ""
      categoryColor = article.category.color || "#3b82f6"
    }
  }

  // Helper: clamp title to 2-3 lines, add ellipsis if too long
  function clampText(text: string, maxChars: number) {
    if (!text) return ""
    if (text.length <= maxChars) return text
    return text.slice(0, maxChars - 1).trim() + "…"
  }

  // Responsive max title chars
  const maxTitleChars = 85

  return (
    <motion.div
      className="relative rounded-3xl overflow-hidden group shadow-2xl border"
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
    >
      <Link
        href={`/${locale === "kh" ? "km" : "en"}/news/${article.slug}`}
        className="block w-full h-full focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/60 transition-all duration-300"
        tabIndex={0}
      >
        <div className="relative h-[500px] md:h-[600px]">
          {article.thumbnail && (
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={article.thumbnail || "/placeholder.svg"}
                alt={article.title?.[locale] || "Feature article image"}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                className="object-cover w-full h-full transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=600&width=800"
                }}
              />

              {/* Enhanced gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
            </div>
          )}

          {/* Floating category badge */}
          {categoryName && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute top-8 left-8 z-20"
            >
              <span
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full shadow-2xl tracking-wider uppercase border border-white/20 text-white"
                style={{
                  backgroundColor: categoryColor,
                  letterSpacing: "0.1em",
                  boxShadow: `0 8px 32px ${categoryColor}40`,
                }}
                aria-label="Category"
              >
                <div className="w-2 h-2 rounded-full bg-white" />
                {categoryName}
              </span>
            </motion.div>
          )}

          {/* Article metadata */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="absolute top-8 right-8 z-20 flex items-center gap-3"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/20">
              <Clock className="w-3 h-3 text-white/80" />
              <span className="text-xs text-white/80 font-medium">5 min read</span>
            </div>
          </motion.div>

          {/* Main content */}
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-20 space-y-6">
            <motion.h1
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight text-white"
              style={{
                textShadow: "0 4px 20px rgba(0,0,0,0.8)",
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              title={article.title?.[locale]}
            >
              {clampText(article.title?.[locale] || "", maxTitleChars)}
            </motion.h1>

            {article.description?.[locale] && (
              <motion.p
                className="text-lg md:text-xl text-white/90 max-w-3xl leading-relaxed drop-shadow-lg line-clamp-3"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {article.description?.[locale]}
              </motion.p>
            )}

            {/* Enhanced CTA button */}
            <motion.div
              className="flex items-center gap-4 pt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <motion.span
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-2xl hover:shadow-primary/25 transition-all duration-300 border border-primary/30"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Read Full Story</span>
                <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
              </motion.span>

              <div className="flex items-center gap-2 text-white/70">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{article.author?.username || "Editorial Team"}</span>
              </div>
            </motion.div>
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-0 left-0 right-0 h-2 opacity-60" style={{ backgroundColor: categoryColor }} />
        </div>
      </Link>
    </motion.div>
  )
}

export default MainFeature
