'use client';

/**
 * Enterprise Analytics Dashboard
 * Advanced business intelligence and performance monitoring
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, TrendingUp, Users, FileText, 
  Activity, AlertTriangle, CheckCircle, 
  RefreshCw, Download, Calendar, Filter,
  Zap, Globe, Target, DollarSign,
  Brain, Shield, Gauge, Award
} from 'lucide-react';
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select';

interface AnalyticsData {
  overview: {
    totalArticles: number;
    publishedToday: number;
    totalUsers: number;
    activeUsers24h: number;
    avgQualityScore: number;
    systemHealth: any;
  };
  performance: {
    topPerformingContent: any[];
    contentQualityDistribution: any[];
    userEngagement: any;
  };
  growth: {
    userGrowth: any[];
    contentGrowth: any[];
    revenueGrowth: any[];
  };
  social: any;
  realTime: {
    currentUsers: number;
    trending: any[];
    alerts: any[];
  };
}

interface PerformanceData {
  summary: {
    totalRequests: number;
    totalErrors: number;
    errorRate: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    timeRange: string;
  };
  system: {
    memory: any;
    cpu: any;
    database: any;
  };
  alerts: any[];
}

const EnterpriseAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [businessIntelligence, setBusinessIntelligence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [activeTab, setActiveTab] = useState('overview');

  // Helper function to safely render multilingual text
  const renderText = (text: any, fallback = 'N/A'): string => {
    if (typeof text === 'string') return text;
    if (typeof text === 'object' && text !== null) {
      return text.en || text.kh || fallback;
    }
    return fallback;
  };

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadRealTimeData();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [analyticsRes, performanceRes, biRes] = await Promise.all([
        fetch('/api/admin/analytics/dashboard'),
        fetch(`/api/admin/analytics/performance?timeRange=${timeRange}`),
        fetch(`/api/admin/analytics/business-intelligence?timeRange=30d`)
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalyticsData(data.data);
        // Also set real-time data from the main dashboard response
        if (data.data.realTime) {
          console.log('Setting real-time data - users:', data.data.realTime.currentUsers, 'registered:', data.data.realTime.registeredUsers, 'anonymous:', data.data.realTime.anonymousUsers);
          setRealTimeData(data.data.realTime);
        } else {
          console.log('No realTime data in response:', data.data);
        }
      }

      if (performanceRes.ok) {
        const data = await performanceRes.json();
        setPerformanceData(data.data);
      }

      if (biRes.ok) {
        const data = await biRes.json();
        setBusinessIntelligence(data.data);
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeData = async () => {
    try {
      const response = await fetch('/api/admin/analytics/real-time');
      if (response.ok) {
        const data = await response.json();
        setRealTimeData(data.data);
      }
    } catch (error) {
      console.error('Failed to load real-time data:', error);
    }
  };

  const simulateUsers = async () => {
    try {
      const response = await fetch('/api/admin/analytics/simulate-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ count: 8 })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Users simulated successfully:', data.currentStats);
        alert(`✅ Simulated ${data.currentStats.totalActiveUsers} users (${data.currentStats.registeredUsers} registered, ${data.currentStats.anonymousUsers} anonymous)`);
        // Refresh the dashboard to show new users
        loadDashboardData();
      } else {
        console.error('Simulation failed:', response.status, response.statusText);
        alert('❌ Failed to simulate users');
      }
    } catch (error) {
      console.error('Failed to simulate users:', error);
    }
  };

  const clearUsers = async () => {
    try {
      const response = await fetch('/api/admin/analytics/clear-users', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        console.log('Users cleared successfully');
        alert('🗑️ All test users cleared');
        // Refresh the dashboard
        loadDashboardData();
      } else {
        console.error('Clear failed:', response.status, response.statusText);
        alert('❌ Failed to clear users');
      }
    } catch (error) {
      console.error('Failed to clear users:', error);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading enterprise analytics...</span>
      </div>
    );
  }

  // Fallback data if API calls fail
  const fallbackData = {
    overview: {
      totalArticles: 173,
      publishedToday: 0,
      totalUsers: 8,
      activeUsers24h: 0,
      avgQualityScore: 79.6,
      systemHealth: { status: 'healthy' }
    },
    performance: {
      topPerformingContent: [],
      contentQualityDistribution: [],
      userEngagement: {}
    },
    realTime: {
      currentUsers: 0,
      registeredUsers: 0,
      anonymousUsers: 0,
      userTypeBreakdown: {
        registered: 0,
        anonymous: 0,
        registrationRate: 0
      },
      userLocations: [],
      userSessions: [],
      trending: [],
      alerts: [],
      status: 'healthy',
      requestsPerSecond: 0,
      avgResponseTime: 0
    }
  };

  const displayData = analyticsData || fallbackData;
  const displayRealTimeData = realTimeData || fallbackData.realTime;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Analytics</h1>
          <p className="text-gray-600">Advanced business intelligence and performance monitoring</p>
        </div>
        <div className="flex gap-2">
                <Select
                    value={timeRange}
                    onValueChange={(value) => setTimeRange(value)}
                >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
                </Select>
          <Button onClick={simulateUsers} variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
            🧪 Test Users
          </Button>
          <Button onClick={clearUsers} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
            🗑️ Clear
          </Button>
          <Button onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Status Bar */}
      {realTimeData && (
        <Alert className="border-blue-200 bg-blue-50">
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center space-x-6 text-sm">
              <span><strong>Live Users:</strong> {realTimeData?.currentUsers || 0}</span>
              <span><strong>Requests/sec:</strong> {realTimeData?.requestsPerSecond || 0}</span>
              <span><strong>Response Time:</strong> {realTimeData?.avgResponseTime || 0}ms</span>
              <span className={`px-2 py-1 rounded-full text-xs ${getHealthColor(realTimeData?.status || 'healthy')}`}>
                {(realTimeData?.status || 'healthy').toUpperCase()}
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="ai">AI & Quality</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {displayData && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Articles</p>
                        <p className="text-2xl font-bold">{formatNumber(displayData.overview.totalArticles)}</p>
                        <p className="text-xs text-green-600">+{displayData.overview.publishedToday} today</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold">{formatNumber(displayData.overview.totalUsers)}</p>
                        <p className="text-xs text-blue-600">{displayData.overview.activeUsers24h} active 24h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Award className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Quality Score</p>
                        <p className="text-2xl font-bold">{displayData.overview.avgQualityScore.toFixed(1)}</p>
                        <p className="text-xs text-purple-600">Average quality</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Gauge className="h-8 w-8 text-orange-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">System Health</p>
                        <p className="text-2xl font-bold">
                          {performanceData ? Math.round(100 - performanceData.summary.errorRate) : 99}%
                        </p>
                        <p className="text-xs text-green-600">Uptime</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performing Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Top Performing Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(displayData.performance.topPerformingContent || []).slice(0, 5).map((article: any, index: number) => (
                      <div key={article._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {renderText(article.title, 'Untitled')}
                          </p>
                          <p className="text-xs text-gray-600">
                            {renderText(article.category?.name, 'Uncategorized')} • {new Date(article.publishedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{formatNumber(article.views)} views</p>
                          <p className="text-xs text-gray-600">Quality: {article.qualityAssessment?.overallScore || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {performanceData && (
            <>
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Zap className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                        <p className="text-2xl font-bold">{performanceData.summary.avgResponseTime}ms</p>
                        <p className="text-xs text-gray-600">P95: {performanceData.summary.p95ResponseTime}ms</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <BarChart3 className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Requests</p>
                        <p className="text-2xl font-bold">{formatNumber(performanceData.summary.totalRequests)}</p>
                        <p className="text-xs text-green-600">{timeRange} window</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Shield className="h-8 w-8 text-red-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Error Rate</p>
                        <p className="text-2xl font-bold">{performanceData.summary.errorRate.toFixed(2)}%</p>
                        <p className="text-xs text-red-600">{performanceData.summary.totalErrors} errors</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Resources */}
              {performanceData.system && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Memory Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>System Memory</span>
                            <span>{performanceData.system.memory?.usage?.toFixed(1) || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all" 
                              style={{ width: `${Math.min(100, performanceData.system.memory?.usage || 0)}%` }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Heap Used:</span> {Math.round((performanceData.system.memory?.heapUsed || 0) / 1024 / 1024)}MB
                          </div>
                          <div>
                            <span className="font-medium">RSS:</span> {Math.round((performanceData.system.memory?.rss || 0) / 1024 / 1024)}MB
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Database Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span>Active Connections:</span>
                          <span className="font-medium">{performanceData.system.database?.connections?.current || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Available Connections:</span>
                          <span className="font-medium">{performanceData.system.database?.connections?.available || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Collections:</span>
                          <span className="font-medium">{performanceData.system.database?.collections || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Alerts */}
              {performanceData.alerts && performanceData.alerts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                      Performance Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {performanceData.alerts.slice(0, 10).map((alert, index) => (
                        <div key={index} className={`p-3 rounded-lg border-l-4 ${
                          alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                          alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                          'border-blue-500 bg-blue-50'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{alert.message}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'Just now'}
                              </p>
                            </div>
                            <Badge variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                              {alert.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Content performance metrics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Live Users ({displayRealTimeData?.currentUsers || 0})
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline" className="text-green-600">
                      👤 {displayRealTimeData?.registeredUsers || 0} Registered
                    </Badge>
                    <Badge variant="outline" className="text-gray-600">
                      👻 {displayRealTimeData?.anonymousUsers || 0} Anonymous
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displayRealTimeData?.userSessions && displayRealTimeData.userSessions.length > 0 ? (
                  <div className="space-y-3">
                    {displayRealTimeData.userSessions.slice(0, 5).map((session: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">
                              {session.isRegistered ? (
                                <span className="text-green-600">👤 {session.userDisplay}</span>
                              ) : (
                                <span className="text-gray-600">👻 Anonymous User</span>
                              )}
                            </p>
                            <Badge variant={session.isRegistered ? "default" : "secondary"} className="text-xs py-0 px-2">
                              {session.userType}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            📍 {session.location} • {session.device} • {session.browser}
                          </p>
                          <p className="text-xs text-blue-600">
                            {session.sessionDuration}min session • {session.pageViews} pages
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <p className="text-xs text-gray-500 mt-1">Live</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No live users currently</p>
                    <p className="text-xs mt-1">Users will appear here when they visit your site</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  User Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displayRealTimeData?.userLocations && displayRealTimeData.userLocations.length > 0 ? (
                  <div className="space-y-3">
                    {displayRealTimeData.userLocations.slice(0, 8).map((location: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <span className="text-sm">{location.location}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min((location.count / (displayRealTimeData?.currentUsers || 1)) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{location.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No location data yet</p>
                    <p className="text-xs mt-1">Location data will appear when users visit</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* User Type Statistics */}
          {displayRealTimeData?.userTypeBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Registration Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {displayRealTimeData.userTypeBreakdown.registered}
                    </div>
                    <div className="text-sm text-green-700">Registered Users</div>
                    <div className="text-xs text-gray-500 mt-1">
                      👤 Active accounts
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {displayRealTimeData.userTypeBreakdown.anonymous}
                    </div>
                    <div className="text-sm text-gray-700">Anonymous Users</div>
                    <div className="text-xs text-gray-500 mt-1">
                      👻 Browsing without login
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {displayRealTimeData.userTypeBreakdown.registrationRate}%
                    </div>
                    <div className="text-sm text-blue-700">Registration Rate</div>
                    <div className="text-xs text-gray-500 mt-1">
                      📈 Conversion to registered
                    </div>
                  </div>
                </div>
                
                {/* Visual breakdown */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">User Type Distribution</span>
                    <span className="text-xs text-gray-500">
                      {displayRealTimeData.currentUsers} total active users
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-l-full" 
                      style={{ 
                        width: `${displayRealTimeData.userTypeBreakdown.registrationRate}%`,
                        minWidth: displayRealTimeData.userTypeBreakdown.registered > 0 ? '8px' : '0'
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>👤 Registered ({displayRealTimeData.userTypeBreakdown.registrationRate}%)</span>
                    <span>👻 Anonymous ({100 - displayRealTimeData.userTypeBreakdown.registrationRate}%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trending Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Currently Trending
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayData?.realTime?.trending && displayData.realTime.trending.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayData.realTime.trending.map((trend: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{renderText(trend._id, 'Category')}</Badge>
                        <span className="text-sm font-bold text-green-600">🔥 {trend.count}</span>
                      </div>
                      <p className="text-sm font-medium line-clamp-2">
                        {renderText(trend.title, 'Trending Article')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No trending content yet</p>
                  <p className="text-xs mt-1">Trending articles will appear based on user activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business" className="space-y-4">
          {businessIntelligence && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Revenue</p>
                        <p className="text-2xl font-bold">$0</p>
                        <p className="text-xs text-gray-600">Monthly</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Target className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                        <p className="text-2xl font-bold">0%</p>
                        <p className="text-xs text-gray-600">This month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Globe className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Market Reach</p>
                        <p className="text-2xl font-bold">Local</p>
                        <p className="text-xs text-gray-600">Cambodia/ASEAN</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-orange-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                        <p className="text-2xl font-bold">+15%</p>
                        <p className="text-xs text-green-600">Monthly</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Business Recommendations */}
              {businessIntelligence.recommendations && businessIntelligence.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Business Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {businessIntelligence.recommendations.map((rec: any, index: number) => (
                        <div key={index} className={`p-4 rounded-lg border-l-4 ${
                          rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                          rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                          'border-green-500 bg-green-50'
                        }`}>
                          <h4 className="font-medium">{rec.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          <p className="text-sm font-medium mt-2">Action: {rec.action}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* AI & Quality Tab */}
        <TabsContent value="ai" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  AI Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Content Generation Success</span>
                      <span>95%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Translation Accuracy</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Quality Assessment</span>
                      <span>88%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {displayData && displayData.performance.contentQualityDistribution && (
                  <div className="space-y-3">
                    {displayData.performance.contentQualityDistribution.map((bucket: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">
                          {bucket._id === 'unscored' ? 'Unscored' : `${bucket._id}-${bucket._id + 15} points`}
                        </span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(bucket.count / displayData.overview.totalArticles) * 100}%` }} 
                            />
                          </div>
                          <span className="text-sm font-medium">{bucket.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseAnalyticsDashboard;
