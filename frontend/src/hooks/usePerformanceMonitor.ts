import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  averageRenderTime: number;
  memoryUsage: number;
  isSlowRender: boolean;
}

export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    averageRenderTime: 0,
    memoryUsage: 0,
    isSlowRender: false
  });

  useEffect(() => {
    const startTime = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - startTime;
      renderTimes.current.push(renderTime);
      
      // Keep only last 10 render times
      if (renderTimes.current.length > 10) {
        renderTimes.current.shift();
      }

      const averageRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
      const isSlowRender = renderTime > 16; // 60fps threshold
      
      // Get memory usage
      let memoryUsage = 0;
      if ((performance as any).memory) {
        memoryUsage = (performance as any).memory.usedJSHeapSize / 1048576; // MB
      }

      setMetrics({
        renderCount: renderCount.current,
        averageRenderTime,
        memoryUsage,
        isSlowRender
      });

      // Log performance issues
      if (isSlowRender) {
        console.warn(`🐌 Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }

      if (renderCount.current > 50) {
        console.warn(`🔄 High render count in ${componentName}: ${renderCount.current} renders`);
      }
    };
  });

  return metrics;
}
