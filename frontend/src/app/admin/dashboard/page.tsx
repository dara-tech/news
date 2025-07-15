'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import StatCard from '@/components/admin/StatCard';
import NewsByCategoryChart from '@/components/admin/charts/NewsByCategoryChart';
import { Newspaper, Users, LayoutList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Stats {
  totalNews: number;
  totalUsers: number;
  totalCategories: number;
  newsByCategory: { name: string; count: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (err) {
        setError('Failed to fetch dashboard statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
    return <p className="text-center">No statistics available.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total News" value={stats.totalNews} icon={Newspaper} />
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard title="Total Categories" value={stats.totalCategories} icon={LayoutList} />
      </div>
      <div className="grid grid-cols-1 gap-6">
        <NewsByCategoryChart data={stats.newsByCategory} />
      </div>
    </div>
  );
}
