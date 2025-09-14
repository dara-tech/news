import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Home, ChevronDown, ChevronRight, Search, Loader2, Star, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

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

const DesktopNav = memo(({ lang, pathname }: DesktopNavProps) => {
  const { user } = useAuth()
  
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
  const NAV_LINKS = useMemo(() => [
    { href: `/${lang}`, label: "Home", icon: Home },
    { href: `/${lang}/news`, label: "News", icon: FileText },
    { href: `/${lang}/recommendations`, label: "Recommendations", icon: Star }
  ], [lang])

  // Fetch categories with retry logic
  const fetchCategories = useCallback(
    async (retryCount = 0) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }))

        const res = await api.get(`/categories`)
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
                const isKhmer = lang === "kh"
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
  const CategoriesDropdown = () => {
    return (
      <div
        data-dropdown-content
        className="fixed left-1/2 transform -translate-x-1/2 top-24 w-80 bg-background/98 backdrop-blur-xl border border-border/20 rounded-xl shadow-xl z-[9999] overflow-hidden"
      >
      {/* Minimalistic search bar */}
      <div className="p-3 border-b border-border/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Search categories..."
            value={state.searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-9 bg-transparent border-0 focus-visible:ring-0 text-sm placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Categories list */}
      <div className="max-h-80 overflow-y-auto">
        {state.isLoading ? (
          <div className="p-2 space-y-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2 mx-1">
                <Skeleton className="h-6 w-6 rounded-md" />
                <Skeleton className="h-4 flex-1 rounded" />
              </div>
            ))}
          </div>
        ) : state.error ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-lg text-muted-foreground/60">⚠</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{state.error}</p>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => fetchCategories()} 
              disabled={state.isLoading} 
              className="h-7 px-3 text-xs rounded-lg hover:bg-muted/40"
            >
              Retry
            </Button>
          </div>
        ) : state.filteredCategories.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Search className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <p className="text-xs text-muted-foreground/70">
              {state.searchQuery ? "No matches found" : "No categories available"}
            </p>
          </div>
        ) : (
          <div className="p-1">
            {state.filteredCategories.map((cat, index) => {
              const categorySlug = typeof cat.slug === 'string' ? cat.slug : 
                                 typeof cat._id === 'string' ? cat._id : 
                                 `category-${index}`;
              return (
              <motion.div
                key={`category-${index}-${String(cat._id || 'unknown')}`}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02, duration: 0.1 }}
              >
                <Link
                  href={`/${lang}/category/${String(categorySlug).replace(/[^a-zA-Z0-9-_]/g, '-')}`}
                  className="group flex items-center justify-between p-2 mx-1 rounded-lg hover:bg-muted/30 transition-all duration-150"
                  onClick={(e) => {
                    e.stopPropagation()
                    setTimeout(() => {
                      setUiState((prev) => ({ ...prev, isCategoriesOpen: false }))
                    }, 50)
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: cat.color || '#9ca3af' }}
                    ></div>
                    <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors truncate">
                      {typeof cat.name === "string"
                        ? cat.name
                        : cat.name[lang === "kh" ? "kh" : "en"]}
                    </span>
                    {cat.count !== undefined && cat.count !== null && (
                      <Badge variant="secondary" className="ml-auto text-xs h-5 px-1.5 rounded-md bg-muted/50 text-muted-foreground border-0">
                        {cat.count}
                      </Badge>
                    )}
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0 ml-2" />
                </Link>
              </motion.div>
            )})}
          </div>
        )}
      </div>
    </div>
    )
  }

  return (
    <nav 
      className="hidden lg:flex items-center gap-2 relative z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`group relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${
            pathname === link.href
              ? "bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/5"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:shadow-sm"
          }`}
          aria-current={pathname === link.href ? "page" : undefined}
        >
          <link.icon className={`h-4 w-4 transition-all duration-300 ${
            pathname === link.href ? "text-primary" : "group-hover:scale-110"
          }`} 
          aria-hidden="true"
          />
          <span>{link.label}</span>
          {pathname === link.href && (
            <motion.div
              className="absolute inset-0 bg-primary/5 rounded-xl"
              layoutId="activeTab"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              aria-hidden="true"
            />
          )}
        </Link>
      ))}

      <div className="relative">
        <Button
          ref={categoriesBtnRef}
          variant="ghost"
          size="sm"
          className={`group relative px-4 py-2.5 h-auto rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${
            uiState.isCategoriesOpen
              ? "bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/5"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:shadow-sm"
          }`}
          onClick={() => {
            setUiState((prev) => ({ ...prev, isCategoriesOpen: !prev.isCategoriesOpen }))
          }}
          aria-haspopup="true"
          aria-expanded={uiState.isCategoriesOpen}
          aria-label="Categories menu"
        >
          <span>Categories</span>
          {state.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ChevronDown className={`h-4 w-4 transition-all duration-300 ${
              uiState.isCategoriesOpen ? 'rotate-180 scale-110' : 'group-hover:scale-110'
            }`} aria-hidden="true" />
          )}
        </Button>

        {uiState.isCategoriesOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[9998] bg-black/20" onClick={() => setUiState((prev) => ({ ...prev, isCategoriesOpen: false }))} />
            <CategoriesDropdown />
          </>
        )}
      </div>

    </nav>
  )
})

DesktopNav.displayName = 'DesktopNav'

export default DesktopNav