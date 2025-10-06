'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Activity, Settings, FileText, Database, BookOpen } from 'lucide-react';
import api from '@/lib/api';
import SentinelStatus from './SentinelStatus';
import SentinelControls from './SentinelControls';
import SentinelSources from './SentinelSources';
import SentinelLogs from './SentinelLogs';
import SentinelSettings from './SentinelSettings';
import SentinelDrafts from './SentinelDrafts';

interface SentinelData {
  config: any;
  runtime: any;
  error: string | null;
}

export default function SentinelMain() {
  const [sentinelData, setSentinelData] = useState<SentinelData>({
    config: null,
    runtime: null,
    error: null
  });
  const [loading, setLoading] = useState(true);

  const fetchSentinelData = async () => {
    try {
      setLoading(true);
      // Fetch sentinel configuration and runtime data using authenticated API
      const { data } = await api.get('/admin/system/sentinel');
      
      if (data.success) {
        
        setSentinelData({
          config: data.config,
          runtime: data.runtime,
          error: null
        });
      } else {
        setSentinelData(prev => ({ ...prev, error: data.message }));
      }
    } catch (error) {
      setSentinelData(prev => ({ 
        ...prev, 
        error: 'Failed to fetch sentinel data' 
      }));
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeStatus = async () => {
    try {
      // Fetch real-time status for live updates
      const { data } = await api.get('/admin/system/sentinel/status');
      
      if (data.success) {
        
        setSentinelData(prev => {
          const newData = {
            ...prev,
            runtime: {
              ...prev.runtime,
              running: data.running,
              status: data.status,
              lastRun: data.lastRun,
              nextRun: data.nextRun,
              lastCreated: data.lastCreated,
              lastProcessed: data.lastProcessed,
              sourcesCount: data.sourcesCount,
              frequencyMs: data.frequencyMs,
              timestamp: data.timestamp
            }
          };
          
          
          return newData;
        });
      }
    } catch (error) {
      console.error('Failed to fetch real-time status:', error);
    }
  };

  useEffect(() => {
    fetchSentinelData();
    
    // Set up auto-refresh for real-time status updates
    const statusInterval = setInterval(() => {
      fetchRealTimeStatus();
    }, 5000); // Refresh every 5 seconds
    
    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Sentinel Management</h1>
      </div>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="status" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Status</span>
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Drafts</span>
          </TabsTrigger>
          <TabsTrigger value="controls" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Controls</span>
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Sources</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Logs</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <SentinelStatus 
            config={sentinelData.config}
            runtime={sentinelData.runtime}
            error={sentinelData.error}
            onRefresh={fetchSentinelData}
          />
        </TabsContent>

        <TabsContent value="drafts">
          <SentinelDrafts />
        </TabsContent>

        <TabsContent value="controls">
          <SentinelControls 
            config={sentinelData.config}
            runtime={sentinelData.runtime}
            onUpdate={fetchSentinelData}
          />
        </TabsContent>

        <TabsContent value="sources">
          <SentinelSources 
            sources={sentinelData.config?.sources || []}
            onUpdate={fetchSentinelData}
          />
        </TabsContent>

        <TabsContent value="logs">
          <SentinelLogs />
        </TabsContent>

        <TabsContent value="settings">
          <SentinelSettings 
            config={sentinelData.config}
            onUpdate={fetchSentinelData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
