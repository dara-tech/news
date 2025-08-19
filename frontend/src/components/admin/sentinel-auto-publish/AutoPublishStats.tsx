'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Activity
} from 'lucide-react';

interface AutoPublishStatsProps {
  stats: {
    totalDrafts: number;
    totalPublished: number;
    todayPublished: number;
    telegramEnabled: boolean;
    lastRunAt?: string;
    isRunning: boolean;
  };
}

export default function AutoPublishStats({ stats }: AutoPublishStatsProps) {
  const publishRate = stats.totalDrafts > 0 ? (stats.totalPublished / (stats.totalDrafts + stats.totalPublished)) * 100 : 0;
  const todayRate = stats.totalPublished > 0 ? (stats.todayPublished / stats.totalPublished) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Publishing Performance
            </CardTitle>
            <CardDescription>
              Overall auto-publish success rate and efficiency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Publish Success Rate</span>
                <span className="text-sm text-muted-foreground">{publishRate.toFixed(1)}%</span>
              </div>
              <Progress value={publishRate} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Today's Activity</span>
                <span className="text-sm text-muted-foreground">{todayRate.toFixed(1)}%</span>
              </div>
              <Progress value={todayRate} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalPublished}</div>
                <div className="text-xs text-muted-foreground">Published</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.totalDrafts}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Current system status and last activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Auto-Publish Status</span>
                <Badge className={stats.isRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {stats.isRunning ? 'Running' : 'Idle'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Telegram Notifications</span>
                <Badge className={stats.telegramEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {stats.telegramEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>

            {stats.lastRunAt && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Last Run: {new Date(stats.lastRunAt).toLocaleString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest auto-publish activities and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.todayPublished}</div>
                <div className="text-sm text-green-700">Published Today</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalDrafts}</div>
                <div className="text-sm text-blue-700">Pending Drafts</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.totalPublished}</div>
                <div className="text-sm text-purple-700">Total Published</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recommendations
          </CardTitle>
          <CardDescription>
            Suggestions to improve auto-publish performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.totalDrafts > 5 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-800">High Draft Count</div>
                  <div className="text-sm text-yellow-700">
                    You have {stats.totalDrafts} pending drafts. Consider running auto-publish to clear the queue.
                  </div>
                </div>
              </div>
            )}
            
            {!stats.telegramEnabled && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-800">Enable Telegram Notifications</div>
                  <div className="text-sm text-blue-700">
                    Configure Telegram notifications to get alerts when articles are auto-published.
                  </div>
                </div>
              </div>
            )}
            
            {stats.totalPublished === 0 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-800">Ready to Start</div>
                  <div className="text-sm text-green-700">
                    Your auto-publish system is ready. Click "Run Auto-Publish" to start processing drafts.
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
