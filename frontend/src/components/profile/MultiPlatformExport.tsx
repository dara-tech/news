'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Download, Globe, CheckCircle, Loader2, Zap, Settings, Palette } from 'lucide-react';
import { PlatformConfig, getRecommendedPlatforms, getAllPlatforms } from '@/lib/platformConfigs';
import { ProfileImageStyle } from '@/hooks/useGenerateProfileImage';
import { SocialIcon } from '@/components/ui/social-icons';

interface MultiPlatformExportProps {
  username: string;
  selectedStyle: ProfileImageStyle | null;
  customColors: string[];
  onGenerateForPlatform: (platform: string, style: ProfileImageStyle, colors: string[]) => Promise<File | null>;
  isGenerating: boolean;
}

interface ExportResult {
  platform: string;
  file: File | null;
  style: ProfileImageStyle;
  colors: string[];
  generatedAt: Date;
}

export const MultiPlatformExport = ({ 
  username, 
  selectedStyle, 
  customColors, 
  onGenerateForPlatform,
  isGenerating 
}: MultiPlatformExportProps) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin', 'twitter', 'github']);
  const [exportResults, setExportResults] = useState<ExportResult[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const recommendedPlatforms = useMemo(() => getRecommendedPlatforms(), []);
  const allPlatforms = useMemo(() => getAllPlatforms(), []);

  const handlePlatformToggle = useCallback((platformName: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformName) 
        ? prev.filter(p => p !== platformName)
        : [...prev, platformName]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedPlatforms(allPlatforms.map(p => p.name));
  }, [allPlatforms]);

  const handleSelectRecommended = useCallback(() => {
    setSelectedPlatforms(recommendedPlatforms.map(p => p.name));
  }, [recommendedPlatforms]);

  const handleClearAll = useCallback(() => {
    setSelectedPlatforms([]);
  }, []);

  const handleBatchExport = useCallback(async () => {
    if (!selectedStyle || selectedPlatforms.length === 0) {
      return;
    }

    setIsExporting(true);
    const results: ExportResult[] = [];

    try {
      for (const platformName of selectedPlatforms) {
        const file = await onGenerateForPlatform(platformName, selectedStyle, customColors);
        results.push({
          platform: platformName,
          file,
          style: selectedStyle,
          colors: customColors,
          generatedAt: new Date()
        });
      }

      setExportResults(results);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [selectedStyle, selectedPlatforms, customColors, onGenerateForPlatform]);

  const handleDownloadAll = useCallback(() => {
    exportResults.forEach(result => {
      if (result.file) {
        const url = URL.createObjectURL(result.file);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${username}-${result.platform}-profile.${result.file.name.split('.').pop()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  }, [exportResults, username]);

  const handleDownloadSingle = useCallback((result: ExportResult) => {
    if (result.file) {
      const url = URL.createObjectURL(result.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${username}-${result.platform}-profile.${result.file.name.split('.').pop()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [username]);

  const getPlatformIcon = useCallback((platform: PlatformConfig) => {
    return (
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
        style={{ backgroundColor: platform.color }}
      >
        <SocialIcon platform={platform.name} size={20} className="text-white" />
      </div>
    );
  }, []);

  const isExportDisabled = !selectedStyle || selectedPlatforms.length === 0 || isGenerating;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Multi-Platform Export
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate character avatars for all platforms
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Platform Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Select Platforms ({selectedPlatforms.length})
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleSelectRecommended}
              className="text-xs px-2 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            >
              Recommended
            </button>
            <button
              onClick={handleSelectAll}
              className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
            >
              All
            </button>
            <button
              onClick={handleClearAll}
              className="text-xs px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {allPlatforms.map((platform) => (
            <button
              key={platform.name}
              onClick={() => handlePlatformToggle(platform.name)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                selectedPlatforms.includes(platform.name)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                {getPlatformIcon(platform)}
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {platform.displayName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {platform.dimensions.width}×{platform.dimensions.height}
                  </div>
                </div>
              </div>
              {selectedPlatforms.includes(platform.name) && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Platform-Specific Styles
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedPlatforms.map(platformName => {
              const platform = allPlatforms.find(p => p.name === platformName);
              if (!platform) return null;
              
              return (
                <div key={platformName} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3 mb-3">
                    {getPlatformIcon(platform)}
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {platform.displayName}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Recommended:</span> {platform.recommendedStyles.join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleBatchExport}
        disabled={isExportDisabled}
        className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        {isExporting ? (
          <>
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            Generating {selectedPlatforms.length} profile pictures...
          </>
        ) : (
          <>
            <Zap className="mr-3 h-5 w-5" />
            Generate for {selectedPlatforms.length} Platforms
          </>
        )}
      </button>

      {/* Export Results */}
      {exportResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Generated Results ({exportResults.length})
            </h4>
            <button
              onClick={handleDownloadAll}
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            >
              <Download className="mr-1 h-3 w-3" />
              Download All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exportResults.map((result, index) => {
              const platform = allPlatforms.find(p => p.name === result.platform);
              if (!platform) return null;

              return (
                <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getPlatformIcon(platform)}
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {platform.displayName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {result.style} • {result.generatedAt.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadSingle(result)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};