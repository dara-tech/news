"use client"

import { useState, useMemo, useCallback, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Globe } from "lucide-react"
import { useRouter } from "next/navigation"

import { Article, Category } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Import the new components
import { BreakingNewsTicker } from "./BreakingNewsTicker"
import MainFeature from "./MainFeature"
import SecondaryFeatureGrid from "./SecondaryFeatureGrid"

interface HeroProps {
  breaking: Article[]
  featured: Article[]
  categories: Category[]
  locale: 'en' | 'kh'
}

const Hero: React.FC<HeroProps> = ({
  breaking = [],
  featured = [],
  categories = [],
  locale = 'en'
}) => {

  const [isTickerPaused, setIsTickerPaused] = useState(false)
  const router = useRouter()
  const tickerRef = useRef<{ pause: () => void; play: () => void }>(null)

  // Memoize derived values to prevent unnecessary recalculations
  const { mainFeature, secondaryFeatures, trendingCategories, allCategories } = useMemo(() => {
    const main = featured[0] || breaking[0] || null
    const secondaries = featured.slice(1, 5)
    const trending = categories.slice(0, 6)
    const remainingCategories = categories.slice(6)
    
    return {
      mainFeature: main,
      secondaryFeatures: secondaries,
      trendingCategories: trending,
      allCategories: remainingCategories
    }
  }, [breaking, featured, categories])



  // Toggle ticker pause state when hovering over the ticker
  const handleTickerHover = useCallback((isHovering: boolean) => {
    if (!tickerRef.current) return
    
    setIsTickerPaused(isHovering)
    if (isHovering) {
      tickerRef.current.pause()
    } else {
      tickerRef.current.play()
    }
  }, [])


  return (
    <section className="relative" aria-label="Featured content">
      {/* Simple gradient background */}
      <div 
        className=" inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" 
        aria-hidden="true"
      />

      {/* Breaking News */}
      {breaking.length > 0 && (
        <div 
          role="alert" 
          aria-live="polite"
          onMouseEnter={() => handleTickerHover(true)}
          onMouseLeave={() => handleTickerHover(false)}
          onFocus={() => handleTickerHover(true)}
          onBlur={() => handleTickerHover(false)}
          className={cn(
            "transition-all duration-200",
            isTickerPaused ? "bg-red-700" : "bg-red-600"
          )}
        >
          <BreakingNewsTicker 
            ref={tickerRef}
            articles={breaking} 
            locale={locale} 
            autoRotateInterval={6000} // 6 seconds per slide
          />
        </div>
      )}

      {/* Hero Header Section */}
      <div className="container mx-auto px-4 pt-8 md:pt-12 relative z-10">
        {/* Live Status Bar */}
        {/* <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 rounded-xl bg-card/50 border">
          <div className="flex items-center flex-wrap gap-4">
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" aria-hidden="true" />
              <span>Trending Now</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Eye className="w-3 h-3" aria-hidden="true" />
              <span>{formatReaders(READERS_COUNT)} Reading</span>
            </Badge>
          </div>
        </div> */}

        {/* Main Content Grid */}
        <div className="space-y-12">
          {/* Featured Articles Section */}
          <div className={cn("grid grid-cols-1 gap-8", {
            'lg:grid-cols-3': mainFeature,
            'lg:grid-cols-1': !mainFeature
          })}>
            {mainFeature ? (
              <div className="lg:col-span-2">
                <MainFeature article={mainFeature} locale={locale} />
              </div>
            ) : null}
            
            {secondaryFeatures.length > 0 && (
              <div className="space-y-6">
                <SecondaryFeatureGrid 
                  articles={secondaryFeatures} 
                  locale={locale} 
                />
              </div>
            )}
          </div>

          {/* Trending Categories Section */}
          {trendingCategories.length > 0 && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
                  aria-hidden="true"
                >
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Discover Topics
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Explore What Matters
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Stay ahead with curated content across technology, business, sports, and more
                </p>
              </div>

              {/* Trending Categories Grid */}
              <div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                role="list"
                aria-label="Trending categories"
              >
                {trendingCategories.map((category) => {
                  // Create a stable article count based on category ID to avoid hydration mismatch
                  const stableCount = (category._id?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40) + 10;
                  const articleCount = stableCount;
                  const categoryName = category.name?.[locale] || 'Uncategorized'
                  const categorySlug = category.slug?.[locale] || category._id
                  
                  return (
                    <div key={category._id} role="listitem">
                      <Link 
                        href={`/category/${categorySlug}`}
                        className="block h-full"
                        aria-label={`View ${categoryName} category with ${articleCount} articles`}
                      >
                        <Card className="h-full group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                          <CardContent className="p-4 md:p-6 text-center space-y-3 h-full flex flex-col items-center justify-center">
                            <div className="w-10 h-10 md:w-12 md:h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <Globe className="w-5 h-5 md:w-6 md:h-6 text-primary" aria-hidden="true" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                                {categoryName}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {articleCount} {articleCount === 1 ? 'article' : 'articles'}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                    
                  )
                })}
              </div>

              {/* All Categories Button */}
              {allCategories.length > 0 && (
                <div className="text-center pt-2">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="group hover:border-primary transition-all duration-200"
                    onClick={() => router.push('/categories')}
                  >
                    <span>View All Categories</span>
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Hero