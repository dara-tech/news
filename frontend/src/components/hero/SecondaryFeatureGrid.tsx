"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, ArrowUpRight, Eye, Calendar, User } from "lucide-react"
import type { Article } from "@/types"

interface SecondaryFeatureGridProps {
  articles: Article[]
  locale: "en" | "kh"
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}


const SecondaryFeatureGrid: React.FC<SecondaryFeatureGridProps> = ({ articles, locale }) => {
  if (!articles || articles.length === 0) return null

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString(locale === "kh" ? "km-KH" : "en-US", {
        month: "short",
        day: "numeric",
      })
    } catch {
      return "Recent"
    }
  }

  // Helper function to estimate read time
  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content?.split(" ").length || 0
    const readTime = Math.ceil(wordCount / wordsPerMinute)
    return readTime || 3
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-12 bg-primary rounded-full shadow-lg shadow-primary/30" />
            <div>
              <h3 className="text-2xl md:text-3xl font-bold">More Stories</h3>
              <p className="text-muted-foreground text-sm mt-1">Discover trending articles</p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border"
        >
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">{articles.length} articles</span>
        </motion.div>
      </motion.div>

      {/* Articles Grid */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-6">
        {articles.map((article) => {
          // Extract category info
          let categoryName = "";
          let categoryColor = "#3b82f6"; // fallback color
          if (article.category) {
            // If category is a string, use as name, fallback color
            if (typeof article.category === "string") {
              categoryName = article.category;
            } else {
              categoryName = article.category.name?.[locale] || article.category.name?.en || "";
              // Use the color from category if available, else fallback
              categoryColor = article.category.color || "#3b82f6";
            }
          }

          const readTime = estimateReadTime(article.description?.[locale] || "");
          const publishDate = formatDate(article.createdAt || article.publishedAt || new Date().toISOString());

          return (
            <motion.div
              key={article._id}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 25 },
              }}
              className="group perspective-1000"
            >
              <Link href={`/${locale === "kh" ? "km" : "en"}/news/${article.slug}`}>
                <div className="relative border rounded-3xl overflow-hidden group-hover:shadow-2xl group-hover:shadow-primary/10 transition-all duration-500">
                  <div className="relative p-6">
                    <div className="flex gap-6">
                      {/* Enhanced Image Section */}
                      <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 rounded-2xl overflow-hidden group">
                        {article.thumbnail && (
                          <>
                            <motion.div whileHover="hover" className="relative w-full h-full">
                              <Image
                                src={article.thumbnail || "/placeholder.svg"}
                                alt={article.title?.[locale] || "Article image"}
                                fill
                                sizes="(max-width: 768px) 128px, 160px"
                                className="object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = "/placeholder.svg?height=160&width=160";
                                }}
                              />
                            </motion.div>

                            {/* Floating read time badge */}
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded-lg">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-white/80" />
                                <span className="text-xs text-white/80 font-medium">{readTime}m</span>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Decorative corner accent */}
                        <div
                          className="absolute top-0 left-0 w-6 h-6 rounded-br-2xl opacity-60"
                          style={{ backgroundColor: categoryColor }}
                        />
                      </div>

                      {/* Enhanced Content Section */}
                      <div className="flex-1 space-y-4 min-w-0">
                        {/* Category and metadata row */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {categoryName && (
                              <motion.span
                                whileHover={{ scale: 1.05 }}
                                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border"
                                style={{
                                  backgroundColor: `${categoryColor}15`,
                                  borderColor: `${categoryColor}30`,
                                  color: categoryColor,
                                }}
                              >
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryColor }} />
                                {categoryName}
                              </motion.span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-muted-foreground text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{publishDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-lg md:text-xl font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {article.title?.[locale]}
                        </h4>

                        {/* Description */}
                        {article.description?.[locale] && (
                          <p className="text-sm md:text-base text-muted-foreground group-hover:opacity-80 transition-opacity line-clamp-2 leading-relaxed">
                            {article.description?.[locale]}
                          </p>
                        )}

                        {/* Bottom row with author and CTA */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span className="text-xs font-medium">{article.author?.username || "Editorial Team"}</span>
                          </div>

                          <motion.div
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-2 text-primary group-hover:text-primary/80 transition-colors"
                          >
                            <span className="text-sm font-semibold">Read more</span>
                            <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      backgroundColor: categoryColor,
                    }}
                  />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* View More Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-center pt-6"
      >
      </motion.div>
    </div>
  )
}

export default SecondaryFeatureGrid
