'use client';

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  Navigation, 
  Target, 
  AlertTriangle 
} from 'lucide-react';

interface MapContainerProps {
  mapRef: React.RefObject<HTMLDivElement | null>;
  mapInstanceRef: React.MutableRefObject<any>;
  analytics: any;
  realTimeUpdates: boolean;
  playbackMode: boolean;
  currentTimeIndex: number;
  playbackSpeed: number;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onTimeChange: (index: number) => void;
  loading?: boolean;
  error?: string | null;
}

export default function MapContainer({
  mapRef,
  mapInstanceRef,
  analytics,
  realTimeUpdates,
  playbackMode,
  currentTimeIndex,
  playbackSpeed,
  onPlayPause,
  onSpeedChange,
  onTimeChange,
  loading = false,
  error = null
}: MapContainerProps) {
  return (
    <div className="relative h-80 sm:h-96 rounded-xl border border-gray-200 overflow-hidden shadow-lg bg-gray-50">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-75 z-20">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️</div>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="w-full h-full relative z-10"
        style={{ 
          minHeight: '320px',
          position: 'relative',
          overflow: 'hidden',
          display: 'block',
          backgroundColor: '#f8fafc'
        }}
      />
      
      {/* Map Legend */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-xl border border-gray-200 max-w-[200px] sm:max-w-none">
        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
          <Target className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
          <span className="text-xs sm:text-sm font-semibold text-gray-700">Activity</span>
        </div>
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full shadow-sm"></div>
            <span className="text-xs text-gray-600">Low (1-2)</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full shadow-sm"></div>
            <span className="text-xs text-gray-600">Medium (3-4)</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-3 h-3 sm:w-5 sm:h-5 bg-orange-500 rounded-full shadow-sm"></div>
            <span className="text-xs text-gray-600">High (5-9)</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-3 h-3 sm:w-6 sm:h-6 bg-red-500 rounded-full shadow-sm"></div>
            <span className="text-xs text-gray-600">Critical (10+)</span>
          </div>
        </div>
        
        {/* Security Status */}
        {analytics && analytics.securityAlerts > 0 && (
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
              <span className="text-xs font-semibold text-red-600">Alerts</span>
            </div>
            <div className="text-xs text-red-600 font-medium">{analytics.securityAlerts} active</div>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-full px-2 sm:px-4 py-1 sm:py-2 shadow-xl border border-gray-200">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${realTimeUpdates ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-xs font-semibold text-gray-700">
            {realTimeUpdates ? 'LIVE' : 'STATIC'}
          </span>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-xl border border-gray-200">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-7 h-7 sm:w-8 sm:h-8 p-0 hover:bg-blue-50"
          >
            <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-7 h-7 sm:w-8 sm:h-8 p-0 hover:bg-blue-50"
          >
            <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <div className="w-px h-5 sm:h-6 bg-gray-300"></div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => mapInstanceRef.current?.setView([20, 0], 2)}
            className="text-xs px-1.5 sm:px-2 py-1"
          >
            <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>

      {/* Playback Controls */}
      {playbackMode && (
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-xl border border-gray-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onPlayPause}
              className="w-7 h-7 sm:w-8 sm:h-8 p-0"
            >
              <Navigation className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <div className="flex items-center gap-1 sm:gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={currentTimeIndex}
                onChange={(e) => onTimeChange(parseInt(e.target.value))}
                className="w-16 sm:w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-600">{currentTimeIndex}%</span>
            </div>
            <select
              value={playbackSpeed}
              onChange={(e) => onSpeedChange(parseInt(e.target.value))}
              className="text-xs border border-gray-300 rounded px-1 sm:px-2 py-1"
            >
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={5}>5x</option>
              <option value={10}>10x</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
} 