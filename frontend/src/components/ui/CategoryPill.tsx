"use client"

import { motion } from "framer-motion"
import React from "react"

// Helper to safely convert hex to rgba
const hexToRGBA = (hex: string, alpha: number): string => {
  try {
    const cleanHex = hex.replace("#", "")
    const r = parseInt(cleanHex.slice(0, 2), 16)
    const g = parseInt(cleanHex.slice(2, 4), 16)
    const b = parseInt(cleanHex.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  } catch {
    return `rgba(59, 130, 246, ${alpha})` // fallback to Tailwind blue-500
  }
}

interface CategoryPillProps {
  name: string
  color?: string // hex color like "#3b82f6"
  animate?: boolean
}

const CategoryPill: React.FC<CategoryPillProps> = ({ name, color = "#3b82f6", animate = true }) => {
  const bgColor = hexToRGBA(color, 0.1)
  const borderColor = hexToRGBA(color, 0.25)

  const pillContent = (
    <div
      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: color,
      }}
    >
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </div>
  )

  return animate ? (
    <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
      {pillContent}
    </motion.div>
  ) : (
    <div className="inline-block">{pillContent}</div>
  )
}

export default CategoryPill 