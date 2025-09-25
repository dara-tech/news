"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface GlobalLoadingProps {
  message?: string
}

export default function GlobalLoading({ message = "Loading..." }: GlobalLoadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="bg-card border rounded-lg p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium">{message}</span>
        </div>
      </div>
    </motion.div>
  )
}
