import { useCallback, useEffect, useRef, useState } from 'react'

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  threshold?: number
  resistance?: number
  enabled?: boolean
  refreshThreshold?: number
}

interface PullToRefreshState {
  isPulling: boolean
  isRefreshing: boolean
  pullDistance: number
  canRefresh: boolean
  progress: number
}

export function usePullToRefresh(options: PullToRefreshOptions) {
  const {
    onRefresh,
    threshold = 80,
    resistance = 0.5,
    enabled = true,
    refreshThreshold = 100
  } = options

  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    canRefresh: false,
    progress: 0
  })

  const startY = useRef<number>(0)
  const currentY = useRef<number>(0)
  const isAtTop = useRef<boolean>(false)
  const elementRef = useRef<HTMLElement | null>(null)

  const checkIfAtTop = useCallback((element: HTMLElement) => {
    return element.scrollTop === 0
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || state.isRefreshing) return

    const element = elementRef.current
    if (!element) return

    isAtTop.current = checkIfAtTop(element)
    
    if (isAtTop.current) {
      startY.current = e.touches[0].clientY
      currentY.current = e.touches[0].clientY
      
      setState(prev => ({
        ...prev,
        isPulling: true
      }))
    }
  }, [enabled, state.isRefreshing, checkIfAtTop])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !state.isPulling || state.isRefreshing) return

    const element = elementRef.current
    if (!element || !isAtTop.current) return

    currentY.current = e.touches[0].clientY
    const deltaY = currentY.current - startY.current

    if (deltaY > 0) {
      e.preventDefault()
      
      const pullDistance = Math.min(deltaY * resistance, threshold * 2)
      const progress = Math.min(pullDistance / threshold, 1)
      const canRefresh = pullDistance >= refreshThreshold

      setState(prev => ({
        ...prev,
        pullDistance,
        progress,
        canRefresh
      }))
    }
  }, [enabled, state.isPulling, state.isRefreshing, resistance, threshold, refreshThreshold])

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || !state.isPulling || state.isRefreshing) return

    setState(prev => ({
      ...prev,
      isPulling: false
    }))

    if (state.canRefresh) {
      setState(prev => ({
        ...prev,
        isRefreshing: true
      }))

      try {
        await onRefresh()
      } catch (error) {
        console.error('Pull to refresh error:', error)
      } finally {
        setState(prev => ({
          ...prev,
          isRefreshing: false,
          pullDistance: 0,
          canRefresh: false,
          progress: 0
        }))
      }
    } else {
      setState(prev => ({
        ...prev,
        pullDistance: 0,
        canRefresh: false,
        progress: 0
      }))
    }
  }, [enabled, state.isPulling, state.isRefreshing, state.canRefresh, onRefresh])

  const handleScroll = useCallback(() => {
    const element = elementRef.current
    if (!element) return

    isAtTop.current = checkIfAtTop(element)
    
    if (!isAtTop.current && state.isPulling) {
      setState(prev => ({
        ...prev,
        isPulling: false,
        pullDistance: 0,
        canRefresh: false,
        progress: 0
      }))
    }
  }, [state.isPulling, checkIfAtTop])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })
    element.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('scroll', handleScroll)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleScroll])

  const setElementRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element
  }, [])

  return {
    ...state,
    setElementRef,
    refresh: async () => {
      if (state.isRefreshing) return
      
      setState(prev => ({ ...prev, isRefreshing: true }))
      try {
        await onRefresh()
      } finally {
        setState(prev => ({ ...prev, isRefreshing: false }))
      }
    }
  }
}

export default usePullToRefresh

