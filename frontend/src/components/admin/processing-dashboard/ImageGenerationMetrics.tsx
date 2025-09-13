'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Image, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Zap,
  Activity
} from 'lucide-react';
import { ImageGenerationMetrics } from '@/lib/processingDashboardService';

interface ImageGenerationMetricsCardProps {
  metrics: ImageGenerationMetrics;
}

export default function ImageGenerationMetricsCard({ metrics }: ImageGenerationMetricsCardProps) {
  const formatNumber = (num: number | undefined) => {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (ms: number | undefined) => {
    if (!ms || isNaN(ms)) return '0ms';
    if (ms >= 1000) return (ms / 1000).toFixed(1) + 's';
    return ms.toFixed(0) + 'ms';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-100';
    if (rate >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Image className="h-5 w-5" />
          <span>Image Generation Metrics</span>
        </CardTitle>
        <CardDescription>
          AI-powered image generation performance and statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(metrics.totalGenerated)}
            </div>
            <div className="text-sm text-gray-500">Total Generated</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {(metrics.successRate || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Success Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatDuration(metrics.averageGenerationTime)}
            </div>
            <div className="text-sm text-gray-500">Avg Generation Time</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatNumber(metrics.totalRequests)}
            </div>
            <div className="text-sm text-gray-500">Total Requests</div>
          </div>
        </div>

        {/* Success Rate Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Success Rate</span>
          <Badge className={getSuccessRateColor(metrics.successRate || 0)}>
            {(metrics.successRate || 0).toFixed(1)}%
          </Badge>
          </div>
          <Progress value={metrics.successRate || 0} className="h-2" />
        </div>

        {/* Last Generation Info */}
        {metrics.lastGenerated && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Last Generated</span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(metrics.lastGenerated).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Recent Generations */}
        {metrics.recentGenerations && metrics.recentGenerations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Recent Generations</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {metrics.recentGenerations.map((generation, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      generation.status === 'success' ? 'bg-green-500' :
                      generation.status === 'failed' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`} />
                    <span className="text-sm text-gray-700">
                      {generation.title?.substring(0, 50)}...
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {formatDuration(generation.generationTime)}
                    </span>
                    {generation.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : generation.status === 'failed' ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Activity className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Performance</span>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {metrics.averageGenerationTime < 5000 ? 'Excellent' :
               metrics.averageGenerationTime < 10000 ? 'Good' :
               metrics.averageGenerationTime < 20000 ? 'Fair' : 'Needs Improvement'}
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Reliability</span>
            </div>
            <div className="text-xs text-green-600 mt-1">
              {metrics.successRate >= 95 ? 'Excellent' :
               metrics.successRate >= 85 ? 'Good' :
               metrics.successRate >= 70 ? 'Fair' : 'Needs Improvement'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}