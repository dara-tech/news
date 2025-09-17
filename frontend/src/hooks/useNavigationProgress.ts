"use client"

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'

interface NavigationProgressState {
  isLoading: boolean
  progress: number
}

export function useNavigationProgress() {
  const [state, setState] = useState<NavigationProgressState>({
    isLoading: false,
    progress: 0
  })
  
  const pathname = usePathname()
  const [navigationStartTime, setNavigationStartTime] = useState<number | null>(null)

  const startLoading = useCallback(() => {
    // Prevent starting loading if already loading
    if (state.isLoading) return
    
    setNavigationStartTime(Date.now())
    setState(prev => ({ ...prev, isLoading: true, progress: 0 }))
  }, [state.isLoading])

  const updateProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress: Math.min(100, Math.max(0, progress)) }))
  }, [])

  const stopLoading = useCallback(() => {
    const navigationDuration = navigationStartTime ? Date.now() - navigationStartTime : 0
    
    // Complete the progress bar
    setState(prev => ({ ...prev, progress: 100 }))
    setNavigationStartTime(null)
    
    // Show completion animation for a more realistic duration
    const delay = navigationDuration > 500 ? 300 : 200
    
    setTimeout(() => {
      setState(prev => ({ ...prev, isLoading: false, progress: 0 }))
    }, delay)
  }, [navigationStartTime])

  // Simulate progress increment with more realistic timing
  useEffect(() => {
    if (!state.isLoading) return

    let progressSteps = 0
    const maxSteps = 8 // More steps for smoother progress

    const interval = setInterval(() => {
      setState(prev => {
        progressSteps++
        
        if (prev.progress >= 80 || progressSteps >= maxSteps) {
          clearInterval(interval)
          return { ...prev, progress: 80 }
        }
        
        // More realistic progress curve - slower at start, faster in middle
        const baseIncrement = 8 + (progressSteps * 2)
        const randomFactor = Math.random() * 4
        const increment = Math.min(baseIncrement + randomFactor, 15)
        
        return { ...prev, progress: prev.progress + increment }
      })
    }, 200) // Slower interval for more realistic progress

    return () => clearInterval(interval)
  }, [state.isLoading])

  // Listen for link clicks and programmatic navigation
  useEffect(() => {
    let navigationTimeout: NodeJS.Timeout

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      
      if (link && link.href && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
        const url = new URL(link.href)
        const currentUrl = new URL(window.location.href)
        
        // Only show progress for internal navigation to different pages
        const isDifferentPage = url.pathname !== currentUrl.pathname
        const isNotAnchor = !url.pathname.includes('#') && !link.href.includes('#')
        const isInternal = url.origin === currentUrl.origin
        
        if (isInternal && isDifferentPage && isNotAnchor) {
          // Shorter delay for more responsive feel
          navigationTimeout = setTimeout(() => {
            startLoading()
          }, 100)
        }
      }
    }

    const handleFormSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement
      const action = form.action
      
      if (action && !action.startsWith('mailto:') && !action.startsWith('tel:')) {
        const url = new URL(action, window.location.origin)
        const currentUrl = new URL(window.location.href)
        
        if (url.pathname !== currentUrl.pathname) {
          navigationTimeout = setTimeout(() => {
            startLoading()
          }, 100)
        }
      }
    }

    // Listen for programmatic navigation via router
    const handleBeforeUnload = () => {
      if (state.isLoading) {
        stopLoading()
      }
    }

    // Listen for browser back/forward buttons
    const handlePopState = () => {
      navigationTimeout = setTimeout(() => {
        startLoading()
      }, 100)
    }

    document.addEventListener('click', handleLinkClick)
    document.addEventListener('submit', handleFormSubmit)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      clearTimeout(navigationTimeout)
      document.removeEventListener('click', handleLinkClick)
      document.removeEventListener('submit', handleFormSubmit)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [startLoading, stopLoading, state.isLoading])

  // Complete loading when pathname changes
  useEffect(() => {
    if (state.isLoading) {
      // Add a delay to ensure the progress bar is visible for a meaningful time
      const completionTimeout = setTimeout(() => {
        stopLoading()
      }, 200)
      
      return () => clearTimeout(completionTimeout)
    }
  }, [pathname, state.isLoading, stopLoading])

  return {
    ...state,
    startLoading,
    updateProgress,
    stopLoading
  }
}

