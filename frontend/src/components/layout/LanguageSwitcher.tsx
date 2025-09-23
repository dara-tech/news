"use client"

import { useLanguage } from "@/context/LanguageContext"
import { Button } from "@/components/ui/button"

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "kh", label: "KH" },
]

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage()

  const currentLabel = LANGUAGES.find(l => l.code === language)?.label || "EN"

  return (
    <Button
      onClick={toggleLanguage}
      className="px-3 py-1 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition-colors"
      variant="outline"
      size="sm"
      title="Switch language"
    >
      {currentLabel}
    </Button>
  )
}
