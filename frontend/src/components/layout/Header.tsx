"use client"

import { useState, useEffect, FC, useCallback } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import type { User } from "@/types"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"

// --- UI & ICONS ---
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import LanguageSwitcher from "./LanguageSwitcher"
import {
  Menu,
  User as UserIcon,
  Home,
  Computer,
  Briefcase,
  Trophy,
  UserCog,
  Settings,
  LogOut,
  X,
  Sun,
  Moon,
  Search,
  Sparkles,
  ChevronRight,
  Languages,
} from "lucide-react"

// --- TYPE DEFINITIONS ---
interface NavLink {
  href: string
  label: string
  icon: React.ElementType
  badge?: number
  isNew?: boolean
}

// --- CONSTANTS ---
const NAV_LINKS: NavLink[] = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/category/technology", icon: Computer, label: "Technology", badge: 12 },
  { href: "/category/business", icon: Briefcase, label: "Business", badge: 8 },
  { href: "/category/sports", icon: Trophy, label: "Sports", isNew: true },
]

// --- MAIN HEADER COMPONENT --- //
const Header: FC = () => {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const { scrollY } = useScroll()

  // Hide header on scroll down, show on scroll up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious()
    // Add null check for previous value
    if (previous === undefined) return
    
    if (latest > previous && latest > 150) {
      setIsHidden(true)
    } else if (latest < previous) {
      if (latest < 150) {
        setIsHidden(false)
      }
    }
  })

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev)

  return (
    <>
      <motion.header
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Logo />
            <DesktopNav />
          </div>

          <div className="flex items-center gap-2">
            <SearchCommand />
            <div className="hidden md:flex">
              <LanguageSwitcher />
            </div>
            {user ? (
              <UserDropdown user={user} logout={logout} />
            ) : (
              <Button asChild variant="ghost" className="hidden md:flex">
                <Link href="en/login">Login</Link>
              </Button>
            )}
            <MobileMenuToggle isOpen={isMobileMenuOpen} toggle={toggleMobileMenu} />
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileNav user={user} logout={logout} closeMenu={toggleMobileMenu} />
        )}
      </AnimatePresence>
    </>
  )
}

// --- SUBCOMPONENTS --- //

const Logo: FC = () => (
  <Link href="/" className="flex items-center gap-2 group">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
      D
    </div>
    <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
      DeepNews
    </span>
  </Link>
)

const DesktopNav: FC = () => {
  const pathname = usePathname()
  return (
    <nav className="hidden lg:flex items-center gap-2">
      {NAV_LINKS.map((link) => {
        // More robust active check for nested routes
        const isActive =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <span className="relative z-10 flex items-center gap-1.5">
              {link.label}
              {link.badge && <Badge variant="secondary">{link.badge}</Badge>}
              {link.isNew && (
                <Badge className="animate-pulse">
                  <Sparkles className="h-3 w-3" />
                </Badge>
              )}
            </span>
            {isActive && (
              <motion.div
                layoutId="active-nav-link"
                className="absolute inset-0 bg-muted rounded-md"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

const MobileMenuToggle: FC<{ isOpen: boolean; toggle: () => void }> = ({
  isOpen,
  toggle,
}) => (
  <Button variant="ghost" size="icon" className="md:hidden" onClick={toggle}>
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={isOpen ? "x" : "menu"}
        initial={{ rotate: 90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: -90, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </motion.div>
    </AnimatePresence>
    <span className="sr-only">Toggle menu</span>
  </Button>
)

const MobileNav: FC<{
  user: User | null
  logout: () => void
  closeMenu: () => void
}> = ({ user, logout, closeMenu }) => {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const handleLogout = () => {
    logout()
    closeMenu()
  }

  const menuVariants = {
    hidden: {
      opacity: 0,
      transition: { when: "afterChildren", staggerChildren: 0.05, staggerDirection: -1 },
    },
    visible: {
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.08 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  const MobileLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} onClick={closeMenu} className="flex items-center justify-between w-full p-3 text-lg font-medium rounded-lg hover:bg-muted">
      {children}
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-background/80 backdrop-blur-lg md:hidden"
    >
      <motion.div
        variants={menuVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="absolute top-16 left-0 w-full h-[calc(100vh-4rem)] p-4 flex flex-col"
      >
        <div className="flex-grow space-y-2">
          {NAV_LINKS.map((link) => (
            <motion.div key={link.href} variants={itemVariants}>
              <MobileLink href={link.href}>
                <span className={cn("flex items-center gap-3", pathname.startsWith(link.href) && "text-primary")}>
                  <link.icon className="h-5 w-5" /> {link.label}
                </span>
              </MobileLink>
            </motion.div>
          ))}
        </div>
        
        {/* --- Bottom Controls --- */}
        <div className="flex-shrink-0 border-t pt-4">
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between w-full p-3 text-lg font-medium rounded-lg">
              <span className="flex items-center gap-3">
                <Sun className="h-5 w-5" /> Theme
              </span>
              <div className="flex items-center gap-2 rounded-full p-1 bg-muted">
                <Button size="icon" variant={theme === 'light' ? 'default' : 'ghost'} onClick={() => setTheme('light')}> <Sun className="h-4 w-4" /> </Button>
                <Button size="icon" variant={theme === 'dark' ? 'default' : 'ghost'} onClick={() => setTheme('dark')}> <Moon className="h-4 w-4" /> </Button>
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between w-full p-3 text-lg font-medium rounded-lg">
              <span className="flex items-center gap-3">
                <Languages className="h-5 w-5" /> Language
              </span>
              <LanguageSwitcher />
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="mt-2">
            {user ? (
              <>
                <MobileLink href="/profile"><UserIcon className="h-5 w-5" /> Profile</MobileLink>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 text-lg font-medium text-destructive hover:bg-destructive/10 rounded-lg"
                >
                  <LogOut className="h-5 w-5" /> Log Out
                </button>
              </>
            ) : (
              <Button asChild className="w-full h-12 text-md">
                <Link href="en/login" onClick={closeMenu}>Login</Link>
              </Button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const UserDropdown: FC<{ user: User; logout: () => void }> = ({ user, logout }) => {
  const { theme, setTheme } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <UserIcon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" /> Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
          Toggle Theme
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const SearchCommand: FC = () => {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <Button variant="outline" className="h-9 w-9 p-0 md:w-40 md:justify-start md:px-3" onClick={() => setOpen(true)}>
        <Search className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline-flex">Search...</span>
        <kbd className="hidden md:inline-flex ml-auto pointer-events-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
              <Home className="mr-2 h-4 w-4" /> Go to Home
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/category/technology"))}>
              <Computer className="mr-2 h-4 w-4" /> Technology
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

export default Header