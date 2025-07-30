"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button 
        variant="outline" 
        size="icon" 
        className="h-9 w-9 rounded-xl border-border/50 bg-background/80 backdrop-blur-sm hover:bg-muted/30 transition-all duration-300"
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="group relative h-9 w-9 rounded-xl border-border/50 bg-background/80 backdrop-blur-sm hover:bg-muted/30 transition-all duration-300 hover:scale-105"
      onClick={toggleTheme}
    >
      <div className="relative w-4 h-4">
        <Sun className="absolute inset-0 h-4 w-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 text-amber-500" />
        <Moon className="absolute inset-0 h-4 w-4 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 text-blue-500" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}