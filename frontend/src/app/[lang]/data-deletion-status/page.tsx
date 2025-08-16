'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, AlertTriangle, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DataDeletionStatusPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'success' | 'error' | 'pending'>('pending');
  const [message, setMessage] = useState('');
  const [platform, setPlatform] = useState('');
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    const statusParam = searchParams.get('status');
    const messageParam = searchParams.get('message');
    const platformParam = searchParams.get('platform');
    const deletedParam = searchParams.get('deleted');

    setStatus(statusParam as 'success' | 'error' | 'pending' || 'pending');
    setMessage(messageParam || '');
    setPlatform(platformParam || '');
    setDeleted(deletedParam === 'true');
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return deleted ? 'Data Deletion Successful' : 'Request Processed';
      case 'error':
        return 'Deletion Request Failed';
      default:
        return 'Processing Deletion Request';
    }
  };

  const getStatusMessage = () => {
    if (message) return message;
    
    switch (status) {
      case 'success':
        return deleted 
          ? `Your account and all associated data have been successfully deleted from our platform.`
          : 'Your deletion request has been processed successfully.';
      case 'error':
        return 'There was an error processing your data deletion request. Please try again or contact support.';
      default:
        return 'Your data deletion request is being processed.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-xl font-semibold">
            {getStatusTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {getStatusMessage()}
            </p>
            
            {platform && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Platform: <span className="font-medium capitalize">{platform}</span>
                </p>
              </div>
            )}

            {deleted && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    All your data has been permanently removed
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Link href="/" className="w-full">
              <Button className="w-full" variant="default">
                Return to Home
              </Button>
            </Link>
            
            {status === 'error' && (
              <Link href="/contact" className="w-full">
                <Button className="w-full" variant="outline">
                  Contact Support
                </Button>
              </Link>
            )}
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>
              This page confirms the status of your data deletion request from {platform || 'the platform'}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
