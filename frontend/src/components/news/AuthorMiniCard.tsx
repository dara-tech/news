'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface AuthorMiniCardProps {
  author: {
    _id: string;
    avatar?: string;
    profileImage?: string;
    username?: string;
    email?: string;
    role?: string;
  };
  locale: 'en' | 'kh';
}

export default function AuthorMiniCard({ author, locale }: AuthorMiniCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const authorName =
    author?.username ||
    (author?.email ? author.email.split('@')[0] : 'Anonymous');

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'editor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'user':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Sparkles className="w-3 h-3" />;
      case 'editor':
        return <User className="w-3 h-3" />;
      default:
        return <Calendar className="w-3 h-3" />;
    }
  };

  const profileImageUrl = author?.profileImage || author?.avatar;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-700">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
      </div>
      
      <div className="relative flex items-center gap-4">
        {/* Enhanced Avatar */}
        <div className="relative">
          {profileImageUrl && !imageError ? (
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900"></div>
              </div>
              <Image
                src={profileImageUrl}
                alt={authorName}
                width={56}
                height={56}
                className="relative rounded-full object-cover ring-2 ring-white dark:ring-gray-900 shadow-lg"
                onError={() => setImageError(true)}
              />
              {/* Online Status Indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900"></div>
              </div>
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xl shadow-lg ring-2 ring-white dark:ring-gray-900">
                {authorName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-400 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
            </div>
          )}
        </div>

        {/* Author Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-lg">
              {authorName}
            </h3>
            {author?.role && (
              <Badge 
                variant="secondary" 
                className={`text-xs px-2 py-0.5 font-medium ${getRoleColor(author.role)}`}
              >
                <span className="flex items-center gap-1">
                  {getRoleIcon(author.role)}
                  {author.role.charAt(0).toUpperCase() + author.role.slice(1)}
                </span>
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <User className="w-3.5 h-3.5" />
            <span>Content Creator</span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>Published author</span>
          </div>
        </div>

        {/* Enhanced Action Button */}
        <Link href={`/${locale === 'kh' ? 'km' : 'en'}/author/${author._id}`}>
          <Button 
            variant="outline" 
            size="sm"
            className="group/btn relative overflow-hidden border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <span className="relative z-10 flex items-center gap-2 text-gray-700 dark:text-gray-300 group-hover/btn:text-blue-700 dark:group-hover/btn:text-blue-300 transition-colors duration-300">
              <span className="font-medium">View Profile</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
            </span>
            
            {/* Button Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"></div>
          </Button>
        </Link>
      </div>

      {/* Card Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
    </div>
  );
} 