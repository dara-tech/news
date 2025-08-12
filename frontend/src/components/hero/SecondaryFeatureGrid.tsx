"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight, Calendar, TrendingUp } from "lucide-react"
import type { Article } from "@/types"
import { getArticleImageUrl } from "@/hooks/useImageLoader"

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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.6
    } 
  },
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
function MobileCard({ article, locale, index }: { article: Article; locale: "en" | "kh"; index: number }) {
  const { categoryName, categoryColor } = getCategoryInfo(article, locale)
  const publishDate = formatDate(article.createdAt || article.publishedAt || new Date().toISOString(), locale)

  return (
    <motion.div
      key={article._id}
      variants={cardVariants}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group relative"
    >
      <Link href={`/${locale === "kh" ? "km" : "en"}/news/${article.slug}`}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 border border-primary/20 transition-all duration-500 backdrop-blur-sm">
          {/* Advanced background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Main content container */}
          <div className="relative flex flex-col w-full">
            {/* Enhanced Image Container */}
            <div className="relative w-full h-48 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/5 z-10" />
              
              <Image
                src={getArticleImageUrl(article) || "/placeholder.jpg"}
                alt={article.title?.[locale] || "Article image"}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg"
                }}
              />
              
              {/* Enhanced overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
              
              {/* Category badge */}
              {categoryName && (
                <div className="absolute top-3 left-3 z-20">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-sm border border-white/30"
                    style={{ color: categoryColor }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryColor }} />
                    {categoryName}
                  </span>
                </div>
              )}
              
              {/* Trending indicator for featured articles */}
              {index === 0 && (
                <div className="absolute top-3 right-3 z-20">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm rounded-full blur-sm animate-pulse" />
                    <div className="relative p-1.5 bg-red-500/90 rounded-full backdrop-blur-sm border border-red-400/30">
                      <TrendingUp className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Enhanced Content Area */}
            <div className="p-4 flex flex-col justify-between min-w-0">
              <div className="min-w-0 space-y-3">
                {/* Enhanced title */}
                <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors duration-300 tracking-tight">
                  <span className="line-clamp-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    {article.title?.[locale]}
                  </span>
                </h3>
                
                {/* Enhanced description */}
                {article.description?.[locale] && (
                  <p className="text-muted-foreground/90 text-sm leading-relaxed">
                    <span className="line-clamp-2">{article.description[locale]}</span>
                  </p>
                )}
              </div>
              
              {/* Enhanced metadata at the bottom */}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs text-muted-foreground/80">
                  <Calendar className="w-3 h-3" />
                  <span className="font-medium">{publishDate}</span>
                </div>
                <div className="flex items-center gap-1 text-primary font-semibold text-xs">
                  <span>Read</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  )
}

// Tablet Card
function TabletCard({ article, locale }: { article: Article; locale: "en" | "kh" }) {
  const { categoryName, categoryColor } = getCategoryInfo(article, locale)
  const publishDate = formatDate(article.createdAt || article.publishedAt || new Date().toISOString(), locale)

  return (
    <motion.div
      key={article._id}
      variants={cardVariants}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group"
    >
                      <Link href={`/${locale === "kh" ? "km" : "en"}/news/${article.slug}`}>
                  <div className="bg-card/50 border border-primary/20 rounded-xl overflow-hidden transition-all duration-300 h-full backdrop-blur-sm">
          {/* Image Header */}
          <div className="relative h-48">
            <Image
              src={getArticleImageUrl(article) || "/placeholder.jpg"}
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
  const publishDate = formatDate(article.createdAt || article.publishedAt || new Date().toISOString(), locale)

  return (
    <motion.div
      key={article._id}
      variants={cardVariants}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="group"
    >
      <Link href={`/${locale === "kh" ? "km" : "en"}/news/${article.slug}`}>
        <div className="bg-card/50 border border-primary/20 rounded-xl overflow-hidden transition-all duration-300 backdrop-blur-sm">
          {/* Image */}
          <div className="relative h-32 overflow-hidden">
            <Image
              src={getArticleImageUrl(article) || "/placeholder.jpg"}
              alt={article.title?.[locale] || "Article image"}
              fill
              sizes="(max-width: 1200px) 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg"
              }}
            />
            
            {/* Category badge */}
            {categoryName && (
              <div className="absolute top-2 left-2">
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur"
                  style={{ color: categoryColor }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryColor }} />
                  {categoryName}
                </span>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-4">
            <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {article.title?.[locale]}
            </h3>
            {article.description?.[locale] && (
              <p className="text-muted-foreground text-xs mb-3 line-clamp-2">
                {article.description?.[locale]}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{publishDate}</span>
              </div>
              <div className="flex items-center gap-1 text-primary font-semibold text-xs">
                <span>Read</span>
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

const SecondaryFeatureGrid: React.FC<SecondaryFeatureGridProps> = ({ articles, locale }) => {
  if (!articles || articles.length === 0) return null

  // If only one article, show it in a professional card layout
  if (articles.length === 1) {
    const article = articles[0];
    return (
      <div className="group relative overflow-hidden rounded-lg bg-background border border-border/50 transition-all duration-300">
        <Link href={`/${locale === "kh" ? "km" : "en"}/news/${article.slug}`}>
          <div className="flex flex-col h-full">
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <Image
                src={getArticleImageUrl(article) || "/placeholder.jpg"}
                alt={article.title?.[locale] || "Article image"}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg"
                }}
              />
              <div className="absolute inset-0 bg-black/20" />
              
              {/* Category badge */}
              {getCategoryInfo(article, locale).categoryName && (
                <div className="absolute top-3 left-3 z-20">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-white/90 text-foreground rounded"
                    style={{ color: getCategoryInfo(article, locale).categoryColor }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getCategoryInfo(article, locale).categoryColor }} />
                    {getCategoryInfo(article, locale).categoryName}
                  </span>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {article.title?.[locale]}
              </h3>
              {article.description?.[locale] && (
                <p className="text-muted-foreground text-sm mb-3 flex-1 line-clamp-2">
                  {article.description?.[locale]}
                </p>
              )}
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(article.createdAt || article.publishedAt || new Date().toISOString(), locale)}</span>
                </div>
                <div className="flex items-center gap-1 text-primary font-medium text-xs">
                  <span>Read</span>
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile Layout - Optimized for Small Screens */}
      <div className="block sm:hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4 px-1"
        >
          {articles.map((article, index) => (
            <MobileCard key={article._id} article={article} locale={locale} index={index} />
          ))}
        </motion.div>
      </div>

      {/* Small Mobile to Tablet Layout */}
      <div className="hidden sm:block lg:hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {articles.map((article) => (
            <TabletCard key={article._id} article={article} locale={locale} />
          ))}
        </motion.div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
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
