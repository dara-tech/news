"use client"

import { useMemo, useState, memo, useEffect } from "react"
import type { Article, Category } from "@/types"
import { Button } from "@/components/ui/button"
import TwitterLikeLayout from "./TwitterLikeLayout"

interface HeroProps {
  breaking: Article[]
  featured: Article[]
  latest: Article[]
  categories: Category[]
  locale: "en" | "kh"
  useTwitterLayout?: boolean
  isLoading?: boolean
}

const Hero = ({ breaking = [], featured = [], latest = [], categories = [], locale = "en", useTwitterLayout = true, isLoading = false }: HeroProps) => {
  const [hasError, setHasError] = useState(false)

  // Error boundary for client-side errors
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Hero component error', error)
      setHasError(true)
    }
    
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  // Memoize derived values
  const { latestNews } = useMemo(() => {
    // If we have latest data from API, use it directly
    if (latest.length > 0) {
      return {
        latestNews: latest,
      }
    }
    
    // Fallback: Create a Map to ensure unique articles by _id
    const uniqueArticles = new Map()
    
    // Add featured articles first
    featured.forEach(article => {
      if (article._id) {
        uniqueArticles.set(article._id, article)
      }
    })
    
    // Add breaking articles (they will override featured if same _id, which is fine)
    breaking.forEach(article => {
      if (article._id) {
        uniqueArticles.set(article._id, article)
      }
    })
    
    const fallbackLatest = Array.from(uniqueArticles.values()).slice(0, 8)
    
    return {
      latestNews: fallbackLatest,
    }
  }, [breaking, featured, latest])

  // Error fallback
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background ">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Unable to load content</h2>
          <p className="text-muted-foreground mb-4">Please refresh the page to try again.</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }

  // Use Twitter-like layout if enabled
  if (useTwitterLayout) {
    return (
      <TwitterLikeLayout
        breaking={breaking}
        featured={featured}
        latestNews={latestNews}
        categories={categories}
        locale={locale}
        isLoading={isLoading}
      />
    );
  }

  // Fallback for non-Twitter layout
  return null;
}

export default memo(Hero)
