"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

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

export function useCustomTheme() {
  const { theme, setTheme } = useTheme()
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([])
  const [activeCustomTheme, setActiveCustomTheme] = useState<CustomTheme | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Load custom themes from localStorage
    const saved = localStorage.getItem("custom-themes")
    if (saved) {
      try {
        const themes = JSON.parse(saved)
        setCustomThemes(themes)
      } catch (error) {
        // Failed to load custom themes - continue with empty array
      }
    }

    // Load active custom theme
    const active = localStorage.getItem("active-custom-theme")
    if (active) {
      try {
        const theme = JSON.parse(active)
        setActiveCustomTheme(theme)
        applyCustomTheme(theme)
      } catch (error) {
        // Failed to load active custom theme - continue without theme
      }
    }
  }, [])

  const applyCustomTheme = (customTheme: CustomTheme) => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    
    // Apply custom theme colors with proper CSS variable names
    const colorMappings = {
      background: '--background',
      foreground: '--foreground',
      card: '--card',
      cardForeground: '--card-foreground',
      popover: '--popover',
      popoverForeground: '--popover-foreground',
      primary: '--primary',
      primaryForeground: '--primary-foreground',
      secondary: '--secondary',
      secondaryForeground: '--secondary-foreground',
      accent: '--accent',
      accentForeground: '--accent-foreground',
      muted: '--muted',
      mutedForeground: '--muted-foreground',
      border: '--border',
      input: '--input',
      ring: '--ring',
      destructive: '--destructive',
      sidebar: '--sidebar',
      sidebarForeground: '--sidebar-foreground',
      sidebarPrimary: '--sidebar-primary',
      sidebarPrimaryForeground: '--sidebar-primary-foreground',
      sidebarAccent: '--sidebar-accent',
      sidebarAccentForeground: '--sidebar-accent-foreground',
      sidebarBorder: '--sidebar-border',
      sidebarRing: '--sidebar-ring'
    }

    Object.entries(customTheme.colors).forEach(([key, value]) => {
      const cssVar = colorMappings[key as keyof typeof colorMappings]
      if (cssVar) {
        root.style.setProperty(cssVar, value)
      }
    })

    // Add custom theme class
    root.classList.add('custom-theme')
    root.setAttribute('data-theme', customTheme.id)
  }

  const removeCustomTheme = () => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    
    // Remove custom theme class
    root.classList.remove('custom-theme')
    root.removeAttribute('data-theme')
    
    // Reset ALL custom theme colors to allow standard themes to work
    const allCustomProperties = [
      '--background', '--foreground', '--card', '--card-foreground', '--popover', '--popover-foreground',
      '--primary', '--primary-foreground', '--secondary', '--secondary-foreground', '--accent', '--accent-foreground',
      '--muted', '--muted-foreground', '--border', '--input', '--ring', '--destructive',
      '--sidebar', '--sidebar-foreground', '--sidebar-primary', '--sidebar-primary-foreground',
      '--sidebar-accent', '--sidebar-accent-foreground', '--sidebar-border', '--sidebar-ring'
    ]
    
    allCustomProperties.forEach(prop => {
      root.style.removeProperty(prop)
    })
  }

  const activateCustomTheme = (customTheme: CustomTheme) => {
    setActiveCustomTheme(customTheme)
    localStorage.setItem("active-custom-theme", JSON.stringify(customTheme))
    applyCustomTheme(customTheme)
  }

  const deactivateCustomTheme = () => {
    setActiveCustomTheme(null)
    localStorage.removeItem("active-custom-theme")
    removeCustomTheme()
  }

  const saveCustomTheme = (theme: CustomTheme) => {
    const updatedThemes = [...customThemes, theme]
    setCustomThemes(updatedThemes)
    localStorage.setItem("custom-themes", JSON.stringify(updatedThemes))
  }

  const deleteCustomTheme = (themeId: string) => {
    const updatedThemes = customThemes.filter(t => t.id !== themeId)
    setCustomThemes(updatedThemes)
    localStorage.setItem("custom-themes", JSON.stringify(updatedThemes))
    
    // If the deleted theme was active, deactivate it
    if (activeCustomTheme?.id === themeId) {
      deactivateCustomTheme()
    }
  }

  const updateCustomTheme = (themeId: string, updatedTheme: CustomTheme) => {
    const updatedThemes = customThemes.map(t => 
      t.id === themeId ? updatedTheme : t
    )
    setCustomThemes(updatedThemes)
    localStorage.setItem("custom-themes", JSON.stringify(updatedThemes))
    
    // If the updated theme was active, reapply it
    if (activeCustomTheme?.id === themeId) {
      activateCustomTheme(updatedTheme)
    }
  }

  return {
    customThemes,
    activeCustomTheme,
    mounted,
    activateCustomTheme,
    deactivateCustomTheme,
    saveCustomTheme,
    deleteCustomTheme,
    updateCustomTheme,
    applyCustomTheme,
    removeCustomTheme
  }
}
