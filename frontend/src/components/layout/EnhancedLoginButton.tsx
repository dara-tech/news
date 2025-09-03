"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { LogIn, UserPlus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EnhancedLoginButtonProps {
  lang: string
}

const EnhancedLoginButton = ({ lang }: EnhancedLoginButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <Button
              variant="outline"
              className="relative overflow-hidden bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group"
            >
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                initial={{ x: "-100%" }}
                animate={{ x: isHovered ? "0%" : "-100%" }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Content */}
              <div className="relative flex items-center gap-2">
                <motion.div
                  animate={{ rotate: isHovered ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <LogIn className="h-4 w-4" />
                </motion.div>
                <span className="hidden md:inline font-medium">Get Started</span>
                
                {/* Sparkle effect */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Sparkles className="h-3 w-3 text-yellow-500" />
                  </motion.div>
                )}
              </div>

              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%", skewX: -15 }}
                animate={{ x: isHovered ? "200%" : "-100%" }}
                transition={{ duration: 0.6 }}
              />
            </Button>
          </motion.div>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="end" 
          className="w-64 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl"
        >
          <div className="px-3 py-2 text-center">
            <div className="text-sm font-medium">Join Razewire News</div>
            <div className="text-xs text-muted-foreground mt-1">
              Get personalized news and exclusive features
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link 
              href={`/${lang}/login`}
              className="flex items-center gap-3 py-3 px-3 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <LogIn className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Sign In</div>
                <div className="text-xs text-muted-foreground">
                  Access your account
                </div>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link 
              href={`/${lang}/register`}
              className="flex items-center gap-3 py-3 px-3 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <UserPlus className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Create Account</div>
                <div className="text-xs text-muted-foreground">
                  Join for free today
                </div>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <div className="px-3 py-2">
            <div className="text-xs text-muted-foreground text-center">
              🚀 Premium features • 📊 Analytics • 🎯 Personalization
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default EnhancedLoginButton
