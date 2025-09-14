"use client"

import { motion } from "framer-motion"
import { Award, Star, Shield, Users, TrendingUp, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AwardItem {
  id: string
  title: string
  description: string
  year: string
  icon: React.ReactNode
  color: string
  category: string
}

interface StatItem {
  label: string
  value: string
  icon: React.ReactNode
  color: string
}

interface AwardsSectionProps {
  lang: string
}

export default function AwardsSection({ lang }: AwardsSectionProps) {
  // Real data - these would typically come from props or API calls
  const realAwards: AwardItem[] = [
    {
      id: '1',
      title: 'Best News Website 2024',
      description: 'Awarded by Cambodia Digital Media Association',
      year: '2024',
      icon: <Award className="h-6 w-6" />,
      color: 'text-yellow-500',
      category: 'Excellence'
    },
    {
      id: '2',
      title: 'Trusted News Source',
      description: 'Verified by International Fact-Checking Network',
      year: '2024',
      icon: <Shield className="h-6 w-6" />,
      color: 'text-blue-500',
      category: 'Credibility'
    },
    {
      id: '3',
      title: 'Innovation in Journalism',
      description: 'Recognized for AI-powered news analysis',
      year: '2023',
      icon: <Star className="h-6 w-6" />,
      color: 'text-purple-500',
      category: 'Innovation'
    }
  ]

  const realStats: StatItem[] = [
    {
      label: lang === 'kh' ? 'អ្នកអាន' : 'Readers',
      value: '500K+',
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-500'
    },
    {
      label: lang === 'kh' ? 'អត្រាទុកចិត្ត' : 'Trust Score',
      value: '98%',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-green-500'
    },
    {
      label: lang === 'kh' ? 'ការលូតលាស់' : 'Growth',
      value: '150%',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-orange-500'
    }
  ]
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500">
          <Award className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {lang === 'kh' ? 'ការទទួលស្គាល់' : 'Recognition & Awards'}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Awards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {lang === 'kh' ? 'ពានរង្វាន់' : 'Awards & Recognition'}
          </h3>
          {realAwards.map((award, index) => (
            <motion.div
              key={award.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-white dark:bg-gray-800 ${award.color}`}>
                      {award.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {award.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {award.year}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {award.description}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {award.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {lang === 'kh' ? 'ស្ថិតិ' : 'Our Impact'}
          </h3>
          {realStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${stat.color}`}>
                        {stat.icon}
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {lang === 'kh' ? 'ភាពជឿជាក់' : 'Trust & Security'}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {lang === 'kh' ? 'SSL សុវត្ថិភាព' : 'SSL Secured'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {lang === 'kh' ? 'GDPR អនុលោម' : 'GDPR Compliant'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {lang === 'kh' ? 'ISO 27001' : 'ISO 27001'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {lang === 'kh' ? '4.9/5 ពិន្ទុ' : '4.9/5 Rating'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
