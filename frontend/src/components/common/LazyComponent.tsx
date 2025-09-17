import { Suspense, lazy, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  [key: string]: any;
}

// Default loading fallback
const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Higher-order component for lazy loading
export function withLazyLoading<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Pre-configured lazy components for heavy admin components
export const LazyEnterpriseAnalytics = withLazyLoading(
  () => import('../admin/EnterpriseAnalyticsDashboard'),
  <div className="flex items-center justify-center h-64">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2">Loading analytics...</span>
  </div>
);

export const LazyUserLoginMap = withLazyLoading(
  () => import('../admin/UserLoginMap'),
  <div className="flex items-center justify-center h-96">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2">Loading map...</span>
  </div>
);

// export const LazyProcessingDashboard = withLazyLoading(
//   () => import('../admin/processing-dashboard/ProcessingDashboard'),
//   <div className="flex items-center justify-center h-64">
//     <Loader2 className="h-8 w-8 animate-spin text-primary" />
//     <span className="ml-2">Loading dashboard...</span>
//   </div>
// );

export const LazyRecommendationEngine = withLazyLoading(
  () => import('../recommendations/RecommendationEngine'),
  <div className="flex items-center justify-center h-32">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

// Generic lazy component wrapper
export default function LazyComponent({ 
  children, 
  fallback = <DefaultFallback />,
  ...props 
}: LazyComponentProps & { children: React.ReactNode }) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}