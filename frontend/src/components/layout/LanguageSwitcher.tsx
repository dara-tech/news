"use client"

import { useRouter, usePathname, useParams } from "next/navigation"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "kh", label: "KH" },
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const currentLang = (params.lang as string) || "en"

  const currentLabel = LANGUAGES.find(l => l.code === currentLang)?.label || "EN"

  const switchLanguage = useCallback(async () => {
    const nextLang = currentLang === "en" ? "kh" : "en"
    let newPath = pathname.replace(`/${currentLang}`, `/${nextLang}`)
    if (!newPath.startsWith(`/${nextLang}`)) {
      newPath = `/${nextLang}${pathname}`
    }
    await router.push(newPath)
  }, [router, pathname, currentLang])

  return (
    <Button
      onClick={switchLanguage}
      className="px-3 py-1 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition-colors"
      variant="outline"
      size="sm"
      title="Switch language"
    >
      {currentLabel}
    </Button>
  )
}
