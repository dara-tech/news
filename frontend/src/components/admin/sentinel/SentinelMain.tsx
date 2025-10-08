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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        <h1 className="text-lg sm:text-2xl font-bold">Sentinel Management</h1>
      </div>

      <Tabs defaultValue="status" className="space-y-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-200/50 p-1 sm:p-2 shadow-sm">
          <TabsList className="flex w-full bg-transparent overflow-x-auto scrollbar-hide">
            <TabsTrigger value="status" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 px-2 sm:px-3 py-1.5 sm:py-2 flex-shrink-0 min-w-fit">
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Status</span>
                <span className="sm:hidden">ST</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="drafts" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 px-2 sm:px-3 py-1.5 sm:py-2 flex-shrink-0 min-w-fit">
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Drafts</span>
                <span className="sm:hidden">DR</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="controls" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 px-2 sm:px-3 py-1.5 sm:py-2 flex-shrink-0 min-w-fit">
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Controls</span>
                <span className="sm:hidden">CT</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="sources" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 px-2 sm:px-3 py-1.5 sm:py-2 flex-shrink-0 min-w-fit">
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Database className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Sources</span>
                <span className="sm:hidden">SC</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 px-2 sm:px-3 py-1.5 sm:py-2 flex-shrink-0 min-w-fit">
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Logs</span>
                <span className="sm:hidden">LG</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 px-2 sm:px-3 py-1.5 sm:py-2 flex-shrink-0 min-w-fit">
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">SG</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="status" className="mt-3 sm:mt-4">
          <SentinelStatus 
            config={sentinelData.config}
            runtime={sentinelData.runtime}
            error={sentinelData.error}
            onRefresh={fetchSentinelData}
          />
        </TabsContent>

        <TabsContent value="drafts" className="mt-3 sm:mt-4">
          <SentinelDrafts />
        </TabsContent>

        <TabsContent value="controls" className="mt-3 sm:mt-4">
          <SentinelControls 
            config={sentinelData.config}
            runtime={sentinelData.runtime}
            onUpdate={fetchSentinelData}
          />
        </TabsContent>

        <TabsContent value="sources" className="mt-3 sm:mt-4">
          <SentinelSources 
            sources={sentinelData.config?.sources || []}
            onUpdate={fetchSentinelData}
          />
        </TabsContent>

        <TabsContent value="logs" className="mt-3 sm:mt-4">
          <SentinelLogs />
        </TabsContent>

        <TabsContent value="settings" className="mt-3 sm:mt-4">
          <SentinelSettings 
            config={sentinelData.config}
            onUpdate={fetchSentinelData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
