'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TableOfContentsProps {
  content: string;
  locale: 'en' | 'kh';
}

interface TocItem {
  id: string;
  title: string;
  level: number;
  element: HTMLElement | null;
}

export default function ArticleTableOfContents({ content, locale }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Extract headings from content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    const items: TocItem[] = Array.from(headings).map((heading, index) => {
      const id = `heading-${index}`;
      const title = heading.textContent || '';
      const level = parseInt(heading.tagName.charAt(1));
      
      return {
        id,
        title,
        level,
        element: null
      };
    });

    setTocItems(items);

    // Add IDs to headings in the DOM
    const contentElement = document.querySelector('.prose');
    if (contentElement) {
      const contentHeadings = contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
      contentHeadings.forEach((heading, index) => {
        heading.id = `heading-${index}`;
      });
    }

    // Set up scroll spy
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (let i = items.length - 1; i >= 0; i--) {
        const element = document.getElementById(items[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(items[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [content]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800">
      <div 
        className="p-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {locale === 'kh' ? 'មាតិកា' : 'Contents'}
          </h3>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4">
          <nav className="space-y-1">
            {tocItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHeading(item.id);
                }}
                className={`block text-sm py-1 px-2 rounded transition-colors ${
                  activeId === item.id
                    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
              >
                {item.title}
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
