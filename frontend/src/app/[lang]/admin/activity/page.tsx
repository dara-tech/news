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
  Trash2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ActivityLog {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
    profileImage?: string;
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

interface ActivityStats {
  totalActivities: number;
  actionStats: Array<{ _id: string; count: number }>;
  entityStats: Array<{ _id: string; count: number }>;
  dailyStats: Array<{ _id: Record<string, unknown>; count: number }>;
  activeUsers: Array<{ username: string; email: string; count: number }>;
  severityStats: Array<{ _id: string; count: number }>;
  period: string;
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [securityEvents, setSecurityEvents] = useState<ActivityLog[]>([]);
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

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        ...Object.fromEntries(Object.entries(filters || {}).filter(([, value]) => value && value !== 'all'))
      });
      
      const { data } = await api.get(`/admin/activity?${params}`);
      if (data.success) {
        setLogs(data.logs);
        setTotalPages(data.pagination.totalPages);
      }
    } catch {
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const { data } = await api.get('/admin/activity/stats?days=7');
      if (data.success) {
        setStats(data.stats);
      }
    } catch {
      toast.error('Failed to fetch activity statistics');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchSecurityEvents = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/activity/security?limit=20');
      if (data.success) {
        setSecurityEvents(data.events);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchStats();
    fetchSecurityEvents();
  }, [currentPage, filters, fetchLogs, fetchStats, fetchSecurityEvents]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        format: 'csv',
        ...Object.fromEntries(Object.entries(filters || {}).filter(([, value]) => value && value !== 'all'))
      });
      
      const response = await api.get(`/admin/activity/export?${params}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Activity logs exported successfully');
    } catch {
      toast.error('Failed to export activity logs');
    }
  };

  const handleCleanup = async () => {
    if (!confirm('This will permanently delete activity logs older than 90 days. Continue?')) {
      return;
    }

    try {
      const { data } = await api.delete('/admin/activity/cleanup', {
        data: { days: 90 }
      });
      
      if (data.success) {
        toast.success(data.message);
        fetchLogs();
        fetchStats();
      }
    } catch {
      toast.error('Failed to cleanup activity logs');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600">Monitor and audit all system activities</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchLogs}
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
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleCleanup}
            className="flex items-center gap-2 text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Cleanup Old Logs
          </Button>
        </div>
      </div>

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
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
                      placeholder="Search descriptions..."
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
                      <SelectItem value="user.login">User Login</SelectItem>
                      <SelectItem value="user.create">User Create</SelectItem>
                      <SelectItem value="news.create">News Create</SelectItem>
                      <SelectItem value="news.update">News Update</SelectItem>
                      <SelectItem value="news.delete">News Delete</SelectItem>
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
                      <SelectItem value="user">Users</SelectItem>
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="category">Categories</SelectItem>
                      <SelectItem value="comment">Comments</SelectItem>
                      <SelectItem value="role">Roles</SelectItem>
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
                Activity Logs
              </CardTitle>
              <CardDescription>
                System-wide activity monitoring and audit trail
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-gray-500">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading activity logs...
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell className="text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage 
                                src={log.userId?.profileImage} 
                                alt={log.userId?.username || 'System'}
                              />
                              <AvatarFallback>
                                {log.userId?.username ? log.userId.username.charAt(0).toUpperCase() : 'S'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{log.userId?.username || 'System'}</div>
                              <div className="text-xs text-gray-500">{log.userId?.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {formatAction(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{log.entity}</TableCell>
                        <TableCell className="max-w-md truncate">{log.description}</TableCell>
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
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeUsers.length}</div>
                    <p className="text-xs text-muted-foreground">Users with activity</p>
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
                      {stats.actionStats[0]?.count || 0} occurrences
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Security Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{securityEvents.length}</div>
                    <p className="text-xs text-muted-foreground">Requiring attention</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Most Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.activeUsers.slice(0, 5).map((user, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                          <Badge variant="outline">{user.count} activities</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Activity by Entity</CardTitle>
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

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Events
              </CardTitle>
              <CardDescription>
                High-priority security-related activities and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.map((event) => (
                    <TableRow key={event._id}>
                      <TableCell className="text-sm">
                        {new Date(event.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={event.userId?.profileImage} 
                              alt={event.userId?.username || 'System'}
                            />
                            <AvatarFallback>
                              {event.userId?.username ? event.userId.username.charAt(0).toUpperCase() : 'S'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{event.userId?.username || 'System'}</div>
                            <div className="text-xs text-gray-500">{event.userId?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {formatAction(event.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">{event.description}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(event.severity)} className="flex items-center gap-1 w-fit">
                          {getSeverityIcon(event.severity)}
                          <span className="capitalize">{event.severity}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {event.ipAddress || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}