'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import StatCard from '@/components/admin/StatCard';
import NewsByCategoryChart from '@/components/admin/charts/NewsByCategoryChart';
import { Newspaper, Users, LayoutList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  
  // Prepare chart data with useMemo at the top level
  const chartData = useMemo(() => {
    if (!stats?.newsByCategory || !Array.isArray(stats.newsByCategory) || stats.newsByCategory.length === 0) {
      console.warn('No valid newsByCategory data available');
      return [];
    }
    
    try {
      return stats.newsByCategory.map(item => {
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
        } catch (itemError) {
          console.error('Error processing category item:', { item, itemError });
          return { name: 'Error', count: 0 };
        }
      });
    } catch (error) {
      console.error('Error preparing chart data:', error);
      return [];
    }
  }, [stats?.newsByCategory]);

  useEffect(() => {
    setHasMounted(true);
    
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching dashboard stats...');
        const response = await api.get<{ success: boolean; data: Stats }>('/dashboard/stats');
        
        console.log('Dashboard stats response:', response.data);
        
        if (!response?.data?.success || !response.data.data) {
          throw new Error('Invalid data format received from server');
        }
        
        // Safely transform the category data
        const safeNewsByCategory = Array.isArray(response.data.data.newsByCategory)
          ? response.data.data.newsByCategory.map((item: CategoryStats) => {
              const name = item?.name 
                ? (typeof item.name === 'object' 
                    ? (item.name as CategoryName).en || 'Unknown' 
                    : String(item.name))
                : 'Unknown';
                
              return {
                name,
                count: typeof item?.count === 'number' ? item.count : 0
              };
            })
          : [];
        
        const transformedData: Stats = {
          totalNews: typeof response.data.data.totalNews === 'number' ? response.data.data.totalNews : 0,
          totalUsers: typeof response.data.data.totalUsers === 'number' ? response.data.data.totalUsers : 0,
          totalCategories: typeof response.data.data.totalCategories === 'number' ? response.data.data.totalCategories : 0,
          newsByCategory: safeNewsByCategory,
          recentNews: Array.isArray(response.data.data.recentNews) ? response.data.data.recentNews : []
        };
        
        console.log('Transformed dashboard stats:', transformedData);
        setStats(transformedData);
        
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
        
        console.error('Error in fetchStats:', {
          error: err,
          status: err.response?.status,
          data: err.response?.data
        });
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (hasMounted) {
      fetchStats();
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [hasMounted]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full bg-gray-200 rounded-md animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  if (!stats) {
    return <p className="text-center p-4 text-gray-600">No statistics available. Please check back later.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total News" value={stats.totalNews} icon={Newspaper} />
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard title="Total Categories" value={stats.totalCategories} icon={LayoutList} />
      </div>
      <div className="grid grid-cols-1 gap-6">
        {Array.isArray(chartData) && chartData.length > 0 ? (
          <NewsByCategoryChart data={chartData} />
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No category data available</p>
            <p className="text-sm text-gray-400 mt-2">News articles by category will appear here</p>
          </div>
        )}
      </div>
    </div>
  
  );
}
