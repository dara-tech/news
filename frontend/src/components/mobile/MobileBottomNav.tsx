"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Home, Search, Bell, User, Menu } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useMobileOptimizations } from "@/hooks/useMobileOptimizations"
import { cn } from "@/lib/utils"

interface MobileBottomNavProps {
  onMenuClick?: () => void
  className?: string
}

const MobileBottomNav = ({ onMenuClick, className }: MobileBottomNavProps) => {
  const pathname = usePathname()
  const { user } = useAuth()
  const { isMobile, triggerHapticFeedback, triggerTouchFeedback } = useMobileOptimizations()

  if (!isMobile) return null

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      exact: true
    },
    {
      href: "/search",
      label: "Search",
      icon: Search
    },
    {
      href: "/notifications",
      label: "Notifications",
      icon: Bell,
      showBadge: true
    },
    {
      href: user ? "/profile" : "/login",
      label: user ? "Profile" : "Login",
      icon: User
    },
    {
      href: "#",
      label: "Menu",
      icon: Menu,
      onClick: onMenuClick
    }
  ]

  const handleItemClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    if (item.onClick) {
      e.preventDefault()
      item.onClick()
    }
    
    triggerHapticFeedback('light')
    triggerTouchFeedback(e.currentTarget as HTMLElement)
  }

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname.startsWith(item.href)
  }

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "mobile-nav fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50",
        "flex items-center justify-around px-2 py-1",
        "safe-area-pb",
        className
      )}
    >
      {navItems.map((item, index) => {
        const Icon = item.icon
        const active = isActive(item)
        
        return (
          <motion.div
            key={item.href}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={item.href}
              onClick={(e) => handleItemClick(item, e)}
              className={cn(
                "mobile-nav-item touchable relative flex flex-col items-center justify-center",
                "min-h-[44px] min-w-[44px] px-2 py-1 rounded-lg",
                "transition-all duration-200 ease-out",
                "active:scale-95",
                active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.showBadge && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background" />
                )}
              </div>
              <span className="text-xs font-medium mt-1 leading-none">
                {item.label}
              </span>
              
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute bottom-0 left-1/2 w-1 h-1 bg-primary rounded-full -translate-x-1/2"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          </motion.div>
        )
      })}
    </motion.nav>
  )
}

export default MobileBottomNav

