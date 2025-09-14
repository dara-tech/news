'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '@/lib/api';
import StatCard from '@/components/admin/StatCard';
import NewsByCategoryChart from '@/components/admin/charts/NewsByCategoryChart';
import DashboardOverview from '@/components/admin/DashboardOverview';
import AdvancedAnalyticsChart from '@/components/admin/charts/AdvancedAnalyticsChart';
import UserLoginMap from '@/components/admin/UserLoginMap';
import CommentManager from '@/components/admin/comments/CommentManager';
import LikeManager from '@/components/admin/likes/LikeManager';
import LogoManagement from '@/components/admin/LogoManagement';
import SocialMediaManagement from '@/components/admin/SocialMediaManagement';
import { 
  Newspaper, 
  Users, 
  LayoutList, 
  RefreshCw, 
  Settings, 
  Filter,
  Calendar,
  TrendingUp,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Download,
  Share2,
  Globe,
  MessageSquare,
  Heart,
  Palette
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CategoryName {
  en: string;
  kh: string;
}

interface CategoryStats {
  name: string | CategoryName;
  count: number;
}

interface Stats {
  totalNews: number;
  totalUsers: number;
  totalCategories: number;
  newsByCategory: CategoryStats[];
  recentNews?: unknown[];
}

interface LogoSettings {
  logoDisplayMode?: 'image' | 'text';
  logoText?: string;
  logoUrl?: string;
  logoTextColor?: string;
  logoBackgroundColor?: string;
  logoFontSize?: number;
}

interface DashboardSettings {
  autoRefresh: boolean;
  refreshInterval: number;
  theme: 'light' | 'dark' | 'auto';
  layout: 'compact' | 'detailed' | 'cards';
  showAnimations: boolean;
  enableNotifications: boolean;
}

interface FilterOptions {
  dateRange: '7d' | '30d' | '90d' | 'custom';
  categories: string[];
  sortBy: 'date' | 'views' | 'engagement';
  sortOrder: 'asc' | 'desc';
}

const defaultSettings: DashboardSettings = {
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  theme: 'auto',
  layout: 'detailed',
  showAnimations: true,
  enableNotifications: true
};

const defaultFilters: FilterOptions = {
  dateRange: '30d',
  categories: [],
  sortBy: 'date',
  sortOrder: 'desc'
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [settings, setSettings] = useState<DashboardSettings>(defaultSettings);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, setLogoSettings] = useState<LogoSettings>({
    logoDisplayMode: 'text',
    logoText: 'Newsly',
    logoTextColor: '#000000',
    logoBackgroundColor: '#ffffff',
    logoFontSize: 24,
  });

  // Smart data processing with filters and sorting
  const processedChartData = useMemo(() => {
    if (!stats?.newsByCategory || !Array.isArray(stats.newsByCategory) || stats.newsByCategory.length === 0) {
      return [];
    }

    try {
      let data = stats.newsByCategory.map(item => {
        try {
          const name = item?.name
            ? (typeof item.name === 'string'
                ? item.name
                : (item.name?.en || 'Unknown'))
            : 'Unknown';

          return {
            name,
            count: typeof item?.count === 'number' ? item.count : 0
          };
        } catch {
          return { name: 'Error', count: 0 };
        }
      });

      // Apply category filters
      if (filters.categories.length > 0) {
        data = data.filter(item => filters.categories.includes(item.name));
      }

      // Apply sorting
      data.sort((a, b) => {
        const multiplier = filters.sortOrder === 'asc' ? 1 : -1;
        if (filters.sortBy === 'date') {
          return 0; // No date info available
        }
        return (a.count - b.count) * multiplier;
      });

      return data;
    } catch {
      return [];
    }
  }, [stats?.newsByCategory, filters]);

  // Fetch logo settings
  const fetchLogoSettings = useCallback(async () => {
    try {
      const response = await api.get('/admin/settings/logo');
      if (response.data.success && response.data.settings) {
        setLogoSettings(prev => ({ ...prev, ...response.data.settings }));
      }
    } catch (error) {}
  }, []);

  // Smart refresh mechanism
  const fetchStats = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setIsRefreshing(true);
      setError(null);

      const response = await api.get<{ success: boolean; data: Stats }>('/dashboard/stats', {
        params: {
          dateRange: filters.dateRange,
          categories: filters.categories.join(','),
          _t: Date.now() // Cache busting
        }
      });

      if (!response?.data?.success || !response.data.data) {
        throw new Error('Invalid data format received from server');
      }

      // Enhanced data transformation with validation
      const safeNewsByCategory = Array.isArray(response.data.data.newsByCategory)
        ? response.data.data.newsByCategory.map((item: CategoryStats) => {
            const name = item?.name
              ? (typeof item.name === 'object'
                  ? (item.name as CategoryName).en || 'Unknown'
                  : String(item.name))
              : 'Unknown';

            return {
              name,
              count: typeof item?.count === 'number' ? Math.max(0, item.count) : 0
            };
          }).filter(item => item.count > 0) // Remove empty categories
        : [];

      const transformedData: Stats = {
        totalNews: Math.max(0, Number(response.data.data.totalNews) || 0),
        totalUsers: Math.max(0, Number(response.data.data.totalUsers) || 0),
        totalCategories: Math.max(0, Number(response.data.data.totalCategories) || 0),
        newsByCategory: safeNewsByCategory,
        recentNews: Array.isArray(response.data.data.recentNews) ? response.data.data.recentNews : []
      };

      setStats(transformedData);
      setLastUpdated(new Date());

      if (settings.enableNotifications && showLoader) {
        toast.success('Dashboard updated successfully');
      }

    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: { message?: string };
          status?: number;
        };
        message?: string;
      };
      const errorMessage = err.response?.data?.message ||
                         err.message ||
                         'Failed to fetch dashboard statistics.';

      setError(errorMessage);
      if (settings.enableNotifications) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!settings.autoRefresh || !hasMounted) return;

    const interval = setInterval(() => {
      fetchStats(false);
    }, settings.refreshInterval);

    return () => clearInterval(interval);
  }, [settings.autoRefresh, settings.refreshInterval, hasMounted, fetchStats]);

  // Initial mount and data fetch
  useEffect(() => {
    setHasMounted(true);
    if (hasMounted) {
      fetchStats();
      fetchLogoSettings();
    }
  }, [hasMounted, fetchStats, fetchLogoSettings]);

  // Settings persistence
  useEffect(() => {
    const savedSettings = localStorage.getItem('dashboard-settings');
    if (savedSettings) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      } catch {
        // Use default settings
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboard-settings', JSON.stringify(settings));
  }, [settings]);

  // Smart export functionality
  const handleExportData = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const response = await api.get(`/dashboard/export?format=${format}`, {
        params: filters,
        responseType: format === 'pdf' ? 'blob' : 'json'
      });

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `dashboard-data-${timestamp}.${format}`;

      if (format === 'pdf') {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const dataStr = format === 'json' 
          ? JSON.stringify(response.data, null, 2)
          : response.data;
        const blob = new Blob([dataStr], { 
          type: format === 'json' ? 'application/json' : 'text/csv' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch {
      toast.error('Export failed. Please try again.');
    }
  }, [filters]);

  // Enhanced loading state with skeleton animations
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-gray-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <div className="h-4 sm:h-5 w-20 sm:w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-5 sm:h-6 sm:w-6 bg-gray-200 rounded-full animate-pulse"></div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="h-6 sm:h-8 w-10 sm:w-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="border-gray-100">
          <CardHeader className="p-4 sm:p-6">
            <div className="h-5 sm:h-6 w-36 sm:w-48 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="h-64 sm:h-80 w-full bg-gray-100 rounded-md animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center">
        <div className="border border-red-200 rounded-lg p-4 sm:p-6 max-w-md">
          <p className="text-red-600 font-medium text-sm sm:text-base">{error}</p>
          <p className="text-red-500 text-xs sm:text-sm mt-2">Please try refreshing the page</p>
          <Button 
            onClick={() => fetchStats()} 
            variant="outline" 
            size="sm" 
            className="mt-4"
            disabled={isRefreshing}
          >
            {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {isRefreshing ? 'Retrying...' : 'Retry'}
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center">
        <div className="border border-gray-200 rounded-lg p-4 sm:p-6 max-w-md">
          <p className="text-gray-600 text-sm sm:text-base">No statistics available.</p>
          <p className="text-gray-500 text-xs sm:text-sm mt-2">Please check back later.</p>
          <Button 
            onClick={() => fetchStats()} 
            variant="outline" 
            size="sm" 
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Smart Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
              {settings.autoRefresh && (
                <Badge variant="secondary" className="ml-2">
                  Auto-refresh: {settings.refreshInterval / 1000}s
                </Badge>
              )}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Date Range Filter */}
          <Select
            value={filters.dateRange}
            onValueChange={(value: '7d' | '30d' | '90d' | 'custom') => setFilters(prev => ({ ...prev, dateRange: value }))}
          >
            <SelectTrigger className="w-fit">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          {/* Export Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExportData('csv')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData('json')}>
                <Activity className="h-4 w-4 mr-2" />
                JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData('pdf')}>
                <Share2 className="h-4 w-4 mr-2" />
                PDF Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Dashboard Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <div className="p-2 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
                  <Switch
                    id="auto-refresh"
                    checked={settings.autoRefresh}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, autoRefresh: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="animations" className="text-sm">Animations</Label>
                  <Switch
                    id="animations"
                    checked={settings.showAnimations}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, showAnimations: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="text-sm">Notifications</Label>
                  <Switch
                    id="notifications"
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, enableNotifications: checked }))
                    }
                  />
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Manual Refresh */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchStats()}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Enhanced Tabs with Smart Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Comments</span>
          </TabsTrigger>
          <TabsTrigger value="likes" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Likes</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">User Map</span>
          </TabsTrigger>
          <TabsTrigger value="logo" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Logo</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Social</span>
          </TabsTrigger>
        
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <DashboardOverview />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <AdvancedAnalyticsChart />
          
          {/* Enhanced Content Metrics */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Content Metrics</h3>
              <Select
                value={filters.sortBy}
                onValueChange={(value: 'date' | 'views' | 'engagement') => setFilters(prev => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger className="w-fit">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="views">Sort by Views</SelectItem>
                  <SelectItem value="engagement">Sort by Engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 ">
              <StatCard 
                title="Total News" 
                value={stats.totalNews} 
                icon={Newspaper}
              
                
              />
              <StatCard 
                title="Total Users" 
                value={stats.totalUsers} 
                icon={Users}
              />
              <StatCard 
                title="Categories" 
                value={stats.totalCategories} 
                icon={LayoutList}
              
              />
              <StatCard 
                title="Engagement" 
                value="94.2%" 
                icon={Eye}
                
              />
            </div>
          </div>

          {/* Smart Category Chart */}
          <div className="w-full mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Content by Category</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {processedChartData.length} categories
                </Badge>
                {processedChartData.length > 0 && (
                  <Badge variant="secondary">
                    Total: {processedChartData.reduce((sum, item) => sum + item.count, 0)} articles
                  </Badge>
                )}
              </div>
            </div>
            
            {Array.isArray(processedChartData) && processedChartData.length > 0 ? (
              <div className={settings.showAnimations ? 'transition-all duration-500 ease-in-out' : ''}>
                <NewsByCategoryChart data={processedChartData} />
              </div>
            ) : (
              <Card className="p-6 sm:p-8 text-center border border-dashed border-gray-300">
                <div className="max-w-sm mx-auto">
                  <PieChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-sm sm:text-base">No category data available</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-2">
                    {filters.categories.length > 0 
                      ? 'Try adjusting your category filters'
                      : 'News articles by category will appear here'
                    }
                  </p>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="comments" className="space-y-6">
          <CommentManager />
        </TabsContent>
        
        <TabsContent value="likes" className="space-y-6">
          <LikeManager />
        </TabsContent>
        
        <TabsContent value="map" className="space-y-6">
          <UserLoginMap />
        </TabsContent>
        
        <TabsContent value="logo" className="space-y-6">
          <LogoManagement 
            onSettingsChange={(newSettings) => {
              setLogoSettings(newSettings);
            }}
          />
        </TabsContent>
        
        <TabsContent value="social" className="space-y-6">
          <SocialMediaManagement 
            onSettingsChange={() => {
              // Handle social media settings change
            }}
          />
        </TabsContent>
     
      </Tabs>
    </div>
  );
}