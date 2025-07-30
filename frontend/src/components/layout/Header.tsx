"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { Menu,  LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import LanguageSwitcher from "@/components/layout/LanguageSwitcher"
import NewsSearch from "@/components/search/NewsSearch"
import { useAuth } from "@/context/AuthContext"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import NotificationDropdown from "@/components/notifications/NotificationDropdown"
import DesktopNav from "./DesktopNav"
import MobileNav from "./MobileNav"
import UserDropdown from "@/components/layout/UserDropdown"
import Logo from "@/components/layout/Logo"

const Header = () => {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const { scrollY } = useScroll()

  // State management
  const [uiState, setUiState] = useState({
    isMobileMenuOpen: false,
    isScrolled: false,
  })

  // Get current language
  const lang = useMemo(() => {
    const split = pathname.split("/")
    return split[1] ? split[1] : "en"
  }, [pathname])

  // Scroll detection for header styling
  useMotionValueEvent(scrollY, "change", (latest) => {
    setUiState((prev) => ({ ...prev, isScrolled: latest > 50 }))
  })

  // Enhanced logout without toast
  const handleLogout = useCallback(async () => {
    try {
      await logout()
      router.push(`/${lang}`)
    } catch {
      // No toast
    }
  }, [logout, router, lang])

  // Keyboard navigation and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUiState((prev) => ({
          ...prev,
          isMobileMenuOpen: false,
        }))
      }
    }

    // Body scroll lock for mobile menu
    if (uiState.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      // Cleanup body styles
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [uiState.isMobileMenuOpen])

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
          <Logo lang={lang} />

          {/* Desktop Navigation */}
          <DesktopNav lang={lang} pathname={pathname} />

          {/* Search Component */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <NewsSearch />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher />

            {/* Notifications (if user is logged in) */}
            {user && (
              <div className="hidden lg:flex">
                <NotificationDropdown />
              </div>
            )}

            {/* User actions */}
            {user ? (
              <div className="hidden lg:block">
                <UserDropdown user={user} lang={lang} onLogout={handleLogout} />
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
      <MobileNav 
        isOpen={uiState.isMobileMenuOpen}
        onClose={() => setUiState((prev) => ({ ...prev, isMobileMenuOpen: false }))}
        user={user}
        lang={lang}
        pathname={pathname}
        onLogout={handleLogout}
      />
    </>
  )
}

export default Header
