'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { ElementType } from 'react';
import { useAuth } from '@/context/AuthContext';

// 1. Simplified Type Definitions
interface SubMenuItem {
  name: string;
  href: string;
}

interface SidebarItem {
  name: string;
  href?: string;
  icon: ElementType;
  key?: string;
  subItems?: SubMenuItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'News',
    href: '/admin/news',
    icon: Newspaper,
  },
  {
    name: 'Manage Users',
    icon: Users,
    // Add a unique key for managing open/closed state
    key: 'users',
    subItems: [
      { name: 'All Users', href: '/admin/users' },
      // { name: 'Add New', href: '/admin/users/new' },
      // { name: 'Roles & Permissions', href: '/admin/users/roles' },
    ],
  },
  // {
  //   name: 'Settings',
  //   icon: Settings,
  //   key: 'settings',
  //   subItems: [
  //     { name: 'General', href: '/admin/settings/general' },
  //     { name: 'Security', href: '/admin/settings/security' },
  //     { name: 'Integrations', href: '/admin/settings/integrations' },
  //   ],
  // },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  // 2. State for Collapsible Sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);
  // State for managing which nested menu is open
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>({});

  const toggleSubMenu = (key: string) => {
    setOpenSubMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.aside
      // 3. Animate the width for collapse/expand
      animate={{ width: isCollapsed ? '5rem' : '16rem' }}
      transition={{ duration: 0.3 }}
      className="relative flex min-h-screen flex-col bg-gray-900 text-gray-300 shadow-xl"
    >
      {/* Logo and Title */}
      <div className="flex h-16 items-center justify-center border-b border-gray-700">
        <Link href="/">
          <motion.div
            initial={false}
            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap"
          >
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          </motion.div>
        </Link>
        <AnimatePresence>
          {isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LayoutDashboard className="h-8 w-8 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = item.href ? pathname.startsWith(item.href) : false;
            const isSubMenuActive = item.subItems?.some(sub => pathname.startsWith(sub.href));
            
            if (item.subItems && item.key) {
              return (
                <li key={item.key}>
                  {/* 4. Accordion Menu Item */}
                  <button
                    onClick={() => item.key && toggleSubMenu(item.key)}
                    className={`flex w-full items-center justify-between rounded-md p-3 text-left transition-colors duration-200 ${
                      isSubMenuActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-6 w-6 flex-shrink-0" />
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                            className="ml-4 overflow-hidden whitespace-nowrap"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    {!isCollapsed && (
                      <ChevronDown
                        className={`h-5 w-5 transform transition-transform duration-300 ${openSubMenus[item.key] ? 'rotate-180' : ''}`}
                      />
                    )}
                  </button>
                  <AnimatePresence>
                    {openSubMenus[item.key] && !isCollapsed && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-6 mt-1 overflow-hidden border-l border-gray-600"
                      >
                        {item.subItems.map((subItem) => {
                          const isSubItemActive = pathname === subItem.href;
                          return (
                            <li key={subItem.name}>
                              <Link
                                href={subItem.href}
                                className={`block py-2 pl-6 pr-3 text-sm transition-colors duration-200 ${
                                  isSubItemActive ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'
                                }`}
                              >
                                {subItem.name}
                              </Link>
                            </li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              );
            }

            return (
              <li key={item.name}>
                <Link
                  href={item.href || '#'}
                  className={`group relative flex items-center justify-start rounded-md p-3  transition-colors duration-200 ${
                    isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="h-6 w-6 flex-shrink-0 " />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="ml-4 overflow-hidden whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {/* 5. Tooltip for Collapsed State */}
                  {isCollapsed && (
                    <div className="absolute   hidden rounded-md bg-gray-800 px-2 py-1 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 group-hover:block">
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer: Collapse Toggle and Logout */}
      <div className="mt-auto border-t border-gray-700 p-2">
        <button
          onClick={handleLogout}
          className="group relative flex w-full items-center rounded-md p-3 text-left transition-colors duration-200 hover:bg-red-800/50"
        >
          <LogOut className="h-6 w-6 flex-shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="ml-4 overflow-hidden whitespace-nowrap font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
           {isCollapsed && (
              <div className="absolute left-full ml-4 hidden rounded-md bg-gray-800 px-2 py-1 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 group-hover:block">
                Logout
              </div>
            )}
        </button>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="group relative flex w-full items-center rounded-md p-3 text-left transition-colors duration-200 hover:bg-gray-800"
        >
          <ChevronRight
            className={`h-6 w-6 flex-shrink-0 transform transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
          />
           <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="ml-4 overflow-hidden whitespace-nowrap font-medium"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
