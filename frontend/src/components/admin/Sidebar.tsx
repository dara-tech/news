'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Settings,
  LogOut,
  Home,
  ChevronRight,
  MoreHorizontal,
  Shield,
  Activity,
  Heart,
  MessageSquare,
  Palette,
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
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Navigation data structure
// interface NavItem {
//   title: string;
//   url?: string;
//   icon?: ElementType;
//   isActive?: boolean;
//   items?: {
//     title: string;
//     url: string;
//   }[];
// }

// Navigation configuration
const data = {
  user: {
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: '/avatars/admin.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Content Management',
      icon: Newspaper,
      items: [
        {
          title: 'All Articles',
          url: '/admin/news',
        },
        {
          title: 'Create Article',
          url: '/admin/news/create',
        },
        {
          title: 'Categories',
          url: '/admin/categories',
        },
      ],
    },
    {
      title: 'User Management',
      icon: Users,
      items: [
        {
          title: 'All Users',
          url: '/admin/users',
        },
        {
          title: 'User Roles',
          url: '/admin/users/roles',
          icon: Shield,
        },
        {
          title: 'Activity Logs',
          url: '/admin/activity',
          icon: Activity,
        },
      ],
    },
    {
      title: 'Engagements',
      icon: Heart,
      items: [
        {
          title: 'Likes',
          url: '/admin/likes',
          icon: Heart,
        },
        {
          title: 'Comments',
          url: '/admin/comments',
          icon: MessageSquare,
        },
        {
          title: 'Follows',
          url: '/admin/follows',
          icon: Users,
        },
      ],
    },
    {
      title: 'Settings',
      icon: Settings,
      items: [
        {
          title: 'General',
          url: '/admin/settings/general',
        },
        {
          title: 'Logo Management',
          url: '/admin/settings/logo',
          icon: Palette,
        },
        {
          title: 'Security',
          url: '/admin/settings/security',
        },
        {
          title: 'Integrations',
          url: '/admin/settings/integrations',
        },
        {
          title: 'Audit Log',
          url: '/admin/settings/audit',
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

  // Helper function to get full href with language prefix
  const getFullHref = (href: string) => `/${lang}${href}`;

  // Helper function to check if a path is active
  const isPathActive = (path: string) => {
    const fullPath = getFullHref(path);
    return pathname === fullPath || pathname.startsWith(fullPath + '/');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={getFullHref('/')}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Panel</span>
                  <span className="truncate text-xs">NewsApp</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
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
                        <SidebarMenuButton tooltip={item.title}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton 
                                asChild 
                                isActive={isPathActive(subItem.url)}
                              >
                                <Link href={getFullHref(subItem.url)}>
                                  {(() => {
                                    const Icon = (subItem as { icon?: React.ComponentType<{ className?: string }> }).icon;
                                    return Icon ? <Icon className="h-4 w-4" /> : null;
                                  })()}
                                  <span>{subItem.title}</span>
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
                  >
                    <Link href={getFullHref(item.url!)}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={getFullHref('/')}>
                    <Home className="size-4" />
                    <span>Back to Site</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage 
                      src={user?.profileImage || user?.avatar || data.user.avatar} 
                      alt={user?.username || data.user.name} 
                    />
                    <AvatarFallback className="rounded-lg">
                      {(user?.username || data.user.name).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.username || data.user.name}
                    </span>
                    <span className="truncate text-xs">
                      {user?.email || data.user.email}
                    </span>
                  </div>
                  <MoreHorizontal className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href={getFullHref('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
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
          {/* Mobile-optimized header */}
          <div className="flex h-14 sm:h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-3 sm:px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 h-8 w-8 sm:h-auto sm:w-auto" />
              <div className="h-4 w-px bg-sidebar-border hidden sm:block" />
              <h1 className="text-base sm:text-lg font-semibold truncate">Admin Dashboard</h1>
            </div>
            <ThemeToggle />
          </div>
          {/* Mobile-optimized content area */}
          <div className="flex-1 overflow-auto bg-muted/10 p-3 sm:p-4 lg:p-6">
            <div className="mx-auto max-w-7xl w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
