"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import {
  Home,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  LogIn,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  Bell,
  User,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import LanguageSwitcher from "@/components/layout/LanguageSwitcher"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"
import { ThemeToggle } from "@/components/ui/theme-toggle"

type Category = {
  _id: string
  slug: string
  name: { en: string; kh: string } | string
  color?: string
  count?: number
}

type HeaderState = {
  categories: Category[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  filteredCategories: Category[]
}

const Header = () => {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const { scrollY } = useScroll()

  // Refs
  const categoriesBtnRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // State management
  const [state, setState] = useState<HeaderState>({
    categories: [],
    isLoading: true,
    error: null,
    searchQuery: "",
    filteredCategories: [],
  })

  const [uiState, setUiState] = useState({
    isMobileMenuOpen: false,
    isCategoriesOpen: false,
    isScrolled: false,
    isSearchFocused: false,
    retryCount: 0,
  })

  // Get current language
  const lang = useMemo(() => {
    const split = pathname.split("/")
    return split[1] ? split[1] : "en"
  }, [pathname])

  // Navigation links
  const NAV_LINKS = useMemo(() => [{ href: `/${lang}`, label: "Home", icon: Home }], [lang])

  // Scroll detection for header styling
  useMotionValueEvent(scrollY, "change", (latest) => {
    setUiState((prev) => ({ ...prev, isScrolled: latest > 50 }))
  })

  // Fetch categories with retry logic
  const fetchCategories = useCallback(
    async (retryCount = 0) => {
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
        // No toast
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

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(state.searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [state.searchQuery, handleSearch])

  // Initial fetch
  useEffect(() => {
    fetchCategories()
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [fetchCategories])

  // Close dropdowns on outside click with proper timing
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node

      if (uiState.isCategoriesOpen && categoriesBtnRef.current && !categoriesBtnRef.current.contains(target)) {
        // Check if click is inside the dropdown content
        const dropdownContent = document.querySelector("[data-dropdown-content]")
        if (dropdownContent && dropdownContent.contains(target)) {
          return // Don't close if clicking inside dropdown
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUiState((prev) => ({
          ...prev,
          isCategoriesOpen: false,
          isMobileMenuOpen: false,
        }))
      }

      if (e.key === "/" && e.ctrlKey) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Enhanced logout without toast
  const handleLogout = useCallback(async () => {
    try {
      await logout()
      router.push(`/${lang}`)
    } catch {
      // No toast
    }
  }, [logout, router, lang])

  // Categories dropdown content
  const CategoriesDropdown = () => (
    <motion.div
      data-dropdown-content
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute left-0 mt-2 w-80 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      {/* Search bar */}
      <div className="p-3 border-b border-border bg-muted/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search categories..."
            value={state.searchQuery}
            onChange={(e) => setState((prev) => ({ ...prev, searchQuery: e.target.value }))}
            onFocus={() => setUiState((prev) => ({ ...prev, isSearchFocused: true }))}
            onBlur={() => setUiState((prev) => ({ ...prev, isSearchFocused: false }))}
            className="pl-10 h-9 bg-background/50"
          />
        </div>
      </div>

      {/* Categories list */}
      <div className="max-h-80 overflow-y-auto">
        {state.isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : state.error ? (
          <div className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">{state.error}</p>
            <Button size="sm" variant="outline" onClick={() => fetchCategories()} disabled={state.isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : state.filteredCategories.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {state.searchQuery ? "No categories found" : "No categories available"}
          </div>
        ) : (
          <div className="py-2">
            {state.filteredCategories.map((cat, index) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/${lang}/category/${cat.slug}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-all duration-200 group cursor-pointer"
                  style={cat.color ? { borderLeft: `3px solid ${cat.color}` } : undefined}
                  onClick={(e) => {
                    e.stopPropagation()
                    setTimeout(() => {
                      setUiState((prev) => ({ ...prev, isCategoriesOpen: false }))
                    }, 50)
                  }}
                >
                  <div className="flex-1">
                    <span className="font-medium text-sm group-hover:text-primary transition-colors">
                      {typeof cat.name === "string"
                        ? cat.name
                        : cat.name[(lang === "km" || lang === "kh") ? "kh" : "en"]}
                    </span>
                    {cat.count !== undefined && cat.count !== null && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {cat.count}
                      </Badge>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )

  // User dropdown menu
  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.avatar || "/placeholder.jpg"} alt={user?.username || "User"} />
            <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user?.username && <p className="font-medium">{user.username}</p>}
            {user?.email && <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/profile`} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/admin/dashboard`} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Admin Panel
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // Desktop navigation
  // Remove hover dropdown, use click only for categories
  const DesktopNav = () => (
    <nav className="hidden lg:flex items-center gap-4">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-4 py-2 rounded-lg text-base font-semibold transition-all duration-200 flex items-center gap-2 ${
            pathname === link.href
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-primary hover:bg-muted/60"
          }`}
        >
          {link.icon && <link.icon className="h-5 w-5" />}
          {link.label}
        </Link>
      ))}

      <div className="relative">
        <button
          ref={categoriesBtnRef}
          className={`px-4 py-2 rounded-full text-base font-semibold flex items-center gap-2 transition-all duration-200 ${
            uiState.isCategoriesOpen
              ? "bg-muted/80 text-primary shadow-sm"
              : "text-muted-foreground hover:text-primary hover:bg-muted/60"
          }`}
          onClick={() => setUiState((prev) => ({ ...prev, isCategoriesOpen: !prev.isCategoriesOpen }))}
          aria-haspopup="true"
          aria-expanded={uiState.isCategoriesOpen}
        >
          Categories
          <motion.div animate={{ rotate: uiState.isCategoriesOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-5 w-5" />
          </motion.div>
          {state.isLoading && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
        </button>

        <AnimatePresence>{uiState.isCategoriesOpen && <CategoriesDropdown />}</AnimatePresence>
      </div>
    </nav>
  )

  // Mobile navigation
  const MobileNav = () => (
    <AnimatePresence>
      {uiState.isMobileMenuOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg flex flex-col"
        >
          {/* Mobile header */}
          <div className="flex justify-between items-center p-4 border-b border-border bg-background/80">
            <Link
              href={`/${lang}`}
              className="flex items-center gap-3 font-extrabold text-xl tracking-tight"
              onClick={() => setUiState((prev) => ({ ...prev, isMobileMenuOpen: false }))}
            >
              <motion.span
                className="bg-primary text-primary-foreground rounded-lg px-2 py-1 shadow"
                whileHover={{ scale: 1.1 }}
              >
                N
              </motion.span>
              Newsly
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setUiState((prev) => ({ ...prev, isMobileMenuOpen: false }))}
              aria-label="Close menu"
            >
              <X className="h-7 w-7" />
            </Button>
          </div>

          {/* Mobile content */}
          <div className="flex flex-col gap-4 p-6 flex-1 overflow-y-auto">
            {/* Navigation links */}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`py-3 px-3 rounded-lg text-lg font-semibold flex items-center gap-2 transition-all ${
                  pathname === link.href
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-primary hover:bg-muted/60"
                }`}
                onClick={() => setUiState((prev) => ({ ...prev, isMobileMenuOpen: false }))}
              >
                {link.icon && <link.icon className="h-5 w-5" />}
                {link.label}
              </Link>
            ))}

            {/* Categories section */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground font-semibold text-base">Categories</span>
                {state.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>

              {/* Search in mobile */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={state.searchQuery}
                  onChange={(e) => setState((prev) => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-10 h-9"
                />
              </div>

              <div className="flex flex-col gap-1 max-h-auto overflow-y-auto">
                {state.isLoading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
                ) : state.error ? (
                  <div className="text-center py-4">
                    <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">{state.error}</p>
                    <Button size="sm" variant="outline" onClick={() => fetchCategories()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                ) : state.filteredCategories.length === 0 ? (
                  <span className="text-muted-foreground text-sm px-2 py-2">
                    {state.searchQuery ? "No categories found" : "No categories available"}
                  </span>
                ) : (
                  state.filteredCategories.map((cat) => (
                    <Link
                      key={cat._id}
                      href={`/${lang}/category/${cat.slug}`}
                      className="flex items-center justify-between px-3 py-2  hover:bg-primary/10 transition-colors font-medium text-base"
                      style={cat.color ? { borderLeft: `3px solid ${cat.color}` } : undefined}
                      onClick={() => setUiState((prev) => ({ ...prev, isMobileMenuOpen: false }))}
                    >
                      <span>
                        {typeof cat.name === "string"
                          ? cat.name
                          : cat.name[(lang === "km" || lang === "kh") ? "kh" : "en"]}
                      </span>
                      {cat.count !== undefined && cat.count !== null && (
                        <Badge variant="secondary" className="text-xs">
                          {cat.count}
                        </Badge>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Mobile actions */}
            <div className="flex items-center justify-center gap-3 mt-auto pt-6 border-t border-border">
              <ThemeToggle />
              <LanguageSwitcher />
              {user ? (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                  onClick={() => {
                    setUiState((prev) => ({ ...prev, isMobileMenuOpen: false }))
                    handleLogout()
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <Button asChild variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Link
                    href={`/${lang}/login`}
                    onClick={() => setUiState((prev) => ({ ...prev, isMobileMenuOpen: false }))}
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <motion.header
        className={`sticky top-0 z-50 w-full border-b border-border transition-all duration-300 ${
          uiState.isScrolled
            ? "bg-background/80 backdrop-blur-xl shadow-lg"
            : "bg-background/95 backdrop-blur-xl shadow-sm"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          {/* Logo */}
          <Link href={`/${lang}`} className="flex items-center gap-3 font-extrabold text-2xl tracking-tight group">
            <motion.span
              className="bg-primary text-primary-foreground rounded-lg px-3 py-2 shadow group-hover:shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              N
            </motion.span>
            <span className="text-foreground group-hover:text-primary transition-colors">Newsly</span>
          </Link>

          {/* Desktop Navigation */}
          <DesktopNav />

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher />

            {/* Notifications (if user is logged in) */}
            {user && (
              <Button variant="ghost" size="icon" className="hidden lg:flex relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  3
                </Badge>
              </Button>
            )}

            {/* User actions */}
            {user ? (
              <div className="hidden lg:block">
                <UserDropdown />
              </div>
            ) : (
              <Button asChild variant="outline" className="hidden lg:flex items-center gap-2 bg-transparent">
                <Link href={`/${lang}/login`}>
                  <LogIn className="h-4 w-4" />
                  <span className="hidden md:inline">Login</span>
                </Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden flex items-center justify-center"
              onClick={() => setUiState((prev) => ({ ...prev, isMobileMenuOpen: true }))}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation */}
      <MobileNav />
    </>
  )
}

export default Header
