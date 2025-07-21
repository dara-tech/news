"use client"

import { useState, useEffect, FC } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
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
  ChevronRight,
  Languages,
} from "lucide-react"

// --- TYPE DEFINITIONS ---
interface NavLink {
  href: string
  label: string
  icon: React.ElementType
  isNew?: boolean
}

// --- CONSTANTS ---
// UPDATED: Removed the `badge` property to get rid of the numbers.
const NAV_LINKS: NavLink[] = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/category/technology", icon: Computer, label: "Technology" },
  { href: "/category/business", icon: Briefcase, label: "Business" },
  { href: "/category/sports", icon: Trophy, label: "Sports", isNew: true },
]

const COMMAND_ITEMS = [
  { href: "/", label: "Go to Home", icon: Home },
  { href: "/admin/profile", label: "View Profile", icon: UserIcon },
  { href: "/settings", label: "Open Settings", icon: Settings },
]

// =================================================================
// --- MAIN HEADER COMPONENT ---
// =================================================================
const Header: FC = () => {
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    if (latest > previous && latest > 150) {
      setIsHidden(true)
    } else {
      setIsHidden(false)
    }
  })

  const pathname = usePathname()
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
  }, [pathname, isMobileMenuOpen])

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev)

  return (
    <>
      <motion.header
        variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm"
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
            {user ? <UserDropdown /> : <LoginButton />}
            <MobileMenuToggle isOpen={isMobileMenuOpen} toggle={toggleMobileMenu} />
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && <MobileNav />}
      </AnimatePresence>
    </>
  )
}

// =================================================================
// --- SUBCOMPONENTS ---
// =================================================================

const Logo: FC = () => (
  <Link href="/" className="flex items-center gap-2 group">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
      N
    </div>
    <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
      Newsly
    </span>
  </Link>
)

const DesktopNav: FC = () => {
  const pathname = usePathname()
  return (
    <nav className="hidden lg:flex items-center gap-1">
      {NAV_LINKS.map((link) => {
        const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
              // UPDATED: Active link has contrasting text for the primary background.
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <span className="relative z-10 flex items-center gap-1.5">
              {link.label}
              {/* UPDATED: Removed badge rendering logic. */}
              {link.isNew && <Badge className="bg-sky-500 text-sky-50 hover:bg-sky-400">New</Badge>}
            </span>
            {isActive && (
              <motion.div
                layoutId="active-nav-link"
                // UPDATED: Active link background is now the solid primary color.
                className="absolute inset-0 bg-primary rounded-md"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

const MobileMenuToggle: FC<{ isOpen: boolean; toggle: () => void }> = ({ isOpen, toggle }) => (
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

const MobileNav: FC = () => {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const menuVariants = {
    hidden: { opacity: 0, transition: { when: "afterChildren", staggerChildren: 0.05, staggerDirection: -1 } },
    visible: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.08 } },
  }
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }

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
          {NAV_LINKS.map((link) => {
            // UPDATED: More robust active check for mobile view.
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
            return (
              <motion.div key={link.href} variants={itemVariants}>
                <Link
                  href={link.href}
                  className="flex items-center justify-between w-full p-3 text-lg font-medium rounded-lg hover:bg-muted"
                >
                  <span className={cn(
                    "flex items-center gap-3",
                    // UPDATED: Active link is bold and uses the primary color.
                    isActive && "text-primary font-bold"
                  )}>
                    <link.icon className="h-5 w-5" /> {link.label}
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </motion.div>
            )
          })}
        </div>

        <div className="flex-shrink-0 border-t pt-4 space-y-2">
          <motion.div variants={itemVariants} className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-lg font-medium"><Sun className="h-5 w-5" />Theme</div>
            <div className="flex items-center gap-1 rounded-full p-1 bg-muted">
              <Button size="icon" variant={theme === "light" ? "default" : "ghost"} onClick={() => setTheme("light")} className="h-8 w-8 rounded-full"><Sun className="h-4 w-4" /></Button>
              <Button size="icon" variant={theme === "dark" ? "default" : "ghost"} onClick={() => setTheme("dark")} className="h-8 w-8 rounded-full"><Moon className="h-4 w-4" /></Button>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-lg font-medium"><Languages className="h-5 w-5" />Language</div>
            <LanguageSwitcher />
          </motion.div>
          <motion.div variants={itemVariants} className="mt-2">
            {user ? (
              <Button onClick={logout} variant="ghost" className="w-full justify-start h-12 text-lg text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut className="mr-3 h-5 w-5" /> Log Out
              </Button>
            ) : (
              <Button asChild className="w-full h-12 text-md"><Link href={`/en/login`}>Login</Link></Button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const UserDropdown: FC = () => {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <UserIcon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2"><UserIcon className="h-4 w-4" /> Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2"><Settings className="h-4 w-4" /> Settings</Link>
        </DropdownMenuItem>
        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin/dashboard" className="flex items-center gap-2"><UserCog className="h-4 w-4" /> Admin Panel</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span>Toggle theme</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const LoginButton: FC = () => (
  <Button asChild variant="ghost" className="hidden md:flex">
    <Link href="/en/login">Login</Link>
  </Button>
)

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

  const handleSelect = (href: string) => {
    router.push(href)
    setOpen(false)
  }

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
            {COMMAND_ITEMS.map((item) => (
              <CommandItem key={item.href} onSelect={() => handleSelect(item.href)}>
                <item.icon className="mr-2 h-4 w-4" /> {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

export default Header
