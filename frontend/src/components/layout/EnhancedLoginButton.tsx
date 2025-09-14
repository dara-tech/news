"use client"

import Link from "next/link"
import { LogIn, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EnhancedLoginButtonProps {
  lang: string
}

const EnhancedLoginButton = ({ lang }: EnhancedLoginButtonProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-border/50 hover:border-border transition-colors"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Sign in</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/login`} className="cursor-pointer">
            <LogIn className="h-4 w-4 mr-2" />
            Sign in
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/register`} className="cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            Create account
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default EnhancedLoginButton
