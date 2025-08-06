'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

import { 
  FiSearch, 
  FiClock, 
  FiGlobe, 
  FiSmartphone, 
  FiRefreshCw, 
  FiRotateCcw, 
  FiBarChart, 
  FiEye, 
  FiDownload, 

  FiTarget, 
  FiFilter,

  FiPlay,

  FiActivity,
  FiX,
  FiMap
} from 'react-icons/fi';
import { 
  HiOutlineGlobeAlt,
  HiOutlineDevicePhoneMobile,
  HiOutlineComputerDesktop,
  HiOutlineDeviceTablet
} from 'react-icons/hi2';
import { 
  BiWorld,
  BiMap,
  BiLayer,
  BiBarChart
} from 'react-icons/bi';
import { 
  MdOutlineMyLocation,
  MdOutlineGroupWork,
  MdOutlineWhatshot,
  MdOutlineStreetview,
  MdOutlineSatellite,
  MdOutlineDarkMode
} from 'react-icons/md';
import { useState } from 'react';

interface MapControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  timeRange: string;
  setTimeRange: (range: string) => void;
  filterCountry: string;
  setFilterCountry: (country: string) => void;
  filterDevice: string;
  setFilterDevice: (device: string) => void;
  mapType: 'streets' | 'satellite' | 'dark';
  setMapType: (type: 'streets' | 'satellite' | 'dark') => void;
  heatmapMode: boolean;
  setHeatmapMode: (mode: boolean) => void;
  clusteringEnabled: boolean;
  setClusteringEnabled: (enabled: boolean) => void;
  realTimeUpdates: boolean;
  setRealTimeUpdates: (enabled: boolean) => void;
  autoRefresh: boolean;
  setAutoRefresh: (enabled: boolean) => void;
  refreshInterval: number;
  setRefreshInterval: (interval: number) => void;
  showAnalytics: boolean;
  setShowAnalytics: (show: boolean) => void;
  showDetails: boolean;
  setShowDetails: (show: boolean) => void;
  onRefresh: () => void;
  onReset: () => void;
  onExport: (format: 'json' | 'csv' | 'pdf') => void;
  exportFormat: 'json' | 'csv' | 'pdf';
  setExportFormat: (format: 'json' | 'csv' | 'pdf') => void;
  mapData: any[];
  analytics: any;
}

export default function MapControls({
  searchQuery,
  setSearchQuery,
  timeRange,
  setTimeRange,
  filterCountry,
  setFilterCountry,
  filterDevice,
  setFilterDevice,
  mapType,
  setMapType,
  heatmapMode,
  setHeatmapMode,
  clusteringEnabled,
  setClusteringEnabled,
  realTimeUpdates,
  setRealTimeUpdates,
  autoRefresh,
  setAutoRefresh,
  refreshInterval,
  setRefreshInterval,
  showAnalytics,
  setShowAnalytics,
  showDetails,
  setShowDetails,
  onRefresh,
  onReset,
  onExport,
  exportFormat,
  setExportFormat,
  mapData,
  analytics
}: MapControlsProps) {
  const handleViewModeChange = (value: string) => {
    if (value === 'heatmap') {
      setHeatmapMode(true);
      setClusteringEnabled(false);
    } else if (value === 'clusters') {
      setHeatmapMode(false);
      setClusteringEnabled(true);
    } else {
      setHeatmapMode(false);
      setClusteringEnabled(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="w-full space-y-4 rounded-xl">
        {/* Advanced Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Title and Status */}
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
              <FiGlobe className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold  tracking-tight">Login Analytics Map</h2>
              <div className="flex items-center gap-3">
                {analytics && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <Badge variant="secondary" className=" text-blue-700 b">
                        {analytics.totalLogins?.toLocaleString()} Logins
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {analytics.totalUsers?.toLocaleString()} Users
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <Badge variant="outline" className=" text-purple-700 ">
                        {mapData.length} Locations
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg  shadow-sm ">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={realTimeUpdates ? "default" : "ghost"}
                    onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                    className={`h-8  ${realTimeUpdates ? 'bg-green-500 hover:bg-green-600 text-white shadow-md' : ''}`}
                  >
                    {realTimeUpdates ? (
                      <div className="flex items-center gap-2">
                        <FiActivity className=" animate-pulse" />
                        <span className="text-xs font-medium">Live</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FiPlay className="" />
                        <span className="text-xs">Enable Live</span>
                      </div>
                    )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {realTimeUpdates ? 'Disable real-time updates' : 'Enable real-time updates'}
                </TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-8" />

            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onRefresh}
                    className="h-8 px-3 0 transition-all duration-200"
                  >
                    <FiRefreshCw className="w-4 h-4 mr-2" />
                    <span className="text-xs">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Refresh data</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onReset}
                    className="h-8 px-3 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  >
                    <FiRotateCcw className="w-4 h-4 mr-2" />
                    <span className="text-xs">Reset</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Reset all filters</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

        {/* Enhanced Search Section */}
        <div className="space-y-4">
          <div className="relative w-full">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search locations, cities, countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 "
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <FiX className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Primary Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Visualization Mode */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FiTarget className="w-4 h-4" />
              Visualization
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Select 
                  value={heatmapMode ? 'heatmap' : clusteringEnabled ? 'clusters' : 'markers'} 
                  onValueChange={handleViewModeChange}
                >
                  <SelectTrigger className="h-11 w-full shadow-smt transition-all duration-200">
                    <SelectValue />
              
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="markers">
                      <div className="flex items-center gap-2">
                        <MdOutlineMyLocation className="w-4 h-4" />
                        Markers
                      </div>
                    </SelectItem>
                    <SelectItem value="clusters">
                      <div className="flex items-center gap-2">
                        <MdOutlineGroupWork className="w-4 h-4" />
                        Clusters
                      </div>
                    </SelectItem>
                    <SelectItem value="heatmap">
                      <div className="flex items-center gap-2">
                        <MdOutlineWhatshot className="w-4 h-4" />
                        Heatmap
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>Change how data is displayed on the map</TooltipContent>
            </Tooltip>
          </div>

          {/* Map Style */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FiMap className="w-4 h-4" />
              Map Style
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Select value={mapType} onValueChange={setMapType}>
                  <SelectTrigger className="h-11 w-full shadow-sm hover:border-gray-300 transition-all duration-200">
                    <SelectValue />
              
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="streets">
                      <div className="flex items-center gap-2">
                        <MdOutlineStreetview className="w-4 h-4" />
                        Streets
                      </div>
                    </SelectItem>
                    <SelectItem value="satellite">
                      <div className="flex items-center gap-2">
                        <MdOutlineSatellite className="w-4 h-4" />
                        Satellite
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <MdOutlineDarkMode className="w-4 h-4" />
                        Dark Mode
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>Choose map appearance</TooltipContent>
            </Tooltip>
          </div>

          {/* Time Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FiClock className="w-4 h-4" />
              Time Period
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="h-11  w-full shadow-sm hover:border-gray-300 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 24 hours</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>Filter data by time range</TooltipContent>
            </Tooltip>
          </div>

          {/* Export */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FiDownload className="w-4 h-4" />
              Export Data
            </Label>
            <div className="flex gap-2">
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="h-11 flex-1  shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => onExport(exportFormat)}
                    className=" bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                  >
                    <FiDownload className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export current data</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* Secondary Filters and Toggles */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <FiFilter className="w-4 h-4" />
              Filters:
            </Label>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Select value={filterCountry} onValueChange={setFilterCountry}>
                  <SelectTrigger className="h-9 w-fit  shadow-sm text-sm">
    
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2 ">
                        <BiWorld className="w-4 h-4" />
                        All Countries
                      </div>
                    </SelectItem>
                    {mapData.map(loc => loc.country).filter((v, i, a) => a.indexOf(v) === i).map(country => (
                      <SelectItem key={country} value={country}>
                        <div className="flex items-center gap-2">
                          <HiOutlineGlobeAlt className="w-4 h-4" />
                          {country}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>Filter by country</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Select value={filterDevice} onValueChange={setFilterDevice}>
                  <SelectTrigger className="h-9 w-fit  shadow-sm text-sm">
 
                    <SelectValue placeholder="All Devices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <FiSmartphone className="w-4 h-4" />
                        All Devices
                      </div>
                    </SelectItem>
                    <SelectItem value="mobile">
                      <div className="flex items-center gap-2">
                        <HiOutlineDevicePhoneMobile className="w-4 h-4" />
                        Mobile
                      </div>
                    </SelectItem>
                    <SelectItem value="desktop">
                      <div className="flex items-center gap-2">
                        <HiOutlineComputerDesktop className="w-4 h-4" />
                        Desktop
                      </div>
                    </SelectItem>
                    <SelectItem value="tablet">
                      <div className="flex items-center gap-2">
                        <HiOutlineDeviceTablet className="w-4 h-4" />
                        Tablet
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>Filter by device type</TooltipContent>
            </Tooltip>
          </div>

          {/* Toggle Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3  rounded-lg  shadow-sm p-1 ">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showAnalytics ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className={`h-8 px-3 ${showAnalytics ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-gray-100'}`}
                  >
                    <BiBarChart className="w-4 h-4 mr-2" />
                    <span className="text-xs">Analytics</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle analytics dashboard</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showDetails ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className={`h-8 px-3 ${showDetails ? 'bg-purple-500 text-white shadow-md' : 'hover:bg-gray-100'}`}
                  >
                    <FiEye className="w-4 h-4 mr-2" />
                    <span className="text-xs">Details</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle location details panel</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={autoRefresh ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`h-8 px-3 ${autoRefresh ? 'bg-green-500 text-white shadow-md' : 'hover:bg-gray-100'}`}
                  >
                    <FiRefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                    <span className="text-xs">Auto</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle auto-refresh</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Auto-refresh Configuration */}
        {autoRefresh && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiRefreshCw className="w-4 h-4 text-green-600 animate-spin" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-green-800">Auto-refresh Active</Label>
                  <p className="text-xs text-green-600">Data will refresh automatically</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-sm text-green-700">Interval:</Label>
                <Select 
                  value={refreshInterval.toString()} 
                  onValueChange={(value) => setRefreshInterval(parseInt(value))}
                >
                  <SelectTrigger className="h-8 w-20  text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10s</SelectItem>
                    <SelectItem value="30">30s</SelectItem>
                    <SelectItem value="60">1m</SelectItem>
                    <SelectItem value="300">5m</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
} 