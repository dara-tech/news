"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Target, 
  BarChart3,
  Globe,
  Smartphone,
  Zap,
  Link,
  Image,
  FileText,
  Settings
} from 'lucide-react'
import AdvancedSEO from '@/lib/advancedSEO'

interface SEOAuditResult {
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    category: string;
    message: string;
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    action: string;
  }>;
  metrics: {
    titleLength: number;
    descriptionLength: number;
    keywordDensity: number;
    headingStructure: number;
    imageOptimization: number;
    internalLinks: number;
    externalLinks: number;
    pageSpeed: number;
    mobileFriendly: boolean;
  };
}

interface KeywordAnalysis {
  primary: string;
  secondary: string[];
  longTail: string[];
  density: number;
  distribution: { [keyword: string]: number };
  suggestions: string[];
}

export default function SEODashboard() {
  const [auditResult, setAuditResult] = useState<SEOAuditResult | null>(null)
  const [keywordAnalysis, setKeywordAnalysis] = useState<KeywordAnalysis | null>(null)
  const [url, setUrl] = useState('')
  const [content, setContent] = useState('')
  const [keywords, setKeywords] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('audit')

  const advancedSEO = AdvancedSEO.getInstance()

  const runSEOAudit = async () => {
    if (!url) return

    setLoading(true)
    try {
      const result = await advancedSEO.auditPage(url, content || undefined)
      setAuditResult(result)
    } catch (error) {
      console.error('SEO audit failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeKeywords = () => {
    if (!content || !keywords) return

    const keywordList = keywords.split(',').map(k => k.trim())
    const analysis = advancedSEO.analyzeKeywords(content, keywordList)
    setKeywordAnalysis(analysis)
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800'
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-800'
      case 'C+':
      case 'C':
        return 'bg-yellow-100 text-yellow-800'
      case 'D':
        return 'bg-orange-100 text-orange-800'
      case 'F':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SEO Dashboard</h1>
          <p className="text-muted-foreground">
            Analyze and optimize your website's search engine performance
          </p>
        </div>
        <Button onClick={runSEOAudit} disabled={!url || loading}>
          {loading ? 'Analyzing...' : 'Run SEO Audit'}
        </Button>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Analysis Input</CardTitle>
          <CardDescription>
            Enter a URL or paste content to analyze SEO performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">URL to Analyze</label>
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Content (Optional)</label>
            <Textarea
              placeholder="Paste your content here for analysis..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Target Keywords (comma-separated)</label>
            <Input
              placeholder="keyword1, keyword2, keyword3"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={runSEOAudit} disabled={!url || loading}>
              <Search className="h-4 w-4 mr-2" />
              Run SEO Audit
            </Button>
            <Button onClick={analyzeKeywords} disabled={!content || !keywords} variant="outline">
              <Target className="h-4 w-4 mr-2" />
              Analyze Keywords
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit">SEO Audit</TabsTrigger>
          <TabsTrigger value="keywords">Keyword Analysis</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* SEO Audit Results */}
        <TabsContent value="audit" className="space-y-4">
          {auditResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{auditResult.score}</div>
                  <Badge className={getGradeColor(auditResult.grade)}>
                    {auditResult.grade}
                  </Badge>
                  <Progress value={auditResult.score} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{auditResult.issues.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {auditResult.issues.filter(i => i.type === 'error').length} errors, {' '}
                    {auditResult.issues.filter(i => i.type === 'warning').length} warnings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{auditResult.recommendations.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {auditResult.recommendations.filter(r => r.priority === 'high').length} high priority
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mobile Friendly</CardTitle>
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {auditResult.metrics.mobileFriendly ? 'Yes' : 'No'}
                  </div>
                  <Badge className={auditResult.metrics.mobileFriendly ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {auditResult.metrics.mobileFriendly ? 'Optimized' : 'Needs Work'}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Issues List */}
          {auditResult && auditResult.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Issues Found</CardTitle>
                <CardDescription>
                  Issues that need attention to improve SEO
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditResult.issues.map((issue, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {issue.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                        {issue.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                        {issue.type === 'info' && <Eye className="h-5 w-5 text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium">{issue.message}</h4>
                          <Badge className={getImpactColor(issue.impact)}>
                            {issue.impact}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {issue.suggestion}
                        </p>
                        <Badge variant="outline">{issue.category}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Keyword Analysis */}
        <TabsContent value="keywords" className="space-y-4">
          {keywordAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Keyword Analysis</CardTitle>
                  <CardDescription>
                    Analysis of keyword usage and density
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">Primary Keyword</h4>
                    <p className="text-sm text-muted-foreground">{keywordAnalysis.primary}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Keyword Density</h4>
                    <div className="flex items-center space-x-2">
                      <Progress value={keywordAnalysis.density} className="flex-1" />
                      <span className="text-sm font-medium">{keywordAnalysis.density.toFixed(2)}%</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Secondary Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {keywordAnalysis.secondary.map((keyword, index) => (
                        <Badge key={index} variant="outline">{keyword}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Keyword Distribution</CardTitle>
                  <CardDescription>
                    How often each keyword appears in the content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(keywordAnalysis.distribution).map(([keyword, count]) => (
                      <div key={keyword} className="flex justify-between items-center">
                        <span className="text-sm">{keyword}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Keyword Suggestions</CardTitle>
                  <CardDescription>
                    Additional keywords that might be relevant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {keywordAnalysis.suggestions.map((suggestion, index) => (
                      <Badge key={index} variant="secondary">{suggestion}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Performance Metrics */}
        <TabsContent value="metrics" className="space-y-4">
          {auditResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Title Length</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{auditResult.metrics.titleLength}</div>
                  <p className="text-xs text-muted-foreground">
                    {auditResult.metrics.titleLength < 30 ? 'Too short' : 
                     auditResult.metrics.titleLength > 60 ? 'Too long' : 'Optimal'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Description Length</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{auditResult.metrics.descriptionLength}</div>
                  <p className="text-xs text-muted-foreground">
                    {auditResult.metrics.descriptionLength < 120 ? 'Too short' : 
                     auditResult.metrics.descriptionLength > 160 ? 'Too long' : 'Optimal'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Heading Structure</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{auditResult.metrics.headingStructure}%</div>
                  <Progress value={auditResult.metrics.headingStructure} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Image Optimization</CardTitle>
                  <Image className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{auditResult.metrics.imageOptimization}%</div>
                  <Progress value={auditResult.metrics.imageOptimization} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Internal Links</CardTitle>
                  <Link className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{auditResult.metrics.internalLinks}</div>
                  <p className="text-xs text-muted-foreground">
                    {auditResult.metrics.internalLinks < 3 ? 'Add more links' : 'Good'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Page Speed</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{auditResult.metrics.pageSpeed}%</div>
                  <Progress value={auditResult.metrics.pageSpeed} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations" className="space-y-4">
          {auditResult && auditResult.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>SEO Recommendations</CardTitle>
                <CardDescription>
                  Actionable recommendations to improve your SEO
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditResult.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <Settings className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium">{rec.title}</h4>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {rec.description}
                        </p>
                        <p className="text-sm font-medium text-blue-600">
                          Action: {rec.action}
                        </p>
                        <Badge variant="outline" className="mt-2">{rec.category}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}


