"use client"

import { motion } from "framer-motion"
import { Filter, Calendar, TrendingUp, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Category } from "@/types"

export interface SearchFilters {
  category?: string
  dateRange?: 'today' | 'week' | 'month' | 'year' | 'all'
  sortBy?: 'relevance' | 'date' | 'views' | 'title'
  featured?: boolean
  breaking?: boolean
}

interface SearchFiltersProps {
  filters: SearchFilters
  setFilters: (filters: SearchFilters) => void
  categories: Category[]
  lang: string
  isLoading: boolean
  onApplyFilters: () => void
}

// Get localized text
const getLocalizedText = (text: string | { en?: string; kh?: string } | undefined, locale: string) => {
  if (typeof text === 'string') return text
  return text?.[locale === 'km' ? 'kh' : 'en'] || text?.en || ''
}

export const SearchFiltersComponent = ({ 
  filters, 
  setFilters, 
  categories, 
  lang, 
  isLoading, 
  onApplyFilters 
}: SearchFiltersProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-muted/30 rounded-lg p-4 mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <Filter className="w-4 h-4" />
              {filters.category ?
                categories.find(c => c._id === filters.category)?.name?.[lang === 'km' ? 'kh' : 'en'] || 'Category'
                : 'Category'
              }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Select Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilters({ ...filters, category: undefined })}>
              All Categories
            </DropdownMenuItem>
            {categories.map((category) => (
              <DropdownMenuItem
                key={category._id}
                onClick={() => setFilters({ ...filters, category: category._id })}
              >
                {getLocalizedText(category.name, lang)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date Range Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <Calendar className="w-4 h-4" />
              {filters.dateRange === 'today' ? 'Today' :
                filters.dateRange === 'week' ? 'This Week' :
                  filters.dateRange === 'month' ? 'This Month' :
                    filters.dateRange === 'year' ? 'This Year' : 'All Time'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Date Range</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { value: 'all', label: 'All Time' },
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'year', label: 'This Year' }
            ].map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setFilters({ ...filters, dateRange: option.value as 'today' | 'week' | 'month' | 'year' | 'all' })}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort By Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <TrendingUp className="w-4 h-4" />
              {filters.sortBy === 'relevance' ? 'Relevance' :
                filters.sortBy === 'date' ? 'Date' :
                  filters.sortBy === 'views' ? 'Views' :
                    filters.sortBy === 'title' ? 'Title' : 'Sort By'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { value: 'relevance', label: 'Relevance' },
              { value: 'date', label: 'Date' },
              { value: 'views', label: 'Views' },
              { value: 'title', label: 'Title' }
            ].map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setFilters({ ...filters, sortBy: option.value as 'relevance' | 'date' | 'views' | 'title' })}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        <Button
          variant="outline"
          onClick={() => setFilters({})}
          className="w-full"
        >
          Clear Filters
        </Button>
      </div>

      {/* Apply Filters Button */}
      <div className="mt-4">
        <Button
          onClick={onApplyFilters}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Apply Filters
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
