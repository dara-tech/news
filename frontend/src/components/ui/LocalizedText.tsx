'use client';

import { cn } from '@/lib/utils';
import { useOptimizedLanguage } from '@/hooks/useOptimizedLanguage';

interface LocalizedTextProps {
  children: React.ReactNode;
  className?: string;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'button';
  weight?: 'light' | 'normal' | 'bold';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  onClick?: () => void;
}

export function LocalizedText({ 
  children, 
  className, 
  as: Component = 'span',
  weight = 'normal',
  size = 'base',
  onClick
}: LocalizedTextProps) {
  const { language } = useOptimizedLanguage();
  const isKhmer = language === 'kh';

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    bold: 'font-bold'
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl'
  };

  return (
    <Component
      className={cn(
        isKhmer ? 'font-khmer' : 'font-sans',
        weightClasses[weight],
        sizeClasses[size],
        className
      )}
      lang={isKhmer ? 'kh' : 'en'}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}
