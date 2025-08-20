'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessMetricsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  trend: 'up' | 'down' | 'neutral';
  className?: string;
}

export default function ProcessMetricsCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  className
}: ProcessMetricsCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-emerald-400';
      case 'down': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <Card className={cn(
      "bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300 group",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-600/50 group-hover:border-slate-500/50 transition-colors">
          <Icon className="h-4 w-4 text-slate-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-100">{value}</div>
        <p className={cn("text-xs flex items-center gap-1", getTrendColor())}>
          <span>{getTrendIcon()}</span>
          {change}
        </p>
      </CardContent>
    </Card>
  );
}
