'use client';

import { useState, useRef } from 'react';
import { Bell, UserCircle, Search, Menu, X, LogOut, Settings, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link'; // Assuming Next.js for dynamic titles

// Hook for handling click outside of an element (for dropdown)
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

export default function DashboardHeader() {
  // 1. State Management for UI interactivity
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(dropdownRef, () => setDropdownOpen(false));
  
  const pathname = usePathname();

  // 2. Dynamic Content: Generate title from the current route
  const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard';
  const capitalizedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  const handleLogout = () => {
    // Add your logout logic here (e.g., call auth context)
  };

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm dark:bg-gray-800/80 dark:border-b dark:border-gray-700">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Section: Dynamic Title & Mobile Menu */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
          <h1 className="hidden md:block text-xl font-semibold text-gray-800 dark:text-gray-100">
            {capitalizedTitle}
          </h1>
        </div>

        {/* Center Section: Search Bar (more prominent) */}
        <div className="hidden md:flex flex-1 justify-center px-8">
          {/* 3. Interactive Search Component */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-full border bg-gray-100 py-2 pl-10 pr-4 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Right Section: Actions & User Dropdown */}
        <div className="flex items-center space-x-4">
          <Button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full dark:text-gray-300 dark:hover:bg-gray-700">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
          </Button>

          {/* 4. Advanced User Dropdown Menu */}
          <div ref={dropdownRef} className="relative">
            <button onClick={() => setDropdownOpen(!isDropdownOpen)}>
              {/* Replace with an actual User Avatar if available */}
              <UserCircle className="h-9 w-9 text-gray-600 dark:text-gray-300 cursor-pointer" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 dark:ring-gray-600">
                <Link href="/profile" className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">
                  <User className="mr-2 h-4 w-4" />
                  Your Profile
                </Link>
                <Link href="/settings" className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
                <div className="my-1 h-px bg-gray-100 dark:bg-gray-600" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 5. Responsive Design: Search bar for mobile */}
      {isMobileMenuOpen && (
        <div className="p-4 md:hidden border-t dark:border-gray-700">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
             <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-full border bg-gray-100 py-2 pl-10 pr-4 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
          </div>
           {/* Mobile navigation links can be added here */}
        </div>
      )}
    </header>
  );
}