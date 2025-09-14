import React, { memo } from 'react';
"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette, 
  Check,
  Settings,
  Eye
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeOption {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const themeOptions: ThemeOption[] = [
  {
    id: "light",
    name: "Light",
    icon: Sun,
    description: "Clean and bright"
  },
  {
    id: "dark", 
    name: "Dark",
    icon: Moon,
    description: "Easy on the eyes"
  },
  {
    id: "system",
    name: "System",
    icon: Monitor,
    description: "Follows device"
  }
]

const customThemeOptions: ThemeOption[] = [
  {
    id: "blue",
    name: "Ocean Blue",
    icon: Palette,
    description: "Professional blue"
  },
  {
    id: "green",
    name: "Forest Green", 
    icon: Palette,
    description: "Natural green"
  },
  {
    id: "purple",
    name: "Royal Purple",
    icon: Palette,
    description: "Elegant purple"
  },
  {
    id: "orange",
    name: "Sunset Orange",
    icon: Palette,
    description: "Warm orange"
  }
]

interface AdminThemeSwitcherProps {
  variant?: "default" | "compact" | "minimal"
  showLabel?: boolean
  className?: string
}

export default memo(function AdminThemeSwitcher({ 
  variant = "default", 
  showLabel = true,
  className 
}: AdminThemeSwitcherProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const getCurrentThemeIcon = () => {
    const currentTheme = themeOptions.find(t => t.id === theme) || 
                        customThemeOptions.find(t => t.id === theme)
    return currentTheme?.icon || Monitor
  }

  const getCurrentThemeName = () => {
    const currentTheme = themeOptions.find(t => t.id === theme) || 
                        customThemeOptions.find(t => t.id === theme)
    return currentTheme?.name || "System"
  }

  const CurrentIcon = getCurrentThemeIcon()

  if (variant === "minimal") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className={cn("h-8 w-8", className)}
      >
        <CurrentIcon className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  if (variant === "compact") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("h-8 gap-2", className)}
          >
            <CurrentIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{getCurrentThemeName()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {themeOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => {
                setTheme(option.id)
                setIsOpen(false)
              }}
              className="flex items-center gap-2"
            >
              <option.icon className="h-4 w-4" />
              <span>{option.name}</span>
              {theme === option.id && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          {customThemeOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => {
                setTheme(option.id)
                setIsOpen(false)
              }}
              className="flex items-center gap-2"
            >
              <option.icon className="h-4 w-4" />
              <span>{option.name}</span>
              {theme === option.id && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="text-sm font-medium">Theme</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-2">
        {/* Standard Themes */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground px-2">
            Standard
          </div>
          {themeOptions.map((option) => (
            <Button
              key={option.id}
              variant={theme === option.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setTheme(option.id)}
              className="w-full justify-start gap-2 h-8"
            >
              <option.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{option.name}</span>
              {theme === option.id && <Check className="h-4 w-4" />}
            </Button>
          ))}
        </div>

        {/* Custom Themes */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground px-2">
            Custom
          </div>
          {customThemeOptions.map((option) => (
            <Button
              key={option.id}
              variant={theme === option.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setTheme(option.id)}
              className="w-full justify-start gap-2 h-8"
            >
              <option.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{option.name}</span>
              {theme === option.id && <Check className="h-4 w-4" />}
            </Button>
          ))}
        </div>
      </div>

      {/* Theme Info */}
      <div className="pt-2 border-t">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Eye className="h-3 w-3" />
          <span>Current: {getCurrentThemeName()}</span>
        </div>
      </div>
    </div>
  )
});
