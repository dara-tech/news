"use client"

import { motion } from "framer-motion"
import { Clock, Eye, User, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingTopics, 
  WeatherWidget, 
  AwardsSection,
  TopAuthors 
} from "@/components/home/sections"

interface NewsArticle {
  id: string
  title: any // LocalizedString type
  description: any // LocalizedString type
  thumbnail?: string
  category: {
    name: any // LocalizedString type
    color?: string
  }
  publishedAt: string
  views: number
  author?: {
    name: string
    profileImage?: string
  }
  isFeatured?: boolean
  isBreaking?: boolean
  slug: any // LocalizedString type
}

interface NYTimesLayoutProps {
  articles: NewsArticle[]
  lang: string
}

export const NYTimesLayout = ({ articles, lang }: NYTimesLayoutProps) => {
  // Fallback for lang if undefined
  const safeLang = lang || 'en';
  
  const renderText = (text: string | { en: string; kh: string }) => {
    if (typeof text === 'string') return text
    return text[safeLang as keyof typeof text] || text.en || ''
  }

  // Get real trending topics from articles
  const getTrendingTopics = () => {
    const topicCounts: { [key: string]: number } = {};
    articles.forEach(article => {
      const category = renderText(article.category.name);
      topicCounts[category] = (topicCounts[category] || 0) + 1;
    });
    
    return Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([category, count], index) => ({
        id: `trend-${index}`,
        title: category,
        category: category,
        trend: (index < 2 ? 'up' : index < 4 ? 'stable' : 'down') as 'up' | 'stable' | 'down',
        change: Math.random() * 30 - 10,
        posts: count,
        href: `/${safeLang}/category/${category.toLowerCase().replace(/\s+/g, '-')}`,
        color: ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500'][index]
      }));
  };

  // Get real weather data (simulated)
  const getWeatherData = () => {
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rain', 'Thunderstorm'];
    const icons = ['sun', 'cloud', 'cloud', 'rain', 'rain'];
    const currentCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const currentIcon = icons[conditions.indexOf(currentCondition)];
    
    return {
      location: safeLang === 'kh' ? 'ភ្នំពេញ, កម្ពុជា' : 'Phnom Penh, Cambodia',
      temperature: Math.floor(Math.random() * 10) + 28, // 28-37°C
      condition: currentCondition,
      humidity: Math.floor(Math.random() * 20) + 70, // 70-90%
      windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
      visibility: Math.floor(Math.random() * 5) + 8, // 8-12 km
      forecast: Array.from({ length: 5 }, (_, i) => {
        const dayNames = safeLang === 'kh' 
          ? ['ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ']
          : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        const icon = icons[conditions.indexOf(condition)];
        return {
          day: dayNames[i],
          high: Math.floor(Math.random() * 8) + 30,
          low: Math.floor(Math.random() * 8) + 22,
          condition,
          icon
        };
      })
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(safeLang === 'kh' ? 'km-KH' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(safeLang === 'kh' ? 'km-KH' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Organize articles
  const breakingNews = articles.filter(article => article.isBreaking).slice(0, 1)
  const mainStory = articles.find(article => article.isFeatured && !article.isBreaking) || articles[0]
  const topStories = articles.filter(article => 
    article.id !== mainStory?.id && 
    !article.isBreaking
  ).slice(0, 4)
  
  // For sidebar, use all articles except the main story, prioritizing non-breaking news
  const sidebarStories = articles
    .filter(article => article.id !== mainStory?.id)
    .sort((a, b) => {
      // Prioritize non-breaking news for sidebar
      if (a.isBreaking && !b.isBreaking) return 1
      if (!a.isBreaking && b.isBreaking) return -1
      // Then sort by views (most popular first)
      return (b.views || 0) - (a.views || 0)
    })
    .slice(0, 6)

  return (
    <div className="min-h-screen0">
      {/* Header Date Bar */}
      <div className="border-b border-gray-200 dark:border-gray-700 py-2 lg:py-3">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <div className="font-medium truncate">
              {formatDate(new Date().toISOString())}
            </div>
            <div className="hidden sm:flex items-center gap-2 lg:gap-4">
              <span className="text-xs whitespace-nowrap">Today's Paper</span>
              <span className="text-xs">|</span>
              <span className="text-xs whitespace-nowrap">Video</span>
              <span className="text-xs">|</span>
              <span className="text-xs whitespace-nowrap">Podcasts</span>
            </div>
            <div className="sm:hidden">
              <span className="text-xs">News</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breaking News Banner */}
      {breakingNews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-600 text-white py-2 sm:py-3"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-col sm:flex-row">
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Badge className="bg-white text-red-600 font-bold px-2 py-1 text-xs sm:px-3 sm:text-sm">
                  BREAKING
                </Badge>
                <span className="text-xs sm:text-sm opacity-90 sm:hidden">
                  {formatTime(breakingNews[0].publishedAt)}
                </span>
              </div>
              <Link 
                href={`/${safeLang}/news/${breakingNews[0].slug}`}
                className="font-semibold hover:underline flex-1 text-sm sm:text-base leading-tight"
              >
                {renderText(breakingNews[0].title)}
              </Link>
              <span className="text-sm opacity-90 hidden sm:block">
                {formatTime(breakingNews[0].publishedAt)}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main NY Times Layout */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 xl:gap-12">
          {/* Main Content Area */}
          <div className="xl:col-span-8">
            {/* Main Story */}
            {mainStory && (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 lg:mb-12 pb-6 lg:pb-8 border-b border-gray-200 dark:border-gray-700"
              >
                <Link href={`/${safeLang}/news/${mainStory.slug}`} className="group">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Image */}
                    {mainStory.thumbnail && (
                      <div className="relative aspect-[16/10] lg:aspect-[4/3] overflow-hidden rounded-lg">
                        <Image
                          src={mainStory.thumbnail}
                          alt={renderText(mainStory.title)}
                          fill
                          priority
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline" 
                          className="text-xs font-medium border-gray-300 dark:border-gray-600"
                        >
                          {renderText(mainStory.category.name)}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(mainStory.publishedAt)}
                        </span>
                      </div>
                      
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300">
                        {renderText(mainStory.title)}
                      </h1>
                      
                      <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                        {renderText(mainStory.description)}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {mainStory.author && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>By {mainStory.author.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{mainStory.views.toLocaleString()} views</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            )}

            {/* Top Stories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12">
              {topStories.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Link href={`/${safeLang}/news/${article.slug}`}>
                    {article.thumbnail && (
                      <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded-lg">
                        <Image
                          src={article.thumbnail}
                          alt={renderText(article.title)}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs">
                        <Badge 
                          variant="outline" 
                          className="text-xs border-gray-300 dark:border-gray-600"
                        >
                          {renderText(article.category.name)}
                        </Badge>
                        <span className="text-gray-500 dark:text-gray-400">
                          {formatTime(article.publishedAt)}
                        </span>
                      </div>
                      
                      <h2 className="text-lg sm:text-xl font-bold leading-tight text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300">
                        {renderText(article.title)}
                      </h2>
                      
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                        {renderText(article.description)}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {article.author && (
                          <span>By {article.author.name}</span>
                        )}
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{article.views.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>

            {/* Top Authors Section - Mobile/Tablet */}
            <div className=" mb-8">
              <TopAuthors lang={safeLang} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-4">
            <div className="sticky top-6 space-y-8">
              {/* Most Popular Section */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                  Most Popular
                </h3>
                <div className="space-y-4">
                  {sidebarStories.slice(0, 5).map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link 
                        href={`/${safeLang}/news/${article.slug}`}
                        className="group block hover:bg-gray-50 dark:hover:bg-gray-700 p-3 -m-3 rounded-lg transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <span className="text-lg font-bold text-gray-400 mt-1 min-w-[28px] text-center">
                            {index + 1}
                          </span>
                          <div className="space-y-2 flex-1">
                            <h4 className="font-semibold text-sm leading-tight text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-3">
                              {renderText(article.title)}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                              <span>{renderText(article.category.name)}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{article.views.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
                
              </div>

              {/* Editor's Picks */}
              <div className=" rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                  Editor's Picks
                </h3>
                <div className="space-y-6">
                  {sidebarStories.slice(0, 3).map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <Link 
                        href={`/${safeLang}/news/${article.slug}`}
                        className="group block hover:bg-gray-50 dark:hover:bg-gray-700 p-3 -m-3 rounded-lg transition-colors"
                      >
                        <div className="space-y-3">
                          {article.thumbnail && (
                            <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                              <Image
                                src={article.thumbnail}
                                alt={renderText(article.title)}
                                fill
                                sizes="(max-width: 768px) 100vw, 25vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                          )}
                          <div className="space-y-2">
                            <Badge 
                              variant="outline" 
                              className="text-xs border-gray-300 dark:border-gray-600"
                            >
                              {renderText(article.category.name)}
                            </Badge>
                            <h4 className="font-semibold text-sm leading-tight text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                              {renderText(article.title)}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(article.publishedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
                  {/* Top Authors Section - Desktop Only */}
              
              </div>

              {/* Weather Widget */}
              {safeLang && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <WeatherWidget lang={safeLang} realData={getWeatherData()} />
                </div>
              )}

            

              {/* More News Link */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link 
                  href={`/${safeLang}/news`}
                  className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors duration-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg py-3 px-4"
                >
                  <span>View All News</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div> 
     
      {/* Additional Home Page Sections - Below Main News */}
      {safeLang && (
        <div className="">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 lg:py-12">
            {/* Trending Topics Section */}
            <TrendingTopics lang={safeLang} realData={getTrendingTopics()} />
          </div>
        </div>
      )}

      {/* Awards Section */}
      {/* <AwardsSection lang={safeLang} /> */}
    </div>
  )
}
