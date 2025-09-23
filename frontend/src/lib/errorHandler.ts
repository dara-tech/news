/**
 * Comprehensive error handling system for better user experience
 */

interface ErrorInfo {
  message: string;
  stack?: string;
  component?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorReport {
  errors: ErrorInfo[];
  totalErrors: number;
  criticalErrors: number;
  lastErrorTime: number;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: ErrorInfo[] = [];
  private maxErrors = 100;
  private reportEndpoint = '/api/errors';

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  constructor() {
    this.setupGlobalErrorHandlers();
    this.setupUnhandledRejectionHandler();
    this.setupNetworkErrorHandler();
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError(
        event.error || new Error(event.message),
        'Global',
        'high'
      );
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleError(
          new Error(`Resource loading failed: ${(event.target as any).src || (event.target as any).href}`),
          'Resource',
          'medium'
        );
      }
    }, true);
  }

  /**
   * Setup unhandled promise rejection handler
   */
  private setupUnhandledRejectionHandler(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        new Error(event.reason),
        'UnhandledPromiseRejection',
        'high'
      );
    });
  }

  /**
   * Setup network error handler
   */
  private setupNetworkErrorHandler(): void {
    if (typeof window === 'undefined') return;

    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.handleError(
            new Error(`Network request failed: ${response.status} ${response.statusText}`),
            'Network',
            'medium'
          );
        }
        return response;
      } catch (error) {
        this.handleError(
          error as Error,
          'Network',
          'medium'
        );
        throw error;
      }
    };
  }

  /**
   * Handle and categorize errors
   */
  handleError(
    error: Error,
    component?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      component,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      severity
    };

    this.errors.push(errorInfo);

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', errorInfo);
    }

    // Send critical errors immediately
    if (severity === 'critical') {
      this.sendErrorReport([errorInfo]);
    }

    // Send error report if we have too many errors
    if (this.errors.length >= 10) {
      this.sendErrorReport();
    }
  }

  /**
   * Get user ID from localStorage or context
   */
  private getUserId(): string | undefined {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        return user.id || user.userId;
      }
    } catch (error) {
      // Ignore parsing errors
    }
    return undefined;
  }

  /**
   * Get session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  /**
   * Send error report to server
   */
  private async sendErrorReport(errors?: ErrorInfo[]): Promise<void> {
    const errorsToSend = errors || this.errors;
    if (errorsToSend.length === 0) return;

    try {
      await fetch(this.reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errors: errorsToSend,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });

      // Clear sent errors
      if (!errors) {
        this.errors = [];
      }
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }

  /**
   * Get error report
   */
  getErrorReport(): ErrorReport {
    const criticalErrors = this.errors.filter(e => e.severity === 'critical').length;
    const lastErrorTime = this.errors.length > 0 
      ? Math.max(...this.errors.map(e => e.timestamp))
      : 0;

    return {
      errors: [...this.errors],
      totalErrors: this.errors.length,
      criticalErrors,
      lastErrorTime
    };
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorInfo['severity']): ErrorInfo[] {
    return this.errors.filter(error => error.severity === severity);
  }

  /**
   * Get errors by component
   */
  getErrorsByComponent(component: string): ErrorInfo[] {
    return this.errors.filter(error => error.component === component);
  }

  /**
   * Check if there are critical errors
   */
  hasCriticalErrors(): boolean {
    return this.errors.some(error => error.severity === 'critical');
  }

  /**
   * Get error rate (errors per minute)
   */
  getErrorRate(): number {
    const oneMinuteAgo = Date.now() - 60000;
    const recentErrors = this.errors.filter(error => error.timestamp > oneMinuteAgo);
    return recentErrors.length;
  }

  /**
   * Generate error summary
   */
  generateErrorSummary(): string {
    const report = this.getErrorReport();
    const errorRate = this.getErrorRate();
    
    return `
Error Summary:
- Total Errors: ${report.totalErrors}
- Critical Errors: ${report.criticalErrors}
- Error Rate: ${errorRate}/min
- Last Error: ${report.lastErrorTime ? new Date(report.lastErrorTime).toLocaleString() : 'None'}
- Status: ${this.hasCriticalErrors() ? '❌ Critical Issues' : '✅ Stable'}
    `;
  }

  /**
   * Setup error boundaries for React components
   */
  setupErrorBoundary(componentName: string) {
    return (error: Error, errorInfo: any) => {
      this.handleError(
        error,
        `ErrorBoundary:${componentName}`,
        'high'
      );
    };
  }

  /**
   * Handle API errors specifically
   */
  handleApiError(error: any, endpoint: string): void {
    let message = 'API request failed';
    let severity: ErrorInfo['severity'] = 'medium';

    if (error.response) {
      const status = error.response.status;
      message = `API Error ${status}: ${error.response.data?.message || error.message}`;
      
      if (status >= 500) {
        severity = 'high';
      } else if (status === 404) {
        severity = 'low';
      }
    } else if (error.request) {
      message = 'Network Error: No response from server';
      severity = 'high';
    }

    this.handleError(
      new Error(`${message} (${endpoint})`),
      `API:${endpoint}`,
      severity
    );
  }

  /**
   * Handle validation errors
   */
  handleValidationError(field: string, message: string): void {
    this.handleError(
      new Error(`Validation Error: ${field} - ${message}`),
      'Validation',
      'low'
    );
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error: Error): void {
    this.handleError(
      error,
      'Authentication',
      'high'
    );
  }
}

export default ErrorHandler;


