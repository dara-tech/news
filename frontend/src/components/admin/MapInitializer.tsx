'use client';

import { useEffect, useRef } from 'react';
import { MapUtils } from './MapUtils';

interface MapInitializerProps {
  mapRef: React.RefObject<HTMLDivElement | null>;
  mapInstanceRef: React.MutableRefObject<any>;
  mapType: string;
  onMapReady: () => void;
}

export default function MapInitializer({
  mapRef,
  mapInstanceRef,
  mapType,
  onMapReady
}: MapInitializerProps) {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current || !mapRef.current) return;

    const loadLeaflet = () => {
      return new Promise<void>((resolve) => {
        if (window.L) {
          resolve();
          return;
        }

        // Check if CSS is already loaded
        const existingCSS = document.querySelector('link[href*="leaflet.css"]');
        if (!existingCSS) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Check if JS is already loaded
        const existingScript = document.querySelector('script[src*="leaflet.js"]');
        if (existingScript) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    const loadHeatmapPlugin = () => {
      return new Promise<void>((resolve) => {
        if (window.L.heatLayer) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
        script.onload = () => resolve();
        script.onerror = () => resolve(); // Continue even if heatmap fails
        document.head.appendChild(script);
      });
    };

    const loadClusteringPlugin = () => {
      return new Promise<void>((resolve) => {
        if (window.L.markerClusterGroup) {
          resolve();
          return;
        }

        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css';
        document.head.appendChild(link);

        // Load JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js';
        script.onload = () => resolve();
        script.onerror = () => resolve(); // Continue even if clustering fails
        document.head.appendChild(script);
      });
    };

    const initializeMap = () => {
      if (!window.L || !mapRef.current) return;

      // Check if map is already initialized
      if (mapInstanceRef.current) {
        console.log('Map already initialized, skipping...');
        return;
      }

      // Ensure map container has proper dimensions and is visible
      if (mapRef.current) {
        mapRef.current.style.width = '100%';
        mapRef.current.style.height = '100%';
        mapRef.current.style.minHeight = '384px';
        mapRef.current.style.position = 'relative';
        mapRef.current.style.zIndex = '1';
        mapRef.current.style.display = 'block';
      }

      try {
        console.log('Initializing map...', { mapRef: mapRef.current, mapType });
        
        // Initialize map with comprehensive options
        mapInstanceRef.current = window.L.map(mapRef.current, {
          center: [20, 0],
          zoom: 2,
          dragging: true,
          zoomControl: false,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
          keyboard: true,
          inertia: true,
          inertiaDeceleration: 3000,
          inertiaMaxSpeed: 3000,
          easeLinearity: 0.2,
          worldCopyJump: false,
          maxBounds: null,
          maxBoundsViscosity: 0.0,
          tap: true,
          tapTolerance: 15,
          trackResize: true,
          closePopupOnClick: true,
          bounceAtZoomLimits: true
        });

        // Add tile layer
        const { url, options } = MapUtils.getTileLayer(mapType);
        console.log('Adding tile layer:', { url, options });
        const tileLayer = window.L.tileLayer(url, options);
        tileLayer.addTo(mapInstanceRef.current);

        // Force proper rendering with multiple attempts
        const forceRender = () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
            console.log('Map size invalidated');
          }
        };

        // Multiple attempts to ensure proper rendering
        setTimeout(forceRender, 100);
        setTimeout(forceRender, 500);
        setTimeout(forceRender, 1000);

        isInitialized.current = true;
        onMapReady();
        console.log('Map initialized successfully');
      } catch (error) {
        console.error('Failed to initialize map:', error);
        mapInstanceRef.current = null;
        isInitialized.current = false;
      }
    };

    const initializeMapAsync = async () => {
      try {
        await loadLeaflet();
        await loadHeatmapPlugin();
        await loadClusteringPlugin();
        initializeMap();
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initializeMapAsync();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.log('Map already removed or not initialized');
        }
        mapInstanceRef.current = null;
      }
      isInitialized.current = false;
    };
  }, [mapRef, mapInstanceRef, mapType, onMapReady]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mapInstanceRef]);

  return null; // This component doesn't render anything
} 