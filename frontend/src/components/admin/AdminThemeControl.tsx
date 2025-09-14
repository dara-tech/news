"use client"
import React, { memo, useState, useEffect } from 'react';
import { useTheme } from "next-themes"
import { useCustomTheme } from "@/hooks/useCustomTheme"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette, 
  Check, 
  Settings,
  Eye,
  Save,
  RotateCcw
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeOption {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  preview: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

const themeOptions: ThemeOption[] = [
  {
    id: "light",
    name: "Light",
    description: "Clean and bright interface",
    icon: Sun,
    preview: "bg-background border-border",
    colors: {
      primary: "var(--primary)",
      secondary: "var(--secondary)",
      accent: "var(--accent)"
    }
  },
  {
    id: "dark",
    name: "Dark",
    description: "Easy on the eyes for low light",
    icon: Moon,
    preview: "bg-background border-border",
    colors: {
      primary: "var(--primary)",
      secondary: "var(--secondary)",
      accent: "var(--accent)"
    }
  },
  {
    id: "system",
    name: "System",
    description: "Follows your device preference",
    icon: Monitor,
    preview: "bg-gradient-to-r from-background to-background border-border",
    colors: {
      primary: "var(--primary)",
      secondary: "var(--secondary)",
      accent: "var(--accent)"
    }
  }
]

// Custom themes removed to prevent conflicts with next-themes

export default memo(function AdminThemeControl() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { deactivateCustomTheme } = useCustomTheme()
  const [mounted, setMounted] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [previewTheme, setPreviewTheme] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setHasChanges(previewTheme !== null && previewTheme !== (theme || "system"))
  }, [previewTheme, theme])

  if (!mounted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Control
          </CardTitle>
          <CardDescription>
            Loading theme settings...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-muted animate-pulse rounded-lg" />
            <div className="h-20 bg-muted animate-pulse rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleThemeSelect = (themeId: string) => {
    // Only allow standard themes that work with next-themes
    const standardThemeIds = ["light", "dark", "system"]
    if (!standardThemeIds.includes(themeId)) {
      // Theme not supported by next-themes, fallback to system theme
      setTheme("system")
      return
    }
    
    // Deactivate any active custom theme when switching to standard themes
    deactivateCustomTheme()
    
    if (previewMode) {
      setPreviewTheme(themeId)
    } else {
      setTheme(themeId)
      setHasChanges(false)
    }
  }

  const handlePreview = () => {
    if (previewMode) {
      // Exit preview mode
      setPreviewMode(false)
      setPreviewTheme(null)
    } else {
      // Enter preview mode
      setPreviewMode(true)
      setPreviewTheme(theme || "system")
    }
  }

  const handleSave = () => {
    if (previewTheme) {
      setTheme(previewTheme)
      setPreviewMode(false)
      setPreviewTheme(null)
      setHasChanges(false)
    }
  }

  const handleReset = () => {
    setPreviewTheme(theme || "system")
    setHasChanges(false)
  }

  const currentTheme = previewTheme || theme
  const currentThemeOption = themeOptions.find(t => t.id === currentTheme)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme Control
            </CardTitle>
            <CardDescription>
              Customize the appearance of your admin interface
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {previewMode && (
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                <Eye className="h-3 w-3 mr-1" />
                Preview Mode
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {previewMode ? "Exit Preview" : "Preview"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Theme Display */}
        {currentThemeOption && (
          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <currentThemeOption.icon className="h-5 w-5" />
                <div>
                  <h3 className="font-medium">{currentThemeOption.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentThemeOption.description}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                {previewMode ? "Preview" : "Active"}
              </Badge>
            </div>
            <div className="flex gap-2">
              {Object.entries(currentThemeOption.colors).map(([key, color]) => (
                <div
                  key={key}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: color }}
                  title={`${key}: ${color}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Standard Themes */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Standard Themes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeOptions.map((option) => (
              <div
                key={option.id}
                className={cn(
                  "relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
                  currentTheme === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => handleThemeSelect(option.id)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <option.icon className="h-5 w-5" />
                  <div>
                    <h4 className="font-medium">{option.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
                
                <div className={cn(
                  "w-full h-16 rounded border-2 mb-3",
                  option.preview
                )} />
                
                <div className="flex gap-1">
                  {Object.entries(option.colors).map(([key, color]) => (
                    <div
                      key={key}
                      className="w-4 h-4 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {currentTheme === option.id && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Theme Information */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme Information
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            The admin interface uses the standard theme system. Custom themes are not supported to prevent conflicts.
          </p>
          <div className="text-xs text-muted-foreground">
            <p>• <strong>Light:</strong> Clean and bright interface</p>
            <p>• <strong>Dark:</strong> Easy on the eyes in low light</p>
            <p>• <strong>System:</strong> Follows your device settings</p>
          </div>
        </div>

        {/* Action Buttons */}
        {previewMode && (
          <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Preview Mode Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!hasChanges}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Apply Theme
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
