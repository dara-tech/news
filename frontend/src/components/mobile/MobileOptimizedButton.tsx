"use client"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { useMobileOptimizations } from "@/hooks/useMobileOptimizations"
import { cn } from "@/lib/utils"

interface MobileOptimizedButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 
  'onDrag' | 'onDragStart' | 'onDragEnd' | 
  'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' |
  'onTransitionEnd' | 'onTransitionStart' | 'onTransitionRun' | 'onTransitionCancel'
> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  hapticFeedback?: boolean
  touchFeedback?: boolean
}

const MobileOptimizedButton = forwardRef<HTMLButtonElement, MobileOptimizedButtonProps>(
  ({
    children,
    className,
    variant = 'default',
    size = 'default',
    fullWidth = false,
    loading = false,
    leftIcon,
    rightIcon,
    hapticFeedback = true,
    touchFeedback = true,
    disabled,
    onClick,
    ...props
  }, ref) => {
    const { isMobile, triggerHapticFeedback, triggerTouchFeedback } = useMobileOptimizations()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return

      if (hapticFeedback && isMobile) {
        triggerHapticFeedback('light')
      }

      if (touchFeedback && isMobile) {
        triggerTouchFeedback(e.currentTarget)
      }

      onClick?.(e)
    }

    const sizeClasses = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10'
    }

    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline'
    }

    return (
      <motion.button
        ref={ref}
        type="button"
        disabled={disabled || loading}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && "w-full",
          isMobile && "touchable min-h-[44px] min-w-[44px]",
          className
        )}
        whileTap={isMobile ? { scale: 0.98 } : undefined}
        whileHover={!isMobile ? { scale: 1.02 } : undefined}
        {...props}
      >
        {loading && (
          <motion.div
            className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          />
        )}
        
        {leftIcon && !loading && (
          <span className="mr-2">{leftIcon}</span>
        )}
        
        {children}
        
        {rightIcon && !loading && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </motion.button>
    )
  }
)

MobileOptimizedButton.displayName = 'MobileOptimizedButton'

export default MobileOptimizedButton

