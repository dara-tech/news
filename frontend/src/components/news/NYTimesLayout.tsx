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
    <div className=" min-h-screen">
      {/* Header Date Bar */}
      <div className="border-b border-gray-200 dark:border-gray-700 py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <div className="font-medium">
              {formatDate(new Date().toISOString())}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs">Today's Paper</span>
              <span className="text-xs">|</span>
              <span className="text-xs">Video</span>
              <span className="text-xs">|</span>
              <span className="text-xs">Podcasts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breaking News Banner */}
      {breakingNews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-600 text-white py-3"
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <Badge className="bg-white text-red-600 font-bold px-3 py-1">
                BREAKING
              </Badge>
              <Link 
                href={`/${safeLang}/news/${breakingNews[0].slug}`}
                className="font-semibold hover:underline flex-1"
              >
                {renderText(breakingNews[0].title)}
              </Link>
              <span className="text-sm opacity-90">
                {formatTime(breakingNews[0].publishedAt)}
              </span>
            </div>
          </div>

        
   
        </motion.div>
      )}

      {/* Main NY Times Layout - TOP PRIORITY */}
      <div className="container mx-auto px-4 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Main Story */}
            {mainStory && (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 pb-8 border-b border-gray-200 dark:border-gray-700"
              >
                <Link href={`/${safeLang}/news/${mainStory.slug}`} className="group">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image */}
                    {mainStory.thumbnail && (
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={mainStory.thumbnail}
                          alt={renderText(mainStory.title)}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className="text-xs font-medium border-gray-300"
                        >
                          {renderText(mainStory.category.name)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTime(mainStory.publishedAt)}
                        </span>
                      </div>
                      
                      <h1 className="text-3xl lg:text-4xl font-bold leading-tight text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {renderText(mainStory.title)}
                      </h1>
                      
                      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                        {renderText(mainStory.description)}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
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
                 {/* Top Authors Section */}
   <TopAuthors lang={safeLang} />
              </motion.article>
            )}

            {/* Top Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
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
                      <div className="relative aspect-[16/9] mb-4 overflow-hidden">
                        <Image
                          src={article.thumbnail}
                          alt={renderText(article.title)}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Badge 
                          variant="outline" 
                          className="text-xs border-gray-300"
                        >
                          {renderText(article.category.name)}
                        </Badge>
                        <span className="text-gray-500">
                          {formatTime(article.publishedAt)}
                        </span>
                      </div>
                      
                      <h2 className="text-xl font-bold leading-tight text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {renderText(article.title)}
                      </h2>
                      
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                        {renderText(article.description)}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
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

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              {/* Most Popular Section */}
              <div>
                <h3 className="text-lg font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
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
                        className="group block"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg font-bold text-gray-400 mt-1 min-w-[24px]">
                            {index + 1}
                          </span>
                          <div className="space-y-1">
                            <h4 className="font-semibold text-sm leading-tight text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-3">
                              {renderText(article.title)}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
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
              <div>
                <h3 className="text-lg font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
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
                        className="group block"
                      >
                        <div className="space-y-3">
                          {article.thumbnail && (
                            <div className="relative aspect-[16/9] overflow-hidden">
                              <Image
                                src={article.thumbnail}
                                alt={renderText(article.title)}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 20vw"
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          )}
                          <div className="space-y-2">
                            <Badge 
                              variant="outline" 
                              className="text-xs border-gray-300"
                            >
                              {renderText(article.category.name)}
                            </Badge>
                            <h4 className="font-semibold text-sm leading-tight text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                              {renderText(article.title)}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(article.publishedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Weather Widget */}
              {safeLang && <WeatherWidget lang={safeLang} realData={getWeatherData()} />}


              {/* More News Link */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link 
                  href={`/${safeLang}/news`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
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
        <div className="container mx-auto px-4 py-8">
          {/* Trending Topics Section */}
          <TrendingTopics lang={safeLang} realData={getTrendingTopics()} />
        </div>
      )}

     

      {/* Awards Section */}
      {/* <AwardsSection lang={safeLang} /> */}
    </div>
  )
}
