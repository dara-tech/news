"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface EnterpriseCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
  bordered?: boolean
  glassmorphism?: boolean
}

export const EnterpriseCard = ({
  children,
  className,
  hover = true,
  gradient = false,
  bordered = true,
  glassmorphism = false
}: EnterpriseCardProps) => {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-300",
        // Base styles
        "bg-background/95",
        // Border styles
        bordered && "border border-border/20",
        // Gradient background
        gradient && "bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20",
        // Glassmorphism effect
        glassmorphism && "backdrop-blur-xl bg-background/80 border-white/10",
        // Hover effects
        hover && "hover:shadow-2xl hover:shadow-primary/5 hover:border-border/40 hover:bg-background/98",
        className
      )}
      whileHover={hover ? { 
        y: -2,
        transition: { duration: 0.2 }
      } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] via-transparent to-purple-500/[0.02] pointer-events-none" />
      
      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
        whileHover={{
          translateX: "200%",
          transition: { duration: 0.6 }
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
