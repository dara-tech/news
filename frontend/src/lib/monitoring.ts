// Basic monitoring utilities for frontend
interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

interface ErrorInfo {
  message: string;
  stack?: string;
  component?: string;
  timestamp: number;
  userAgent: string;
  url: string;
}

class MonitoringService {
  private static instance: MonitoringService;
  private metrics: PerformanceMetrics | null = null;
  private errors: ErrorInfo[] = [];

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Initialize performance monitoring
  initPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Wait for page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.capturePerformanceMetrics();
      }, 1000);
    });

    // Monitor Core Web Vitals
    this.observeWebVitals();
  }

  private capturePerformanceMetrics() {
    if (typeof window === 'undefined' || !window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    this.metrics = {
      pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
      firstContentfulPaint: this.getFirstContentfulPaint(),
      largestContentfulPaint: 0, // Will be updated by observer
      cumulativeLayoutShift: 0, // Will be updated by observer
      firstInputDelay: 0, // Will be updated by observer
    };

    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {}

    // Send to analytics service
    this.sendMetricsToAnalytics();
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  private observeWebVitals() {
    if (typeof window === 'undefined') return;

    // Observe Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (this.metrics) {
            this.metrics.largestContentfulPaint = lastEntry.startTime;
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Observe Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          if (this.metrics) {
            this.metrics.cumulativeLayoutShift = clsValue;
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Observe First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (this.metrics) {
              this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
            }
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (error) {}
    }
  }

  // Error tracking
  captureError(error: Error, component?: string) {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      component,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.errors.push(errorInfo);

    // Log in development
    if (process.env.NODE_ENV === 'development') {}

    // Send to error tracking service
    this.sendErrorToAnalytics(errorInfo);
  }

  // Health check
  async performHealthCheck(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      return data.status === 'OK';
    } catch (error) {return false;
    }
  }

  // Send metrics to analytics (implement based on your analytics service)
  private sendMetricsToAnalytics() {
    if (!this.metrics) return;

    // Example: Send to your analytics service
    // analytics.track('performance_metrics', this.metrics);
  }

  // Send error to analytics (implement based on your error tracking service)
  private sendErrorToAnalytics(errorInfo: ErrorInfo) {
    // Example: Send to your error tracking service
    // errorTracking.captureException(errorInfo);
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics | null {
    return this.metrics;
  }

  // Get error history
  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  // Clear error history
  clearErrors() {
    this.errors = [];
  }
}

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    MonitoringService.getInstance().captureError(event.error, 'Global');
  });

  window.addEventListener('unhandledrejection', (event) => {
    MonitoringService.getInstance().captureError(
      new Error(event.reason),
      'UnhandledPromiseRejection'
    );
  });
}

export default MonitoringService;

