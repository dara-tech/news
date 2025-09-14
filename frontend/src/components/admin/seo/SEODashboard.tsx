'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  Search, 
  Target, 
  BarChart3, 
  Lightbulb, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Star,
  Zap
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface SEODashboardData {
  statistics: {
    totalArticles: number;
    featuredArticles: number;
    breakingArticles: number;
    recentArticles: number;
    averageScore: number;
  };
  gradeDistribution: {
    'A+': number;
    'A': number;
    'B+': number;
    'B': number;
    'C+': number;
    'C': number;
    'D': number;
    'F': number;
  };
  topRecommendations: Array<{
    priority: string;
    category: string;
    title: string;
    description: string;
    action: string;
  }>;
  recentAnalyses: Array<{
    article: {
      _id: string;
      title: { en: string; kh: string };
      slug: string;
      views: number;
      isFeatured: boolean;
      isBreaking: boolean;
    };
    seoAnalysis: {
      overallScore: number;
      seoGrade: string;
      factorScores: {
        contentQuality: number;
        technicalSEO: number;
        userEngagement: number;
        socialSignals: number;
        backlinks: number;
        freshness: number;
      };
    };
  }>;
}

const SEODashboard: React.FC = () => {
  const [data, setData] = useState<SEODashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSEODashboard();
  }, []);

  const fetchSEODashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/seo/dashboard');
      setData(response.data.data);
    } catch (error) {setError('Failed to load SEO dashboard data');
      toast.error('Failed to load SEO dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C+':
      case 'C':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'F':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error || 'Failed to load SEO dashboard'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and optimize your articles for better search engine rankings
          </p>
        </div>
        <Button onClick={fetchSEODashboard} variant="outline">
          <BarChart3 className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statistics.totalArticles}</div>
            <p className="text-xs text-muted-foreground">
              Published articles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average SEO Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statistics.averageScore}/100</div>
            <p className="text-xs text-muted-foreground">
              Overall performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Articles</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statistics.featuredArticles}</div>
            <p className="text-xs text-muted-foreground">
              High-priority content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Articles</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statistics.recentArticles}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="recent">Recent Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Grade Distribution</CardTitle>
                <CardDescription>
                  Distribution of articles by SEO performance grade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(data.gradeDistribution).map(([grade, count]) => (
                  <div key={grade} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={getGradeColor(grade)}>
                        {grade}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {count} articles
                      </span>
                    </div>
                    <div className="w-24">
                      <Progress 
                        value={(count / data.statistics.totalArticles) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Factors</CardTitle>
                <CardDescription>
                  Key factors affecting SEO performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.recentAnalyses.length > 0 && (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Content Quality</span>
                        <span className="text-sm font-medium">
                          {Math.round(data.recentAnalyses[0].seoAnalysis.factorScores.contentQuality)}%
                        </span>
                      </div>
                      <Progress value={data.recentAnalyses[0].seoAnalysis.factorScores.contentQuality} />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Technical SEO</span>
                        <span className="text-sm font-medium">
                          {Math.round(data.recentAnalyses[0].seoAnalysis.factorScores.technicalSEO)}%
                        </span>
                      </div>
                      <Progress value={data.recentAnalyses[0].seoAnalysis.factorScores.technicalSEO} />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">User Engagement</span>
                        <span className="text-sm font-medium">
                          {Math.round(data.recentAnalyses[0].seoAnalysis.factorScores.userEngagement)}%
                        </span>
                      </div>
                      <Progress value={data.recentAnalyses[0].seoAnalysis.factorScores.userEngagement} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top SEO Recommendations</CardTitle>
              <CardDescription>
                Priority actions to improve your SEO performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.topRecommendations.length > 0 ? (
                <div className="space-y-4">
                  {data.topRecommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {rec.priority === 'high' ? (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        ) : rec.priority === 'medium' ? (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-sm font-medium">{rec.title}</h4>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No urgent recommendations found!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent SEO Analysis</CardTitle>
              <CardDescription>
                Latest articles and their SEO performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentAnalyses.length > 0 ? (
                <div className="space-y-4">
                  {data.recentAnalyses.map((analysis) => (
                    <div key={analysis.article._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">
                          {analysis.article.title.en}
                        </h4>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {analysis.article.views} views
                            </span>
                          </div>
                          {analysis.article.isFeatured && (
                            <Badge variant="secondary" className="text-xs">
                              Featured
                            </Badge>
                          )}
                          {analysis.article.isBreaking && (
                            <Badge variant="destructive" className="text-xs">
                              Breaking
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {analysis.seoAnalysis.overallScore}/100
                          </div>
                          <Badge className={getGradeColor(analysis.seoAnalysis.seoGrade)}>
                            {analysis.seoAnalysis.seoGrade}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          <Zap className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent analysis available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEODashboard;

