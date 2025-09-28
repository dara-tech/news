'use client';

/**
 * Advanced Data Quality Dashboard
 * Comprehensive interface for monitoring and managing data quality
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import api from '@/lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  CheckCircle, XCircle, AlertTriangle, TrendingUp, 
  Target, Settings, RefreshCw, Eye, Filter
} from 'lucide-react';

interface QualityAssessment {
  overallScore: number;
  qualityGrade: string;
  factorScores: {
    contentAccuracy: { score: number; confidence: string };
    sourceReliability: { score: number; confidence: string };
    contentCompleteness: { score: number; missingElements: string[] };
    languageQuality: { score: number; issues: string[] };
    relevanceScore: { score: number; matchedCategories: any[] };
    uniquenessScore: { score: number; duplicateFactors: string[] };
  };
  recommendations: Array<{
    category: string;
    priority: string;
    suggestion: string;
    impact: string;
  }>;
  riskFactors: Array<{
    level: string;
    factor: string;
    description: string;
    mitigation: string;
  }>;
}

interface QualityStatistics {
  totalArticles: number;
  averageScore: number;
  qualityDistribution: {
    excellent: number;
    good: number;
    acceptable: number;
    poor: number;
    unacceptable: number;
  };
  trends: Array<{
    date: string;
    averageScore: number;
    articleCount: number;
  }>;
}

const DataQualityDashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<QualityStatistics | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [enhancedSentinelStatus, setEnhancedSentinelStatus] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [selectedTimeframe]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load quality statistics
      const statsResponse = await fetch(`/api/admin/data-quality/statistics?timeframe=${selectedTimeframe}`);
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStatistics(statsData.data);
      }

      // Load recommendations
      const recResponse = await fetch('/api/admin/data-quality/recommendations');
      const recData = await recResponse.json();
      if (recData.success) {
        setRecommendations(recData.data);
      }

      // Load enhanced Sentinel status
      const statusResponse = await fetch('/api/admin/data-quality/enhanced-sentinel/status');
      const statusData = await statusResponse.json();
      if (statusData.success) {
        setEnhancedSentinelStatus(statusData.data);
      }

      // Load articles by grade if specific grade selected
      if (selectedGrade !== 'all') {
        const articlesResponse = await fetch(`/api/admin/data-quality/articles/${selectedGrade}?limit=10`);
        const articlesData = await articlesResponse.json();
        if (articlesData.success) {
          setArticles(articlesData.data);
        }
      }

    } catch (error) {} finally {
      setLoading(false);
    }
  };

  const runEnhancedSentinel = async () => {
    try {
      setLoading(true);
      
      // Create a custom axios instance with longer timeout for sentinel operations
      const sentinelApi = api.create({
        timeout: 120000, // 2 minutes for sentinel operations
      });
      
      const { data } = await sentinelApi.post('/admin/data-quality/enhanced-sentinel/run');
      
      if (data.success) {
        toast.success('Enhanced Sentinel run completed successfully!');
        loadData(); // Refresh data
      } else {
        toast.error('Enhanced Sentinel run failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Enhanced Sentinel run error:', error);
      if (error.code === 'ECONNABORTED') {
        toast.error('Enhanced Sentinel operation timed out. It may still be running in the background.');
      } else {
        toast.error('Enhanced Sentinel run failed: ' + (error.message || 'Network error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQualityThreshold = async (threshold: number) => {
    try {
      const response = await fetch('/api/admin/data-quality/enhanced-sentinel/threshold', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold })
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Quality threshold updated successfully!');
        loadData(); // Refresh data
      } else {
        alert('Failed to update quality threshold: ' + data.message);
      }
    } catch (error) {alert('Failed to update quality threshold');
    }
  };

  const toggleAutoPublish = async (enabled: boolean) => {
    try {
      const response = await fetch('/api/admin/data-quality/enhanced-sentinel/auto-publish', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`Auto-publish ${enabled ? 'enabled' : 'disabled'} successfully!`);
        loadData(); // Refresh data
      } else {
        alert('Failed to toggle auto-publish: ' + data.message);
      }
    } catch (error) {alert('Failed to toggle auto-publish');
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'acceptable': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
      case 'unacceptable': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'acceptable': return <AlertTriangle className="h-4 w-4" />;
      case 'poor': return <XCircle className="h-4 w-4" />;
      case 'unacceptable': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading data quality dashboard...</span>
      </div>
    );
  }

  const qualityDistributionData = statistics ? [
    { name: 'Excellent', value: statistics.qualityDistribution.excellent, color: '#10b981' },
    { name: 'Good', value: statistics.qualityDistribution.good, color: '#3b82f6' },
    { name: 'Acceptable', value: statistics.qualityDistribution.acceptable, color: '#f59e0b' },
    { name: 'Poor', value: statistics.qualityDistribution.poor, color: '#f97316' },
    { name: 'Unacceptable', value: statistics.qualityDistribution.unacceptable, color: '#ef4444' }
  ] : [];

  const trendsData = statistics?.trends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString(),
    score: trend.averageScore,
    count: trend.articleCount
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Data Quality Dashboard</h1>
          <p className="text-muted-foreground">
            Advanced data quality monitoring and management for Sentinel AI
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={runEnhancedSentinel} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Run Enhanced Sentinel
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Enhanced Sentinel Status */}
      {enhancedSentinelStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Enhanced Sentinel Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <span>Quality Threshold:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{enhancedSentinelStatus.qualityThreshold}/100</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newThreshold = prompt('Enter new quality threshold (0-100):', enhancedSentinelStatus.qualityThreshold.toString());
                      if (newThreshold && !isNaN(Number(newThreshold))) {
                        updateQualityThreshold(Number(newThreshold));
                      }
                    }}
                  >
                    Update
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Auto-Publish:</span>
                <Button
                  size="sm"
                  variant={enhancedSentinelStatus.autoPublishEnabled ? "default" : "outline"}
                  onClick={() => toggleAutoPublish(!enhancedSentinelStatus.autoPublishEnabled)}
                >
                  {enhancedSentinelStatus.autoPublishEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span>Enhancement:</span>
                <Badge variant={enhancedSentinelStatus.enhancementEnabled ? "default" : "secondary"}>
                  {enhancedSentinelStatus.enhancementEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quality Overview */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Quality</p>
                  <p className="text-2xl font-bold">{statistics.averageScore}/100</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <Progress value={statistics.averageScore} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
                  <p className="text-2xl font-bold">{statistics.totalArticles}</p>
                </div>
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Quality</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statistics.qualityDistribution.excellent + statistics.qualityDistribution.good}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Needs Review</p>
                  <p className="text-2xl font-bold text-red-600">
                    {statistics.qualityDistribution.poor + statistics.qualityDistribution.unacceptable}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distribution">Quality Distribution</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quality Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={qualityDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${(Number(value) || 0).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {qualityDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quality Trends Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Distribution Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityDistributionData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {item.value} articles
                      </span>
                      <Badge variant="outline">
                        {statistics ? Math.round((item.value / statistics.totalArticles) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Improvement Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{rec.suggestion}</p>
                          <p className="text-sm text-muted-foreground">{rec.impact}</p>
                        </div>
                        <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                          {rec.priority} priority
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Articles by Quality
                <div className="flex gap-2">
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Grades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="acceptable">Acceptable</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                        <SelectItem value="unacceptable">Unacceptable</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {articles.map((article) => (
                  <div key={article._id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex-1">
                      <h3 className="font-medium">{article.title?.en || article.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {article.description?.en || article.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getGradeColor(article.qualityAssessment?.qualityGrade)}>
                        {getGradeIcon(article.qualityAssessment?.qualityGrade)}
                        <span className="ml-1">{article.qualityAssessment?.qualityGrade}</span>
                      </Badge>
                      <span className="text-sm font-medium">
                        {article.qualityAssessment?.overallScore}/100
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataQualityDashboard;
