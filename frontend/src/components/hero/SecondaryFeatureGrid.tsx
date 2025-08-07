"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight, Calendar, TrendingUp } from "lucide-react"
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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-500 backdrop-blur-sm">
          {/* Advanced background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Main content container */}
          <div className="relative flex flex-col w-full">
            {/* Enhanced Image Container */}
            <div className="relative w-full h-48 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/5 z-10" />
              
              <Image
                src={article.thumbnail || "/placeholder.jpg"}
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
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-sm shadow-sm border border-white/30"
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
                    <div className="relative p-1.5 bg-red-500/90 rounded-full backdrop-blur-sm shadow-lg border border-red-400/30">
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
