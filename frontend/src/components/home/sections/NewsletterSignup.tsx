"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Send, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface NewsletterSignupProps {
  lang: string
}

export default function NewsletterSignup({ lang }: NewsletterSignupProps) {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubscribed(true)
    setIsLoading(false)
    setEmail("")
  }

  if (isSubscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8"
      >
        <Card className="border border-border/50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-1">
              {lang === 'kh' ? 'អរគុណ!' : 'Thank you!'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {lang === 'kh' ? 'យើងនឹងផ្ញើព័ត៌មានថ្មីៗទៅអ្នក' : 'You\'ll receive updates in your inbox'}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <Card className="border border-border/50">
        <CardContent className="p-6">
          <div className="max-w-md mx-auto text-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-medium">
                {lang === 'kh' ? 'ទទួលព័ត៌មានថ្មី' : 'Stay updated'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {lang === 'kh' ? 'ទទួលព័ត៌មានថ្មីៗតាមអ៊ីមែល' : 'Get the latest news delivered to your inbox'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder={lang === 'kh' ? 'អ៊ីមែលរបស់អ្នក' : 'your@email.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 text-sm"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  size="sm"
                  className="px-4"
                >
                  {isLoading ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    lang === 'kh' ? 'ជាវ' : 'Subscribe'
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {lang === 'kh' ? 'អាចបញ្ឈប់ការជាវបានគ្រប់ពេល' : 'Unsubscribe at any time'}
              </p>
            </form>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  )
}
