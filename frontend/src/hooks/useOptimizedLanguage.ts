"use client"

import { useLanguage } from '@/context/LanguageContext'
import { useCallback, useMemo } from 'react'

interface LocalizedContent {
  en: string
  kh: string
}

export const useOptimizedLanguage = () => {
  const { language, setLanguage, toggleLanguage, isChanging } = useLanguage()

  // Memoized function to get localized text
  const getLocalizedText = useCallback((content: LocalizedContent | string): string => {
    if (typeof content === 'string') return content
    return language === 'kh' ? content.kh : content.en
  }, [language])

  // Memoized function to get localized object
  const getLocalizedObject = useCallback(<T extends Record<string, LocalizedContent>>(
    obj: T
  ): Record<keyof T, string> => {
    const result = {} as Record<keyof T, string>
    for (const key in obj) {
      result[key] = getLocalizedText(obj[key])
    }
    return result
  }, [getLocalizedText])

  // Memoized language info
  const languageInfo = useMemo(() => ({
    isEnglish: language === 'en',
    isKhmer: language === 'kh',
    locale: language === 'kh' ? 'km-KH' : 'en-US',
    direction: language === 'kh' ? 'rtl' : 'ltr'
  }), [language])

  // Memoized date formatter
  const formatDate = useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString(languageInfo.locale, {
      timeZone: 'Asia/Phnom_Penh',
      ...options
    })
  }, [languageInfo.locale])

  // Memoized time formatter
  const formatTime = useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleTimeString(languageInfo.locale, {
      timeZone: 'Asia/Phnom_Penh',
      ...options
    })
  }, [languageInfo.locale])

  return {
    language,
    setLanguage,
    toggleLanguage,
    isChanging,
    getLocalizedText,
    getLocalizedObject,
    ...languageInfo,
    formatDate,
    formatTime
  }
}
