import React, { useCallback, useRef, useState } from 'react'

interface TouchGestureState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  deltaX: number
  deltaY: number
  isDragging: boolean
  direction: 'left' | 'right' | 'up' | 'down' | null
  velocity: number
}

interface TouchGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', distance: number, velocity: number) => void
  threshold?: number
  velocityThreshold?: number
  preventDefault?: boolean
  stopPropagation?: boolean
}

export function useTouchGestures(options: TouchGestureOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipe,
    threshold = 50,
    velocityThreshold = 0.3,
    preventDefault = true,
    stopPropagation = false
  } = options

  const [gestureState, setGestureState] = useState<TouchGestureState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    isDragging: false,
    direction: null,
    velocity: 0
  })

  const touchStartTime = useRef<number>(0)
  const lastTouchTime = useRef<number>(0)
  const lastTouchX = useRef<number>(0)
  const lastTouchY = useRef<number>(0)

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLElement>) => {
    if (preventDefault) e.preventDefault()
    if (stopPropagation) e.stopPropagation()

    const touch = e.touches[0]
    const now = Date.now()
    
    touchStartTime.current = now
    lastTouchTime.current = now
    lastTouchX.current = touch.clientX
    lastTouchY.current = touch.clientY

    setGestureState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      isDragging: true,
      direction: null,
      velocity: 0
    })
  }, [preventDefault, stopPropagation])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLElement>) => {
    if (preventDefault) e.preventDefault()
    if (stopPropagation) e.stopPropagation()

    const touch = e.touches[0]
    const now = Date.now()
    const deltaTime = now - lastTouchTime.current
    const deltaX = touch.clientX - lastTouchX.current
    const deltaY = touch.clientY - lastTouchY.current

    if (deltaTime > 0) {
      const velocityX = Math.abs(deltaX) / deltaTime
      const velocityY = Math.abs(deltaY) / deltaTime
      const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY)

      setGestureState(prev => {
        const newDeltaX = touch.clientX - prev.startX
        const newDeltaY = touch.clientY - prev.startY
        const absDeltaX = Math.abs(newDeltaX)
        const absDeltaY = Math.abs(newDeltaY)

        let direction: 'left' | 'right' | 'up' | 'down' | null = null
        if (absDeltaX > absDeltaY) {
          direction = newDeltaX > 0 ? 'right' : 'left'
        } else if (absDeltaY > absDeltaX) {
          direction = newDeltaY > 0 ? 'down' : 'up'
        }

        return {
          ...prev,
          currentX: touch.clientX,
          currentY: touch.clientY,
          deltaX: newDeltaX,
          deltaY: newDeltaY,
          direction,
          velocity
        }
      })

      lastTouchTime.current = now
      lastTouchX.current = touch.clientX
      lastTouchY.current = touch.clientY
    }
  }, [preventDefault, stopPropagation])

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLElement>) => {
    if (preventDefault) e.preventDefault()
    if (stopPropagation) e.stopPropagation()

    const now = Date.now()
    const totalTime = now - touchStartTime.current

    setGestureState(prev => {
      const absDeltaX = Math.abs(prev.deltaX)
      const absDeltaY = Math.abs(prev.deltaY)
      const distance = Math.sqrt(prev.deltaX * prev.deltaX + prev.deltaY * prev.deltaY)
      const velocity = totalTime > 0 ? distance / totalTime : 0

      // Check if it's a valid swipe
      if (distance >= threshold && velocity >= velocityThreshold && prev.direction) {
        const direction = prev.direction

        // Call specific direction handlers
        switch (direction) {
          case 'left':
            onSwipeLeft?.()
            break
          case 'right':
            onSwipeRight?.()
            break
          case 'up':
            onSwipeUp?.()
            break
          case 'down':
            onSwipeDown?.()
            break
        }

        // Call general swipe handler
        onSwipe?.(direction, distance, velocity)
      }

      return {
        ...prev,
        isDragging: false,
        direction: null,
        velocity
      }
    })
  }, [preventDefault, stopPropagation, threshold, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipe])

  return {
    gestureState,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  }
}

export default useTouchGestures

