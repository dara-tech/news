"use client"

import { memo } from 'react'
import { useLanguage } from '@/context/LanguageContext'

interface LocalizedTextProps {
  en: string
  kh: string
  className?: string
  as?: keyof React.JSX.IntrinsicElements
  children?: React.ReactNode
}

const LocalizedText = memo<LocalizedTextProps>(({ 
  en, 
  kh, 
  className = "", 
  as: Component = 'span',
  children,
  ...props 
}) => {
  const { language } = useLanguage()
  
  const text = language === 'kh' ? kh : en
  
  return (
    <Component className={className} {...props}>
      {text}
      {children}
    </Component>
  )
})

LocalizedText.displayName = 'LocalizedText'

export default LocalizedText
