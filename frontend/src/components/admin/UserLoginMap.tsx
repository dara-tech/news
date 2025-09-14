'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import AnalyticsDashboard from './AnalyticsDashboard';
import MapControls from './MapControls';
import LocationDetails from './LocationDetails';
import MapContainer from './MapContainer';
import MapInitializer from './MapInitializer';
import MapMarkers from './MapMarkers';
import { MapUtils } from './MapUtils';
import { 
  MapPin, 
  Users, 
  Globe, 
  Clock, 
  Shield, 
  AlertTriangle,
  RefreshCw,
  Eye,
  BarChart3,
  Layers,
  Download,
  Settings,
  Globe2,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

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
  timeDistribution?: {
    hourly: number[];
    daily: number[];
    weekly: number[];
  };
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

interface UserLoginMapProps {
  className?: string;
}

// Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

export default function UserLoginMap({ className }: UserLoginMapProps) {
  const [mapData, setMapData] = useState<LoginLocation[]>([]);
  const [analytics, setAnalytics] = useState<MapAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [timeRange, setTimeRange] = useState('7');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LoginLocation | null>(null);
  const [mapType, setMapType] = useState<'streets' | 'satellite' | 'dark'>('streets');
  const [zoom, setZoom] = useState(2);
  
  // Advanced features
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterDevice, setFilterDevice] = useState('all');
  const [filterSecurity, setFilterSecurity] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTimeChart, setShowTimeChart] = useState(false);
  const [playbackMode, setPlaybackMode] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const heatmapRef = useRef<any>(null);
  const clusterRef = useRef<any>(null);
  const popupRef = useRef<any>(null);
  const isInitializingRef = useRef(false);
  const realTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMapData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { days: timeRange };
      if (filterCountry && filterCountry !== 'all') params.country = filterCountry;
      if (filterDevice && filterDevice !== 'all') params.device = filterDevice;
      if (filterSecurity && filterSecurity !== 'all') params.security = filterSecurity;
      if (searchQuery) params.search = searchQuery;
      
      const response = await api.get('/admin/user-logins/map', { params });
      
      if (response.data.success) {
        // Transform coordinates from [longitude, latitude] array to {latitude, longitude} object
        const validData = (response.data.data || []).map((location: any) => {
          if (Array.isArray(location.coordinates) && location.coordinates.length === 2) {
            const [longitude, latitude] = location.coordinates;
            return {
              ...location,
              coordinates: { latitude, longitude }
            };
          }
          return location;
        }).filter((location: LoginLocation) => 
          location?.coordinates?.latitude !== undefined && 
          location?.coordinates?.longitude !== undefined &&
          !isNaN(location.coordinates.latitude) &&
          !isNaN(location.coordinates.longitude)
        );
        
        setMapData(validData);
        
        // Calculate analytics
        const analyticsData = calculateAnalytics(validData);
        setAnalytics(analyticsData);
        
        // Update map markers if map is initialized
        if (mapInstanceRef.current) {
          updateMapMarkers(validData);
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch login map data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [timeRange, filterCountry, filterDevice, filterSecurity, searchQuery]);

  const calculateAnalytics = useCallback((locations: LoginLocation[]): MapAnalytics => {
    const totalLogins = locations.reduce((sum, loc) => sum + loc.totalLogins, 0);
    const uniqueUsers = locations.reduce((sum, loc) => sum + loc.userCount, 0);
    const mostActiveLocation = locations.reduce((max, loc) => 
      loc.count > (max?.count || 0) ? loc : max, null as LoginLocation | null
    );
    
    // Country distribution
    const countryCounts = locations.reduce((acc, loc) => {
      acc[loc.country] = (acc[loc.country] || 0) + loc.count;
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
        if (loc.securityFlags.suspicious || loc.securityFlags.vpn || 
            loc.securityFlags.proxy || loc.securityFlags.tor) {
          return sum + 1;
        }
      }
      return sum;
    }, 0);
    
    // Time trends (simplified - in real app, this would come from backend)
    const timeTrends = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      logins: Math.floor(Math.random() * 100) + 10
    }));
    
    return {
      totalLocations: locations.length,
      totalLogins,
      uniqueUsers,
      mostActiveLocation,
      averageLoginsPerLocation: locations.length > 0 ? totalLogins / locations.length : 0,
      topCountries,
      deviceDistribution,
      browserDistribution,
      timeTrends,
      securityAlerts
    };
  }, []);

  const updateMapMarkers = useCallback((locations: LoginLocation[]) => {
    if (!mapInstanceRef.current || !window.L) return;
    
    // Clear existing markers, heatmap, and clusters
    markersRef.current.forEach(marker => {
      try {
        mapInstanceRef.current.removeLayer(marker);
      } catch (e) {}
    });
    markersRef.current = [];

    if (heatmapRef.current) {
      try {
        mapInstanceRef.current.removeLayer(heatmapRef.current);
      } catch (e) {}
      heatmapRef.current = null;
    }

    if (clusterRef.current) {
      try {
        mapInstanceRef.current.removeLayer(clusterRef.current);
      } catch (e) {}
      clusterRef.current = null;
    }

    if (heatmapMode) {
      // Check if heatmap plugin is available
      if (window.L.heatLayer) {
        // Create heatmap
        const heatmapData = locations.map(location => ({
          lat: location.coordinates.latitude,
          lng: location.coordinates.longitude,
          value: location.count
        }));

        heatmapRef.current = window.L.heatLayer(heatmapData, {
          radius: 25,
          blur: 15,
          maxZoom: 10,
          gradient: {
            0.4: '#22c55e',
            0.6: '#eab308',
            0.8: '#f97316',
            1.0: '#ef4444'
          }
        }).addTo(mapInstanceRef.current);
      } else {
        // Fallback to regular markers if heatmap plugin is not available
        locations.forEach((location, index) => {
          if (!location.coordinates || 
              typeof location.coordinates.latitude !== 'number' || 
              typeof location.coordinates.longitude !== 'number' ||
              isNaN(location.coordinates.latitude) || 
              isNaN(location.coordinates.longitude)) {
            return;
          }
          
          const marker = createCustomMarker(location);
          marker.addTo(mapInstanceRef.current);
          markersRef.current.push(marker);
        });
      }
    } else if (clusteringEnabled && locations.length > 10) {
      // Check if clustering plugin is available
      if (window.L.markerClusterGroup) {
        // Create clustered markers
        const markers = locations.map(location => {
          if (!location.coordinates || 
              typeof location.coordinates.latitude !== 'number' || 
              typeof location.coordinates.longitude !== 'number' ||
              isNaN(location.coordinates.latitude) || 
              isNaN(location.coordinates.longitude)) {
            return null;
          }

          const marker = window.L.marker([location.coordinates.latitude, location.coordinates.longitude], {
            icon: createCustomIcon(location.count)
          });

          const popupContent = createPopupContent(location);
          marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
          });

          marker.on('click', () => {
            setSelectedLocation(location);
          });

          return marker;
        }).filter(Boolean);

        clusterRef.current = window.L.markerClusterGroup({
          chunkedLoading: true,
          maxClusterRadius: 50,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: true,
          zoomToBoundsOnClick: true,
          iconCreateFunction: function(cluster: any) {
            const count = cluster.getChildCount();
            const size = Math.max(20, Math.min(40, count * 3));
            return window.L.divIcon({
              html: `<div class="cluster-marker" style="
                width: ${size}px; 
                height: ${size}px; 
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                border: 3px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: ${Math.max(10, size / 3)}px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              ">${count}</div>`,
              className: 'custom-cluster',
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2]
            });
          }
        });

        markers.forEach(marker => {
          if (marker) clusterRef.current.addLayer(marker);
        });

        clusterRef.current.addTo(mapInstanceRef.current);
      } else {
        // Fallback to regular markers if clustering plugin is not available
        locations.forEach((location, index) => {
          if (!location.coordinates || 
              typeof location.coordinates.latitude !== 'number' || 
              typeof location.coordinates.longitude !== 'number' ||
              isNaN(location.coordinates.latitude) || 
              isNaN(location.coordinates.longitude)) {
            return;
          }
          
          const marker = createCustomMarker(location);
          marker.addTo(mapInstanceRef.current);
          markersRef.current.push(marker);
        });
      }
    } else {
      // Create individual markers
      locations.forEach((location, index) => {
        if (!location.coordinates || 
            typeof location.coordinates.latitude !== 'number' || 
            typeof location.coordinates.longitude !== 'number' ||
            isNaN(location.coordinates.latitude) || 
            isNaN(location.coordinates.longitude)) {
          return;
        }
        
        const marker = createCustomMarker(location);
        marker.addTo(mapInstanceRef.current);
        markersRef.current.push(marker);
      });
    }
  }, [heatmapMode, clusteringEnabled]);

  const createCustomMarker = useCallback((location: LoginLocation) => {
    const markerSize = Math.max(8, Math.min(20, location.count * 2));
    
    const marker = window.L.circleMarker([location.coordinates.latitude, location.coordinates.longitude], {
      radius: markerSize,
      fillColor: getMarkerColor(location.count),
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    });

    const popupContent = createPopupContent(location);
    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'custom-popup'
    });

    marker.on('click', () => {
      setSelectedLocation(location);
    });

    return marker;
  }, []);

  const createCustomIcon = useCallback((count: number) => {
    const size = Math.max(20, Math.min(40, count * 3));
    return window.L.divIcon({
      html: `<div class="custom-marker" style="
        width: ${size}px; 
        height: ${size}px; 
        background: ${getMarkerColor(count)};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${Math.max(8, size / 4)}px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">${count}</div>`,
      className: 'custom-marker-icon',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }, []);

  const createPopupContent = useCallback((location: LoginLocation) => {
    const securityFlags = location.securityFlags ? Object.entries(location.securityFlags)
      .filter(([_, value]) => value)
      .map(([key, _]) => key)
      .join(', ') : '';

    // Create user avatars HTML
    const userAvatars = location.users.slice(0, 5).map(user => {
      const initials = user.username.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
      const profileImage = user.profileImage ? 
        `<img src="${user.profileImage}" alt="${user.username}" class="w-6 h-6 rounded-full object-cover border-2 border-white shadow-sm" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />` : '';
      const fallback = `<div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm" style="display: ${user.profileImage ? 'none' : 'flex'};">${initials}</div>`;
      
      return `
        <div class="flex items-center gap-2 mb-2">
          <div class="relative">
            ${profileImage}
            ${fallback}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-800 truncate">${user.username}</div>
            <div class="text-xs text-gray-500 truncate">${user.email}</div>
          </div>
          ${user.deviceType ? `
            <div class="text-xs text-gray-400">
              ${user.deviceType === 'mobile' ? '📱' : user.deviceType === 'tablet' ? '📱' : '💻'}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="p-4 max-w-sm">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-3 h-3 rounded-full ${getMarkerColorClass(location.count)}"></div>
          <h3 class="font-bold text-lg">${location.city}, ${location.country}</h3>
        </div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Total Logins:</span>
            <span class="font-semibold text-green-600">${location.count}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Unique Users:</span>
            <span class="font-semibold text-blue-600">${location.userCount}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Total Activity:</span>
            <span class="font-semibold text-purple-600">${location.totalLogins}</span>
          </div>
          ${location.deviceStats ? `
            <div class="flex justify-between">
              <span class="text-gray-600">Devices:</span>
              <span class="font-semibold text-gray-700">
                📱${location.deviceStats.mobile} 💻${location.deviceStats.desktop} 📱${location.deviceStats.tablet}
              </span>
            </div>
          ` : ''}
          ${securityFlags ? `
            <div class="flex justify-between">
              <span class="text-gray-600">Security:</span>
              <span class="font-semibold text-red-600">⚠️ ${securityFlags}</span>
            </div>
          ` : ''}
        </div>
        <div class="mt-3 pt-3 border-t border-gray-200">
          <div class="text-xs font-medium text-gray-700 mb-2">Recent Users:</div>
          <div class="space-y-1">
            ${userAvatars}
          </div>
          ${location.users.length > 5 ? `
            <div class="text-xs text-gray-500 mt-2">
              +${location.users.length - 5} more users
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }, []);

  const getMarkerColor = (count: number) => {
    if (count >= 10) return '#ef4444'; // red
    if (count >= 5) return '#f97316'; // orange
    if (count >= 2) return '#eab308'; // yellow
    return '#22c55e'; // green
  };

  const getMarkerColorClass = (count: number) => {
    if (count >= 10) return 'bg-red-500';
    if (count >= 5) return 'bg-orange-500';
    if (count >= 2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Advanced utility functions
  const startRealTimeUpdates = useCallback(() => {
    if (realTimeIntervalRef.current) {
      clearInterval(realTimeIntervalRef.current);
    }
    
    realTimeIntervalRef.current = setInterval(() => {
      fetchMapData();
    }, refreshInterval * 1000);
  }, [refreshInterval, fetchMapData]);

  const stopRealTimeUpdates = useCallback(() => {
    if (realTimeIntervalRef.current) {
      clearInterval(realTimeIntervalRef.current);
      realTimeIntervalRef.current = null;
    }
  }, []);

  const startPlayback = useCallback(() => {
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }
    
    playbackIntervalRef.current = setInterval(() => {
      setCurrentTimeIndex(prev => {
        const next = prev + 1;
        if (next >= 24) { // 24 hours of data
          setPlaybackMode(false);
          return 0;
        }
        return next;
      });
    }, 1000 / playbackSpeed);
  }, [playbackSpeed]);

  const stopPlayback = useCallback(() => {
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
  }, []);

  const exportData = useCallback(async (format: 'json' | 'csv' | 'pdf') => {
    try {
      const params: any = { 
        format,
        days: timeRange
      };
      if (filterCountry && filterCountry !== 'all') params.country = filterCountry;
      if (filterDevice && filterDevice !== 'all') params.device = filterDevice;
      if (filterSecurity && filterSecurity !== 'all') params.security = filterSecurity;
      
      const response = await api.get('/admin/user-logins/export', {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user-logins-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error('Failed to export data');
    }
  }, [timeRange, filterCountry, filterDevice, filterSecurity]);

  const resetMap = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([20, 0], 2);
    }
    setSelectedLocation(null);
    setSearchQuery('');
    setFilterCountry('all');
    setFilterDevice('all');
    setFilterSecurity('all');
  }, []);

  const getDeviceIcon = useCallback((deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Globe2 className="w-4 h-4" />;
    }
  }, []);

  const getSecurityLevel = useCallback((location: LoginLocation) => {
    if (!location.securityFlags) return 'safe';
    const flags = Object.values(location.securityFlags).filter(Boolean).length;
    if (flags >= 3) return 'high';
    if (flags >= 1) return 'medium';
    return 'low';
  }, []);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.L || isInitializingRef.current) return;

    // Set initializing flag
    isInitializingRef.current = true;

    // Clean up existing map instance if it exists
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {}
      mapInstanceRef.current = null;
    }

    try {
      // Ensure the map container has proper dimensions
      if (mapRef.current) {
        mapRef.current.style.width = '100%';
        mapRef.current.style.height = '100%';
        mapRef.current.style.minHeight = '384px'; // 96 * 4 (h-96)
      }

      // Create map instance with proper options
      mapInstanceRef.current = window.L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        tap: true,
        tapTolerance: 15,
        trackResize: true,
        worldCopyJump: false,
        maxBounds: null,
        maxBoundsViscosity: 0.0,
        inertia: true,
        inertiaDeceleration: 3000,
        inertiaMaxSpeed: 3000,
        easeLinearity: 0.25,
        zoomAnimation: true,
        zoomAnimationThreshold: 4,
        fadeAnimation: true,
        markerZoomAnimation: true,
        transform3DLimit: 8388608,
        zoomSnap: 1,
        zoomDelta: 1,
        wheelDebounceTime: 40,
        wheelPxPerZoomLevel: 60,
        bounceAtZoomLimits: true
      });

      // Add tile layer based on map type
      const tileLayer = getTileLayer(mapType);
      tileLayer.addTo(mapInstanceRef.current);

      // Force a resize to ensure proper rendering
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);

      // Update markers if data is already loaded
      if (mapData.length > 0) {
        updateMapMarkers(mapData);
      }
    } catch (error) {
      console.error('Failed to initialize map:', error);
    } finally {
      // Reset initializing flag
      isInitializingRef.current = false;
    }
  }, [mapData, mapType, updateMapMarkers]);

  const getTileLayer = (type: string) => {
    switch (type) {
      case 'satellite':
        return window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 19,
          minZoom: 1,
          tileSize: 256,
          zoomOffset: 0
        });
      case 'dark':
        return window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
          minZoom: 1,
          tileSize: 256,
          zoomOffset: 0
        });
      default:
        return window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          minZoom: 1,
          tileSize: 256,
          zoomOffset: 0
        });
    }
  };

  useEffect(() => {
    // Load Leaflet CSS and JS
    const loadLeaflet = () => {
      if (window.L) {
        loadHeatmapPlugin();
        return;
      }

      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      cssLink.crossOrigin = '';
      document.head.appendChild(cssLink);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = loadHeatmapPlugin;
      document.head.appendChild(script);
    };

    const loadHeatmapPlugin = () => {
      // Load Leaflet.heat plugin
      const heatmapScript = document.createElement('script');
      heatmapScript.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
      heatmapScript.onload = loadClusteringPlugin;
      document.head.appendChild(heatmapScript);
    };

    const loadClusteringPlugin = () => {
      // Load Leaflet.markercluster plugin
      const clusteringCSS = document.createElement('link');
      clusteringCSS.rel = 'stylesheet';
      clusteringCSS.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css';
      document.head.appendChild(clusteringCSS);

      const clusteringScript = document.createElement('script');
      clusteringScript.src = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js';
      clusteringScript.onload = initializeMap;
      document.head.appendChild(clusteringScript);
    };

    loadLeaflet();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initializeMap]);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  // Real-time updates effect
  useEffect(() => {
    if (realTimeUpdates) {
      startRealTimeUpdates();
    } else {
      stopRealTimeUpdates();
    }

    return () => {
      stopRealTimeUpdates();
    };
  }, [realTimeUpdates, startRealTimeUpdates, stopRealTimeUpdates]);

  // Playback effect
  useEffect(() => {
    if (playbackMode) {
      startPlayback();
    } else {
      stopPlayback();
    }

    return () => {
      stopPlayback();
    };
  }, [playbackMode, startPlayback, stopPlayback]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchMapData();
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchMapData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRealTimeUpdates();
      stopPlayback();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [stopRealTimeUpdates, stopPlayback]);

  // Handle map resize when container changes
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        setTimeout(() => {
          mapInstanceRef.current.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString();
  };

  const handleMapTypeChange = (type: 'streets' | 'satellite' | 'dark') => {
    setMapType(type);
    if (mapInstanceRef.current) {
      // Remove existing tile layer and add new one
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer instanceof window.L.TileLayer) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });
      getTileLayer(type).addTo(mapInstanceRef.current);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            User Login Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading OpenStreetMap...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            User Login Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-red-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 font-medium">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchMapData}
                className="mt-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4 sm:p-6">
        {/* Map Controls */}
        <MapControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          filterCountry={filterCountry}
          setFilterCountry={setFilterCountry}
          filterDevice={filterDevice}
          setFilterDevice={setFilterDevice}
          mapType={mapType}
          setMapType={setMapType}
          heatmapMode={heatmapMode}
          setHeatmapMode={setHeatmapMode}
          clusteringEnabled={clusteringEnabled}
          setClusteringEnabled={setClusteringEnabled}
          realTimeUpdates={realTimeUpdates}
          setRealTimeUpdates={setRealTimeUpdates}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
          refreshInterval={refreshInterval}
          setRefreshInterval={setRefreshInterval}
          showAnalytics={showAnalytics}
          setShowAnalytics={setShowAnalytics}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
          onRefresh={fetchMapData}
          onReset={resetMap}
          onExport={exportData}
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          mapData={mapData}
          analytics={analytics}
        />

        {/* Main Content */}
        <div className="mt-2">
          {/* Map and Analytics */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Enhanced Analytics Dashboard */}
            {showAnalytics && analytics && (
              <AnalyticsDashboard analytics={analytics} />
            )}

            {/* Enhanced Map Container */}
            <MapContainer
              mapRef={mapRef}
              mapInstanceRef={mapInstanceRef}
              analytics={analytics}
              realTimeUpdates={realTimeUpdates}
              playbackMode={playbackMode}
              currentTimeIndex={currentTimeIndex}
              playbackSpeed={playbackSpeed}
              onPlayPause={() => setPlaybackMode(!playbackMode)}
              onSpeedChange={setPlaybackSpeed}
              onTimeChange={setCurrentTimeIndex}
              loading={loading && !mapReady}
              error={error}
            />
          
          {/* Map Initializer */}
          {!mapInstanceRef.current && (
            <MapInitializer
              mapRef={mapRef}
              mapInstanceRef={mapInstanceRef}
              mapType={mapType}
              onMapReady={() => {
                setMapReady(true);
              }}
            />
          )}
          
          {/* Map Markers */}
          {mapReady && mapInstanceRef.current && (
            <MapMarkers
              mapInstanceRef={mapInstanceRef}
              locations={mapData}
              heatmapMode={heatmapMode}
              clusteringEnabled={clusteringEnabled}
              formatTime={formatTime}
              getDeviceIcon={getDeviceIcon}
            />
          )}

          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-2">
                <Globe className="w-5 h-5 text-blue-600 mr-2" />
                <div className="text-2xl font-bold text-blue-600">{mapData.length}</div>
              </div>
              <div className="text-sm font-medium text-blue-700">Locations</div>
            </div>
            <div className="text-center p-4 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-green-600 mr-2" />
                <div className="text-2xl font-bold text-green-600">
                  {mapData.reduce((sum: number, loc: LoginLocation) => sum + loc.totalLogins, 0)}
                </div>
              </div>
              <div className="text-sm font-medium text-green-700">Total Logins</div>
            </div>
            <div className="text-center p-4 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-purple-600 mr-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {mapData.reduce((sum: number, loc: LoginLocation) => sum + loc.userCount, 0)}
                </div>
              </div>
              <div className="text-sm font-medium text-purple-700">Unique Users</div>
            </div>
            <div className="text-center p-4 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-orange-600 mr-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {Math.max(...mapData.map(loc => loc.count), 0)}
                </div>
              </div>
              <div className="text-sm font-medium text-orange-700">Most Active</div>
            </div>
          </div>

          {/* Advanced Analytics Charts */}
          {showAnalytics && analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Device Distribution */}
              <div className="p-4 rounded-xl border border-gray-200">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Device Distribution
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Mobile</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{analytics.deviceDistribution.mobile}</span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full" 
                          style={{ width: `${(analytics.deviceDistribution.mobile / Math.max(analytics.deviceDistribution.mobile + analytics.deviceDistribution.desktop + analytics.deviceDistribution.tablet, 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Desktop</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{analytics.deviceDistribution.desktop}</span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-600 rounded-full" 
                          style={{ width: `${(analytics.deviceDistribution.desktop / Math.max(analytics.deviceDistribution.mobile + analytics.deviceDistribution.desktop + analytics.deviceDistribution.tablet, 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tablet className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Tablet</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{analytics.deviceDistribution.tablet}</span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 rounded-full" 
                          style={{ width: `${(analytics.deviceDistribution.tablet / Math.max(analytics.deviceDistribution.mobile + analytics.deviceDistribution.desktop + analytics.deviceDistribution.tablet, 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Countries */}
              <div className="p-4 rounded-xl border border-gray-200">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Globe2 className="w-4 h-4" />
                  Top Countries
                </h4>
                <div className="space-y-2">
                  {analytics.topCountries.map((country, index) => (
                    <div key={country.country} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{index + 1}.</span>
                        <span className="text-sm">{country.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{country.count}</span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-600 rounded-full" 
                            style={{ width: `${(country.count / Math.max(...analytics.topCountries.map(c => c.count), 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Location Details */}
          {showDetails && selectedLocation && (
            <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {selectedLocation.city}, {selectedLocation.country}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedLocation.region && `${selectedLocation.region}, `}{selectedLocation.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedLocation.count}</div>
                      <div className="text-xs text-gray-500">Total Logins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedLocation.userCount}</div>
                      <div className="text-xs text-gray-500">Unique Users</div>
                    </div>
                    {selectedLocation.securityFlags && Object.values(selectedLocation.securityFlags).some(Boolean) && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {Object.values(selectedLocation.securityFlags).filter(Boolean).length}
                        </div>
                        <div className="text-xs text-red-500">Security Alerts</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                {/* Users */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Users ({selectedLocation.userCount})
                  </h4>
                  
                  {/* Debug Profile Images */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="space-y-2">
                      {selectedLocation.users.slice(0, 5).map((user) => (
                        <div key={user._id} className="flex items-center gap-2 p-2 rounded border">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profileImage} alt={user.username} />
                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{user.username}</div>
                            <div className="text-xs text-gray-500 truncate">{user.email}</div>
                          </div>
                          {user.lastLogin && (
                            <div className="text-xs text-gray-400">
                              {formatTime(user.lastLogin)}
                            </div>
                          )}
                        </div>
                      ))}
                      {selectedLocation.userCount > 5 && (
                        <div className="text-xs text-gray-500 text-center p-2">
                          +{selectedLocation.userCount - 5} more users
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Recent Logins */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Logins
                  </h4>
                  <div className="space-y-2">
                    {selectedLocation.recentLogins.map((login, index) => (
                      <div key={index} className="text-sm p-2 rounded border">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{login.username}</span>
                          <Badge variant="outline" className="text-xs">
                            {login.device}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(login.loginTime)} • {login.browser}
                        </div>
                        {login.ipAddress && (
                          <div className="text-xs text-gray-400">
                            IP: {login.ipAddress}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security & Analytics */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security & Analytics
                  </h4>
                  <div className="space-y-3">
                    {/* Device Stats */}
                    {selectedLocation.deviceStats && (
                      <div className="p-2 rounded border">
                        <div className="text-xs font-medium mb-1">Device Distribution</div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Mobile</span>
                            <span className="font-medium">{selectedLocation.deviceStats.mobile}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span>Desktop</span>
                            <span className="font-medium">{selectedLocation.deviceStats.desktop}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span>Tablet</span>
                            <span className="font-medium">{selectedLocation.deviceStats.tablet}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Security Flags */}
                    {selectedLocation.securityFlags && (
                      <div className="p-2 rounded border">
                        <div className="text-xs font-medium mb-1">Security Status</div>
                        <div className="space-y-1">
                          {Object.entries(selectedLocation.securityFlags).map(([flag, value]) => (
                            <div key={flag} className="flex items-center justify-between text-xs">
                              <span className="capitalize">{flag}</span>
                              <Badge variant={value ? "destructive" : "secondary"} className="text-xs">
                                {value ? "Yes" : "No"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Browser Stats */}
                    {selectedLocation.browserStats && (
                      <div className="p-2 rounded border">
                        <div className="text-xs font-medium mb-1">Browser Usage</div>
                        <div className="space-y-1">
                          {Object.entries(selectedLocation.browserStats).map(([browser, count]) => (
                            <div key={browser} className="flex items-center justify-between text-xs">
                              <span className="capitalize">{browser}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Location List */}
          {showDetails && (
            <div className="space-y-2">
              <h4 className="font-medium">All Locations</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {mapData.map((location, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded border cursor-pointer"
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getMarkerColorClass(location.count)}`} />
                      <span className="font-medium">{location.city}</span>
                      <span className="text-sm text-gray-500">({location.country})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{location.count} logins</Badge>
                      <Badge variant="secondary">{location.userCount} users</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar for Details */}
        <div className="space-y-4 sm:space-y-6">
          {/* Location Details */}
          {selectedLocation && (
            <LocationDetails 
              location={selectedLocation}
              formatTime={formatTime}
              getDeviceIcon={getDeviceIcon}
            />
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);
} 