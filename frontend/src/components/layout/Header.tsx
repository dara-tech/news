"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Menu, X, ChevronDown, ChevronRight } from "lucide-react";
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

  // Get current lang from pathname
  const lang = pathname.split("/")[1] || "en";

  // Navigation links
  const NAV_LINKS = [
    { href: `/${lang}`, label: "Home", icon: Home },
  ];

  // Desktop nav
  const DesktopNav = () => (
    <nav className="hidden lg:flex items-center gap-2">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            pathname === link.href ? "bg-primary text-white" : "text-muted-foreground hover:text-primary"
          }`}
        >
          {link.icon && <link.icon className="inline-block mr-1 h-4 w-4" />}
          {link.label}
        </Link>
      ))}
      <div className="relative">
        <button
          className="px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 hover:text-primary"
          onClick={() => setIsCategoriesOpen((open) => !open)}
          onBlur={() => setTimeout(() => setIsCategoriesOpen(false), 200)}
        >
          Categories <ChevronDown className="h-4 w-4" />
        </button>
        <AnimatePresence>
          {isCategoriesOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-900 border rounded-lg shadow-lg z-50"
            >
              {categories.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">No categories</div>
              )}
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/${lang}/category/${cat.slug}`}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors"
                  style={{ color: cat.color }}
                >
                  <span className="font-medium">{typeof cat.name === "string" ? cat.name : cat.name[lang === "km" ? "kh" : "en"]}</span>
                  <ChevronRight className="h-4 w-4 ml-auto" />
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
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur flex flex-col"
        >
          <div className="flex justify-between items-center p-4 border-b">
            <span className="font-bold text-lg">Menu</span>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex flex-col gap-2 p-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2 text-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div>
              <span className="block text-muted-foreground font-semibold mb-2">Categories</span>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/${lang}/category/${cat.slug}`}
                  className="block px-2 py-2 rounded hover:bg-muted"
                  style={{ color: cat.color }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {typeof cat.name === "string" ? cat.name : cat.name[lang === "km" ? "kh" : "en"]}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href={`/${lang}`} className="flex items-center gap-2 font-bold text-xl">
            <span className="bg-primary text-primary-foreground rounded-lg px-2 py-1">N</span>
            <span>Newsly</span>
          </Link>
          <DesktopNav />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {user ? (
              <Button variant="ghost" onClick={logout}>Logout</Button>
            ) : (
              <Button asChild variant="ghost">
                <Link href={`/${lang}/login`}>Login</Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>
      <MobileNav />
    </>
  );
};

export default Header;