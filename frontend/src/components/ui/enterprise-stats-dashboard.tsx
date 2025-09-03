"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Users, Eye, FileText, Globe, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { EnterpriseCard } from "./enterprise-card"
import { Badge } from "@/components/ui/badge"

interface StatItem {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  color: string
}

interface EnterpriseStatsDashboardProps {
  stats?: StatItem[]
  title?: string
}

export const EnterpriseStatsDashboard = ({
  stats = [
    {
      label: "Total Articles",
      value: "12,847",
      change: "+12.5%",
      trend: 'up',
      icon: <FileText className="h-5 w-5" />,
      color: "blue"
    },
    {
      label: "Active Readers",
      value: "48,392",
      change: "+8.2%",
      trend: 'up',
      icon: <Users className="h-5 w-5" />,
      color: "green"
    },
    {
      label: "Page Views",
      value: "2.1M",
      change: "+15.3%",
      trend: 'up',
      icon: <Eye className="h-5 w-5" />,
      color: "purple"
    },
    {
      label: "Global Reach",
      value: "127",
      change: "-2.1%",
      trend: 'down',
      icon: <Globe className="h-5 w-5" />,
      color: "orange"
    }
  ],
  title = "Platform Analytics"
}: EnterpriseStatsDashboardProps) => {
  
  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500/10 to-blue-600/10 text-blue-600 border-blue-500/20",
      green: "from-green-500/10 to-green-600/10 text-green-600 border-green-500/20",
      purple: "from-purple-500/10 to-purple-600/10 text-purple-600 border-purple-500/20",
      orange: "from-orange-500/10 to-orange-600/10 text-orange-600 border-orange-500/20",
      red: "from-red-500/10 to-red-600/10 text-red-600 border-red-500/20"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return "text-green-600 bg-green-50 dark:bg-green-950/20"
      case 'down':
        return "text-red-600 bg-red-50 dark:bg-red-950/20"
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950/20"
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
            {title}
          </span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real-time insights and performance metrics for data-driven decision making.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <EnterpriseCard className="p-6" hover gradient>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br border ${getColorClasses(stat.color)}`}>
                  {stat.icon}
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(stat.trend)}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </h3>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </span>
                  <Badge 
                    className={`text-xs font-medium border-0 ${getTrendColor(stat.trend)}`}
                  >
                    {stat.change}
                  </Badge>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${stat.color === 'blue' ? 'from-blue-500 to-blue-600' : 
                    stat.color === 'green' ? 'from-green-500 to-green-600' :
                    stat.color === 'purple' ? 'from-purple-500 to-purple-600' :
                    'from-orange-500 to-orange-600'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.random() * 40 + 60}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                />
              </div>
            </EnterpriseCard>
          </motion.div>
        ))}
      </div>

      {/* Additional Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Performance Chart Placeholder */}
        <EnterpriseCard className="p-6" gradient>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Performance Overview</h3>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-300">
              +24% Growth
            </Badge>
          </div>
          
          {/* Mock Chart */}
          <div className="h-40 flex items-end justify-between gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-sm flex-1"
                initial={{ height: 0 }}
                animate={{ height: `${Math.random() * 100 + 20}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              />
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Jan</span>
            <span>Dec</span>
          </div>
        </EnterpriseCard>

        {/* Top Categories */}
        <EnterpriseCard className="p-6" gradient>
          <h3 className="text-lg font-semibold mb-6">Top Categories</h3>
          <div className="space-y-4">
            {[
              { name: "Technology", percentage: 85, color: "bg-blue-500" },
              { name: "Business", percentage: 72, color: "bg-green-500" },
              { name: "Politics", percentage: 68, color: "bg-purple-500" },
              { name: "Sports", percentage: 45, color: "bg-orange-500" }
            ].map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="flex items-center gap-4"
              >
                <span className="text-sm font-medium w-20">{category.name}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${category.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">{category.percentage}%</span>
              </motion.div>
            ))}
          </div>
        </EnterpriseCard>
      </motion.div>
    </div>
  )
}
