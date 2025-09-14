export interface SystemMetrics {
  server: {
    uptime: string;
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    requestsPerMinute: number;
  };
  database: {
    status: 'healthy' | 'warning' | 'error';
    connectionPool: number;
    slowQueries: number;
    size: string;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
  };
  endpoints: Array<{
    name: string;
    url: string;
    status: 'up' | 'down' | 'slow';
    responseTime: number;
    lastChecked: string;
  }>;
  errors: Array<{
    timestamp: string;
    level: 'error' | 'warning' | 'info';
    message: string;
    count: number;
  }>;
}

export interface SentinelConfig {
  enabled: boolean;
  autoPersist: boolean;
  frequencyMs: number;
  sources: any[];
  lastRunAt: string | null;
  running: boolean;
  settings?: {
    maxPerRun: number;
    contentBalance: {
      local: number;
      international: number;
      tech: number;
      development: number;
    };
    filtering: {
      enableLocalKeywords: boolean;
      enableGlobalKeywords: boolean;
      enableHighPrioritySources: boolean;
      enableTechSources: boolean;
    };
    keywords: {
      local: string[];
      global: string[];
    };
  };
}

export interface SentinelRuntime {
  nextRunAt?: string;
  lastRunAt?: string;
  lastCreated?: number;
  lastProcessed?: number;
  cooldownUntil?: string | null;
  maxPerRun?: number;
  frequencyMs?: number;
  running?: boolean;
}

export interface SystemLog {
  timestamp: string;
  level: string;
  message: string;
}

// Enhanced Service Health Types
export interface ServiceHealth {
  id: string;
  name: string;
  category: 'core' | 'ai' | 'analytics' | 'social' | 'business' | 'infrastructure';
  status: 'healthy' | 'warning' | 'error' | 'offline';
  responseTime: number;
  lastCheck: string;
  uptime: number;
  errorRate: number;
  dependencies: string[];
  description: string;
  version?: string;
  metrics?: {
    requestsPerMinute?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    queueSize?: number;
    successRate?: number;
  };
}

export interface ServiceHealthStatus {
  overall: 'healthy' | 'warning' | 'error';
  services: ServiceHealth[];
  lastUpdated: string;
  summary: {
    total: number;
    healthy: number;
    warning: number;
    error: number;
    offline: number;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  serviceId: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  lastTriggered?: string;
}

export interface Alert {
  id: string;
  ruleId: string;
  serviceId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}
