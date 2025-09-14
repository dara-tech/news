"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Send, CheckCircle, Users, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

  const stats = [
    { label: lang === 'kh' ? 'អ្នកជាវ' : 'Subscribers', value: '50K+', icon: Users },
    { label: lang === 'kh' ? 'អត្រាបើក' : 'Open Rate', value: '85%', icon: CheckCircle },
    { label: lang === 'kh' ? 'ប្រចាំថ្ងៃ' : 'Daily', value: '24/7', icon: Sparkles }
  ]

  if (isSubscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8"
      >
        <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {lang === 'kh' ? 'អរគុណ! អ្នកបានជាវដោយជោគជ័យ' : 'Thank you! Successfully subscribed'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {lang === 'kh' ? 'យើងនឹងផ្ញើព័ត៌មានថ្មីៗទៅអ្នក' : 'We\'ll send you the latest news updates'}
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
      <Card className="border-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 overflow-hidden">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {lang === 'kh' ? 'ព័ត៌មានថ្មីៗ' : 'Stay Updated'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {lang === 'kh' ? 'ទទួលបានព័ត៌មានថ្មីៗដោយផ្ទាល់' : 'Get the latest news delivered to your inbox'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder={lang === 'kh' ? 'អាសយដ្ឋានអ៊ីមែលរបស់អ្នក' : 'Enter your email address'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {lang === 'kh' ? 'យើងនឹងមិនចែករំលែកអ៊ីមែលរបស់អ្នកទេ' : 'We respect your privacy. Unsubscribe at any time.'}
                </p>
              </form>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <stat.icon className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl" />
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span>{lang === 'kh' ? 'ព័ត៌មានថ្មីៗរបស់អ្នក' : 'Your newsletter'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  )
}
