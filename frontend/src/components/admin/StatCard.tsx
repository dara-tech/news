import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period?: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  description?: string;
  loading?: boolean;
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  color = 'blue',
  description,
  loading = false
}: StatCardProps) {
  const colorVariants = {
    blue: {
      icon: 'bg-blue-500/10 text-blue-600 border-blue-200/50 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
      accent: 'bg-blue-500'
    },
    green: {
      icon: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
      accent: 'bg-emerald-500'
    },
    purple: {
      icon: 'bg-purple-500/10 text-purple-600 border-purple-200/50 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30',
      accent: 'bg-purple-500'
    },
    orange: {
      icon: 'bg-orange-500/10 text-orange-600 border-orange-200/50 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30',
      accent: 'bg-orange-500'
    },
    red: {
      icon: 'bg-red-500/10 text-red-600 border-red-200/50 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
      accent: 'bg-red-500'
    }
  };

  const currentColor = colorVariants[color];

  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-700 backdrop-blur-sm animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-3 flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
          {description && (
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                {title}
              </h3>
              {trend && (
                <Badge 
                  variant="outline" 
                  className={`text-xs h-6 px-2 ${
                    trend.direction === 'up' 
                      ? 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-950/50' 
                      : 'border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-950/50'
                  }`}
                >
                  {trend.direction === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {trend.value}%
                </Badge>
              )}
            </div>
            
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            
            {trend?.period && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                vs {trend.period}
              </p>
            )}
          </div>
          
          <div className={`p-3 rounded-xl border ${currentColor.icon}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        )}
        
        {/* Subtle accent line */}
        <div className="mt-4 pt-0">
          <div className="h-px bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
            <div 
              className={`absolute left-0 top-0 h-full ${currentColor.accent} transition-all duration-500`}
              style={{ width: typeof value === 'number' ? `${Math.min((value / 1000) * 100, 100)}%` : '60%' }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
