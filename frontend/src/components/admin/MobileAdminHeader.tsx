'use client';

import { useState } from 'react';
import { Menu, X, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useNotifications } from '@/context/NotificationContext';
import MobileNotificationDropdown from '@/components/notifications/MobileNotificationDropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface MobileAdminHeaderProps {
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  notificationCount?: number;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function MobileAdminHeader({
  title = "Admin Dashboard",
  showSearch = true,
  showNotifications = true,
  // notificationCount: propNotificationCount = 0, // Removed unused variable
  user
}: MobileAdminHeaderProps) {
  // const { unreadCount } = useNotifications(); // Remove if not used elsewhere
  useNotifications(); // Call for side effects if needed, but don't assign
  // Removed unused notificationCount variable
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* Mobile Header - Only visible on mobile */}
      <div className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 sm:hidden">
        {/* Menu Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Admin Menu</SheetTitle>
              <SheetDescription>
                Navigate through admin sections
              </SheetDescription>
            </SheetHeader>
            {/* Mobile navigation content would go here */}
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                Mobile navigation menu content
              </p>
            </div>
          </SheetContent>
        </Sheet>

        {/* Title */}
        <h1 className="flex-1 text-lg font-semibold truncate">{title}</h1>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Search Toggle */}
          {showSearch && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          {/* Notifications */}
          {showNotifications && (
            <MobileNotificationDropdown />
          )}

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile Search Bar - Collapsible */}
      {isSearchOpen && showSearch && (
        <div className="border-b bg-background p-4 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10 pr-10"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0"
              onClick={() => setIsSearchOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close search</span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
