import { useCallback, useEffect, useState } from 'react'
import { useIsMobile } from './use-mobile'

interface MobileOptimizations {
  // Touch optimizations
  enableTouchFeedback: boolean
  enableHapticFeedback: boolean
  enableSmoothScrolling: boolean
  
  // Performance optimizations
  enableReducedMotion: boolean
  enableLazyLoading: boolean
  enableImageOptimization: boolean
  
  // UX optimizations
  enableAutoFocus: boolean
  enableKeyboardAvoidance: boolean
  enableSafeAreaInsets: boolean
  
  // Gesture optimizations
  enableSwipeGestures: boolean
  enablePinchZoom: boolean
  enablePullToRefresh: boolean
}

const defaultOptimizations: MobileOptimizations = {
  enableTouchFeedback: true,
  enableHapticFeedback: true,
  enableSmoothScrolling: true,
  enableReducedMotion: false,
  enableLazyLoading: true,
  enableImageOptimization: true,
  enableAutoFocus: true,
  enableKeyboardAvoidance: true,
  enableSafeAreaInsets: true,
  enableSwipeGestures: true,
  enablePinchZoom: true,
  enablePullToRefresh: true
}

export function useMobileOptimizations(customOptimizations?: Partial<MobileOptimizations>) {
  const isMobile = useIsMobile()
  const [optimizations, setOptimizations] = useState<MobileOptimizations>({
    ...defaultOptimizations,
    ...customOptimizations
  })

  // Apply mobile-specific optimizations
  useEffect(() => {
    if (!isMobile) return

    // Apply CSS custom properties for mobile
    const root = document.documentElement
    
    if (optimizations.enableSmoothScrolling) {
      root.style.setProperty('--mobile-scroll-behavior', 'smooth')
    }
    
    if (optimizations.enableReducedMotion) {
      root.style.setProperty('--mobile-prefers-reduced-motion', 'reduce')
    }
    
    if (optimizations.enableSafeAreaInsets) {
      root.style.setProperty('--mobile-safe-area-inset-top', 'env(safe-area-inset-top, 0px)')
      root.style.setProperty('--mobile-safe-area-inset-bottom', 'env(safe-area-inset-bottom, 0px)')
      root.style.setProperty('--mobile-safe-area-inset-left', 'env(safe-area-inset-left, 0px)')
      root.style.setProperty('--mobile-safe-area-inset-right', 'env(safe-area-inset-right, 0px)')
    }

    // Add mobile-specific classes
    document.body.classList.add('mobile-optimized')
    
    if (optimizations.enableTouchFeedback) {
      document.body.classList.add('touch-feedback-enabled')
    }
    
    if (optimizations.enableHapticFeedback) {
      document.body.classList.add('haptic-feedback-enabled')
    }

    return () => {
      // Cleanup
      document.body.classList.remove('mobile-optimized', 'touch-feedback-enabled', 'haptic-feedback-enabled')
    }
  }, [isMobile, optimizations])

  // Haptic feedback function
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!isMobile || !optimizations.enableHapticFeedback) return

    try {
      if ('vibrate' in navigator) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30]
        }
        navigator.vibrate(patterns[type])
      }
    } catch (error) {
      // Haptic feedback not supported
    }
  }, [isMobile, optimizations.enableHapticFeedback])

  // Touch feedback function
  const triggerTouchFeedback = useCallback((element: HTMLElement) => {
    if (!isMobile || !optimizations.enableTouchFeedback) return

    element.classList.add('touch-active')
    setTimeout(() => {
      element.classList.remove('touch-active')
    }, 150)
  }, [isMobile, optimizations.enableTouchFeedback])

  // Auto-focus for mobile
  const autoFocus = useCallback((element: HTMLElement | null) => {
    if (!isMobile || !optimizations.enableAutoFocus || !element) return

    // Small delay to ensure element is rendered
    setTimeout(() => {
      element.focus()
    }, 100)
  }, [isMobile, optimizations.enableAutoFocus])

  // Keyboard avoidance
  const handleKeyboardAvoidance = useCallback(() => {
    if (!isMobile || !optimizations.enableKeyboardAvoidance) return

    const handleResize = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight
      const isKeyboardOpen = viewportHeight < window.innerHeight * 0.75
      
      document.body.classList.toggle('keyboard-open', isKeyboardOpen)
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      return () => window.visualViewport?.removeEventListener('resize', handleResize)
    }
  }, [isMobile, optimizations.enableKeyboardAvoidance])

  useEffect(() => {
    const cleanup = handleKeyboardAvoidance()
    return cleanup
  }, [handleKeyboardAvoidance])

  // Update optimizations
  const updateOptimizations = useCallback((newOptimizations: Partial<MobileOptimizations>) => {
    setOptimizations(prev => ({
      ...prev,
      ...newOptimizations
    }))
  }, [])

  return {
    isMobile,
    optimizations,
    updateOptimizations,
    triggerHapticFeedback,
    triggerTouchFeedback,
    autoFocus
  }
}

export default useMobileOptimizations

