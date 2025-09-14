
"use client"
import React, { memo } from 'react';
import { useState } from "react"
import { useCustomTheme } from "@/hooks/useCustomTheme"
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
  Palette, 
  Check,
  Plus,
  Settings,
  Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomThemeSwitcherProps {
  variant?: "default" | "compact"
  showLabel?: boolean
  className?: string
}

export default memo(function CustomThemeSwitcher({ 
  variant = "default", 
  showLabel = true,
  className 
}: CustomThemeSwitcherProps) {
  const {
    customThemes,
    activeCustomTheme,
    mounted,
    activateCustomTheme,
    deactivateCustomTheme,
    deleteCustomTheme
  } = useCustomTheme()

  const [isOpen, setIsOpen] = useState(false)

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Palette className="h-4 w-4" />
        {showLabel && <span className="ml-2">Loading...</span>}
      </Button>
    )
  }

  const handleThemeSelect = (theme: any) => {
    if (theme.id === "none") {
      deactivateCustomTheme()
    } else {
      activateCustomTheme(theme)
    }
    setIsOpen(false)
  }

  const handleDeleteTheme = (themeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteCustomTheme(themeId)
  }

  if (variant === "compact") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className={cn("h-8 w-8 p-0", className)}
          >
            <Palette className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Custom Themes</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleThemeSelect({ id: "none" })}>
            <div className="flex items-center gap-2 w-full">
              <div className="w-4 h-4 rounded border border-gray-300" />
              <span>No Custom Theme</span>
              {!activeCustomTheme && <Check className="h-4 w-4 ml-auto" />}
            </div>
          </DropdownMenuItem>
          
          {customThemes.map((theme) => (
            <DropdownMenuItem 
              key={theme.id} 
              onClick={() => handleThemeSelect(theme)}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="flex gap-1">
                  {Object.values(theme.colors).slice(0, 3).map((color, index) => (
                    <div
                      key={index}
                      className="w-3 h-3 rounded border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="flex-1 truncate">{theme.name}</span>
                <div className="flex items-center gap-1">
                  {activeCustomTheme?.id === theme.id && (
                    <Check className="h-4 w-4" />
                  )}
                  <Button
                    onClick={(e) => handleDeleteTheme(theme.id, e)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          
          {customThemes.length === 0 && (
            <DropdownMenuItem disabled>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Plus className="h-4 w-4" />
                <span>No custom themes yet</span>
              </div>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Custom Themes</h3>
        <Badge variant="outline">
          {customThemes.length} themes
        </Badge>
      </div>

      {activeCustomTheme && (
        <div className="p-3 rounded-lg border bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Object.values(activeCustomTheme.colors).slice(0, 4).map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="font-medium">{activeCustomTheme.name}</span>
            </div>
            <Button
              onClick={deactivateCustomTheme}
              variant="outline"
              size="sm"
            >
              Deactivate
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          className={cn(
            "p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
            !activeCustomTheme 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50"
          )}
          onClick={() => handleThemeSelect({ id: "none" })}
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-gray-300" />
            <span className="font-medium">No Custom Theme</span>
            {!activeCustomTheme && <Check className="h-4 w-4 ml-auto" />}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Use default system themes
          </p>
        </div>

        {customThemes.map((theme) => (
          <div
            key={theme.id}
            className={cn(
              "p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
              activeCustomTheme?.id === theme.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => handleThemeSelect(theme)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Object.values(theme.colors).slice(0, 4).map((color, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="font-medium">{theme.name}</span>
              </div>
              <div className="flex items-center gap-1">
                {activeCustomTheme?.id === theme.id && (
                  <Check className="h-4 w-4" />
                )}
                <Button
                  onClick={(e) => handleDeleteTheme(theme.id, e)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Created {new Date(theme.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {customThemes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No custom themes created yet</p>
          <p className="text-sm">Use the theme generator to create your first custom theme</p>
        </div>
      )}
    </div>
  )
});
