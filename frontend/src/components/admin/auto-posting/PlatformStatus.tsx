'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { Facebook, Twitter, Instagram, MessageCircle, Linkedin, MessageSquare } from 'lucide-react';

interface PlatformStatusProps {
  settings: {
    facebook: { enabled: boolean; status: string };
    twitter: { enabled: boolean; status: string };
    instagram: { enabled: boolean; status: string };
    threads: { enabled: boolean; status: string };
    linkedin: { enabled: boolean; status: string };
    telegram: { enabled: boolean; status: string };
  };
}

export default function PlatformStatus({ settings }: PlatformStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'error': return 'Error';
      default: return 'Disconnected';
    }
  };

  const platforms = [
    { key: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { key: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-sky-500' },
    { key: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { key: 'threads', name: 'Threads', icon: MessageCircle, color: 'text-black' },
    { key: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
    { key: 'telegram', name: 'Telegram', icon: MessageSquare, color: 'text-blue-400' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Platform Status
        </CardTitle>
        <CardDescription>
          Current status of all social media platforms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platforms.map(({ key, name, icon: Icon, color }) => {
            const platform = settings[key as keyof typeof settings] as { enabled: boolean; status: string };
            return (
              <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-sm text-muted-foreground">
                      {platform.enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(platform.status)}`} />
                  <Badge variant="outline" className="text-xs">
                    {getStatusText(platform.status)}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
