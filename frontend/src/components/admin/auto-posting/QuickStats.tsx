'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Activity, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface QuickStatsProps {
  settings: {
    autoPostEnabled: boolean;
    facebook: { enabled: boolean; status: string };
    twitter: { enabled: boolean; status: string };
    instagram: { enabled: boolean; status: string };
    threads: { enabled: boolean; status: string };
    linkedin: { enabled: boolean; status: string };
    telegram: { enabled: boolean; status: string };
  };
}

export default function QuickStats({ settings }: QuickStatsProps) {
  const platforms = [settings.facebook, settings.twitter, settings.instagram, settings.threads, settings.linkedin, settings.telegram];
  
  const activePlatforms = platforms.filter(p => p.enabled && p.status === 'connected').length;
  const connectedPlatforms = platforms.filter(p => p.status === 'connected').length;
  const errorPlatforms = platforms.filter(p => p.status === 'error').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Platforms</p>
              <p className="text-2xl font-bold">{activePlatforms}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Auto-Posting</p>
              <p className="text-2xl font-bold">{settings.autoPostEnabled ? 'ON' : 'OFF'}</p>
            </div>
            <Zap className={`h-8 w-8 ${settings.autoPostEnabled ? 'text-yellow-500' : 'text-gray-400'}`} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Connected</p>
              <p className="text-2xl font-bold">{connectedPlatforms}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Errors</p>
              <p className="text-2xl font-bold">{errorPlatforms}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
