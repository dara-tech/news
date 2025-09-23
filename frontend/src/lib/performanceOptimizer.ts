/**
 * Performance optimization utilities for better page speed and user experience
 */

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

interface OptimizationConfig {
  enableImageLazyLoading: boolean;
  enableCodeSplitting: boolean;
  enablePrefetching: boolean;
  enableServiceWorker: boolean;
  enableCompression: boolean;
  enableCaching: boolean;
}

class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: PerformanceMetrics = {
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0
  };
  private config: OptimizationConfig = {
    enableImageLazyLoading: true,
    enableCodeSplitting: true,
    enablePrefetching: true,
    enableServiceWorker: true,
    enableCompression: true,
    enableCaching: true
  };

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Initialize performance monitoring and optimizations
   */
  init(): void {
    this.observeWebVitals();
    this.optimizeImages();
    this.enablePrefetching();
    this.setupServiceWorker();
    this.optimizeFonts();
    this.optimizeCSS();
  }

  /**
   * Monitor Core Web Vitals
   */
  private observeWebVitals(): void {
    if (typeof window === 'undefined') return;

    // First Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
        }
      }
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.metrics.fid = (entry as any).processingStart - entry.startTime;
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.metrics.cls = clsValue;
    }).observe({ entryTypes: ['layout-shift'] });

    // Time to First Byte
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
    }
  }

  /**
   * Optimize images for better performance
   */
  private optimizeImages(): void {
    if (!this.config.enableImageLazyLoading) return;

    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  /**
   * Enable prefetching for critical resources
   */
  private enablePrefetching(): void {
    if (!this.config.enablePrefetching) return;

    // Prefetch critical pages
    const criticalPages = ['/news', '/categories', '/search'];
    criticalPages.forEach(page => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    });

    // Prefetch next page on hover
    const links = document.querySelectorAll('a[href^="/"]');
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const href = link.getAttribute('href');
        if (href && !document.querySelector(`link[href="${href}"]`)) {
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = href;
          document.head.appendChild(prefetchLink);
        }
      });
    });
  }

  /**
   * Setup service worker for caching
   */
  private setupServiceWorker(): void {
    if (!this.config.enableServiceWorker) return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }

  /**
   * Optimize font loading
   */
  private optimizeFonts(): void {
    // Preload critical fonts
    const criticalFonts = [
      '/fonts/kantumruy-pro-regular.woff2',
      '/fonts/kantumruy-pro-bold.woff2'
    ];

    criticalFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Add font-display: swap to existing font faces
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Kantumruy Pro';
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Optimize CSS delivery
   */
  private optimizeCSS(): void {
    // Inline critical CSS
    const criticalCSS = `
      body { font-family: 'Kantumruy Pro', sans-serif; }
      .container { max-width: 1200px; margin: 0 auto; }
      .mobile-optimized { -webkit-tap-highlight-color: transparent; }
    `;

    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if performance is good
   */
  isPerformanceGood(): boolean {
    return (
      this.metrics.fcp < 1800 && // Good FCP
      this.metrics.lcp < 2500 && // Good LCP
      this.metrics.fid < 100 &&  // Good FID
      this.metrics.cls < 0.1     // Good CLS
    );
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const metrics = this.getMetrics();
    const isGood = this.isPerformanceGood();
    
    return `
Performance Report:
- First Contentful Paint: ${metrics.fcp.toFixed(2)}ms ${metrics.fcp < 1800 ? '✅' : '❌'}
- Largest Contentful Paint: ${metrics.lcp.toFixed(2)}ms ${metrics.lcp < 2500 ? '✅' : '❌'}
- First Input Delay: ${metrics.fid.toFixed(2)}ms ${metrics.fid < 100 ? '✅' : '❌'}
- Cumulative Layout Shift: ${metrics.cls.toFixed(3)} ${metrics.cls < 0.1 ? '✅' : '❌'}
- Time to First Byte: ${metrics.ttfb.toFixed(2)}ms ${metrics.ttfb < 600 ? '✅' : '❌'}

Overall Performance: ${isGood ? 'Good ✅' : 'Needs Improvement ❌'}
    `;
  }

  /**
   * Optimize bundle size
   */
  optimizeBundle(): void {
    // Remove unused CSS
    this.removeUnusedCSS();
    
    // Minify inline styles
    this.minifyInlineStyles();
    
    // Optimize images
    this.optimizeImageFormats();
  }

  private removeUnusedCSS(): void {
    // This would typically be done at build time
    console.log('Removing unused CSS...');
  }

  private minifyInlineStyles(): void {
    const styleElements = document.querySelectorAll('style');
    styleElements.forEach(style => {
      style.textContent = style.textContent ?? ''
        ?.replace(/\s+/g, ' ')
        .replace(/;\s*}/g, '}')
        .trim();
    });
  }

  private optimizeImageFormats(): void {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Add loading="lazy" to images below the fold
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Add proper alt text if missing
      if (!img.alt) {
        img.alt = 'Image';
      }
    });
  }
}

export default PerformanceOptimizer;


