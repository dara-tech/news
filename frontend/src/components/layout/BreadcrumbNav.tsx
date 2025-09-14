'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment, memo } from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
  isLast?: boolean;
}

const BreadcrumbNav = memo(() => {
  const pathname = usePathname();
  
  // Get current language
  const lang = pathname.split('/')[1] || 'en';
  
  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Always start with home
    breadcrumbs.push({
      label: 'Home',
      href: `/${lang}`,
    });
    
    // Skip language segment
    const pathSegments = segments.slice(1);
    
    let currentPath = `/${lang}`;
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Convert segment to readable label
      let label = segment;
      
      // Handle special cases
      switch (segment) {
        case 'news':
          label = 'News';
          break;
        case 'recommendations':
          label = 'Recommendations';
          break;
        case 'search':
          label = 'Search';
          break;
        case 'admin':
          label = 'Admin';
          break;
        case 'profile':
          label = 'Profile';
          break;
        case 'categories':
          label = 'Categories';
          break;
        case 'category':
          label = 'Category';
          break;
        case 'author':
          label = 'Author';
          break;
        case 'contact':
          label = 'Contact';
          break;
        case 'about':
          label = 'About';
          break;
        case 'faq':
          label = 'FAQ';
          break;
        case 'privacy':
          label = 'Privacy Policy';
          break;
        case 'terms':
          label = 'Terms of Service';
          break;
        default:
          // Capitalize first letter and replace hyphens with spaces
          label = segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
      }
      
      breadcrumbs.push({
        label,
        href: currentPath,
        isLast,
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  // Don't show breadcrumbs on home page or if only one item
  if (breadcrumbs.length <= 1) {
    return null;
  }
  
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground py-2 px-4 bg-muted/30 border-b border-border/50">
      {breadcrumbs.map((item, index) => (
        <Fragment key={item.href}>
          {index === 0 ? (
            <Link
              href={item.href}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
          ) : (
            <Link
              href={item.href}
              className={`hover:text-foreground transition-colors ${
                item.isLast ? 'text-foreground font-medium' : ''
              }`}
            >
              {item.label}
            </Link>
          )}
          
          {!item.isLast && (
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
          )}
        </Fragment>
      ))}
    </nav>
  );
});

BreadcrumbNav.displayName = 'BreadcrumbNav';

export default BreadcrumbNav;
