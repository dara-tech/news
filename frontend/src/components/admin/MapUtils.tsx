'use client';

interface LoginLocation {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  country: string;
  city: string;
  region: string;
  count: number;
  userCount: number;
  totalLogins: number;
  users: Array<{
    _id: string;
    username: string;
    email: string;
    profileImage?: string;
    lastLogin?: string;
    deviceType?: string;
  }>;
  recentLogins: Array<{
    username: string;
    loginTime: string;
    device: string;
    browser: string;
    ipAddress?: string;
    userAgent?: string;
  }>;
  deviceStats?: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  browserStats?: {
    chrome: number;
    firefox: number;
    safari: number;
    edge: number;
    other: number;
  };
  securityFlags?: {
    suspicious: boolean;
    vpn: boolean;
    proxy: boolean;
    tor: boolean;
  };
}

interface MapAnalytics {
  totalLocations: number;
  totalLogins: number;
  uniqueUsers: number;
  mostActiveLocation: LoginLocation | null;
  averageLoginsPerLocation: number;
  topCountries: Array<{ country: string; count: number }>;
  deviceDistribution: { mobile: number; desktop: number; tablet: number };
  browserDistribution: { chrome: number; firefox: number; safari: number; edge: number; other: number };
  timeTrends: Array<{ date: string; logins: number }>;
  securityAlerts: number;
}

export class MapUtils {
  // Marker utilities
  static getMarkerColor(count: number): string {
    if (count <= 2) return '#22c55e'; // green
    if (count <= 4) return '#eab308'; // yellow
    if (count <= 9) return '#f97316'; // orange
    return '#ef4444'; // red
  }

  static getMarkerColorClass(count: number): string {
    if (count <= 2) return 'bg-green-500';
    if (count <= 4) return 'bg-yellow-500';
    if (count <= 9) return 'bg-orange-500';
    return 'bg-red-500';
  }

  static getMarkerSize(count: number): number {
    return Math.max(8, Math.min(20, 8 + count * 2));
  }

  // Device utilities
  static getDeviceIcon(deviceType: string) {
    const icons = {
      mobile: '📱',
      desktop: '💻',
      tablet: '📱',
      unknown: '❓'
    };
    return icons[deviceType as keyof typeof icons] || icons.unknown;
  }

  static getSecurityLevel(flags: any): 'low' | 'medium' | 'high' {
    const activeFlags = Object.values(flags).filter(Boolean).length;
    if (activeFlags === 0) return 'low';
    if (activeFlags <= 2) return 'medium';
    return 'high';
  }

  // Time utilities
  static formatTime(timeString: string): string {
    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInHours * 60);
        return `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
      }
    } catch (error) {
      return 'Unknown';
    }
  }

  // Analytics utilities
  static calculateAnalytics(locations: LoginLocation[]): MapAnalytics {
    const totalLocations = locations.length;
    const totalLogins = locations.reduce((sum, loc) => sum + loc.totalLogins, 0);
    const uniqueUsers = new Set(locations.flatMap(loc => loc.users.map(u => u._id))).size;
    
    // Most active location
    const mostActiveLocation = locations.reduce((max, loc) => 
      loc.totalLogins > (max?.totalLogins || 0) ? loc : max, null as LoginLocation | null
    );
    
    // Country distribution
    const countryCounts = locations.reduce((acc, loc) => {
      acc[loc.country] = (acc[loc.country] || 0) + loc.totalLogins;
      return acc;
    }, {} as Record<string, number>);
    
    const topCountries = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Device distribution
    const deviceDistribution = locations.reduce((acc, loc) => {
      if (loc.deviceStats) {
        acc.mobile += loc.deviceStats.mobile;
        acc.desktop += loc.deviceStats.desktop;
        acc.tablet += loc.deviceStats.tablet;
      }
      return acc;
    }, { mobile: 0, desktop: 0, tablet: 0 });
    
    // Browser distribution
    const browserDistribution = locations.reduce((acc, loc) => {
      if (loc.browserStats) {
        acc.chrome += loc.browserStats.chrome;
        acc.firefox += loc.browserStats.firefox;
        acc.safari += loc.browserStats.safari;
        acc.edge += loc.browserStats.edge;
        acc.other += loc.browserStats.other;
      }
      return acc;
    }, { chrome: 0, firefox: 0, safari: 0, edge: 0, other: 0 });
    
    // Security alerts
    const securityAlerts = locations.reduce((sum, loc) => {
      if (loc.securityFlags) {
        sum += Object.values(loc.securityFlags).filter(Boolean).length;
      }
      return sum;
    }, 0);
    
    // Time trends (simplified)
    const timeTrends = locations.map((loc, index) => ({
      date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      logins: loc.totalLogins
    })).reverse();
    
    return {
      totalLocations,
      totalLogins,
      uniqueUsers,
      mostActiveLocation,
      averageLoginsPerLocation: totalLocations > 0 ? totalLogins / totalLocations : 0,
      topCountries,
      deviceDistribution,
      browserDistribution,
      timeTrends,
      securityAlerts
    };
  }

  // Map utilities
  static getTileLayer(type: string) {
    const layers = {
      streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    };
    
    const options = {
      maxZoom: 18,
      minZoom: 1,
      tileSize: 256,
      zoomOffset: 0,
      attribution: type === 'streets' 
        ? '© OpenStreetMap contributors'
        : type === 'satellite'
        ? '© Esri'
        : '© CARTO'
    };
    
    return { url: layers[type as keyof typeof layers], options };
  }

  // Export utilities
  static exportToJSON(data: any, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  static exportToCSV(data: any[], filename: string) {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
} 