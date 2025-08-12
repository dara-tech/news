import React from 'react';
import { CheckCircle, AlertTriangle, Activity } from 'lucide-react';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
    case 'up': return 'text-green-600 bg-green-50';
    case 'warning':
    case 'slow': return 'text-yellow-600 bg-yellow-50';
    case 'error':
    case 'down': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
    case 'up': return React.createElement(CheckCircle, { className: "h-4 w-4" });
    case 'warning':
    case 'slow': return React.createElement(AlertTriangle, { className: "h-4 w-4" });
    case 'error':
    case 'down': return React.createElement(AlertTriangle, { className: "h-4 w-4" });
    default: return React.createElement(Activity, { className: "h-4 w-4" });
  }
};

export const getUsageColor = (usage: number) => {
  if (usage >= 80) return 'bg-red-500';
  if (usage >= 60) return 'bg-yellow-500';
  return 'bg-green-500';
};

export const humanizeMs = (ms: number) => {
  if (!ms || ms < 1000) return `${ms} ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m${r ? ` ${r}s` : ''}`;
};

export const timeLeft = (iso?: string | null) => {
  if (!iso) return null;
  const left = new Date(iso).getTime() - Date.now();
  return left > 0 ? humanizeMs(left) : null;
};

export const getDefaultSettings = () => ({
  maxPerRun: 3,
  contentBalance: { local: 30, international: 40, tech: 20, development: 10 },
  filtering: { enableLocalKeywords: true, enableGlobalKeywords: true, enableHighPrioritySources: true, enableTechSources: true },
  keywords: { local: [], global: [] }
});

// New Sentinel Control Functions
export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const calculateSentinelStats = (runtime: any) => {
  return {
    efficiency: runtime?.lastProcessed && runtime?.lastCreated 
      ? Math.round((runtime.lastProcessed / runtime.lastCreated) * 100) 
      : 0,
    avgProcessingTime: runtime?.lastRunAt && runtime?.lastCreated
      ? Math.round((Date.now() - new Date(runtime.lastRunAt).getTime()) / runtime.lastCreated)
      : 0,
    successRate: runtime?.lastProcessed && runtime?.lastCreated
      ? Math.round((runtime.lastProcessed / runtime.lastCreated) * 100)
      : 0
  };
};

export const getSentinelHealthStatus = (sentinel: any, runtime: any) => {
  if (!sentinel?.enabled) return 'disabled';
  if (runtime?.running) return 'running';
  if (runtime?.cooldownUntil && timeLeft(runtime.cooldownUntil)) return 'cooldown';
  return 'ready';
};

export const validateSentinelConfig = (config: any) => {
  const errors: string[] = [];
  
  if (config.frequencyMs < 5000) {
    errors.push('Frequency must be at least 5 seconds');
  }
  
  if (config.settings?.maxPerRun < 1 || config.settings?.maxPerRun > 50) {
    errors.push('Max per run must be between 1 and 50');
  }
  
  const balance = config.settings?.contentBalance;
  if (balance) {
    const total = Object.values(balance).reduce((sum: any, val: any) => sum + val, 0);
    if (total !== 100) {
      errors.push('Content balance percentages must total 100%');
    }
  }
  
  return errors;
};

export const getResourceUsage = () => {
  // Mock resource usage - in real implementation, this would fetch from system
  return {
    memory: Math.floor(Math.random() * 30) + 20,
    cpu: Math.floor(Math.random() * 40) + 30,
    disk: Math.floor(Math.random() * 20) + 10,
    network: Math.floor(Math.random() * 50) + 20
  };
};

export const getSentinelMetrics = (runtime: any) => {
  return {
    totalRuns: runtime?.totalRuns || 0,
    totalArticlesProcessed: runtime?.totalProcessed || 0,
    totalArticlesCreated: runtime?.totalCreated || 0,
    averageRunTime: runtime?.avgRunTime || 0,
    lastRunDuration: runtime?.lastRunDuration || 0,
    errorCount: runtime?.errorCount || 0,
    successRate: runtime?.successRate || 0
  };
};

export const formatSentinelLog = (log: any) => {
  const timestamp = new Date(log.timestamp).toLocaleString();
  const level = log.level.toUpperCase();
  const message = log.message;
  
  return {
    timestamp,
    level,
    message,
    formatted: `[${timestamp}] ${level}: ${message}`
  };
};

export const getSentinelRecommendations = (metrics: any, config: any) => {
  const recommendations: string[] = [];
  
  if (metrics.successRate < 80) {
    recommendations.push('Consider adjusting content filtering criteria');
  }
  
  if (metrics.averageRunTime > 300000) { // 5 minutes
    recommendations.push('Consider reducing max articles per run');
  }
  
  if (config.frequencyMs < 60000) { // 1 minute
    recommendations.push('High frequency may impact system performance');
  }
  
  if (metrics.errorCount > 5) {
    recommendations.push('Check source availability and network connectivity');
  }
  
  return recommendations;
};
