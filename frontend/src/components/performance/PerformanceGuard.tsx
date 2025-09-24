'use client';

import { useEffect, useRef, useState } from 'react';

interface PerformanceGuardProps {
  children: React.ReactNode;
  maxRenderTime?: number;
  maxRendersPerSecond?: number;
}

export default function PerformanceGuard({ 
  children, 
  maxRenderTime = 16, // 60fps
  maxRendersPerSecond = 30
}: PerformanceGuardProps) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const renderTimes = useRef<number[]>([]);
  const [isThrottled, setIsThrottled] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    // Track render frequency
    if (timeSinceLastRender < 1000) {
      renderCount.current++;
    } else {
      renderCount.current = 1;
    }
    
    lastRenderTime.current = now;
    
    // Check for excessive renders
    if (renderCount.current > maxRendersPerSecond) {
      const issue = `Excessive renders detected: ${renderCount.current} renders per second`;
      console.warn('🚨 Performance Issue:', issue);
      
      // Throttle renders
      setIsThrottled(true);
      setTimeout(() => setIsThrottled(false), 1000);
    }
    
    // Track render time
    const startTime = performance.now();
    requestAnimationFrame(() => {
      const renderTime = performance.now() - startTime;
      renderTimes.current.push(renderTime);
      
      // Keep only last 10 render times
      if (renderTimes.current.length > 10) {
        renderTimes.current.shift();
      }
      
      // Check for slow renders
      if (renderTime > maxRenderTime) {
        const issue = `Slow render detected: ${renderTime.toFixed(2)}ms`;
        console.warn('🐌 Performance Issue:', issue);
      }
    });
  });

  // Memory leak detection
  useEffect(() => {
    const checkMemory = () => {
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        const used = memory.usedJSHeapSize / 1048576; // MB
        const limit = memory.jsHeapSizeLimit / 1048576; // MB
        
        if (used > limit * 0.9) {
          const issue = `High memory usage: ${used.toFixed(2)}MB / ${limit.toFixed(2)}MB`;
          console.warn('⚠️ Memory Issue:', issue);
        }
      }
    };
    
    const interval = setInterval(checkMemory, 5000);
    return () => clearInterval(interval);
  }, []);

  // Throttle rendering if needed
  if (isThrottled) {
    return (
      <div className="flex items-center justify-center p-4 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
        Optimizing performance...
      </div>
    );
  }

  return <>{children}</>;
}
