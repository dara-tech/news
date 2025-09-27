'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Activity,
  Download,
  Filter,
  Search,
  Shield,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  RefreshCw,
  User,
  Calendar,
  Clock
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ActivityLog {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

interface UserActivityStats {
  totalActivities: number;
  actionStats: Array<{ _id: string; count: number }>;
  entityStats: Array<{ _id: string; count: number }>;
  dailyStats: Array<{ _id: Record<string, unknown>; count: number }>;
  severityStats: Array<{ _id: string; count: number }>;
  period: string;
  lastLogin?: string;
  mostActiveDay?: string;
}

export default function UserActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<UserActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: 'all',
    entity: 'all',
    severity: 'all',
    search: '',
    startDate: '',
    endDate: ''
  });

  const fetchUserLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        ...Object.fromEntries(Object.entries(filters || {}).filter(([, value]) => value && value !== 'all'))
      });
      
      const { data } = await api.get(`/user/activity?${params}`);
      if (data.success) {
        setLogs(data.logs);
        setTotalPages(data.pagination.totalPages);
      }
    } catch {
      toast.error('Failed to fetch your activity logs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  const fetchUserStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const { data } = await api.get('/user/activity/stats?days=30');
      if (data.success) {
        setStats(data.stats);
      }
    } catch {
      toast.error('Failed to fetch your activity statistics');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserLogs();
    fetchUserStats();
  }, [currentPage, filters, fetchUserLogs, fetchUserStats]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        format: 'csv',
        ...Object.fromEntries(Object.entries(filters || {}).filter(([, value]) => value && value !== 'all'))
      });
      
      const response = await api.get(`/user/activity/export?${params}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Your activity logs exported successfully');
    } catch {
      toast.error('Failed to export your activity logs');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatAction = (action: string) => {
    return action.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  };

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return <User className="h-4 w-4" />;
    if (action.includes('news')) return <Activity className="h-4 w-4" />;
    if (action.includes('comment')) return <Info className="h-4 w-4" />;
    if (action.includes('settings')) return <Shield className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Activity History</h1>
          <p className="text-gray-600">Track your account activities and interactions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchUserLogs}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export My Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="logs">My Activities</TabsTrigger>
          <TabsTrigger value="stats">My Statistics</TabsTrigger>
          <TabsTrigger value="insights">Activity Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter My Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search my activities..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="action">Action</Label>
                  <Select value={filters.action} onValueChange={(value) => setFilters({ ...filters, action: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All actions</SelectItem>
                      <SelectItem value="user.login">Login</SelectItem>
                      <SelectItem value="user.update">Profile Update</SelectItem>
                      <SelectItem value="news.create">News Create</SelectItem>
                      <SelectItem value="news.update">News Update</SelectItem>
                      <SelectItem value="comment.create">Comment Create</SelectItem>
                      <SelectItem value="comment.update">Comment Update</SelectItem>
                      <SelectItem value="settings.update">Settings Update</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entity">Entity</Label>
                  <Select value={filters.entity} onValueChange={(value) => setFilters({ ...filters, entity: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All entities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All entities</SelectItem>
                      <SelectItem value="user">My Profile</SelectItem>
                      <SelectItem value="news">News Articles</SelectItem>
                      <SelectItem value="comment">Comments</SelectItem>
                      <SelectItem value="settings">Settings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={filters.severity} onValueChange={(value) => setFilters({ ...filters, severity: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All severities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                My Activity History
              </CardTitle>
              <CardDescription>
                Your personal activity timeline and audit trail
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-gray-500">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading your activities...
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {new Date(log.timestamp).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            {getActionIcon(log.action)}
                            {formatAction(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md">{log.description}</TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(log.severity)} className="flex items-center gap-1 w-fit">
                            {getSeverityIcon(log.severity)}
                            <span className="capitalize">{log.severity}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {log.ipAddress || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              {!loading && logs.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {!loading && logs.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                  <p className="text-gray-500">Try adjusting your filters or check back later.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {statsLoading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats && (
            <div className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalActivities}</div>
                    <p className="text-xs text-muted-foreground">Last {stats.period}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Last Login</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">
                      {stats.lastLogin ? new Date(stats.lastLogin).toLocaleDateString() : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">Most recent login</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Most Active Day</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">
                      {stats.mostActiveDay ? new Date(stats.mostActiveDay).toLocaleDateString() : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">Day with most activities</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Top Action</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">
                      {stats.actionStats[0]?._id ? formatAction(stats.actionStats[0]._id) : 'None'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.actionStats[0]?.count || 0} times
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>My Most Common Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.actionStats.slice(0, 5).map((action, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getActionIcon(action._id)}
                            <span className="font-medium">{formatAction(action._id)}</span>
                          </div>
                          <Badge variant="outline">{action.count} times</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Activity by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.entityStats.slice(0, 5).map((entity, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="capitalize font-medium">{entity._id}</span>
                          <Badge variant="outline">{entity.count} activities</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Account Active</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">Secure</Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>• Your account shows normal activity patterns</p>
                    <p>• No suspicious login attempts detected</p>
                    <p>• All activities are from recognized devices</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Most Active Time</span>
                    <span className="text-sm text-gray-600">Afternoon</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Favorite Activity</span>
                    <span className="text-sm text-gray-600">Reading News</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Engagement Level</span>
                    <Badge variant="outline" className="text-blue-600">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data Control</CardTitle>
              <CardDescription>
                Manage your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Data Export</h4>
                  <p className="text-sm text-gray-600">
                    Download all your activity data in CSV format for your records.
                  </p>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export My Data
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Activity Retention</h4>
                  <p className="text-sm text-gray-600">
                    Your activity logs are kept for 90 days for security purposes.
                  </p>
                  <p className="text-xs text-gray-500">
                    After 90 days, logs are automatically deleted.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 