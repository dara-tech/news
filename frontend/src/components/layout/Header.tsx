"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Menu, X, ChevronDown, ChevronRight, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

type Category = {
  _id: string;
  slug: string;
  name: { en: string; kh: string } | string;
  color?: string;
};

const Header = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const categoriesBtnRef = useRef<HTMLButtonElement>(null);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get("/categories");
        setCategories(res.data?.data || []);
      } catch {
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  // Close categories dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        isCategoriesOpen &&
        categoriesBtnRef.current &&
        !categoriesBtnRef.current.contains(e.target as Node)
      ) {
        setIsCategoriesOpen(false);
      }
    }
    if (isCategoriesOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isCategoriesOpen]);

  // Get current lang from pathname
  const lang = pathname.split("/")[1] || "en";

  // Navigation links
  const NAV_LINKS = [
    { href: `/${lang}`, label: "Home", icon: Home },
  ];

  // Desktop nav
  const DesktopNav = () => (
    <nav className="hidden lg:flex items-center gap-4">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-4 py-2 rounded-lg text-base font-semibold transition-all duration-200 flex items-center gap-2 ${
            pathname === link.href
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-primary hover:bg-muted/60"
          }`}
        >
          {link.icon && <link.icon className="inline-block h-5 w-5" />}
          {link.label}
        </Link>
      ))}
      <div className="relative">
        <button
          ref={categoriesBtnRef}
          className={`px-4 py-2 rounded-lg text-base font-semibold flex items-center gap-2 transition-all duration-200 ${
            isCategoriesOpen
              ? "bg-muted/80 text-primary"
              : "text-muted-foreground hover:text-primary hover:bg-muted/60"
          }`}
          onClick={() => setIsCategoriesOpen((open) => !open)}
          aria-haspopup="true"
          aria-expanded={isCategoriesOpen}
        >
          Categories <ChevronDown className={`h-5 w-5 transition-transform ${isCategoriesOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {isCategoriesOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 mt-2 w-64 bg-popover dark:bg-gray-900 border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {categories.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">No categories</div>
              )}
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/${lang}/category/${cat.slug}`}
                  className="flex items-center gap-2 px-5 py-3 hover:bg-primary/10 transition-colors font-medium text-base"
                  style={cat.color ? { color: cat.color } : undefined}
                  onClick={() => setIsCategoriesOpen(false)}
                >
                  <span>
                    {typeof cat.name === "string"
                      ? cat.name
                      : cat.name[lang === "km" ? "kh" : "en"]}
                  </span>
                  <ChevronRight className="h-4 w-4 ml-auto opacity-60" />
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );

  // Mobile nav
  const MobileNav = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg flex flex-col"
        >
          <div className="flex justify-between items-center p-4 border-b border-border bg-background/80">
            <span className="font-bold text-xl tracking-tight flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-lg px-2 py-1">N</span>
              Newsly
            </span>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
              <X className="h-7 w-7" />
            </Button>
          </div>
          <div className="flex flex-col gap-4 p-6 flex-1 overflow-y-auto">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`py-3 px-3 rounded-lg text-lg font-semibold flex items-center gap-2 transition-all ${
                  pathname === link.href
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-primary hover:bg-muted/60"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.icon && <link.icon className="h-5 w-5" />}
                {link.label}
              </Link>
            ))}
            <div>
              <span className="block text-muted-foreground font-semibold mb-2 text-base">Categories</span>
              <div className="flex flex-col gap-1">
                {categories.length === 0 && (
                  <span className="text-muted-foreground text-sm px-2 py-2">No categories</span>
                )}
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/${lang}/category/${cat.slug}`}
                    className="block px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors font-medium text-base"
                    style={cat.color ? { color: cat.color } : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {typeof cat.name === "string"
                      ? cat.name
                      : cat.name[lang === "km" ? "kh" : "en"]}
                  </Link>
                ))}
              </div>
            </div>
            {/* Align LanguageSwitcher and mobile login/logout button horizontally */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <LanguageSwitcher />
              {user ? (
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                >
                  <LogOut className="h-6 w-6" />
                  Logout
                </Button>
              ) : (
                <Button asChild variant="outline" className="flex items-center gap-2">
                  <Link href={`/${lang}/login`} onClick={() => setIsMobileMenuOpen(false)}>
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
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link
            href={`/${lang}`}
            className="flex items-center gap-3 font-extrabold text-2xl tracking-tight group"
          >
            <motion.span
              className="bg-primary text-primary-foreground rounded-lg px-3 py-2 shadow group-hover:scale-110 transition-transform"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
            >
              N
            </motion.span>
            <span className="text-foreground group-hover:text-primary transition-colors">Newsly</span>
          </Link>
          <DesktopNav />
          {/* Align LanguageSwitcher and mobile menu button together */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {user ? (
              <Button
                variant="outline"
                className="hidden lg:flex items-center gap-2"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            ) : (
              <Button asChild variant="outline" className="hidden lg:flex items-center gap-2">
                <Link href={`/${lang}/login`}>
                  <LogIn className="h-4 w-4" />
                  <span className="hidden md:inline">Login</span>
                </Link>
              </Button>
            )}
            {/* LanguageSwitcher and mobile menu button are now horizontally aligned */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-10 w-10" />
            </Button>
          </div>
        </div>
      </header>
      <MobileNav />
    </>
  );
};

export default Header;