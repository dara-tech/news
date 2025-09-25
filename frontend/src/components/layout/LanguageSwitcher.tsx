"use client"

import { useLanguage } from "@/context/LanguageContext"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function LanguageSwitcher() {
  const { language, toggleLanguage, isChanging } = useLanguage()

  return (
    <>
      <Button
        onClick={toggleLanguage}
        disabled={isChanging}
        variant="outline"
        size="sm"
        className="px-3 py-1 min-w-[60px]"
      >
        <AnimatePresence mode="wait">
          {isChanging ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-xs">...</span>
            </motion.div>
          ) : (
            <motion.div
              key={language}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {language.toUpperCase()}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </>
  )
}
