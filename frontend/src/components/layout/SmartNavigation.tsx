'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  Star, 
  Eye, 
  Bookmark,
  History,
  Zap,
  ChevronRight,
  BarChart3,
  Users,
  FileText,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  category: 'content' | 'analytics' | 'management' | 'personal';
  frequency: number;
  lastAccessed: number;
  isBookmarked?: boolean;
  isTrending?: boolean;
  description?: string;
}

interface SmartNavigationProps {
  lang: string;
  user: any;
}

export default function SmartNavigation({ lang, user }: SmartNavigationProps) {
  const [navigationData, setNavigationData] = useState<NavigationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'frequent' | 'trending' | 'recent' | 'bookmarks'>('frequent');

  // Load navigation data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('smartNavigation');
    if (saved) {
      setNavigationData(JSON.parse(saved));
    } else {
      // Initialize with default navigation items
      const defaultItems: NavigationItem[] = [
        {
          id: 'home',
          label: 'Home',
          href: `/${lang}`,
          icon: FileText,
          category: 'content',
          frequency: 0,
          lastAccessed: 0,
          description: 'Latest news and updates'
        },
        {
          id: 'recommendations',
          label: 'Recommendations',
          href: `/${lang}/recommendations`,
          icon: Star,
          category: 'personal',
          frequency: 0,
          lastAccessed: 0,
          description: 'Personalized content suggestions'
        },
        {
          id: 'analytics',
          label: 'Analytics',
          href: `/${lang}/admin/analytics`,
          icon: BarChart3,
          category: 'analytics',
          frequency: 0,
          lastAccessed: 0,
          description: 'Performance metrics and insights'
        },
        {
          id: 'users',
          label: 'Users',
          href: `/${lang}/admin/users`,
          icon: Users,
          category: 'management',
          frequency: 0,
          lastAccessed: 0,
          description: 'User management and roles'
        },
        {
          id: 'settings',
          label: 'Settings',
          href: `/${lang}/admin/settings`,
          icon: Settings,
          category: 'management',
          frequency: 0,
          lastAccessed: 0,
          description: 'System configuration'
        }
      ];
      setNavigationData(defaultItems);
      localStorage.setItem('smartNavigation', JSON.stringify(defaultItems));
    }
  }, [lang]);

  // Track navigation usage
  const trackNavigation = useCallback((itemId: string) => {
    setNavigationData(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            frequency: item.frequency + 1,
            lastAccessed: Date.now()
          };
        }
        return item;
      });
      localStorage.setItem('smartNavigation', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Get items by category
  const getItemsByCategory = (category: NavigationItem['category']) => {
    return navigationData.filter(item => item.category === category);
  };

  // Get frequent items
  const getFrequentItems = () => {
    return [...navigationData]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 6);
  };

  // Get recent items
  const getRecentItems = () => {
    return [...navigationData]
      .filter(item => item.lastAccessed > 0)
      .sort((a, b) => b.lastAccessed - a.lastAccessed)
      .slice(0, 6);
  };

  // Get bookmarked items
  const getBookmarkedItems = () => {
    return navigationData.filter(item => item.isBookmarked);
  };

  // Get trending items (simulated)
  const getTrendingItems = () => {
    return [...navigationData]
      .filter(item => item.isTrending)
      .slice(0, 6);
  };

  // Toggle bookmark
  const toggleBookmark = (itemId: string) => {
    setNavigationData(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          return { ...item, isBookmarked: !item.isBookmarked };
        }
        return item;
      });
      localStorage.setItem('smartNavigation', JSON.stringify(updated));
      return updated;
    });
  };

  const tabs = [
    { id: 'frequent', label: 'Frequent', icon: TrendingUp, count: getFrequentItems().length },
    { id: 'recent', label: 'Recent', icon: Clock, count: getRecentItems().length },
    { id: 'trending', label: 'Trending', icon: Zap, count: getTrendingItems().length },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, count: getBookmarkedItems().length }
  ];

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'frequent': return getFrequentItems();
      case 'recent': return getRecentItems();
      case 'trending': return getTrendingItems();
      case 'bookmarks': return getBookmarkedItems();
      default: return [];
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="group relative px-3 py-1.5 h-auto rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-150 text-muted-foreground hover:text-foreground hover:bg-muted/20"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Zap className="h-4 w-4" />
        Smart Nav
        <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-150 ${
          isOpen ? 'rotate-90' : ''
        }`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 w-80 bg-background/98 backdrop-blur-xl border border-border/20 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Smart Navigation</h3>
                <Badge variant="secondary" className="text-xs">
                  AI-Powered
                </Badge>
              </div>
            </div>

            {/* Tabs */}
            <div className="p-4 border-b border-border/10">
              <div className="flex space-x-1 bg-muted/30 rounded-lg p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <tab.icon className="h-3 w-3" />
                    {tab.label}
                    {tab.count > 0 && (
                      <Badge variant="secondary" className="text-xs h-4 px-1">
                        {tab.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {getCurrentItems().length > 0 ? (
                <div className="p-2">
                  {getCurrentItems().map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => trackNavigation(item.id)}
                        className="group flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium truncate">{item.label}</p>
                            {item.isTrending && (
                              <Badge variant="default" className="text-xs bg-orange-500">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                            {activeTab === 'frequent' && item.frequency > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {item.frequency}
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleBookmark(item.id);
                            }}
                            className={`p-1 rounded hover:bg-muted/50 transition-colors ${
                              item.isBookmarked ? 'text-yellow-500' : 'text-muted-foreground'
                            }`}
                            aria-label={item.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                            title={item.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                          >
                            <Bookmark className={`h-3 w-3 ${item.isBookmarked ? 'fill-current' : ''}`} />
                          </button>
                          <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    {activeTab === 'frequent' && <TrendingUp className="h-5 w-5 text-muted-foreground/60" />}
                    {activeTab === 'recent' && <Clock className="h-5 w-5 text-muted-foreground/60" />}
                    {activeTab === 'trending' && <Zap className="h-5 w-5 text-muted-foreground/60" />}
                    {activeTab === 'bookmarks' && <Bookmark className="h-5 w-5 text-muted-foreground/60" />}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {activeTab === 'frequent' && 'No frequent pages yet'}
                    {activeTab === 'recent' && 'No recent activity'}
                    {activeTab === 'trending' && 'No trending content'}
                    {activeTab === 'bookmarks' && 'No bookmarked pages'}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Start navigating to see smart suggestions
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-muted/20 border-t border-border/10">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Learns from your behavior</span>
                <span>Enterprise Edition</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
