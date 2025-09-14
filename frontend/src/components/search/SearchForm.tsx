"use client"

import { Search, Filter, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchFormProps {
  query: string
  setQuery: (query: string) => void
  isLoading: boolean
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  onSearch: (e: React.FormEvent) => void
  onClear: () => void
}

export const SearchForm = ({ 
  query, 
  setQuery, 
  isLoading, 
  showFilters, 
  setShowFilters, 
  onSearch, 
  onClear 
}: SearchFormProps) => {
  return (
    <form onSubmit={onSearch} className="mb-6">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search all news articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-12 h-12 text-lg"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-muted/50"
              onClick={onClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Search
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>
    </form>
  )
}
