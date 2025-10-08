'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Settings, 
  BarChart3, 
  Users, 
  FileText, 
  Zap, 
  TrendingUp,
  Clock,
  Star,
  Bookmark,
  History,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Calendar,
  MessageSquare,
  Bell,
  Shield,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  description: string;
  category: 'content' | 'analytics' | 'management' | 'tools';
  isNew?: boolean;
  isPro?: boolean;
  shortcut?: string;
}

interface EnterpriseQuickActionsProps {
  lang: string;
  user: any;
}

export default function EnterpriseQuickActions({ lang, user }: EnterpriseQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentActions, setRecentActions] = useState<string[]>([]);

  // Load recent actions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentActions');
    if (saved) {
      setRecentActions(JSON.parse(saved));
    }
  }, []);

  // Save action to recent
  const trackAction = (actionId: string) => {
    const updated = [actionId, ...recentActions.filter(id => id !== actionId)].slice(0, 5);
    setRecentActions(updated);
    localStorage.setItem('recentActions', JSON.stringify(updated));
  };

  const quickActions: QuickAction[] = [
    // Content Management
    {
      id: 'create-article',
      label: 'Create Article',
      icon: Plus,
      href: `/${lang}/admin/news/create`,
      description: 'Write and publish new content',
      category: 'content',
      shortcut: 'C'
    },
    {
      id: 'manage-articles',
      label: 'Manage Articles',
      icon: FileText,
      href: `/${lang}/admin/news`,
      description: 'Edit and organize content',
      category: 'content'
    },
    {
      id: 'content-calendar',
      label: 'Content Calendar',
      icon: Calendar,
      href: `/${lang}/admin/content-calendar`,
      description: 'Plan and schedule content',
      category: 'content',
      isNew: true
    },
    
    // Analytics & Insights
    {
      id: 'analytics-dashboard',
      label: 'Analytics Dashboard',
      icon: BarChart3,
      href: `/${lang}/admin/analytics`,
      description: 'View performance metrics',
      category: 'analytics',
      isPro: true
    },
    {
      id: 'trending-content',
      label: 'Trending Content',
      icon: TrendingUp,
      href: `/${lang}/admin/trending`,
      description: 'See what\'s performing well',
      category: 'analytics'
    },
    {
      id: 'user-insights',
      label: 'User Insights',
      icon: Users,
      href: `/${lang}/admin/users`,
      description: 'Analyze user behavior',
      category: 'analytics'
    },
    
    // Management Tools
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: `/${lang}/admin/settings`,
      description: 'Configure system settings',
      category: 'management'
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: Users,
      href: `/${lang}/admin/users`,
      description: 'Manage user accounts',
      category: 'management'
    },
    {
      id: 'security-center',
      label: 'Security Center',
      icon: Shield,
      href: `/${lang}/admin/security`,
      description: 'Monitor security status',
      category: 'management',
      isPro: true
    },
    
    // Productivity Tools
    {
      id: 'bulk-actions',
      label: 'Bulk Actions',
      icon: Upload,
      href: `/${lang}/admin/bulk-actions`,
      description: 'Perform bulk operations',
      category: 'tools'
    },
    {
      id: 'export-data',
      label: 'Export Data',
      icon: Download,
      href: `/${lang}/admin/export`,
      description: 'Export reports and data',
      category: 'tools'
    }
  ];

  const getRecentActions = () => {
    return recentActions
      .map(id => quickActions.find(action => action.id === id))
      .filter(Boolean) as QuickAction[];
  };

  const getActionsByCategory = (category: QuickAction['category']) => {
    return quickActions.filter(action => action.category === category);
  };

  const categories = [
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'management', label: 'Management', icon: Settings },
    { id: 'tools', label: 'Tools', icon: Zap }
  ];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="group relative px-3 py-1.5 h-auto rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-150 text-muted-foreground hover:text-foreground hover:bg-muted/20"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Zap className="h-4 w-4" />
        Quick Actions
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
            className="absolute right-0 mt-2 w-96 bg-background/98 backdrop-blur-xl border border-border/20 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {quickActions.length} actions
                  </Badge>
                </div>
              </div>
            </div>

            {/* Recent Actions */}
            {getRecentActions().length > 0 && (
              <div className="p-4 border-b border-border/10">
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent
                </h4>
                <div className="space-y-1">
                  {getRecentActions().slice(0, 3).map((action) => (
                    <Link
                      key={action.id}
                      href={action.href}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors group"
                      onClick={() => trackAction(action.id)}
                    >
                      <action.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{action.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                      </div>
                      {action.shortcut && (
                        <Badge variant="outline" className="text-xs">
                          {action.shortcut}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            <div className="max-h-80 overflow-y-auto">
              {categories.map((category) => {
                const actions = getActionsByCategory(category.id as QuickAction['category']);
                if (actions.length === 0) return null;

                return (
                  <div key={category.id} className="p-4 border-b border-border/10 last:border-b-0">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      {category.label}
                    </h4>
                    <div className="space-y-1">
                      {actions.map((action) => (
                        <Link
                          key={action.id}
                          href={action.href}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors group"
                          onClick={() => trackAction(action.id)}
                        >
                          <action.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{action.label}</p>
                              {action.isNew && (
                                <Badge variant="default" className="text-xs bg-green-500">
                                  New
                                </Badge>
                              )}
                              {action.isPro && (
                                <Badge variant="default" className="text-xs bg-purple-500">
                                  Pro
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                          </div>
                          {action.shortcut && (
                            <Badge variant="outline" className="text-xs">
                              {action.shortcut}
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 bg-muted/20 border-t border-border/10">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘</kbd> + <kbd className="px-1 py-0.5 bg-muted rounded text-xs">K</kbd> for search</span>
                <span>Enterprise Edition</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
