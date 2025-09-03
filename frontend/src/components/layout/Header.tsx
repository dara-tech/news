"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { Menu, LogIn } from "lucide-react"
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
import LiveStatsBar from "./LiveStatsBar"
import EnhancedLoginButton from "./EnhancedLoginButton"
import QuickAdminAccess from "./QuickAdminAccess"

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
      {/* Live Stats Bar */}
      <LiveStatsBar />
      
      <motion.header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          uiState.isScrolled
            ? "bg-background/70 backdrop-blur-2xl border-b border-border/30 shadow-2xl shadow-primary/5"
            : "bg-background/85 backdrop-blur-xl border-b border-border/20 shadow-lg shadow-primary/3"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Enhanced glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-transparent to-purple-500/3 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        
        <div className="relative container mx-auto flex h-20 items-center justify-between px-4">
          {/* Logo */}
          <Logo lang={lang} />

          {/* Desktop Navigation */}
          <DesktopNav lang={lang} pathname={pathname} />

          {/* Enhanced Search Component */}
          <motion.div 
            className="hidden lg:block flex-1 max-w-md mx-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-sm" />
              <div className="relative">
                <NewsSearch />
              </div>
            </div>
          </motion.div>

          {/* Enhanced Right side actions */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ThemeToggle />
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LanguageSwitcher />
              </motion.div>
            </div>

            {/* Notifications and Admin Access (if user is logged in) */}
            {user && (
              <div className="hidden lg:flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <NotificationDropdown />
                </motion.div>
                
                {/* Quick Admin Access */}
                <QuickAdminAccess user={user} lang={lang} />
              </div>
            )}

            {/* Enhanced User actions */}
            {user ? (
              <div className="hidden lg:block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UserDropdown user={user} lang={lang} onLogout={handleLogout} />
                </motion.div>
              </div>
            ) : (
              <div className="hidden lg:block">
                <EnhancedLoginButton lang={lang} />
              </div>
            )}

            {/* Enhanced Mobile menu button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden"
            >
              <Button
                variant="ghost"
                size="icon"
                className="relative overflow-hidden bg-gradient-to-r from-blue-500/5 to-purple-500/5 hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-300"
                onClick={() => setUiState((prev) => ({ ...prev, isMobileMenuOpen: true }))}
                aria-label="Open menu"
              >
                <motion.div
                  animate={{ rotate: uiState.isMobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
                
                {/* Ripple effect */}
                <motion.div
                  className="absolute inset-0 bg-primary/20 rounded-md"
                  initial={{ scale: 0, opacity: 0 }}
                  whileTap={{ scale: 1.2, opacity: 0.3 }}
                  transition={{ duration: 0.2 }}
                />
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Bottom gradient border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
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