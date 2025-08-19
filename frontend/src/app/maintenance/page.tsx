'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, RefreshCw, Shield, Home } from 'lucide-react';
import Link from 'next/link';

export default function MaintenancePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const isAdmin = user?.role === 'admin';

  const checkMaintenanceStatus = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/maintenance-status`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (!data.maintenance || data.canAccess) {
          window.location.href = '/';
        }
      }
    } catch (error) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkMaintenanceStatus();
  }, []);

  const handleRefresh = () => {
    setLastChecked(new Date());
    checkMaintenanceStatus();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Checking maintenance status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full mx-auto">
        {/* Illustration */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            {/* Modern SVG illustration */}
            <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="48" cy="48" r="46" fill="#FDE68A" className="dark:fill-gray-800" stroke="#F59E42" strokeWidth="4" />
              <g className="animate-spin-slow origin-center">
                <rect x="44" y="20" width="8" height="28" rx="4" fill="#F59E42" />
                <rect x="44" y="48" width="8" height="28" rx="4" fill="#F59E42" />
                <rect x="20" y="44" width="28" height="8" rx="4" fill="#F59E42" />
                <rect x="48" y="44" width="28" height="8" rx="4" fill="#F59E42" />
              </g>
              <circle cx="48" cy="48" r="12" fill="#F59E42" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Maintenance Mode</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">Our site is currently undergoing scheduled maintenance.</p>
          <p className="text-gray-500 dark:text-gray-400">We're working hard to improve your experience. Please check back soon.</p>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg dark:bg-gray-900/80">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              Scheduled Maintenance
            </CardTitle>
            <CardDescription>
              We're performing essential updates to ensure the best possible experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge variant="destructive" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Maintenance Active
              </Badge>
            </div>

            {/* What's happening */}
            <div className="p-4 rounded-lg">
              <h3 className="font-semibold mb-2">
                What's happening?
              </h3>
              <ul className="text-sm space-y-1">
                <li>• System updates and improvements</li>
                <li>• Database optimization</li>
                <li>• Security enhancements</li>
                <li>• Performance improvements</li>
              </ul>
            </div>

            {/* Admin Access Notice */}
            {isAdmin && (
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">
                    Administrator Access
                  </h3>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200">
                  As an administrator, you can still access the site normally. 
                  Other users will see this maintenance page.
                </p>
                <div className="mt-3">
                  <Link href="/admin">
                    <Button size="sm" variant="outline">
                      Go to Admin Panel
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Status
              </Button>
              <Link href="/" className="flex-1">
                <Button className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </Link>
            </div>

            {/* Last checked */}
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              Last checked: {lastChecked.toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>Thank you for your patience</p>
        </div>
      </div>
    </div>
  );
}