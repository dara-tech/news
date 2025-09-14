"use client"

import React, { Suspense, lazy, ComponentType } from 'react'
import { Loader2 } from 'lucide-react'

interface LazyComponentProps {
  fallback?: React.ReactNode
  [key: string]: any
}

// Default loading component
const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
    <span className="ml-2">Loading...</span>
  </div>
)

// Higher-order component for lazy loading
export function withLazyLoading<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc)

  return function WrappedComponent(props: any) {
    return (
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Lazy component wrapper
export function LazyWrapper({ 
  children, 
  fallback = <DefaultFallback /> 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}

// Predefined lazy components for common use cases
export const LazyAdminDashboard = withLazyLoading(
  () => import('@/components/admin/DashboardOverview'),
  <div className="p-4">Loading admin dashboard...</div>
)

export const LazyNewsForm = withLazyLoading(
  () => import('@/components/admin/news/NewsForm'),
  <div className="p-4">Loading news form...</div>
)

export const LazyAnalytics = withLazyLoading(
  () => import('@/components/admin/EnterpriseAnalyticsDashboard'),
  <div className="p-4">Loading analytics...</div>
)

export const LazyUserProfile = withLazyLoading(
  () => import('@/components/profile/ProfilePageClient'),
  <div className="p-4">Loading profile...</div>
)

export const LazyComments = withLazyLoading(
  () => import('@/components/comments/CommentSection'),
  <div className="p-4">Loading comments...</div>
)

export const LazySearch = withLazyLoading(
  () => import('@/components/search/EnterpriseSearch'),
  <div className="p-4">Loading search...</div>
)

export default LazyWrapper