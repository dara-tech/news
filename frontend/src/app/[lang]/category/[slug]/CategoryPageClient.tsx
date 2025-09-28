"use client"

import { useEffect, useState, use } from "react"
import { notFound } from "next/navigation"
import NewsGrid from "@/components/news/NewsGrid"
import { Tag, Calendar, TrendingUp, Users, Grid, List, Search, ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Article } from "@/types"
import TwitterLikeLayout from "@/components/hero/TwitterLikeLayout"


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

  // Create a custom main content component for the category page
  const CategoryMainContent = () => (
    <div className="space-y-6 px-1">
      {/* Minimal Back Navigation */}
      <div className=" py-8">
        <Button 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Minimal Hero Section */}
      <div className="border-b border-border pb-8 ">
        <div className="flex items-center gap-4 mb-6">
          {/* Category Icon - Minimal */}
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-lg font-medium" 
               style={{ backgroundColor: String(categoryObj.color ?? '#3B82F6') }}>
            {(() => { 
              const name = categoryName; 
              return (typeof name === 'string' && name.length > 0 ? name.charAt(0).toUpperCase() : 'C'); 
            })()}
          </div>
          
          <div>
            {/* Category Title - Clean */}
            <h1 className="text-3xl font-bold text-foreground mb-1">
              {categoryName}
            </h1>
            
            {/* Article Count - Minimal */}
            <p className="text-sm text-muted-foreground">
              {articles?.length || 0} articles
            </p>
          </div>
        </div>
        
        {/* Category Description - Clean */}
        {categoryDescription && (
          <p className="text-muted-foreground max-w-2xl">
            {categoryDescription}
          </p>
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {articles && articles.length > 0 ? (
          <>
            {/* Enhanced Filtering Section */}
            <div className="space-y-4">
              {/* Main Controls Row */}
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Search Section */}
                <div className="flex-1 w-full lg:max-w-md">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      placeholder="Search articles in this category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 bg-background border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Filter Controls */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  {/* Sort Dropdown */}
                  <div className="flex-1 lg:flex-none">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full lg:w-40 h-10 bg-background border-border hover:border-primary/50 transition-colors">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Latest First
                        </SelectItem>
                        <SelectItem value="oldest" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Oldest First
                        </SelectItem>
                        <SelectItem value="title" className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Title A-Z
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-muted rounded-lg p-1 border border-border">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="h-8 px-3 transition-all"
                      title="Grid view"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="h-8 px-3 transition-all"
                      title="List view"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
             
            </div>

            {/* Articles Content - Simplified */}
            <div className="space-y-6">
              <NewsGrid articles={filteredArticles} locale={safeLang} viewMode={viewMode}/>
            </div>
          </>   
        ) : (
          /* Minimal Empty State */
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                No articles yet
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                This category is waiting for its first article. Check back soon!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <TwitterLikeLayout
      breaking={[]}
      featured={[]}
      latestNews={[]}
      categories={[]}
      locale={safeLang}
      customMainContent={<CategoryMainContent />}
    />
  );
}
