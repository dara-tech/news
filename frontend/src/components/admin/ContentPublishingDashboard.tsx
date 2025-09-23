"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, TrendingUp, Users, FileText, Target, CheckCircle, AlertCircle } from 'lucide-react'
import ContentManager from '@/lib/contentManager'
import SEOOptimizer from '@/lib/seoOptimizer'
import AnalyticsManager from '@/lib/analyticsManager'

interface ContentPlan {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  category: string;
  keywords: string[];
  estimatedReadingTime: number;
  assignedTo?: string;
  createdAt: string;
}

interface ContentMetrics {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  archivedArticles: number;
  averageReadingTime: number;
  totalWordCount: number;
  articlesThisWeek: number;
  articlesThisMonth: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  topTags: Array<{
    tag: string;
    count: number;
  }>;
}

export default function ContentPublishingDashboard() {
  const [contentPlan, setContentPlan] = useState<ContentPlan[]>([])
  const [metrics, setMetrics] = useState<ContentMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const contentManager = ContentManager.getInstance()
  const seoOptimizer = SEOOptimizer.getInstance()
  const analyticsManager = AnalyticsManager.getInstance()

  useEffect(() => {
    loadContentData()
  }, [])

  const loadContentData = async () => {
    try {
      setLoading(true)
      
      // Load content plan
      const plan = contentManager.getContentPlan()
      if (plan.length === 0) {
        const newPlan = contentManager.createContentPlan()
        setContentPlan(newPlan)
      } else {
        setContentPlan(plan)
      }

      // Load metrics
      const contentMetrics = await contentManager.getContentMetrics()
      setMetrics(contentMetrics)
    } catch (error) {
      console.error('Failed to load content data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTodaysContent = () => {
    return contentPlan.filter(item => 
      item.targetDate.startsWith(selectedDate) && item.status === 'planned'
    )
  }

  const getThisWeeksContent = () => {
    const today = new Date(selectedDate)
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6))
    
    return contentPlan.filter(item => {
      const itemDate = new Date(item.targetDate)
      return itemDate >= weekStart && itemDate <= weekEnd
    })
  }

  const updateContentStatus = (id: string, status: ContentPlan['status']) => {
    contentManager.updateContentPlan(id, { status })
    setContentPlan(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status } : item
      )
    )
  }

  const getPriorityColor = (priority: ContentPlan['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: ContentPlan['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'planned': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressPercentage = () => {
    if (!metrics) return 0
    const target = 50 // Target 50 articles
    return Math.min((metrics.publishedArticles / target) * 100, 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading content data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Publishing Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your content strategy and track progress towards AdSense requirements
          </p>
        </div>
        <Button onClick={loadContentData}>
          Refresh Data
        </Button>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalArticles}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.publishedArticles} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.articlesThisWeek}</div>
              <p className="text-xs text-muted-foreground">
                articles published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Reading Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageReadingTime}m</div>
              <p className="text-xs text-muted-foreground">
                per article
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress to Goal</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(getProgressPercentage())}%</div>
              <Progress value={getProgressPercentage()} className="mt-2" />
              <p className="text-xs text-muted-foreground">
                {metrics.publishedArticles}/50 articles
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Management Tabs */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today's Content</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Content Plan</CardTitle>
              <CardDescription>
                Content scheduled for {new Date(selectedDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTodaysContent().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No content planned for today</p>
                    <Button className="mt-4" onClick={() => {
                      const newPlan = contentManager.createContentPlan()
                      setContentPlan(newPlan)
                    }}>
                      Generate Content Plan
                    </Button>
                  </div>
                ) : (
                  getTodaysContent().map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.estimatedReadingTime} min read
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateContentStatus(item.id, 'in-progress')}
                        >
                          Start
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateContentStatus(item.id, 'completed')}
                        >
                          Complete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>This Week's Content</CardTitle>
              <CardDescription>
                Content planned for the current week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getThisWeeksContent().map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.targetDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateContentStatus(item.id, 'in-progress')}
                      >
                        Start
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Calendar</CardTitle>
              <CardDescription>
                Visual overview of your content schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Content calendar view coming soon</p>
                <p className="text-sm">This will show a monthly view of your content schedule</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Analytics</CardTitle>
              <CardDescription>
                Track your content performance and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Top Categories</h4>
                      <div className="space-y-2">
                        {metrics.topCategories.map((category, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{category.category}</span>
                            <span className="text-muted-foreground">{category.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Top Tags</h4>
                      <div className="space-y-2">
                        {metrics.topTags.map((tag, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{tag.tag}</span>
                            <span className="text-muted-foreground">{tag.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AdSense Requirements Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>AdSense Requirements Checklist</CardTitle>
          <CardDescription>
            Track your progress towards AdSense approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {metrics && metrics.publishedArticles >= 50 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <div className="flex-1">
                <p className="font-medium">50+ Quality Articles</p>
                <p className="text-sm text-muted-foreground">
                  {metrics ? `${metrics.publishedArticles}/50 articles` : 'Loading...'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div className="flex-1">
                <p className="font-medium">1000+ Monthly Visitors</p>
                <p className="text-sm text-muted-foreground">
                  Monitor your traffic growth
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium">Fast Loading Speed</p>
                <p className="text-sm text-muted-foreground">
                  Performance optimization implemented
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium">Mobile Responsive</p>
                <p className="text-sm text-muted-foreground">
                  Mobile optimization completed
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium">SEO Optimized</p>
                <p className="text-sm text-muted-foreground">
                  SEO tools and optimization implemented
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


