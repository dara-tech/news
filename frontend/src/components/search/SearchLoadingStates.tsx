"use client"

import { Search, Filter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface SearchLoadingSkeletonProps {
  count?: number
}

export const SearchLoadingSkeleton = ({ count = 5 }: SearchLoadingSkeletonProps) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex gap-4 p-4 border rounded-xl">
        <Skeleton className="w-24 h-24 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    ))}
  </div>
)

interface SearchEmptyStateProps {
  query: string
  onShowFilters: () => void
  showFilters: boolean
}

export const SearchEmptyState = ({ query, onShowFilters, showFilters }: SearchEmptyStateProps) => (
  <div className="text-center py-12">
    <div className="bg-muted/30 rounded-lg p-8">
      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-2xl font-semibold mb-4">
        No Results Found
      </h3>
      <p className="text-muted-foreground mb-6">
        We couldn&apos;t find any articles matching &quot;{query}&quot;
      </p>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Try:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Using different keywords</li>
          <li>Checking your spelling</li>
          <li>Using more general terms</li>
          <li>Adjusting your filters</li>
        </ul>
      </div>
    </div>
  </div>
)

interface SearchInitialStateProps {
  onShowFilters: () => void
}

export const SearchInitialState = ({ onShowFilters }: SearchInitialStateProps) => (
  <div className="text-center py-12">
    <div className="bg-muted/30 rounded-lg p-8">
      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-2xl font-semibold mb-4">
        Search News Articles
      </h3>
      <p className="text-muted-foreground">
        Enter keywords above to search through our news database
      </p>
    </div>
  </div>
)

interface SearchResultsHeaderProps {
  query: string
  totalResults: number
  showFilters: boolean
  onToggleFilters: () => void
}

export const SearchResultsHeader = ({ 
  query, 
  totalResults, 
  showFilters, 
  onToggleFilters 
}: SearchResultsHeaderProps) => (
  <div className="mb-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold mb-2">
          Search Results for &quot;{query}&quot;
        </h2>
        <p className="text-muted-foreground">
          {totalResults > 0
            ? `Found ${totalResults} article${totalResults !== 1 ? 's' : ''}`
            : 'No articles found'
          }
        </p>
      </div>
      {totalResults > 0 && (
        <Button variant="outline" onClick={onToggleFilters}>
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? 'Hide' : 'Show'} Filters
        </Button>
      )}
    </div>
  </div>
)

interface LoadMoreButtonProps {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
}

export const LoadMoreButton = ({ hasMore, isLoading, onLoadMore }: LoadMoreButtonProps) => {
  if (!hasMore) return null

  return (
    <div className="text-center pt-6">
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={isLoading}
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          'Load More Results'
        )}
      </Button>
    </div>
  )
}
