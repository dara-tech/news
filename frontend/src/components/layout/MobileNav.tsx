"use client"

import { useState, useEffect, useCallback, memo } from "react"
import Link from "next/link"
import { X, Home, Search, LogOut, LogIn, Settings, Shield, ChevronRight, FileText, User as UserIcon, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import LanguageSwitcher from "@/components/layout/LanguageSwitcher"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import MobileNotificationDropdown from "@/components/notifications/MobileNotificationDropdown"
import api from "@/lib/api"
import { User } from "@/types"
import Image from "next/image"

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

  // Minimal navigation links - only essential items
  const NAV_LINKS = [
    { href: `/${lang}`, label: "Home", icon: Home },
    { href: `/${lang}/news`, label: "News", icon: FileText }
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
    <>
      {isOpen && (
        <>
          {/* Minimal backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />
          
          {/* Minimal slide-out panel */}
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full bg-background border-l border-border flex flex-col overflow-hidden">
            {/* Minimal header */}
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h2 className="text-lg font-medium">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close menu"
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Minimal content */}
            <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Navigation - Clean and minimal */}
              <nav className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                    onClick={onClose}
                    prefetch={true}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* User section - Minimal design */}
              {user && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {user.profileImage || user.avatar ? (
                        <Image
                          src={user.profileImage || user.avatar as string}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                          width={32}
                          height={32}
                          unoptimized
                        />
                      ) : (
                        user.username?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.username || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Link
                      href={`/${lang}/profile`}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={onClose}
                      prefetch={true}
                    >
                      <Settings className="h-4 w-4" />
                      Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href={`/${lang}/admin/dashboard`}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={onClose}
                        prefetch={true}
                      >
                        <Shield className="h-4 w-4" />
                        Admin
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Categories - Simplified */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
                
                {/* Simple search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    value={state.searchQuery}
                    onChange={(e) => setState((prev) => ({ ...prev, searchQuery: e.target.value }))}
                    className="pl-10 h-9"
                  />
                </div>

                {/* Categories list - Clean */}
                <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-hide">
                  {state.isLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-2">
                          <Skeleton className="h-6 w-6 rounded" />
                          <Skeleton className="h-4 flex-1" />
                        </div>
                      ))}
                    </div>
                  ) : state.error ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-2">{state.error}</p>
                      <Button size="sm" variant="outline" onClick={() => fetchCategories()}>
                        Try Again
                      </Button>
                    </div>
                  ) : state.filteredCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {state.searchQuery ? "No categories found" : "No categories available"}
                    </p>
                  ) : (
                    state.filteredCategories.map((cat, index) => {
                      const categorySlug = typeof cat.slug === 'string' 
                        ? cat.slug 
                        : (cat.slug as any)?.[lang === 'kh' ? 'kh' : 'en'] || (cat.slug as any)?.en || cat._id;
                      return (
                        <Link
                          key={`category-${index}-${String(cat._id || 'unknown')}`}
                          href={`/${lang}/category/${String(categorySlug).replace(/[^a-zA-Z0-9-_]/g, '-')}`}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                          onClick={onClose}
                          prefetch={true}
                        >
                          <span className="text-sm font-medium">
                            {typeof cat.name === "string"
                              ? cat.name
                              : cat.name[lang === "kh" ? "kh" : "en"]}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Bottom actions - Minimal */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <LanguageSwitcher />
                  {user && <MobileNotificationDropdown />}
                </div>
                {user ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClose()
                      onLogout()
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                ) : (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/${lang}/login`} onClick={onClose} prefetch={true}>
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
})

MobileNav.displayName = 'MobileNav'

export default MobileNav