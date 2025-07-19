import { useCallback, useEffect, useState } from "react"

interface UseCarouselProps {
  itemCount: number
  autoRotate?: boolean
  autoRotateInterval?: number
}

export function useCarousel({
  itemCount,
  autoRotate = true,
  autoRotateInterval = 5000,
}: UseCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % itemCount)
  }, [itemCount])

  useEffect(() => {
    if (!autoRotate || isPaused) return
    const interval = setInterval(() => next(), autoRotateInterval)
    return () => clearInterval(interval)
  }, [autoRotate, isPaused, autoRotateInterval, next])

  const play = () => setIsPaused(false)
  const pause = () => setIsPaused(true)

  return {
    currentIndex,
    isPaused,
    play,
    pause,
    setCurrentIndex,
  }
}
