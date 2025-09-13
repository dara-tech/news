'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Settings,
  BarChart3,
  LogOut,
  Home,
  ChevronRight,
  MoreHorizontal,
  Shield,
  Activity,
  Heart,
  MessageSquare,
  Monitor,
  User,
  Brain,
  Zap,
  Target,
  Key,
} from 'lucide-react';
import { ThemeToggle } from "@/components/ui/theme-toggle"

import { useAuth } from '@/context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Navigation configuration with modern structure
const data = {
  user: {
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: '/placeholder.jpg',
  },
  navMain: [
    {
      title: 'Overview',
      url: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'AI',
      icon: Brain,
      items: [
        {
          title: 'AI Assistant',
          url: '/ai-assistant',
          icon: Brain,
        },
        {
          title: 'AI Recommendations',
          url: '/admin/recommendations',
          icon: Target,
        },
      ],
    },
    {
      title: 'Content',
      icon: Newspaper,
      items: [
        {
          title: 'Articles',
          url: '/admin/news',
        },
        {
          title: 'New Article',
          url: '/admin/news/create',
        },
        {
          title: 'Categories',
          url: '/admin/categories',
        },
      ],
    },
    {
      title: 'Users',
      icon: Users,
      items: [
        {
          title: 'All Users',
          url: '/admin/users',
        },
        {
          title: 'Roles',
          url: '/admin/users/roles',
        },
        {
          title: 'Activity',
          url: '/admin/activity',
        },
      ],
    },
    {
      title: 'Engagement',
      icon: Heart,
      items: [
        {
          title: 'Likes',
          url: '/admin/likes',
        },
        {
          title: 'Comments',
          url: '/admin/comments',
        },
        {
          title: 'Follows',
          url: '/admin/follows',
        },
      ],
    },
    {
      title: 'Settings',
      icon: Settings,
      items: [
        {
          title: 'Frontend Controls',
          url: '/admin/frontend-controls',
          icon: Monitor,
        },
        {
          title: 'General',
          url: '/admin/settings/general',
        },
        {
          title: 'Branding',
          url: '/admin/settings/logo',
        },
        {
          title: 'Social Links',
          url: '/admin/settings/social-media',
        },
        {
          title: 'Security',
          url: '/admin/settings/security',
        },
        {
          title: 'Monitoring',
          url: '/admin/settings/monitoring',
        },
      ],
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      items: [
        {
          title: 'Enterprise Analytics',
          url: '/admin/enterprise-analytics',
          icon: Target,
        },
        {
          title: 'SEO Dashboard',
          url: '/admin/seo',
        },
        {
          title: 'Process Mining',
          url: '/admin/processing-dashboard',
        },
        {
          title: 'Data Quality',
          url: '/admin/data-quality',
        },
        {
          title: 'API Keys',
          url: '/admin/api-keys',
          icon: Key,
        },
      ],
    },
    {
      title: 'Automation',
      icon: Zap,
      items: [
        {
          title: 'Auto-Posting',
          url: '/admin/auto-posting',
        },
        {
          title: 'Sentinel AI',
          url: '/admin/sentinel-auto-publish',
        },
      ],
    },
  ],
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const lang = params?.lang || 'en';
  const { logout, user } = useAuth();

  // Helper function to get full href with language prefix (only for non-admin routes)
  const getFullHref = (href: string) => {
    // Admin routes don't use language prefix
    if (href.startsWith('/admin/')) {
      return href;
    }
    return `/${lang}${href}`;
  };

  // Helper function to check if a path is active
  const isPathActive = (path: string) => {
    const fullPath = getFullHref(path);
    return pathname === fullPath || pathname.startsWith(fullPath + '/');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar variant="inset" className="border-r border-border/40 bg-gray-50/50 dark:bg-gray-900/50">
      <SidebarHeader className="border-b border-border/40 px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-xl">
              <Link href={getFullHref('/')}>
                <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 text-white shadow-sm">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-foreground">Admin</span>
                  <span className="truncate text-xs text-muted-foreground/80">Razewire Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            {data.navMain.map((item) => {
              const isActive = item.url ? isPathActive(item.url) : false;
              
              if (item.items) {
                return (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={item.items.some(subItem => isPathActive(subItem.url))}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton 
                          tooltip={item.title} 
                          className="text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 rounded-xl mx-1"
                        >
                          {item.icon && <item.icon className="size-4 text-gray-600 dark:text-gray-400" />}
                          <span className="text-foreground">{item.title}</span>
                          <ChevronRight className="ml-auto size-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="ml-3 mt-1 space-y-0.5">
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton 
                                asChild 
                                isActive={isPathActive(subItem.url)}
                                className="text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-lg py-2"
                              >
                                <Link href={getFullHref(subItem.url)} className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                                  <span className="text-gray-700 dark:text-gray-300 group-data-[active=true]:text-foreground font-medium">
                                    {subItem.title}
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              }
              
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                    isActive={isActive}
                    className="text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 rounded-xl mx-1"
                  >
                    <Link href={getFullHref(item.url!)}>
                      {item.icon && <item.icon className="size-4 text-gray-600 dark:text-gray-400" />}
                      <span className="text-foreground">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarGroup className="mt-8 pt-4 border-t border-border/40">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  className="text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-xl mx-1"
                >
                  <Link href={getFullHref('/')}>
                    <Home className="size-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-foreground">Back to Site</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border/40 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-xl"
                >
                  <Avatar className="h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-700">
                    <AvatarImage 
                      src={user?.profileImage || user?.avatar || data.user.avatar} 
                      alt={user?.username || data.user.name} 
                    />
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 text-white font-semibold">
                      {(user?.username || data.user.name).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-foreground">
                      {user?.username || data.user.name}
                    </span>
                    <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {user?.email || data.user.email}
                    </span>
                  </div>
                  <MoreHorizontal className="ml-auto size-4 text-gray-500 dark:text-gray-400" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-xl border border-border/40 shadow-lg"
                side="bottom"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link href={getFullHref('/profile')} className="flex items-center gap-3 px-3 py-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link href={getFullHref('/admin/settings')} className="flex items-center gap-3 px-3 py-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="font-medium">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}

// Wrapper component to provide sidebar context
export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          {/* Refined header with better spacing and typography */}
          <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/40 bg-background/95 backdrop-blur-sm px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-8 w-8 hover:bg-accent/50 transition-colors rounded-md" />
              <div className="h-5 w-px bg-border/60 hidden sm:block" />
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-foreground tracking-tight">Dashboard</h1>
                <p className="text-xs text-muted-foreground/80 hidden sm:block">Manage your content and settings</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
          {/* Refined content area with better padding and max-width */}
          <div className="flex-1 overflow-auto bg-muted/20 p-4 lg:p-6">
            <div className="mx-auto max-w-7xl w-full space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
