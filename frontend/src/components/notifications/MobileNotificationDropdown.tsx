"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Trash2, 
  ExternalLink, 
  Clock,
  Newspaper,
  Zap,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import type { Notification } from '@/types/notification';

// Use 'object' instead of an empty interface to avoid @typescript-eslint/no-empty-object-type
type MobileNotificationDropdownProps = object;

const MobileNotificationDropdown: React.FC<MobileNotificationDropdownProps> = () => {
  const { user } = useAuth();

  const {
    notifications = [],
    unreadCount = 0,
    isLoading = false,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications() || {};

  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead && typeof markAsRead === 'function') {
      await markAsRead(notification._id);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (typeof markAllAsRead === 'function') {
      await markAllAsRead();
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (typeof deleteNotification === 'function') {
      await deleteNotification(id);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type || 'system') {
      case 'breaking_news':
        return <Zap className="h-4 w-4 text-red-500" />;
      case 'news_published':
        return <Newspaper className="h-4 w-4 text-blue-500" />;
      case 'news_updated':
        return <Clock className="h-4 w-4 text-green-500" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: Notification['type'], isImportant: boolean) => {
    if (isImportant) return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
    switch (type || 'system') {
      case 'breaking_news':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'news_published':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'news_updated':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  if (!user) return null;

  // Ensure notifications is always an array and typed
  const safeNotifications: Notification[] = Array.isArray(notifications) ? notifications : [];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
          </SheetTitle>
          <SheetDescription>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3 p-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : safeNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1">We&apos;ll notify you when there&apos;s something new</p>
            </div>
          ) : (
            <div className="space-y-2">
              {safeNotifications.map((notification) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`relative p-4 rounded-lg border-l-4 transition-all hover:bg-muted/50 cursor-pointer ${
                    !notification.isRead ? 'bg-muted/30' : ''
                  } ${getNotificationColor(notification.type, notification.isImportant || false)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium line-clamp-1">
                            {notification.title?.en || 'Notification'}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message?.en || 'No message available'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {notification.data?.actionUrl && (
                            <Link 
                              href={notification.data.actionUrl}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDeleteNotification(e, notification._id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNotificationDropdown;