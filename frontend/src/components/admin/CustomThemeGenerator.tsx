"use client"
import React, { memo } from 'react';

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Palette, 
  Save, 
  Trash2, 
  Eye, 
  Download, 
  Upload,
  Sparkles,
  Copy,
  Sun,
  Moon
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomTheme {
  id: string
  name: string
  colors: {
    // Core colors
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    
    // Brand colors
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    accent: string
    accentForeground: string
    muted: string
    mutedForeground: string
    
    // UI colors
    border: string
    input: string
    ring: string
    destructive: string
    
    // Sidebar colors
    sidebar: string
    sidebarForeground: string
    sidebarPrimary: string
    sidebarPrimaryForeground: string
    sidebarAccent: string
    sidebarAccentForeground: string
    sidebarBorder: string
    sidebarRing: string
  }
  createdAt: string
}

const defaultLightTheme: CustomTheme = {
  id: "custom-light-default",
  name: "Light Custom Theme",
  colors: {
    // Core colors
    background: "#ffffff",
    foreground: "#0f172a",
    card: "#ffffff",
    cardForeground: "#0f172a",
    popover: "#ffffff",
    popoverForeground: "#0f172a",
    
    // Brand colors
    primary: "#3b82f6",
    primaryForeground: "#ffffff",
    secondary: "#f1f5f9",
    secondaryForeground: "#0f172a",
    accent: "#0ea5e9",
    accentForeground: "#ffffff",
    muted: "#f8fafc",
    mutedForeground: "#64748b",
    
    // UI colors
    border: "#e2e8f0",
    input: "#e2e8f0",
    ring: "#3b82f6",
    destructive: "#ef4444",
    
    // Sidebar colors
    sidebar: "#ffffff",
    sidebarForeground: "#0f172a",
    sidebarPrimary: "#3b82f6",
    sidebarPrimaryForeground: "#ffffff",
    sidebarAccent: "#f1f5f9",
    sidebarAccentForeground: "#0f172a",
    sidebarBorder: "#e2e8f0",
    sidebarRing: "#3b82f6"
  },
  createdAt: new Date().toISOString()
};

const defaultDarkTheme: CustomTheme = {
  id: "custom-dark-default",
  name: "Dark Custom Theme",
  colors: {
    // Core colors
    background: "#0f172a",
    foreground: "#f8fafc",
    card: "#1e293b",
    cardForeground: "#f8fafc",
    popover: "#1e293b",
    popoverForeground: "#f8fafc",
    
    // Brand colors
    primary: "#60a5fa",
    primaryForeground: "#0f172a",
    secondary: "#1e293b",
    secondaryForeground: "#f8fafc",
    accent: "#38bdf8",
    accentForeground: "#0f172a",
    muted: "#1e293b",
    mutedForeground: "#94a3b8",
    
    // UI colors
    border: "#334155",
    input: "#334155",
    ring: "#60a5fa",
    destructive: "#f87171",
    
    // Sidebar colors
    sidebar: "#0f172a",
    sidebarForeground: "#f8fafc",
    sidebarPrimary: "#60a5fa",
    sidebarPrimaryForeground: "#0f172a",
    sidebarAccent: "#1e293b",
    sidebarAccentForeground: "#f8fafc",
    sidebarBorder: "#334155",
    sidebarRing: "#60a5fa"
  },
  createdAt: new Date().toISOString()
};

export default memo(function CustomThemeGenerator() {
  const [currentTheme, setCurrentTheme] = useState<CustomTheme>(defaultLightTheme)
  const [savedThemes, setSavedThemes] = useState<CustomTheme[]>([])
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Load saved themes from localStorage
    const saved = localStorage.getItem("custom-themes")
    if (saved) {
      try {
        setSavedThemes(JSON.parse(saved))
      } catch (error) {
        }
    }
  }, [])

  const saveThemes = (themes: CustomTheme[]) => {
    setSavedThemes(themes)
    localStorage.setItem("custom-themes", JSON.stringify(themes))
  }

  const handleColorChange = (colorKey: keyof CustomTheme['colors'], value: string) => {
    setCurrentTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }))
  }

  const switchThemeMode = (mode: 'light' | 'dark') => {
    setThemeMode(mode)
    
    // Update current theme to match the new mode
    const baseTheme = mode === 'dark' ? defaultDarkTheme : defaultLightTheme
    setCurrentTheme(prev => ({
      ...prev,
      name: `${mode === 'dark' ? 'Dark' : 'Light'} Custom Theme`,
      colors: {
        ...baseTheme.colors,
        // Keep any custom colors that were already set
        primary: prev.colors.primary,
        secondary: prev.colors.secondary,
        accent: prev.colors.accent,
        destructive: prev.colors.destructive
      }
    }))
  }

  const generateRandomTheme = () => {
    setIsGenerating(true)
    
    // Generate random colors with good contrast based on theme mode
    const generateColor = (baseHue: number, saturation: number, lightness: number) => {
      const hue = (baseHue + Math.random() * 60) % 360
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`
    }

    const isDark = themeMode === 'dark'
    
    const newTheme: CustomTheme = {
      id: `custom-${Date.now()}`,
      name: `Generated ${themeMode === 'dark' ? 'Dark' : 'Light'} Theme ${savedThemes.length + 1}`,
      colors: {
        // Core colors - different ranges for light vs dark
        background: isDark ? generateColor(220, 20, 15) : generateColor(200, 20, 95),
        foreground: isDark ? generateColor(200, 20, 90) : generateColor(200, 20, 10),
        card: isDark ? generateColor(220, 20, 20) : generateColor(200, 20, 98),
        cardForeground: isDark ? generateColor(200, 20, 90) : generateColor(200, 20, 10),
        popover: isDark ? generateColor(220, 20, 20) : generateColor(200, 20, 98),
        popoverForeground: isDark ? generateColor(200, 20, 90) : generateColor(200, 20, 10),
        
        // Brand colors - vibrant for both modes
        primary: generateColor(220, 70, isDark ? 60 : 50),
        primaryForeground: isDark ? generateColor(200, 20, 15) : generateColor(200, 20, 95),
        secondary: isDark ? generateColor(220, 20, 25) : generateColor(200, 30, 90),
        secondaryForeground: isDark ? generateColor(200, 20, 90) : generateColor(200, 20, 10),
        accent: generateColor(280, 60, isDark ? 70 : 60),
        accentForeground: isDark ? generateColor(200, 20, 15) : generateColor(200, 20, 95),
        muted: isDark ? generateColor(220, 15, 25) : generateColor(200, 15, 85),
        mutedForeground: isDark ? generateColor(200, 20, 60) : generateColor(200, 20, 40),
        
        // UI colors
        border: isDark ? generateColor(220, 20, 30) : generateColor(200, 20, 80),
        input: isDark ? generateColor(220, 20, 30) : generateColor(200, 20, 80),
        ring: generateColor(220, 70, isDark ? 60 : 50),
        destructive: generateColor(0, 70, isDark ? 60 : 50),
        
        // Sidebar colors
        sidebar: isDark ? generateColor(220, 20, 15) : generateColor(200, 20, 98),
        sidebarForeground: isDark ? generateColor(200, 20, 90) : generateColor(200, 20, 10),
        sidebarPrimary: generateColor(220, 70, isDark ? 60 : 50),
        sidebarPrimaryForeground: isDark ? generateColor(200, 20, 15) : generateColor(200, 20, 95),
        sidebarAccent: isDark ? generateColor(220, 20, 25) : generateColor(200, 30, 90),
        sidebarAccentForeground: isDark ? generateColor(200, 20, 90) : generateColor(200, 20, 10),
        sidebarBorder: isDark ? generateColor(220, 20, 30) : generateColor(200, 20, 80),
        sidebarRing: generateColor(220, 70, isDark ? 60 : 50)
      },
      createdAt: new Date().toISOString()
    }

    setCurrentTheme(newTheme)
    
    setTimeout(() => setIsGenerating(false), 500)
  }

  const saveTheme = () => {
    const newTheme = {
      ...currentTheme,
      id: `custom-${Date.now()}`,
      name: currentTheme.name || `Custom Theme ${savedThemes.length + 1}`
    }
    
    const updatedThemes = [...savedThemes, newTheme]
    saveThemes(updatedThemes)
  }

  const deleteTheme = (themeId: string) => {
    const updatedThemes = savedThemes.filter(t => t.id !== themeId)
    saveThemes(updatedThemes)
  }

  const loadTheme = (theme: CustomTheme) => {
    setCurrentTheme(theme)
  }

  const applyTheme = () => {
    if (isPreviewMode) {
      // Apply theme to document
      const root = document.documentElement
      Object.entries(currentTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value)
      })
    }
  }

  const exportTheme = () => {
    const themeData = {
      name: currentTheme.name,
      colors: currentTheme.colors,
      css: generateThemeCSS(currentTheme)
    }
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentTheme.name.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateThemeCSS = (theme: CustomTheme) => {
    return `
:root {
  /* Core colors */
  --background: ${theme.colors.background};
  --foreground: ${theme.colors.foreground};
  --card: ${theme.colors.card};
  --card-foreground: ${theme.colors.cardForeground};
  --popover: ${theme.colors.popover};
  --popover-foreground: ${theme.colors.popoverForeground};
  
  /* Brand colors */
  --primary: ${theme.colors.primary};
  --primary-foreground: ${theme.colors.primaryForeground};
  --secondary: ${theme.colors.secondary};
  --secondary-foreground: ${theme.colors.secondaryForeground};
  --accent: ${theme.colors.accent};
  --accent-foreground: ${theme.colors.accentForeground};
  --muted: ${theme.colors.muted};
  --muted-foreground: ${theme.colors.mutedForeground};
  
  /* UI colors */
  --border: ${theme.colors.border};
  --input: ${theme.colors.input};
  --ring: ${theme.colors.ring};
  --destructive: ${theme.colors.destructive};
  
  /* Sidebar colors */
  --sidebar: ${theme.colors.sidebar};
  --sidebar-foreground: ${theme.colors.sidebarForeground};
  --sidebar-primary: ${theme.colors.sidebarPrimary};
  --sidebar-primary-foreground: ${theme.colors.sidebarPrimaryForeground};
  --sidebar-accent: ${theme.colors.sidebarAccent};
  --sidebar-accent-foreground: ${theme.colors.sidebarAccentForeground};
  --sidebar-border: ${theme.colors.sidebarBorder};
  --sidebar-ring: ${theme.colors.sidebarRing};
}`
  }

  useEffect(() => {
    if (isPreviewMode) {
      applyTheme()
    }
  }, [currentTheme, isPreviewMode])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Custom Theme Generator
            </CardTitle>
            <CardDescription>
              Create and customize your own color themes
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={generateRandomTheme}
              variant="outline"
              size="sm"
              disabled={isGenerating}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Random"}
            </Button>
            <Button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              variant={isPreviewMode ? "default" : "outline"}
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreviewMode ? "Exit Preview" : "Preview"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Mode and Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Theme Mode</Label>
            <div className="flex gap-2">
              <Button
                variant={themeMode === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchThemeMode('light')}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={themeMode === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchThemeMode('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme-name">Theme Name</Label>
            <Input
              id="theme-name"
              value={currentTheme.name}
              onChange={(e) => setCurrentTheme(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter theme name"
            />
          </div>
        </div>

        {/* Color Controls */}
        <div className="space-y-6">
          {/* Core Colors */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Core Colors</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(currentTheme.colors).slice(0, 6).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={key}
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof CustomTheme['colors'], e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof CustomTheme['colors'], e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Colors */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Brand Colors</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(currentTheme.colors).slice(6, 14).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={key}
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof CustomTheme['colors'], e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof CustomTheme['colors'], e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UI Colors */}
          <div>
            <h4 className="text-lg font-semibold mb-3">UI Colors</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(currentTheme.colors).slice(14, 18).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={key}
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof CustomTheme['colors'], e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof CustomTheme['colors'], e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Colors */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Sidebar Colors</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(currentTheme.colors).slice(18).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={key}
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof CustomTheme['colors'], e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof CustomTheme['colors'], e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Theme Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Theme Preview</Label>
            <Badge variant="outline">
              {themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </Badge>
          </div>
          <div 
            className="p-6 rounded-lg border-2"
            style={{
              backgroundColor: currentTheme.colors.background,
              color: currentTheme.colors.foreground,
              borderColor: currentTheme.colors.border
            }}
          >
            <div className="space-y-4">
              <h3 className="text-xl font-bold" style={{ color: currentTheme.colors.foreground }}>
                Sample Content
              </h3>
              <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                This is how your {themeMode} theme will look with different content types.
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  className="px-4 py-2 rounded text-sm font-medium"
                  style={{
                    backgroundColor: currentTheme.colors.primary,
                    color: currentTheme.colors.primaryForeground
                  }}
                >
                  Primary Button
                </button>
                <button
                  className="px-4 py-2 rounded text-sm font-medium border"
                  style={{
                    backgroundColor: currentTheme.colors.secondary,
                    color: currentTheme.colors.secondaryForeground,
                    borderColor: currentTheme.colors.border
                  }}
                >
                  Secondary Button
                </button>
                <button
                  className="px-4 py-2 rounded text-sm font-medium border"
                  style={{
                    backgroundColor: currentTheme.colors.accent,
                    color: currentTheme.colors.accentForeground,
                    borderColor: currentTheme.colors.border
                  }}
                >
                  Accent Button
                </button>
              </div>
              <div 
                className="p-4 rounded border"
                style={{
                  backgroundColor: currentTheme.colors.card,
                  color: currentTheme.colors.cardForeground,
                  borderColor: currentTheme.colors.border
                }}
              >
                <p className="text-sm font-medium mb-2" style={{ color: currentTheme.colors.cardForeground }}>
                  Card Content
                </p>
                <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                  This card shows how your theme affects different UI elements.
                </p>
              </div>
              <div 
                className="p-3 rounded"
                style={{
                  backgroundColor: currentTheme.colors.muted,
                  color: currentTheme.colors.mutedForeground
                }}
              >
                <p className="text-sm">Muted content area</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={saveTheme} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Theme
          </Button>
          <Button onClick={exportTheme} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button 
            onClick={() => navigator.clipboard.writeText(generateThemeCSS(currentTheme))} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy CSS
          </Button>
        </div>

        {/* Saved Themes */}
        {savedThemes.length > 0 && (
          <div className="space-y-3">
            <Label>Saved Themes</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedThemes.map((theme) => (
                <div
                  key={theme.id}
                  className="p-3 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all"
                  style={{ 
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.card,
                    color: theme.colors.cardForeground
                  }}
                  onClick={() => loadTheme(theme)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm" style={{ color: theme.colors.cardForeground }}>
                      {theme.name}
                    </h4>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTheme(theme.id)
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    {Object.values(theme.colors).slice(0, 4).map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
});
