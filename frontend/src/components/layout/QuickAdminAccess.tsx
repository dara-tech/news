"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Settings, 
  BarChart3, 
  Users, 
  FileText, 
  Key, 
  Zap, 
  ChevronDown,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface QuickAdminAccessProps {
  lang: string
  user: any // User object from auth context
}

const QuickAdminAccess = ({ lang, user }: QuickAdminAccessProps) => {
  const [isOpen, setIsOpen] = useState(false)

  // Check if user has admin privileges
  const isAdmin = user?.role === 'admin' || user?.isAdmin

  if (!isAdmin) return null

  const adminMenuItems = [
    {
      label: "Analytics",
      href: `/${lang}/admin/analytics`,
      icon: BarChart3,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "View platform metrics"
    },
    {
      label: "Data Quality",
      href: `/${lang}/admin/data-quality`,
      icon: Shield,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      description: "Monitor content quality"
    },
    {
      label: "API Keys",
      href: `/${lang}/admin/api-keys`,
      icon: Key,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      description: "Manage integrations"
    },
    {
      label: "Users",
      href: `/${lang}/admin/users`,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: "User management"
    },
    {
      label: "Content",
      href: `/${lang}/admin/content`,
      icon: FileText,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      description: "Content management"
    },
    {
      label: "Settings",
      href: `/${lang}/admin/settings`,
      icon: Settings,
      color: "text-gray-500",
      bgColor: "bg-gray-500/10",
      description: "System settings"
    }
  ]

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className={`relative overflow-hidden transition-all duration-300 ${
              isOpen 
                ? "bg-red-500/10 text-red-600 border-red-500/20" 
                : "hover:bg-red-500/5 hover:text-red-600"
            }`}
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Zap className="h-4 w-4" />
              </motion.div>
              <span className="hidden md:inline font-medium">Admin</span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-3 w-3" />
              </motion.div>
            </div>

            {/* Pulse effect for admin access */}
            <motion.div
              className="absolute inset-0 bg-red-500/20 rounded-md"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isOpen ? [1, 1.05, 1] : 0,
                opacity: isOpen ? [0.3, 0.1, 0] : 0
              }}
              transition={{ duration: 0.6, repeat: isOpen ? Infinity : 0 }}
            />
          </Button>
        </motion.div>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-72 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl"
      >
        <DropdownMenuLabel className="flex items-center gap-2 py-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Shield className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <div className="font-medium">Admin Dashboard</div>
            <div className="text-xs text-muted-foreground">Quick access panel</div>
          </div>
          <Badge variant="destructive" className="ml-auto text-xs">
            ADMIN
          </Badge>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="grid grid-cols-2 gap-1 p-2">
          {adminMenuItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <DropdownMenuItem asChild>
                <Link
                  href={item.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg cursor-pointer group hover:bg-muted/50 transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-xl ${item.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            </motion.div>
          ))}
        </div>

        <DropdownMenuSeparator />

        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              System Status
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-600 font-medium">Healthy</span>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default QuickAdminAccess
