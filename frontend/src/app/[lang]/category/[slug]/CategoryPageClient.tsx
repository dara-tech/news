"use client"

import { useEffect, useState, use } from "react"
import { notFound } from "next/navigation"
import NewsGrid from "@/components/news/NewsGrid"
import { Tag, Calendar, TrendingUp, Users, ChevronDown, Filter, Grid, List, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Article } from "@/types"


// ----- INTERFACES & API FUNCTIONS -----
interface Category {
  _id: string
  id?: string
  name: { en: string; kh: string } | string
  slug: { en: string; kh: string } | string
  description?: { en: string; kh: string } | string
  color: string
  isActive: boolean
  newsCount?: number
  count?: number // For related categories count
  articles?: Article[] // Added for direct article access
  image?: string // Added for category image
}

interface CategoryPageProps {
  params: Promise<{ lang: string; slug: string }>
  category: {
    category: Category;
    articles: Article[];
  };
}

const getLocalizedText = (text: string | { en?: string; kh?: string } | undefined, lang: "en" | "kh" = "en"): string => {
  const safeLang = lang;
  if (!text) return "";
  if (typeof text === "string") return text;
  if (typeof text === "object") {
    if (typeof text[safeLang] === 'string') return text[safeLang]!;
    // Fallback to any available value
    const values = Object.values(text).filter(Boolean);
    if (values.length > 0) return values[0] as string;
  }
  return "";
}

// ----- PAGE COMPONENT -----
export default function CategoryPageClient({ params, category }: CategoryPageProps) {
  const { lang } = use(params);
  const safeLang = (lang === 'kh' ? 'kh' : 'en') as 'en' | 'kh';
  const categoryObj = category.category;
  const articles = category.articles;
  
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("latest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filteredArticles, setFilteredArticles] = useState(articles)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!categoryObj || !categoryObj.isActive) {
          notFound()
          return
        }
      } catch {
        // Error handling
      }
    }

    fetchData()
  }, [categoryObj])

  useEffect(() => {
    let filtered = articles || []
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article => 
        getLocalizedText(article.title, safeLang).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getLocalizedText(article.description, safeLang).toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Sort articles
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        case "oldest":
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        case "title":
          return getLocalizedText(a.title, safeLang).localeCompare(getLocalizedText(b.title, safeLang))
        default:
          return 0
      }
    })
    
    setFilteredArticles(filtered)
  }, [articles, searchTerm, sortBy, safeLang])

  if (!categoryObj) {
    return null
  }

  const categoryName = getLocalizedText(categoryObj.name, safeLang) || 'Category'
  const categoryDescription = getLocalizedText(categoryObj.description, safeLang)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden  border-b border-gray-200 dark:border-gray-700">
        <div className="absolute inset-0 " />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {/* Category Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full text-white text-2xl font-bold mb-6 shadow-lg" 
                 style={{ backgroundColor: String(categoryObj.color ?? '#3B82F6') }}>
              {(() => { 
                const name = categoryName; 
                return (typeof name === 'string' && name.length > 0 ? name.charAt(0).toUpperCase() : 'C'); 
              })()}
            </div>
            
            {/* Category Title */}
            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
              {categoryName}
            </h1>
            
            {/* Category Description */}
            {categoryDescription && (
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                {categoryDescription}
              </p>
            )}
            
            {/* Category Stats */}
            <div className="flex justify-center items-center gap-8 mb-8">
              <div className="flex items-center gap-2  px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {articles?.length || 0} Articles
                </span>
              </div>
              <div className="flex items-center gap-2  px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Updated Daily
                </span>
              </div>
              <div className="flex items-center gap-2 0 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Popular
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {articles && articles.length > 0 ? (
          <>
            {/* Controls Section */}
            <Card className="mb-8 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  {/* Search */}
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10  border-gray-200 dark:border-gray-600"
                      />
                    </div>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center gap-3">
                    {/* Sort */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40 ">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">Latest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="title">Title A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* View Mode */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="h-8 px-3"
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="h-8 px-3"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Results Counter */}
                {searchTerm && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Found {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} 
                      {searchTerm && (
                        <span> matching "<span className="font-medium">{searchTerm}</span>"</span>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Articles Content */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  All Articles
                  <Badge variant="secondary" className="ml-1">
                    {filteredArticles.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="recent" className="flex items-center gap-2">
                  Recent
                  <Badge variant="secondary" className="ml-1">
                    {filteredArticles.filter(a => {
                      const publishedDate = new Date(a.publishedAt)
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return publishedDate >= weekAgo
                    }).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  Trending
                  <Badge variant="secondary" className="ml-1">
                    {Math.min(filteredArticles.length, 5)}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-8">
                <NewsGrid articles={filteredArticles} locale={safeLang}/>
              </TabsContent>
              
              <TabsContent value="recent" className="space-y-8">
                <NewsGrid 
                  articles={filteredArticles.filter(a => {
                    const publishedDate = new Date(a.publishedAt)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return publishedDate >= weekAgo
                  })} 
                  locale={safeLang} 
        
                />
              </TabsContent>
              
              <TabsContent value="trending" className="space-y-8">
                <NewsGrid 
                  articles={filteredArticles.slice(0, 5)} 
                  locale={safeLang} 
    
                />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          /* Empty State */
          <Card className="text-center py-16border-0 shadow-lg">
            <CardContent className="space-y-6">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                <Tag className="w-12 h-12 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  No articles yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  This category is waiting for its first article. Check back soon for exciting content!
                </p>
              </div>
              <Button variant="outline" className="mt-6">
                Browse Other Categories
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
