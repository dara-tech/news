'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Download, 
  Eye, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  Activity,
  Target,
  Gauge
} from 'lucide-react';

interface LogoAnalytics {
  totalViews: number;
  loadTime: number;
  fileSize: number;
  optimizationScore: number;
  lastUpdated: string;
  format: string;
  dimensions: {
    width: number;
    height: number;
  };
  recommendations: string[];
  performance: {
    score: number;
    issues: string[];
  };
}

interface LogoAnalyticsProps {
  logoUrl?: string;
  logoData?: any;
}

export default function LogoAnalytics({ logoUrl, logoData }: LogoAnalyticsProps) {
  const [analytics, setAnalytics] = useState<LogoAnalytics>({
    totalViews: 0,
    loadTime: 0,
    fileSize: 0,
    optimizationScore: 0,
    lastUpdated: '',
    format: '',
    dimensions: { width: 0, height: 0 },
    recommendations: [],
    performance: { score: 0, issues: [] }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (logoUrl && logoData) {
      calculateAnalytics();
    }
  }, [logoUrl, logoData]);

  const calculateAnalytics = () => {
    // Simulate analytics calculation
    const mockAnalytics: LogoAnalytics = {
      totalViews: Math.floor(Math.random() * 10000) + 1000,
      loadTime: Math.random() * 200 + 50,
      fileSize: logoData?.size || 0,
      optimizationScore: Math.floor(Math.random() * 40) + 60,
      lastUpdated: logoData?.lastUpdated || new Date().toISOString(),
      format: logoData?.format || 'PNG',
      dimensions: {
        width: logoData?.width || 0,
        height: logoData?.height || 0
      },
      recommendations: generateRecommendations(logoData),
      performance: calculatePerformance(logoData)
    };

    setAnalytics(mockAnalytics);
    setLoading(false);
  };

  const generateRecommendations = (data: any): string[] => {
    const recommendations = [];
    
    if (data?.size > 100 * 1024) { // > 100KB
      recommendations.push('Consider compressing the logo to reduce file size');
    }
    
    if (data?.width > 300 || data?.height > 100) {
      recommendations.push('Logo dimensions could be optimized for better performance');
    }
    
    if (data?.format === 'PNG' && data?.size > 50 * 1024) {
      recommendations.push('Consider converting to WebP for better compression');
    }
    
    if (!recommendations.length) {
      recommendations.push('Logo is well optimized');
    }
    
    return recommendations;
  };

  const calculatePerformance = (data: any) => {
    let score = 100;
    const issues = [];
    
    if (data?.size > 100 * 1024) {
      score -= 20;
      issues.push('Large file size');
    }
    
    if (data?.width > 300 || data?.height > 100) {
      score -= 15;
      issues.push('Large dimensions');
    }
    
    if (data?.format === 'GIF') {
      score -= 10;
      issues.push('GIF format not optimal for logos');
    }
    
    return { score: Math.max(0, score), issues };
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Logo Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Logo Analytics
          </CardTitle>
          <CardDescription>
            Performance metrics and optimization insights for your logo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Performance Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Performance Score</span>
              {getPerformanceBadge(analytics.performance.score)}
            </div>
            <Progress value={analytics.performance.score} className="h-2" />
            <p className={`text-sm ${getPerformanceColor(analytics.performance.score)}`}>
              {analytics.performance.score}/100
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Views</span>
              </div>
              <p className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Load Time</span>
              </div>
              <p className="text-2xl font-bold">{analytics.loadTime.toFixed(0)}ms</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">File Size</span>
              </div>
              <p className="text-2xl font-bold">
                {(analytics.fileSize / 1024).toFixed(1)}KB
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Dimensions</span>
              </div>
              <p className="text-2xl font-bold">
                {analytics.dimensions.width}×{analytics.dimensions.height}
              </p>
            </div>
          </div>

          {/* Performance Issues */}
          {analytics.performance.issues.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Performance Issues</span>
              </div>
              <div className="space-y-1">
                {analytics.performance.issues.map((issue, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1 h-1 bg-yellow-600 rounded-full"></div>
                    {issue}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Recommendations</span>
            </div>
            <div className="space-y-1">
              {analytics.recommendations.map((rec, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                  {rec}
                </div>
              ))}
            </div>
          </div>

          {/* Technical Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Format</span>
              <p className="text-sm font-medium">{analytics.format}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Last Updated</span>
              <p className="text-sm font-medium">
                {new Date(analytics.lastUpdated).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Optimization Score</span>
              <p className="text-sm font-medium">{analytics.optimizationScore}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Usage Trends
          </CardTitle>
          <CardDescription>
            Logo usage patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Weekly Views</span>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+12%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Load Performance</span>
              <div className="flex items-center gap-1 text-green-600">
                <Zap className="h-4 w-4" />
                <span className="text-sm">-8%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">File Size</span>
              <div className="flex items-center gap-1 text-yellow-600">
                <Gauge className="h-4 w-4" />
                <span className="text-sm">No change</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 