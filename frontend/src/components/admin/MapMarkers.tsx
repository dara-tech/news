'use client';

import { useEffect, useRef } from 'react';
import { MapUtils } from './MapUtils';

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

interface MapMarkersProps {
  mapInstanceRef: React.MutableRefObject<any>;
  locations: LoginLocation[];
  heatmapMode: boolean;
  clusteringEnabled: boolean;
  formatTime: (timeString: string) => string;
  getDeviceIcon: (deviceType: string) => React.ReactNode;
}

export default function MapMarkers({
  mapInstanceRef,
  locations,
  heatmapMode,
  clusteringEnabled,
  formatTime,
  getDeviceIcon
}: MapMarkersProps) {
  const markersRef = useRef<any[]>([]);
  const heatmapRef = useRef<any>(null);
  const clusterRef = useRef<any>(null);

  const createCustomMarker = (location: LoginLocation) => {
    if (!window.L) return null;

    const size = MapUtils.getMarkerSize(location.count);
    const color = MapUtils.getMarkerColor(location.count);

    const marker = window.L.circleMarker([location.coordinates.latitude, location.coordinates.longitude], {
      radius: size,
      fillColor: color,
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    });

    const popupContent = createPopupContent(location, formatTime, getDeviceIcon);
    marker.bindPopup(popupContent, {
      maxWidth: 400,
      className: 'custom-popup'
    });

    return marker;
  };

  const createCustomIcon = (count: number) => {
    const size = MapUtils.getMarkerSize(count);
    const color = MapUtils.getMarkerColor(count);

    return window.L.divIcon({
      html: `<div style="
        width: ${size * 2}px;
        height: ${size * 2}px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${Math.max(10, size - 4)}px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${count}</div>`,
      className: 'custom-cluster-icon',
      iconSize: [size * 2, size * 2],
      iconAnchor: [size, size]
    });
  };

  const createPopupContent = (location: LoginLocation, formatTime: (timeString: string) => string, getDeviceIcon: (deviceType: string) => React.ReactNode) => {
    const securityLevel = location.securityFlags ? MapUtils.getSecurityLevel(location.securityFlags) : 'low';
    const securityColor = securityLevel === 'high' ? 'red' : securityLevel === 'medium' ? 'orange' : 'green';

    return `
      <div class="p-4 max-w-sm">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="font-semibold text-lg text-gray-800">${location.city}, ${location.country}</h3>
            <p class="text-sm text-gray-600">${location.region && `${location.region}, `}${location.country}</p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-blue-600">${location.count}</div>
            <div class="text-xs text-gray-500">Total Logins</div>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-3">
          <div class="text-center p-2 bg-blue-50 rounded">
            <div class="text-lg font-bold text-blue-600">${location.userCount}</div>
            <div class="text-xs text-blue-600">Unique Users</div>
          </div>
          <div class="text-center p-2 bg-${securityColor}-50 rounded">
            <div class="text-lg font-bold text-${securityColor}-600">${location.securityFlags ? Object.values(location.securityFlags).filter(Boolean).length : 0}</div>
            <div class="text-xs text-${securityColor}-600">Security Alerts</div>
          </div>
        </div>
        
        ${location.deviceStats ? `
        <div class="mb-3">
          <h4 class="font-medium text-sm text-gray-700 mb-2">Device Distribution</h4>
          <div class="space-y-1">
            <div class="flex justify-between text-xs">
              <span>Mobile</span>
              <span class="font-medium">${location.deviceStats.mobile}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span>Desktop</span>
              <span class="font-medium">${location.deviceStats.desktop}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span>Tablet</span>
              <span class="font-medium">${location.deviceStats.tablet}</span>
            </div>
          </div>
        </div>
        ` : ''}
        
        ${location.securityFlags ? `
        <div class="mb-3">
          <h4 class="font-medium text-sm text-gray-700 mb-2">Security Status</h4>
          <div class="space-y-1">
            ${Object.entries(location.securityFlags).map(([flag, value]) => `
              <div class="flex justify-between text-xs">
                <span class="capitalize">${flag}</span>
                <span class="font-medium ${value ? 'text-red-600' : 'text-green-600'}">${value ? 'Yes' : 'No'}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <div class="border-t pt-3">
          <h4 class="font-medium text-sm text-gray-700 mb-2">Recent Users</h4>
          <div class="space-y-2 max-h-32 overflow-y-auto">
            ${location.users.slice(0, 3).map(user => `
              <div class="flex items-center gap-2 p-1 rounded hover:bg-gray-50">
                <div class="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  ${user.username.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-medium text-gray-800 truncate">${user.username}</div>
                  <div class="text-xs text-gray-500 truncate">${user.email}</div>
                </div>
                <div class="text-xs">${user.deviceType ? getDeviceIcon(user.deviceType) : '❓'}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  };

  const updateMapMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear existing markers, heatmap, and clusters
    markersRef.current.forEach(marker => {
      if (marker && marker.remove) marker.remove();
    });
    markersRef.current = [];

    if (heatmapRef.current) {
      heatmapRef.current.remove();
      heatmapRef.current = null;
    }

    if (clusterRef.current) {
      clusterRef.current.remove();
      clusterRef.current = null;
    }

    if (locations.length === 0) return;

    // Create heatmap
    if (heatmapMode && window.L.heatLayer) {
      const heatmapData = locations.map(loc => [
        loc.coordinates.latitude,
        loc.coordinates.longitude,
        loc.count
      ]);

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
      });

      heatmapRef.current.addTo(mapInstanceRef.current);
      return;
    }

    // Create clusters
    if (clusteringEnabled && window.L.markerClusterGroup) {
      clusterRef.current = window.L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          return createCustomIcon(count);
        }
      });

      locations.forEach(location => {
        const marker = createCustomMarker(location);
        if (marker) {
          clusterRef.current.addLayer(marker);
          markersRef.current.push(marker);
        }
      });

      clusterRef.current.addTo(mapInstanceRef.current);
      return;
    }

    // Create individual markers
    locations.forEach(location => {
      const marker = createCustomMarker(location);
      if (marker) {
        marker.addTo(mapInstanceRef.current);
        markersRef.current.push(marker);
      }
    });
  };

  useEffect(() => {
    updateMapMarkers();
  }, [locations, heatmapMode, clusteringEnabled]);

  return null; // This component doesn't render anything
} 