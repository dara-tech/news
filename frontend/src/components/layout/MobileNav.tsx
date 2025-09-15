import { useState, useEffect, useCallback, memo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { X, Home, Search, LogOut, LogIn, Loader2, AlertCircle, RefreshCw, Settings, Shield, ChevronRight, Sparkles, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import NewsSearch from "@/components/search/EnterpriseSearch"
import LanguageSwitcher from "@/components/layout/LanguageSwitcher"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import MobileNotificationDropdown from "@/components/notifications/MobileNotificationDropdown"
import Logo from "./Logo"
import api from "@/lib/api"
import { User } from "@/types"
import Image from "next/image"
import EnterpriseSearch from "@/components/search/EnterpriseSearch"

type Category = {
  _id: string
  slug: string
  name: { en: string; kh: string } | string
  color?: string
  count?: number
}

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  lang: string
  pathname: string
  onLogout: () => void
}

const MobileNav = memo(({ isOpen, onClose, user, lang, pathname, onLogout }: MobileNavProps) => {
  // State management
  const [state, setState] = useState({
    categories: [] as Category[],
    isLoading: true,
    error: null as string | null,
    searchQuery: "",
    filteredCategories: [] as Category[],
  })

  // Navigation links
  const NAV_LINKS = [
    { href: `/${lang}`, label: "Home", icon: Home },
    { href: `/${lang}/news`, label: "News", icon: FileText },
    { href: `/${lang}/recommendations`, label: "Recommendations", icon: Sparkles }
  ]

  // Fetch categories with retry logic
  const fetchCategories = useCallback(
    async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }))

        const res = await api.get("/categories")
        const categories = res.data?.data || []

        setState((prev) => ({
          ...prev,
          categories,
          filteredCategories: categories,
          isLoading: false,
          error: null,
        }))
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
      }
    },
    [],
  )

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

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(state.searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [state.searchQuery, handleSearch])

  // Initial fetch
  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [fetchCategories, isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, x: "100%", scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: "100%", scale: 0.95 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.16, 1, 0.3, 1],
              scale: { duration: 0.3 }
            }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm sm:max-w-md bg-background/98 backdrop-blur-2xl flex flex-col overflow-hidden shadow-2xl border-l border-border/30"
          >
          {/* Mobile header with glassmorphism */}
          <div className="flex justify-between items-center p-6 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            {/* <Logo lang={lang} /> */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close menu"
              className="hover:bg-muted/60 transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Mobile content with improved spacing */}
          <div className="flex flex-col flex-1 overflow-y-auto overscroll-contain p-6 space-y-8">
            {/* Mobile Search with enhanced styling */}
            <div className="lg:hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-sm overflow-hidden"></div>
                <div className="relative">
                  <EnterpriseSearch lang={lang} />
                </div>
              </div>
            </div>
            
            {/* Navigation links with improved design */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Navigation</h3>
              <nav role="navigation" aria-label="Mobile navigation">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group flex flex-col items-center gap-3 p-3 sm:p-4 rounded-2xl text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${
                      pathname === link.href
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5"
                        : "text-muted-foreground hover:text-primary hover:bg-muted/30 hover:shadow-md"
                    }`}
                    onClick={onClose}
                    aria-current={pathname === link.href ? "page" : undefined}
                  >
                    <div className={`p-2 sm:p-3 rounded-xl transition-all duration-300 ${
                      pathname === link.href
                        ? "bg-primary/20"
                        : "bg-muted/60 group-hover:bg-primary/10"
                    }`}>
                      {link.icon && <link.icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />}
                    </div>
                    <span className="text-center text-xs sm:text-sm">{link.label}</span>
                  </Link>
                ))}
              </div>
              </nav>
            </div>

            {/* User Profile Card - Enhanced design */}
            {user && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Account</h3>
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-blue-800/50 shadow-xl">
                  {/* Background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full -translate-y-8 translate-x-8"></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-white/20 dark:ring-gray-800/20">
                          {user.profileImage || user.avatar ? (
                            typeof (user.profileImage || user.avatar) === "string" ? (
                              <Image
                                src={user.profileImage || user.avatar as string}
                                alt={user.username}
                                className="w-16 h-16 rounded-2xl object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                                width={64}
                                height={64}
                                unoptimized
                              />
                            ) : null
                          ) : null}
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-white/20 dark:ring-gray-800/20" style={{ display: user.profileImage || user.avatar ? 'none' : 'flex' }}>
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-white dark:border-gray-900 rounded-full shadow-lg"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
                          {user.username || 'User'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                          {user.email}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200/50 dark:border-blue-800/50">
                            {user.role || 'user'}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-semibold px-3 py-1 rounded-full border border-green-200/50 dark:border-green-800/50">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Actions with enhanced styling */}
                    <div className="mt-6 pt-6 border-t border-blue-200/50 dark:border-blue-800/50">
                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          href={`/${lang}/profile`}
                          className="group flex items-center justify-center gap-3 py-3 px-4 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg hover:scale-105"
                          onClick={onClose}
                        >
                          <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                          Profile
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            href={`/${lang}/admin/dashboard`}
                            className="group flex items-center justify-center gap-3 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            onClick={onClose}
                          >
                            <Shield className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                            Admin
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Categories section with enhanced design */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Categories</h3>
                {state.isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>

              {/* Search in mobile with enhanced styling */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-2xl blur-sm overflow-hidden"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    placeholder="Search categories..."
                    value={state.searchQuery}
                    onChange={(e) => setState((prev) => ({ ...prev, searchQuery: e.target.value }))}
                    className="pl-12 h-12 bg-background/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-background/90"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {state.isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>
                ) : state.error ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{state.error}</p>
                    <Button size="sm" variant="outline" onClick={() => fetchCategories()} className="rounded-xl">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                ) : state.filteredCategories.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {state.searchQuery ? "No categories found" : "No categories available"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {state.filteredCategories.map((cat, index) => {
                      // Get localized slug properly
                      const categorySlug = typeof cat.slug === 'string' 
                        ? cat.slug 
                        : (cat.slug as any)?.[lang === 'kh' ? 'kh' : 'en'] || (cat.slug as any)?.en || cat._id;
                      return (
                      <Link
                        key={`category-${index}-${String(cat._id || 'unknown')}`}
                        href={`/${lang}/category/${String(categorySlug).replace(/[^a-zA-Z0-9-_]/g, '-')}`}
                        className="group flex items-center justify-between p-4 rounded-2xl hover:bg-muted/40 transition-all duration-300 border border-transparent hover:border-border/50"
                        style={cat.color ? { borderLeft: `4px solid ${cat.color}` } : undefined}
                        onClick={onClose}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color || '#6b7280' }}></div>
                          </div>
                          <span className="font-medium text-base group-hover:text-primary transition-colors">
                            {typeof cat.name === "string"
                              ? cat.name
                              : cat.name[lang === "kh" ? "kh" : "en"]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {cat.count !== undefined && cat.count !== null && (
                            <Badge variant="secondary" className="text-xs rounded-full">
                              {cat.count}
                            </Badge>
                          )}
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </div>
                      </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile actions with enhanced design */}
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-border/50">
              <ThemeToggle />
              <LanguageSwitcher />
              {user && <MobileNotificationDropdown />}
              {user ? (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent border-border/50 hover:bg-muted/30 rounded-lg px-3 py-2 text-sm"
                  onClick={() => {
                    onClose()
                    onLogout()
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <Button asChild variant="outline" className="flex items-center gap-2 bg-transparent border-border/50 hover:bg-muted/30 rounded-lg px-3 py-2 text-sm">
                  <Link href={`/${lang}/login`} onClick={onClose}>
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                </Button>
              )}
            </div>
          </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

MobileNav.displayName = 'MobileNav'

export default MobileNav