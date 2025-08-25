'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Image, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Activity,
  Zap,
  BarChart3,
  Eye,
  RefreshCw
} from 'lucide-react';
import { ImageGenerationMetrics } from '@/lib/processingDashboardService';

interface ImageGenerationMetricsProps {
  metrics: ImageGenerationMetrics;
  onRefresh?: () => void;
}

export default function ImageGenerationMetricsCard({ metrics, onRefresh }: ImageGenerationMetricsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'idle': return 'Idle';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-400/30">
              <Image className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-foreground">Image Generation</CardTitle>
              <CardDescription>AI-powered image description generation</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 ${getStatusColor(metrics.serviceStatus)}/20`}
            >
              <div className={`w-2 h-2 rounded-full ${getStatusColor(metrics.serviceStatus)}`} />
              {getStatusText(metrics.serviceStatus)}
            </Badge>
            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.totalGenerated}</div>
            <div className="text-xs text-muted-foreground">Total Generated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.successRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.averageGenerationTime.toFixed(1)}s</div>
            <div className="text-xs text-muted-foreground">Avg Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{metrics.apiUsage.quotaRemaining}</div>
            <div className="text-xs text-muted-foreground">Quota Left</div>
          </div>
        </div>

        {/* API Usage Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">API Usage (This Month)</span>
            <span className="font-medium">{metrics.apiUsage.requestsThisMonth} / 1000</span>
          </div>
          <Progress 
            value={(metrics.apiUsage.requestsThisMonth / 1000) * 100} 
            className="h-2"
          />
        </div>

        {/* Quality Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <span>Relevance Score</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.qualityMetrics.relevanceScore}%
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-green-500" />
              <span>Professional Score</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {metrics.qualityMetrics.professionalScore}%
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-purple-500" />
              <span>Avg Description Length</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(metrics.qualityMetrics.averageDescriptionLength)} chars
            </div>
          </div>
        </div>

        {/* Recent Generations */}
        {metrics.recentGenerations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Activity className="h-4 w-4" />
              Recent Generations
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {metrics.recentGenerations.slice(0, 5).map((generation) => (
                <div key={generation.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <div className="flex-shrink-0">
                    {generation.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{generation.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {generation.description}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-xs text-muted-foreground">
                    {generation.generationTime}s
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Generated */}
        {metrics.lastGenerated && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last generated: {new Date(metrics.lastGenerated).toLocaleString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


