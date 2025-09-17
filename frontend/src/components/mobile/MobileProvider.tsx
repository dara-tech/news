"use client"

import { useEffect } from "react"
import { useMobileOptimizations } from "@/hooks/useMobileOptimizations"

interface MobileProviderProps {
  children: React.ReactNode
}

const MobileProvider = ({ children }: MobileProviderProps) => {
  const { isMobile } = useMobileOptimizations()

  useEffect(() => {
    if (isMobile) {
      // Add mobile-specific meta tags
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
      } else {
        const meta = document.createElement('meta')
        meta.name = 'viewport'
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        document.head.appendChild(meta)
      }

      // Add mobile-specific theme color
      const themeColor = document.querySelector('meta[name="theme-color"]')
      if (themeColor) {
        themeColor.setAttribute('content', '#000000')
      } else {
        const meta = document.createElement('meta')
        meta.name = 'theme-color'
        meta.content = '#000000'
        document.head.appendChild(meta)
      }

      // Add mobile-specific status bar style
      const statusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
      if (statusBar) {
        statusBar.setAttribute('content', 'black-translucent')
      } else {
        const meta = document.createElement('meta')
        meta.name = 'apple-mobile-web-app-status-bar-style'
        meta.content = 'black-translucent'
        document.head.appendChild(meta)
      }

      // Add mobile-specific web app capabilities
      const webAppCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]')
      if (webAppCapable) {
        webAppCapable.setAttribute('content', 'yes')
      } else {
        const meta = document.createElement('meta')
        meta.name = 'apple-mobile-web-app-capable'
        meta.content = 'yes'
        document.head.appendChild(meta)
      }

      // Prevent zoom on input focus (iOS)
      const preventZoom = (e: Event) => {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
          const viewport = document.querySelector('meta[name="viewport"]')
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
          }
        }
      }

      const restoreZoom = (e: Event) => {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
          const viewport = document.querySelector('meta[name="viewport"]')
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
          }
        }
      }

      document.addEventListener('focusin', preventZoom)
      document.addEventListener('focusout', restoreZoom)

      return () => {
        document.removeEventListener('focusin', preventZoom)
        document.removeEventListener('focusout', restoreZoom)
      }
    }
  }, [isMobile])

  return <>{children}</>
}

export default MobileProvider

