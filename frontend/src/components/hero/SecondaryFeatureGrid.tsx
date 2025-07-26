"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, ArrowUpRight, Calendar, TrendingUp } from "lucide-react"
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
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

// Helper function to format date - consistent between server and client
function formatDate(dateString: string, locale: "en" | "kh") {
  try {
    const date = new Date(dateString)
    
    // Use consistent formatting to avoid hydration mismatches
    const month = date.getMonth()
    const day = date.getDate()
    
    if (locale === "kh") {
      const khmerMonths = [
        "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
        "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
      ]
      return `${day} ${khmerMonths[month]}`
    } else {
      const englishMonths = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ]
      return `${englishMonths[month]} ${day}`
    }
  } catch {
    return "Recent"
  }
}

// Helper function to estimate read time
function estimateReadTime(content: string) {
  const wordsPerMinute = 200
  const wordCount = content?.split(" ").length || 0
  const readTime = Math.ceil(wordCount / wordsPerMinute)
  return readTime || 3
}

// Helper to get category name and color
function getCategoryInfo(article: Article, locale: "en" | "kh") {
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
  return { categoryName, categoryColor }
}

// Mobile Card
function MobileCard({ article, locale }: { article: Article; locale: "en" | "kh" }) {
  const { categoryName, categoryColor } = getCategoryInfo(article, locale)
  const readTime = estimateReadTime(article.description?.[locale] || "")
  const publishDate = formatDate(article.createdAt || article.publishedAt || new Date().toISOString(), locale)

  return (
    <motion.div
      key={article._id}
      variants={cardVariants}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Link href={`/${locale === "kh" ? "km" : "en"}/news/${article.slug}`}>
        <div className="bg-card/60 border border-border/30 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-md w-full group">
          {/* Professional Layout */}
          <div className="flex w-full h-32 sm:h-36">
            {/* Professional Image Container */}
            <div className="relative w-20 sm:w-24 flex-shrink-0 h-full">
              <Image
                src={article.thumbnail || "/placeholder.jpg"}
                alt={article.title?.[locale] || "Article image"}
                fill
                sizes="(max-width: 640px) 80px, 96px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg"
                }}
              />
              {/* Enhanced category indicator */}
              {categoryName && (
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: categoryColor }}
                />
              )}
              {/* Subtle overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>
            
            {/* Professional Content Area */}
            <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
              <div className="min-w-0 space-y-2 sm:space-y-3 flex-1">
                <h3 className="font-bold text-sm sm:text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors tracking-tight">
                  {article.title?.[locale]}
                </h3>
                
                {article.description?.[locale] && (
                  <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 leading-relaxed">
                    {article.description?.[locale]}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-border/20">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium">{publishDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium">{readTime}m</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Tablet Card
function TabletCard({ article, locale }: { article: Article; locale: "en" | "kh" }) {
  const { categoryName, categoryColor } = getCategoryInfo(article, locale)
  const readTime = estimateReadTime(article.description?.[locale] || "")
  const publishDate = formatDate(article.createdAt || article.publishedAt || new Date().toISOString(), locale)

  return (
    <motion.div
      key={article._id}
      variants={cardVariants}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group"
    >
                      <Link href={`/${locale === "kh" ? "km" : "en"}/news/${article.slug}`}>
                  <div className="bg-card/50 border border-border/20 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full backdrop-blur-sm">
          {/* Image Header */}
          <div className="relative h-48">
            <Image
              src={article.thumbnail || "/placeholder.jpg"}
              alt={article.title?.[locale] || "Article image"}
              fill
              sizes="(max-width: 1024px) 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg"
              }}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* Category badge */}
            {categoryName && (
              <div className="absolute top-4 left-4">
                <span
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur"
                  style={{ color: categoryColor }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColor }} />
                  {categoryName}
                </span>
              </div>
            )}
            
            {/* Read time badge */}
            <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/70 rounded-lg backdrop-blur">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-white" />
                <span className="text-xs text-white font-medium">{readTime}m</span>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
              {article.title?.[locale]}
            </h3>
            {article.description?.[locale] && (
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {article.description?.[locale]}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{publishDate}</span>
              </div>
              <div className="flex items-center gap-1 text-primary font-semibold text-sm">
                <span>Read</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Desktop Card
function DesktopCard({
  article,
  locale,
  index,
}: {
  article: Article
  locale: "en" | "kh"
  index: number
}) {
  const { categoryName, categoryColor } = getCategoryInfo(article, locale)
  const readTime = estimateReadTime(article.description?.[locale] || "")
  const publishDate = formatDate(article.createdAt || article.publishedAt || new Date().toISOString(), locale)
  const isFeatured = index === 0
  const isLarge = index === 1 || index === 2
  const isMedium = index === 3 || index === 4

  return (
    <motion.div
      key={article._id}
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`group ${
        isFeatured ? "col-span-12" : 
        isLarge ? "col-span-6" : 
        isMedium ? "col-span-4" : "col-span-3"
      }`}
    >
      <Link href={`/${locale === "kh" ? "km" : "en"}/news/${article.slug}`}>
                          <div className={`bg-card/50 border border-border/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-full backdrop-blur-sm ${
                    isFeatured ? "min-h-[400px]" : "min-h-[300px]"
                  }`}>
          {/* Featured Article Layout */}
          {isFeatured ? (
            <div className="relative h-full">
              <div className="absolute inset-0">
                <Image
                  src={article.thumbnail || "/placeholder.jpg"}
                  alt={article.title?.[locale] || "Article image"}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
              
              <div className="relative h-full flex flex-col justify-end p-8">
                {/* Category and trending badge */}
                <div className="flex items-center gap-3 mb-4">
                  {categoryName && (
                    <span
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur"
                      style={{ color: categoryColor }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColor }} />
                      {categoryName}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-500 backdrop-blur">
                    <TrendingUp className="w-3 h-3" />
                    Trending
                  </span>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-4 line-clamp-3">
                  {article.title?.[locale]}
                </h3>
                
                {article.description?.[locale] && (
                  <p className="text-white/90 text-lg mb-6 line-clamp-2">
                    {article.description?.[locale]}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-white/80">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{publishDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{readTime}m read</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <span>Read Full Story</span>
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Regular Article Layout */
            <div className="h-full flex flex-col">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={article.thumbnail || "/placeholder.jpg"}
                  alt={article.title?.[locale] || "Article image"}
                  fill
                  sizes="(max-width: 1200px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg"
                  }}
                />
                
                {/* Category badge */}
                {categoryName && (
                  <div className="absolute top-4 left-4">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur"
                      style={{ color: categoryColor }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColor }} />
                      {categoryName}
                    </span>
                  </div>
                )}
                
                {/* Read time badge */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/70 rounded-lg backdrop-blur">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-white" />
                    <span className="text-xs text-white font-medium">{readTime}m</span>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title?.[locale]}
                </h3>
                {article.description?.[locale] && (
                  <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-2">
                    {article.description?.[locale]}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{publishDate}</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary font-semibold text-sm">
                    <span>Read</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

const SecondaryFeatureGrid: React.FC<SecondaryFeatureGridProps> = ({ articles, locale }) => {
  if (!articles || articles.length === 0) return null

  return (
    <div className="space-y-8">
      {/* Mobile Layout - Stacked Professional Cards */}
      <div className="block md:hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {articles.map((article) => (
            <MobileCard key={article._id} article={article} locale={locale} />
          ))}
        </motion.div>
      </div>

      {/* Tablet Layout - Horizontal Professional Cards */}
      <div className="hidden md:block lg:hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-6"
        >
          {articles.map((article) => (
            <TabletCard key={article._id} article={article} locale={locale} />
          ))}
        </motion.div>
      </div>

      {/* Desktop Layout - Professional Masonry Grid */}
      <div className="hidden lg:block">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-12 gap-6"
        >
          {articles.map((article, index) => (
            <DesktopCard key={article._id} article={article} locale={locale} index={index} />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default SecondaryFeatureGrid
