"use client"

import { useState, useEffect, FC } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"

// --- Type Definitions ---

interface NavLink {
  href: string
  label: string
  icon: React.ElementType
}

interface User {
  role: string
  // Add other user properties as needed
}
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import LanguageSwitcher from "./LanguageSwitcher"

import {
  Menu as MenuIcon,
  Bell as BellIcon,
  User as UserIcon,
  Home as HomeIcon,
  Computer as ComputerIcon,
  Briefcase as BriefcaseIcon,
  Trophy as TrophyIcon,
  UserCog as UserCogIcon,
  Settings,
  LogOut,
  X as XIcon,
  Sun,
  Moon,
} from "lucide-react"

// --- Main Header Component --- //
const Header: FC = () => {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  const navLinks = [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/category/technology", icon: ComputerIcon, label: "Technology" },
    { href: "/category/business", icon: BriefcaseIcon, label: "Business" },
    { href: "/category/sports", icon: TrophyIcon, label: "Sports" },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/90 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Logo />
          <DesktopNav navLinks={navLinks} />
          <div className="flex items-center gap-2">
            <DesktopRightNav />
            {user ? (
              <UserDropdownMenu user={user} logout={logout} />
            ) : (
              <LoginButton />
            )}
            <MobileMenuToggle
              isOpen={isMobileMenuOpen}
              toggle={toggleMobileMenu}
            />
          </div>
        </div>
      </header>
      <MobileNav
        isOpen={isMobileMenuOpen}
        toggle={toggleMobileMenu}
        navLinks={navLinks}
        user={user}
        logout={logout}
      />
    </>
  )
}

// --- Subcomponents --- //

const Logo: FC = () => {
  const pathname = usePathname()
  const isActive = pathname === '/'
  
  return (
    <Link href="/" className="group flex items-center gap-2">
      <span className={cn(
        "text-xl font-bold transition-all duration-300",
        isActive ? "text-primary" : "text-foreground",
        "group-hover:text-primary"
      )}>
        NewsApp
      </span>
    </Link>
  )
}

const DesktopNav: FC<{ navLinks: NavLink[] }> = ({ navLinks }) => {
  const pathname = usePathname()
  
  return (
    <nav className="hidden md:flex items-center gap-2">
      {navLinks.map((link) => {
        const isActive = pathname === link.href
        
        return (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button asChild variant="ghost" key={link.href}>
              <Link 
                href={link.href} 
                className={cn(
                  "flex items-center gap-2 transition-all duration-300",
                  isActive && "bg-accent text-primary"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          </motion.div>
        )
      })}
    </nav>
  )
}

const DesktopRightNav: FC = () => (
  <div className="hidden md:flex items-center gap-2">
    <LanguageSwitcher />
    <NotificationButton />
  </div>
)

const NotificationButton: FC = () => {
  const [notifications, setNotifications] = useState(3)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => prev + 1)
    }, 30000) // Increment every 30 seconds
    return () => clearInterval(interval)
  }, [])
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button variant="ghost" size="icon" className="relative">
        <BellIcon className="h-5 w-5" />
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {notifications}
        </span>
        <span className="sr-only">Notifications</span>
      </Button>
    </motion.div>
  )
}

const LoginButton: FC = () => (
  <Button asChild variant="outline" className="hidden md:flex">
    <Link href="/login">Login</Link>
  </Button>
)

const UserDropdownMenu: FC<{ user: User; logout: () => void }> = ({
  user,
  logout,
}) => {
  const { theme, setTheme } = useTheme()
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <UserIcon className="h-5 w-5" />
          <span className="sr-only">User Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <UserCogIcon className="h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <span className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span>Toggle Theme</span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const MobileMenuToggle: FC<{ isOpen: boolean; toggle: () => void }> = ({
  isOpen,
  toggle,
}) => (
  <Button
    variant="ghost"
    size="icon"
    className="md:hidden"
    onClick={toggle}
  >
    {isOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
    <span className="sr-only">Toggle menu</span>
  </Button>
)

const MobileNav: FC<{
  isOpen: boolean
  toggle: () => void
  navLinks: NavLink[]
  user: User | null
  logout: () => void
}> = ({ isOpen, toggle, navLinks, user, logout }) => {
  const pathname = usePathname()
  
  return (
    <div
      className={cn(
        "fixed inset-0 z-40 md:hidden",
        isOpen
          ? "bg-background/80 backdrop-blur-sm animate-in fade-in-20"
          : "animate-out fade-out-20 hidden"
      )}
    >
      <nav className="fixed left-0 top-16 h-full w-full bg-background p-6">
        <div className="space-y-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            
            return (
              <motion.div
                key={`mobile-${link.href}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md p-2 text-lg font-medium transition-all duration-300",
                    isActive ? "bg-accent text-primary" : "hover:bg-accent",
                    "flex-shrink-0"
                  )}
                  onClick={toggle}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              </motion.div>
            )
          })}
        </div>
        <div className="mt-8 border-t border-border pt-6">
          {user ? (
            <div className="space-y-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-md p-2 text-lg font-medium hover:bg-accent"
                  onClick={toggle}
                >
                  <UserIcon className="h-5 w-5" /> Profile
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-md p-2 text-lg font-medium hover:bg-accent"
                  onClick={toggle}
                >
                  <Settings className="h-5 w-5" /> Settings
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => {
                    logout()
                    toggle()
                  }}
                  className="w-full flex items-center gap-3 rounded-md p-2 text-lg font-medium text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-5 w-5" /> Log Out
                </button>
              </motion.div>
            </div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild className="w-full">
                <Link href="/login" onClick={toggle}>
                  Login
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </nav>
    </div>
  )
}

export default Header