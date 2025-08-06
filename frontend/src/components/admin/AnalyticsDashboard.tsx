'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Users, 
  Shield, 
  AlertTriangle, 
  Layers, 
  Globe2 
} from 'lucide-react';

interface MapAnalytics {
  totalLocations: number;
  totalLogins: number;
  uniqueUsers: number;
  mostActiveLocation: any | null;
  averageLoginsPerLocation: number;
  topCountries: Array<{ country: string; count: number }>;
  deviceDistribution: { mobile: number; desktop: number; tablet: number };
  browserDistribution: { chrome: number; firefox: number; safari: number; edge: number; other: number };
  timeTrends: Array<{ date: string; logins: number }>;
  securityAlerts: number;
}

interface AnalyticsDashboardProps {
  analytics: MapAnalytics;
}

export default function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-4">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Locations</p>
              <p className="text-2xl font-bold text-blue-700">{analytics.totalLocations}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Total Logins</p>
              <p className="text-2xl font-bold text-green-700">{analytics.totalLogins}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Unique Users</p>
              <p className="text-2xl font-bold text-purple-700">{analytics.uniqueUsers}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 rounded-xl border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">Security Alerts</p>
              <p className="text-2xl font-bold text-red-700">{analytics.securityAlerts}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Distribution */}
        <Card className="p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Device Distribution</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Mobile</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{analytics.deviceDistribution.mobile}</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                    style={{ width: `${(analytics.deviceDistribution.mobile / Math.max(analytics.deviceDistribution.mobile + analytics.deviceDistribution.desktop + analytics.deviceDistribution.tablet, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Desktop</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{analytics.deviceDistribution.desktop}</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-300" 
                    style={{ width: `${(analytics.deviceDistribution.desktop / Math.max(analytics.deviceDistribution.mobile + analytics.deviceDistribution.desktop + analytics.deviceDistribution.tablet, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Tablet</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{analytics.deviceDistribution.tablet}</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-300" 
                    style={{ width: `${(analytics.deviceDistribution.tablet / Math.max(analytics.deviceDistribution.mobile + analytics.deviceDistribution.desktop + analytics.deviceDistribution.tablet, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Top Countries */}
        <Card className="p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Top Countries</h3>
          </div>
          <div className="space-y-3">
            {analytics.topCountries.map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium">{country.country}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{country.count}</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-300" 
                      style={{ width: `${(country.count / Math.max(...analytics.topCountries.map(c => c.count), 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
} 