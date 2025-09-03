import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Home, ChevronDown, ChevronRight, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/api"

type Category = {
  _id: string
  slug: string
  name: { en: string; kh: string } | string
  color?: string
  count?: number
}

interface DesktopNavProps {
  lang: string
  pathname: string
}

const DesktopNav = ({ lang, pathname }: DesktopNavProps) => {
  // Refs
  const categoriesBtnRef = useRef<HTMLButtonElement>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // State management
  const [state, setState] = useState({
    categories: [] as Category[],
    isLoading: true,
    error: null as string | null,
    searchQuery: "",
    filteredCategories: [] as Category[],
  })

  const [uiState, setUiState] = useState({
    isCategoriesOpen: false,
    retryCount: 0,
  })

  // Navigation links
  const NAV_LINKS = useMemo(() => [{ href: `/${lang}`, label: "Home", icon: Home }], [lang])

  // Fetch categories with retry logic
  const fetchCategories = useCallback(
    async (retryCount = 0) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }))

        const res = await api.get(`/categories?lang=${lang}`)
        const categories = res.data?.data || []

        setState((prev) => ({
          ...prev,
          categories,
          filteredCategories: categories, // Always show all categories since no search
          isLoading: false,
          error: null,
        }))

        setUiState((prev) => ({ ...prev, retryCount: 0 }))
      } catch (err) {
        const errorMessage =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Failed to load categories"

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }))

        // Auto retry with exponential backoff
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000
          retryTimeoutRef.current = setTimeout(() => {
            fetchCategories(retryCount + 1)
          }, delay)

          setUiState((prev) => ({ ...prev, retryCount: retryCount + 1 }))
        }
      }
    },
    [lang],
  )

  // Initial fetch
  useEffect(() => {
    fetchCategories()
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [fetchCategories])

  // Search functionality with debouncing
  const handleSearch = useCallback(
    (query: string) => {
      setState((prev) => {
        const filtered =
          query.trim() === ""
            ? prev.categories
            : prev.categories.filter((cat) => {
                const isKhmer = lang === "km" || lang === "kh"
                const name =
                  typeof cat.name === "string"
                    ? cat.name
                    : cat.name[isKhmer ? "kh" : "en"]
                return name.toLowerCase().includes(query.toLowerCase())
              })

        return {
          ...prev,
          searchQuery: query,
          filteredCategories: filtered,
        }
      })
    },
    [lang],
  )

  // Close dropdowns on outside click with proper timing
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node

      if (uiState.isCategoriesOpen && categoriesBtnRef.current && !categoriesBtnRef.current.contains(target)) {
        // Check if click is inside the dropdown content
        const dropdownContent = document.querySelector("[data-dropdown-content]")
        if (dropdownContent && dropdownContent.contains(target)) {
          return
        }

        // Add small delay to allow link navigation
        setTimeout(() => {
          setUiState((prev) => ({ ...prev, isCategoriesOpen: false }))
        }, 100)
      }
    }

    if (uiState.isCategoriesOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [uiState.isCategoriesOpen])

  // Categories dropdown content
  const CategoriesDropdown = () => (
    <motion.div
      data-dropdown-content
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute left-0 mt-3 w-96 bg-background/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl z-50 overflow-hidden"
    >
      {/* Enhanced search bar with gradient background */}
      <div className="p-4 border-b border-border/30 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-lg"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              placeholder="Search categories..."
              value={state.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-12 bg-background/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-background/90"
            />
          </div>
        </div>
      </div>

      {/* Enhanced categories list */}
      <div className="max-h-96 overflow-y-auto">
        {state.isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        ) : state.error ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span role="img" aria-label="cat sad" className="text-3xl">😿</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{state.error}</p>
            <Button size="sm" variant="outline" onClick={() => fetchCategories()} disabled={state.isLoading} className="rounded-xl">
              Try Again
            </Button>
          </div>
        ) : state.filteredCategories.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {state.searchQuery ? "No categories found" : "No categories available"}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {state.filteredCategories.map((cat, index) => {
              return (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/${lang}/category/${cat.slug}`}
                  className="group flex items-center justify-between p-4 rounded-2xl hover:bg-muted/40 transition-all duration-300 border border-transparent hover:border-border/50"
                  style={cat.color ? { borderLeft: `4px solid ${cat.color}` } : undefined}
                  onClick={(e) => {
                    e.stopPropagation()
                    setTimeout(() => {
                      setUiState((prev) => ({ ...prev, isCategoriesOpen: false }))
                    }, 50)
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#6b7280' }}></div>
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-base group-hover:text-primary transition-colors">
                        {typeof cat.name === "string"
                          ? cat.name
                          : cat.name[(lang === "km" || lang === "kh") ? "kh" : "en"]}
                      </span>
                      {cat.count !== undefined && cat.count !== null && (
                        <Badge variant="secondary" className="ml-2 text-xs rounded-full">
                          {cat.count}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-60 transition-opacity" />
                </Link>
              </motion.div>
            )})}
          </div>
        )}
      </div>
    </motion.div>
  )

  return (
    <nav className="hidden lg:flex items-center gap-4">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`group relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
            pathname === link.href
              ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
              : "text-muted-foreground hover:text-primary hover:bg-muted/30"
          }`}
        >
          <div className={`p-1 rounded-md transition-all duration-300 ${
            pathname === link.href
              ? "bg-primary/20"
              : "bg-muted/60 group-hover:bg-primary/10"
          }`}>
            {link.icon && <link.icon className="h-4 w-4" />}
          </div>
          {link.label}
        </Link>
      ))}

      <div className="relative">
        <Button
          ref={categoriesBtnRef}
          className={`group relative px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
            uiState.isCategoriesOpen
              ? "bg-blue-500/10 text-primary border border-blue-500/20 shadow-sm"
              : "text-muted-foreground hover:text-primary hover:bg-muted/30"
          }`}
          onClick={() => {
            setUiState((prev) => ({ ...prev, isCategoriesOpen: !prev.isCategoriesOpen }))
          }}
          aria-haspopup="true"
          aria-expanded={uiState.isCategoriesOpen}
        >
          <div className={`p-1 rounded-md transition-all duration-300 ${
            uiState.isCategoriesOpen
              ? "bg-primary/20"
              : "bg-muted/60 group-hover:bg-primary/10"
          }`}>
            <ChevronDown className="h-4 w-4 transition-transform duration-300" />
          </div>
          Categories
          {state.isLoading && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
        </Button>

        <AnimatePresence>
          {uiState.isCategoriesOpen && (
            <CategoriesDropdown />
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default DesktopNav