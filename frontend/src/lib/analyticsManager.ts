/**
 * Analytics and monitoring system for tracking user behavior and site performance
 */

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  page: string;
  userAgent: string;
}

interface UserBehavior {
  pageViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  bounceRate: number;
  pagesPerSession: number;
  topPages: Array<{
    page: string;
    views: number;
    uniqueViews: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  deviceTypes: Array<{
    device: string;
    visitors: number;
    percentage: number;
  }>;
  geographicData: Array<{
    country: string;
    visitors: number;
    percentage: number;
  }>;
}

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  totalBlockingTime: number;
}

interface ConversionMetrics {
  totalConversions: number;
  conversionRate: number;
  goalCompletions: Array<{
    goal: string;
    completions: number;
    value: number;
  }>;
  funnelSteps: Array<{
    step: string;
    visitors: number;
    dropOffRate: number;
  }>;
}

class AnalyticsManager {
  private static instance: AnalyticsManager;
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private startTime: number;
  private pageViewCount = 0;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.initializeAnalytics();
  }

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  /**
   * Initialize analytics tracking
   */
  private initializeAnalytics(): void {
    if (typeof window === 'undefined') return;

    // Track page view
    this.trackPageView();

    // Track performance metrics
    this.trackPerformanceMetrics();

    // Track user interactions
    this.trackUserInteractions();

    // Track scroll depth
    this.trackScrollDepth();

    // Track time on page
    this.trackTimeOnPage();

    // Track form interactions
    this.trackFormInteractions();

    // Track external links
    this.trackExternalLinks();
  }

  /**
   * Track page view
   */
  trackPageView(page?: string): void {
    const currentPage = page || window.location.pathname;
    this.pageViewCount++;

    this.trackEvent('Page View', 'Navigation', 'View', this.pageViewCount);

    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.trackEvent('Performance', 'Page Load', 'Load Time', Math.round(loadTime));
    });
  }

  /**
   * Track custom events
   */
  trackEvent(
    category: string,
    action: string,
    label?: string,
    value?: number
  ): void {
    const event: AnalyticsEvent = {
      event: `${category} - ${action}`,
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      page: window.location.pathname,
      userAgent: navigator.userAgent
    };

    this.events.push(event);

    // Send to analytics service
    this.sendEventToAnalytics(event);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }
  }

  /**
   * Track user interactions
   */
  private trackUserInteractions(): void {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const className = target.className;
      const id = target.id;

      if (tagName === 'button' || tagName === 'a') {
        this.trackEvent('User Interaction', 'Click', `${tagName}.${className || id}`);
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent('Form', 'Submit', form.id || form.className);
    });

    // Track search queries
    const searchInputs = document.querySelectorAll('input[type="search"], input[name*="search"]');
    searchInputs.forEach(input => {
      input.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement;
        if (target.value) {
          this.trackEvent('Search', 'Query', target.value);
        }
      });
    });
  }

  /**
   * Track scroll depth
   */
  private trackScrollDepth(): void {
    let maxScroll = 0;
    const scrollThresholds = [25, 50, 75, 90, 100];
    const trackedThresholds = new Set<number>();

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
      }

      scrollThresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
          trackedThresholds.add(threshold);
          this.trackEvent('Engagement', 'Scroll Depth', `${threshold}%`);
        }
      });
    });
  }

  /**
   * Track time on page
   */
  private trackTimeOnPage(): void {
    const timeThresholds = [10, 30, 60, 120, 300]; // seconds
    const trackedTimes = new Set<number>();

    timeThresholds.forEach(threshold => {
      setTimeout(() => {
        if (!trackedTimes.has(threshold)) {
          trackedTimes.add(threshold);
          this.trackEvent('Engagement', 'Time on Page', `${threshold}s`);
        }
      }, threshold * 1000);
    });

    // Track when user leaves page
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Math.round((Date.now() - this.startTime) / 1000);
      this.trackEvent('Engagement', 'Session Duration', `${timeOnPage}s`);
    });
  }

  /**
   * Track form interactions
   */
  private trackFormInteractions(): void {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          this.trackEvent('Form', 'Focus', (input as HTMLInputElement).name || (input as HTMLInputElement).id);
        });

        input.addEventListener('blur', () => {
          this.trackEvent('Form', 'Blur', (input as HTMLInputElement).name || (input as HTMLInputElement).id);
        });
      });
    });
  }

  /**
   * Track external links
   */
  private trackExternalLinks(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        try {
          const url = new URL(link.href);
          if (url.hostname !== window.location.hostname) {
            this.trackEvent('External Link', 'Click', url.hostname);
          }
        } catch (error) {
          // Invalid URL
        }
      }
    });
  }

  /**
   * Track performance metrics
   */
  private trackPerformanceMetrics(): void {
    // Wait for page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        const metrics = this.getPerformanceMetrics();
        this.trackEvent('Performance', 'Core Web Vitals', 'FCP', metrics.firstContentfulPaint);
        this.trackEvent('Performance', 'Core Web Vitals', 'LCP', metrics.largestContentfulPaint);
        this.trackEvent('Performance', 'Core Web Vitals', 'FID', metrics.firstInputDelay);
        this.trackEvent('Performance', 'Core Web Vitals', 'CLS', metrics.cumulativeLayoutShift);
      }, 1000);
    });
  }

  /**
   * Get performance metrics
   */
  private getPerformanceMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      pageLoadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      firstContentfulPaint: this.getMetricValue('first-contentful-paint'),
      largestContentfulPaint: this.getMetricValue('largest-contentful-paint'),
      firstInputDelay: this.getMetricValue('first-input'),
      cumulativeLayoutShift: this.getMetricValue('layout-shift'),
      timeToInteractive: navigation ? navigation.domInteractive - navigation.fetchStart : 0,
      totalBlockingTime: this.calculateTotalBlockingTime()
    };
  }

  /**
   * Get metric value from performance entries
   */
  private getMetricValue(metricName: string): number {
    const entries = performance.getEntriesByName(metricName);
    return entries.length > 0 ? entries[0].startTime : 0;
  }

  /**
   * Calculate total blocking time
   */
  private calculateTotalBlockingTime(): number {
    const longTasks = performance.getEntriesByType('longtask');
    return longTasks.reduce((total, task) => total + task.duration, 0);
  }

  /**
   * Track conversion goals
   */
  trackConversion(goal: string, value?: number): void {
    this.trackEvent('Conversion', 'Goal', goal, value);
  }

  /**
   * Track user engagement
   */
  trackEngagement(action: string, details?: string): void {
    this.trackEvent('Engagement', action, details);
  }

  /**
   * Track errors
   */
  trackError(error: string, context?: string): void {
    this.trackEvent('Error', 'JavaScript Error', context, undefined);
  }

  /**
   * Get user behavior analytics
   */
  getUserBehavior(): UserBehavior {
    const uniqueVisitors = new Set(this.events.map(e => e.userId || e.sessionId)).size;
    const pageViews = this.events.filter(e => e.action === 'View').length;
    
    // Calculate average session duration
    const sessionDurations = this.events
      .filter(e => e.action === 'Session Duration')
      .map(e => e.value || 0);
    const averageSessionDuration = sessionDurations.length > 0 
      ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length 
      : 0;

    // Get top pages
    const pageViewsMap = new Map<string, { views: number; uniqueViews: Set<string> }>();
    this.events
      .filter(e => e.action === 'View')
      .forEach(e => {
        const page = e.label || e.page;
        if (!pageViewsMap.has(page)) {
          pageViewsMap.set(page, { views: 0, uniqueViews: new Set() });
        }
        const pageData = pageViewsMap.get(page)!;
        pageData.views++;
        pageData.uniqueViews.add(e.userId || e.sessionId);
      });

    const topPages = Array.from(pageViewsMap.entries())
      .map(([page, data]) => ({
        page,
        views: data.views,
        uniqueViews: data.uniqueViews.size
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return {
      pageViews,
      uniqueVisitors,
      averageSessionDuration,
      bounceRate: 0, // Would need more complex calculation
      pagesPerSession: pageViews / uniqueVisitors,
      topPages,
      trafficSources: [], // Would need referrer data
      deviceTypes: [], // Would need device detection
      geographicData: [] // Would need IP geolocation
    };
  }

  /**
   * Get conversion metrics
   */
  getConversionMetrics(): ConversionMetrics {
    const conversions = this.events.filter(e => e.category === 'Conversion');
    const totalConversions = conversions.length;
    const conversionRate = this.pageViewCount > 0 ? (totalConversions / this.pageViewCount) * 100 : 0;

    const goalCompletions = conversions.reduce((acc, event) => {
      const goal = event.label || 'Unknown';
      const existing = acc.find(g => g.goal === goal);
      if (existing) {
        existing.completions++;
        existing.value += event.value || 0;
      } else {
        acc.push({
          goal,
          completions: 1,
          value: event.value || 0
        });
      }
      return acc;
    }, [] as Array<{ goal: string; completions: number; value: number }>);

    return {
      totalConversions,
      conversionRate,
      goalCompletions,
      funnelSteps: [] // Would need funnel configuration
    };
  }

  /**
   * Generate analytics report
   */
  generateReport(): string {
    const behavior = this.getUserBehavior();
    const conversions = this.getConversionMetrics();
    const performance = this.getPerformanceMetrics();

    return `
Analytics Report:
================

User Behavior:
- Page Views: ${behavior.pageViews}
- Unique Visitors: ${behavior.uniqueVisitors}
- Average Session Duration: ${behavior.averageSessionDuration.toFixed(2)}s
- Pages per Session: ${behavior.pagesPerSession.toFixed(2)}

Top Pages:
${behavior.topPages.map(page => `- ${page.page}: ${page.views} views`).join('\n')}

Conversions:
- Total Conversions: ${conversions.totalConversions}
- Conversion Rate: ${conversions.conversionRate.toFixed(2)}%

Performance:
- Page Load Time: ${performance.pageLoadTime.toFixed(2)}ms
- First Contentful Paint: ${performance.firstContentfulPaint.toFixed(2)}ms
- Largest Contentful Paint: ${performance.largestContentfulPaint.toFixed(2)}ms
- Cumulative Layout Shift: ${performance.cumulativeLayoutShift.toFixed(3)}
    `;
  }

  /**
   * Send event to analytics service
   */
  private async sendEventToAnalytics(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set user ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Get events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Clear events
   */
  clearEvents(): void {
    this.events = [];
  }
}

export default AnalyticsManager;


