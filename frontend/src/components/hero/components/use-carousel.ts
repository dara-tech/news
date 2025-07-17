"use client"

import { useState, useEffect, useCallback } from "react"

/**
 * A custom hook to manage carousel state and logic.
 * @param count The total number of items in the carousel.
 * @param intervalMs The auto-play interval in milliseconds.
 * @param autoPlay Whether the carousel should auto-play.
 * @returns The current index, and functions to navigate to the next/previous item or a specific index.
 */
export const useCarousel = (count: number, intervalMs: number = 8000, autoPlay: boolean = true) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = useCallback(() => {
    if (count === 0) return
    setCurrentIndex((prev) => (prev + 1) % count)
  }, [count])

  const prev = useCallback(() => {
    if (count === 0) return
    setCurrentIndex((prev) => (prev - 1 + count) % count)
  }, [count])

  useEffect(() => {
    if (!autoPlay || count === 0) return

    const timer = setInterval(next, intervalMs)
    return () => clearInterval(timer)
  }, [count, intervalMs, next, autoPlay])

  return { currentIndex, setCurrentIndex, next, prev }
}