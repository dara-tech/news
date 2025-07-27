"use client"

import { ErrorBoundary } from 'react-error-boundary'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { LanguageProvider } from '@/context/LanguageContext'
import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context/NotificationContext'
import AppBody from '@/components/layout/AppBody'
import { Toaster } from 'sonner'

const FallbackUI = () => (
  <div className="w-full h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <h1 className="text-4xl font-semibold text-gray-800 dark:text-white">Something went wrong</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-2">We&apos;ve been notified and are looking into it. Please try refreshing the page.</p>
    </div>
    
  </div>
);

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={FallbackUI}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <AppBody>
                {children}
              </AppBody>
              <Toaster richColors position="top-right" />
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
