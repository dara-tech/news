"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import LanguageSwitcher from "@/components/layout/LanguageSwitcher"
import { useAuth } from "@/context/AuthContext"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import NotificationDropdown from "@/components/notifications/NotificationDropdown"
import DesktopNav from "./DesktopNav"
import MobileNav from "./MobileNav"
import UserDropdown from "@/components/layout/UserDropdown"
import Logo from "@/components/layout/Logo"
import EnhancedLoginButton from "./EnhancedLoginButton"

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
    } else {
      document.body.style.overflow = ''
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [uiState.isMobileMenuOpen])

  return (
    <>
      <motion.header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          uiState.isScrolled
            ? "bg-background/80 backdrop-blur-md border-b shadow-sm"
            : "bg-background/90 backdrop-blur-sm border-b border-border/20"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 overflow-visible">
          {/* Logo */}
          <Logo lang={lang} />

          {/* Desktop Navigation */}
          <DesktopNav lang={lang} pathname={pathname} />

          {/* Search Component */}

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />

            {/* User actions */}
            {user ? (
              <>
                <div className="hidden lg:block">
                  <NotificationDropdown />
                </div>
                <div className="hidden lg:block">
                  <UserDropdown user={user} lang={lang} onLogout={handleLogout} />
                </div>
              </>
            ) : (
              <div className="hidden lg:block">
                <EnhancedLoginButton lang={lang} />
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setUiState((prev) => ({ ...prev, isMobileMenuOpen: true }))}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
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