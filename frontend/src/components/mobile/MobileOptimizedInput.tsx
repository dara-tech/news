"use client"

import { forwardRef, useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Search, X, AlertCircle } from "lucide-react"
import { useMobileOptimizations } from "@/hooks/useMobileOptimizations"
import { cn } from "@/lib/utils"

interface MobileOptimizedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  clearable?: boolean
  showPasswordToggle?: boolean
  variant?: 'default' | 'filled' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  onClear?: () => void
}

const MobileOptimizedInput = forwardRef<HTMLInputElement, MobileOptimizedInputProps>(
  ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    clearable = false,
    showPasswordToggle = false,
    variant = 'outlined',
    size = 'md',
    fullWidth = false,
    className,
    type = 'text',
    value,
    onChange,
    onClear,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [inputValue, setInputValue] = useState(value || '')
    const { isMobile, triggerHapticFeedback, triggerTouchFeedback, autoFocus } = useMobileOptimizations()
    const inputRef = useRef<HTMLInputElement>(null)

    const actualType = showPasswordToggle && showPassword ? 'text' : type
    const hasValue = inputValue !== '' && inputValue != null
    const hasError = !!error

    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(inputRef.current)
        } else {
          ref.current = inputRef.current
        }
      }
    }, [ref])

    useEffect(() => {
      setInputValue(value || '')
    }, [value])

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      triggerHapticFeedback('light')
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
      onChange?.(e)
    }

    const handleClear = () => {
      setInputValue('')
      triggerHapticFeedback('light')
      triggerTouchFeedback(inputRef.current!)
      onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
      onClear?.()
      autoFocus(inputRef.current)
    }

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
      triggerHapticFeedback('light')
      triggerTouchFeedback(inputRef.current!)
      autoFocus(inputRef.current)
    }

    const sizeClasses = {
      sm: 'h-10 px-3 text-sm',
      md: 'h-12 px-4 text-base',
      lg: 'h-14 px-5 text-lg'
    }

    const variantClasses = {
      default: 'bg-background border border-input',
      filled: 'bg-muted border-0',
      outlined: 'bg-background border-2 border-input'
    }

    return (
      <div className={cn("relative", fullWidth && "w-full", className)}>
        {/* Label */}
        {label && (
          <motion.label
            className={cn(
              "block text-sm font-medium mb-2 transition-colors",
              hasError ? "text-destructive" : "text-foreground"
            )}
            animate={{
              color: hasError ? "hsl(var(--destructive))" : "hsl(var(--foreground))"
            }}
          >
            {label}
          </motion.label>
        )}

        {/* Input Container */}
        <div className="relative">
          <motion.div
            className={cn(
              "relative flex items-center rounded-lg transition-all duration-200",
              sizeClasses[size],
              variantClasses[variant],
              isFocused && "ring-2 ring-primary/20 border-primary",
              hasError && "border-destructive ring-2 ring-destructive/20",
              isMobile && "touchable"
            )}
            animate={{
              scale: isFocused ? 1.02 : 1,
              borderColor: hasError 
                ? "hsl(var(--destructive))" 
                : isFocused 
                  ? "hsl(var(--primary))" 
                  : "hsl(var(--input))"
            }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Left Icon */}
            {leftIcon && (
              <div className="absolute left-3 flex items-center justify-center text-muted-foreground">
                {leftIcon}
              </div>
            )}

            {/* Input */}
            <input
              ref={inputRef}
              type={actualType}
              value={inputValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={cn(
                "flex-1 bg-transparent border-0 outline-none placeholder:text-muted-foreground",
                "disabled:cursor-not-allowed disabled:opacity-50",
                leftIcon && "pl-10",
                (rightIcon || clearable || showPasswordToggle) && "pr-10",
                isMobile && "text-base" // Prevent zoom on iOS
              )}
              {...props}
            />

            {/* Right Icons */}
            <div className="absolute right-3 flex items-center gap-2">
              {/* Clear Button */}
              <AnimatePresence>
                {clearable && hasValue && !isFocused && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={handleClear}
                    className="p-1 rounded-full hover:bg-muted transition-colors touchable"
                    type="button"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Password Toggle */}
              {showPasswordToggle && (
                <button
                  onClick={togglePasswordVisibility}
                  className="p-1 rounded-full hover:bg-muted transition-colors touchable"
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              )}

              {/* Custom Right Icon */}
              {rightIcon && !clearable && !showPasswordToggle && (
                <div className="text-muted-foreground">
                  {rightIcon}
                </div>
              )}
            </div>
          </motion.div>

          {/* Error Icon */}
          <AnimatePresence>
            {hasError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <AlertCircle className="h-4 w-4 text-destructive" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Helper Text / Error Message */}
        <AnimatePresence>
          {(helperText || error) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2"
            >
              <p className={cn(
                "text-sm",
                hasError ? "text-destructive" : "text-muted-foreground"
              )}>
                {error || helperText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

MobileOptimizedInput.displayName = 'MobileOptimizedInput'

export default MobileOptimizedInput

