'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight, Sparkles, Eye, Heart, MessageCircle, Award, Star, Verified } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion} from 'framer-motion';

interface AuthorMiniCardProps {
  author: {
    _id: string;
    avatar?: string;
    profileImage?: string;
    username?: string;
    email?: string;
    role?: string;
    stats?: {
      articlesCount?: number;
      followersCount?: number;
      likesCount?: number;
    };
    isVerified?: boolean;
    lastActive?: string;
  };
  locale: 'en' | 'kh';
  showStats?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export default function AuthorMiniCard({ 
  author, 
  locale, 
  showStats = true,
  variant = 'default'
}: AuthorMiniCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  
  const authorName =
    author?.username ||
    (author?.email ? author.email.split('@')[0] : 'Anonymous');

  // Simulate online status based on lastActive
  useEffect(() => {
    if (author?.lastActive) {
      const lastActiveTime = new Date(author.lastActive).getTime();
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      setIsOnline(now - lastActiveTime < fiveMinutes);
    }
  }, [author?.lastActive]);

  const getRoleConfig = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return {
          color: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
          icon: <Award className="w-3 h-3" />,
          glow: 'shadow-red-500/20'
        };
      case 'editor':
        return {
          color: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
          icon: <Star className="w-3 h-3" />,
          glow: 'shadow-blue-500/20'
        };
      case 'user':
        return {
          color: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
          icon: <User className="w-3 h-3" />,
          glow: 'shadow-green-500/20'
        };
      default:
        return {
          color: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white',
          icon: <Calendar className="w-3 h-3" />,
          glow: 'shadow-gray-500/20'
        };
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const profileImageUrl = author?.profileImage || author?.avatar;
  const roleConfig = getRoleConfig(author?.role);

  const cardVariants = {
    default: "p-3 sm:p-5",
    compact: "p-2 sm:p-3",
    featured: "p-4 sm:p-6"
  };

  const avatarSizes = {
    default: "w-12 h-12 sm:w-16 sm:h-16",
    compact: "w-10 h-10 sm:w-12 sm:h-12",
    featured: "w-16 h-16 sm:w-20 sm:h-20"
  };

  return (
    <motion.div 
      className={`group relative overflow-hidden border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 ${cardVariants[variant]} hover:shadow-lg transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600 backdrop-blur-sm shadow-none`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}

      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Simplified Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-950/20 dark:to-purple-950/20 opacity-0"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
        {/* Simplified Avatar */}
        <motion.div>
          {profileImageUrl && !imageError ? (
            <div className="relative">
              <Image
                src={profileImageUrl}
                alt={authorName}
                width={variant === 'featured' ? 80 : variant === 'compact' ? 48 : 64}
                height={variant === 'featured' ? 80 : variant === 'compact' ? 48 : 64}
                className={`relative ${avatarSizes[variant]} rounded-full object-cover ring-2 ring-white dark:ring-gray-900 shadow-md`}
                onError={() => setImageError(true)}
              />
              
              {/* Status Indicator */}
              <motion.div 
                className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 ${
                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                } rounded-full border-2 border-white dark:border-gray-900`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
              
              {/* Verification Badge */}
              {author?.isVerified && (
                <motion.div 
                  className="absolute -top-1 -left-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Verified className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </div>
          ) : (
            <div className="relative">
              <div className={`relative ${avatarSizes[variant]} rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md ring-2 ring-white dark:ring-gray-900`}>
                {authorName.charAt(0).toUpperCase()}
              </div>
              
              <motion.div 
                className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 ${
                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                } rounded-full border-2 border-white dark:border-gray-900`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
          )}
        </motion.div>

        {/* Author Info */}
        <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
          <motion.div 
            className="flex flex-col sm:flex-row items-center sm:items-start gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-bold text-gray-900 dark:text-white truncate text-base sm:text-lg">
              {authorName}
            </h3>
            
            {author?.role && (
              <Badge 
                className={`text-xs px-3 py-1 font-semibold shrink-0 ${roleConfig.color} border-0`}
              >
                <span className="flex items-center gap-1.5">
                  {roleConfig.icon}
                  <span>
                    {author.role.charAt(0).toUpperCase() + author.role.slice(1)}
                  </span>
                </span>
              </Badge>
            )}
          </motion.div>
          
          <motion.div 
            className="flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-500" />
            <span className="font-medium">Content Creator</span>
          </motion.div>
          
          {/* Stats Row */}
          {showStats && author?.stats && (
            <motion.div 
              className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {author.stats.articlesCount && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Eye className="w-3 h-3" />
                  <span>{formatCount(author.stats.articlesCount)}</span>
                </div>
              )}
              {author.stats.followersCount && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Heart className="w-3 h-3" />
                  <span>{formatCount(author.stats.followersCount)}</span>
                </div>
              )}
              {author.stats.likesCount && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-3 h-3" />
                  <span>{formatCount(author.stats.likesCount)}</span>
                </div>
              )}
            </motion.div>
          )}
          
          <motion.div 
            className="flex items-center justify-center sm:justify-start gap-1 text-xs text-gray-400 dark:text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>Published author</span>
            {isOnline && (
              <span className="ml-2 text-green-500 font-medium">
                • Online
              </span>
            )}
          </motion.div>
        </div>

        {/* Action Button */}
        <motion.div 
          className="w-full sm:w-auto mt-3 sm:mt-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link href={`/${locale === 'kh' ? 'km' : 'en'}/author/${author._id}`} className="block">
            <Button 
              variant="outline" 
              size="sm"
              className="group/btn border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 bg-white/50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-300 w-full sm:w-auto"
            >
              <span className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 group-hover/btn:text-blue-700 dark:group-hover/btn:text-blue-300">
                <span className="font-semibold text-xs sm:text-sm">
                  <span className="hidden sm:inline">View Profile</span>
                  <span className="sm:hidden">Profile</span>
                </span>
                <motion.div
                  animate={{ x: isHovered ? 4 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </motion.div>
              </span>
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
} 