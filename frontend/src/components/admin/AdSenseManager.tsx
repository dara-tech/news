'use client';

/**
 * AdSense Management Component
 * Advanced AdSense configuration and revenue monitoring
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign, TrendingUp, Eye, Settings, TestTube,
  Globe, Monitor, Smartphone, CheckCircle, 
  AlertTriangle, RefreshCw, BarChart3
} from 'lucide-react';

interface AdSenseData {
  revenue: {
    today: number;
    yesterday: number;
    thisMonth: number;
    lastMonth: number;
  };
  performance: {
    impressions: number;
    clicks: number;
    ctr: number;
    cpm: number;
  };
  adUnits: {
    header: { impressions: number; revenue: number };
    sidebar: { impressions: number; revenue: number };
    article: { impressions: number; revenue: number };
    footer: { impressions: number; revenue: number };
  };
}

const AdSenseManager: React.FC = () => {
  const [adsenseData, setAdsenseData] = useState<AdSenseData | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testingConfig, setTestingConfig] = useState(false);

  useEffect(() => {
    loadAdSenseData();
    loadSettings();
  }, []);

  const loadAdSenseData = async () => {
    try {
      // Simulate AdSense data for demo
      const mockData: AdSenseData = {
        revenue: {
          today: 12.45,
          yesterday: 15.23,
          thisMonth: 342.67,
          lastMonth: 298.44
        },
        performance: {
          impressions: 15420,
          clicks: 234,
          ctr: 1.52,
          cpm: 2.34
        },
        adUnits: {
          header: { impressions: 5200, revenue: 8.45 },
          sidebar: { impressions: 3100, revenue: 2.67 },
          article: { impressions: 4800, revenue: 1.23 },
          footer: { impressions: 2320, revenue: 0.10 }
        }
      };
      
      setAdsenseData(mockData);
    } catch (error) {
      console.error('Failed to load AdSense data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/frontend-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const testAdSenseConfig = async () => {
    if (!settings?.adsense?.publisherId) return;
    
    setTestingConfig(true);
    try {
      const response = await fetch('/api/admin/frontend-settings/test-adsense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publisherId: settings.adsense.publisherId })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('✅ AdSense configuration is valid!');
      } else {
        alert('❌ AdSense configuration error: ' + result.message);
      }
    } catch (error) {
      alert('❌ Failed to test AdSense configuration');
    } finally {
      setTestingConfig(false);
    }
  };

  const toggleAdSense = async () => {
    if (!settings) return;
    
    const newEnabled = !settings.adsense.enabled;
    
    try {
      const response = await fetch('/api/admin/frontend-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            ...settings,
            adsense: { ...settings.adsense, enabled: newEnabled }
          }
        })
      });
      
      if (response.ok) {
        setSettings({
          ...settings,
          adsense: { ...settings.adsense, enabled: newEnabled }
        });
        alert(`✅ AdSense ${newEnabled ? 'enabled' : 'disabled'} successfully!`);
      }
    } catch (error) {
      alert('❌ Failed to toggle AdSense');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading AdSense data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AdSense Management</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor and manage your Google AdSense monetization
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={testAdSenseConfig} variant="outline" disabled={testingConfig}>
            {testingConfig ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <TestTube className="h-4 w-4 mr-2" />}
            Test Config
          </Button>
          <Button onClick={toggleAdSense} variant={settings?.adsense?.enabled ? "destructive" : "default"}>
            {settings?.adsense?.enabled ? 'Disable AdSense' : 'Enable AdSense'}
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {settings && (
        <Alert className={settings.adsense.enabled ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
          <DollarSign className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                AdSense Status: <strong>{settings.adsense.enabled ? 'Active' : 'Inactive'}</strong>
                {settings.adsense.testMode && <Badge variant="outline" className="ml-2">Test Mode</Badge>}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant={settings.adsense.publisherId.includes('XXX') ? 'destructive' : 'default'}>
                  {settings.adsense.publisherId.includes('XXX') ? 'Demo ID' : 'Live ID'}
                </Badge>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Revenue Dashboard */}
      {adsenseData && settings?.adsense?.enabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold">${adsenseData.revenue.today.toFixed(2)}</p>
                  <p className="text-xs text-green-600">
                    +${(adsenseData.revenue.today - adsenseData.revenue.yesterday).toFixed(2)} vs yesterday
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">${adsenseData.revenue.thisMonth.toFixed(2)}</p>
                  <p className="text-xs text-blue-600">
                    +${(adsenseData.revenue.thisMonth - adsenseData.revenue.lastMonth).toFixed(2)} vs last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Impressions</p>
                  <p className="text-2xl font-bold">{adsenseData.performance.impressions.toLocaleString()}</p>
                  <p className="text-xs text-purple-600">CTR: {adsenseData.performance.ctr}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">CPM</p>
                  <p className="text-2xl font-bold">${adsenseData.performance.cpm.toFixed(2)}</p>
                  <p className="text-xs text-orange-600">{adsenseData.performance.clicks} clicks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AdSense Configuration */}
      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AdSense Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Publisher ID</Label>
                      <div className="flex gap-2">
                        <Input
                          value={settings.adsense.publisherId}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto Ads</Label>
                        <p className="text-xs text-gray-600">Automatic ad placement</p>
                      </div>
                      <Switch
                        checked={settings.adsense.autoAdsEnabled}
                        onCheckedChange={() => {/* Handle toggle */}}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(settings.adsense.adSlots).map(([slot, id]) => (
                      <div key={slot}>
                        <Label className="capitalize">{slot} Ad</Label>
                        <Input
                          value={id}
                          readOnly
                          className="font-mono text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {adsenseData && (
            <Card>
              <CardHeader>
                <CardTitle>Ad Unit Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(adsenseData.adUnits).map(([unit, data]) => (
                    <div key={unit} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          {unit === 'header' && <Monitor className="h-5 w-5 text-blue-600" />}
                          {unit === 'sidebar' && <Smartphone className="h-5 w-5 text-blue-600" />}
                          {unit === 'article' && <Eye className="h-5 w-5 text-blue-600" />}
                          {unit === 'footer' && <BarChart3 className="h-5 w-5 text-blue-600" />}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{unit} Ad</p>
                          <p className="text-sm text-gray-600">{data.impressions.toLocaleString()} impressions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${data.revenue.toFixed(2)}</p>
                        <p className="text-xs text-gray-600">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Optimization Recommendations:</p>
                      <ul className="text-sm space-y-1">
                        <li>• Place ads above the fold for better visibility</li>
                        <li>• Use responsive ad units for mobile optimization</li>
                        <li>• Enable Auto Ads for maximum coverage</li>
                        <li>• Monitor performance and adjust placement</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Best Performing</h3>
                    <p className="text-2xl font-bold text-green-600">Header Ads</p>
                    <p className="text-sm text-gray-600">Highest revenue per impression</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Optimization Score</h3>
                    <p className="text-2xl font-bold text-blue-600">85%</p>
                    <p className="text-sm text-gray-600">Room for improvement</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => window.open('https://www.google.com/adsense/', '_blank')}
              className="h-20 flex flex-col"
            >
              <Globe className="h-6 w-6 mb-2" />
              AdSense Dashboard
            </Button>
            
            <Button 
              onClick={() => window.open('https://www.google.com/adsense/new/u/0/pub-0000000000000000/myads/units', '_blank')}
              variant="outline"
              className="h-20 flex flex-col"
            >
              <Settings className="h-6 w-6 mb-2" />
              Manage Ad Units
            </Button>
            
            <Button 
              onClick={() => window.open('/admin/enterprise-analytics', '_blank')}
              variant="outline"
              className="h-20 flex flex-col"
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdSenseManager;
