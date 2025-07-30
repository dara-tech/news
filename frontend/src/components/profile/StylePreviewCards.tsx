'use client';

import React from 'react';
import { User, Cat, Sparkles, Zap, Building2, Cpu, Brush, Crown, Heart, Star, Rocket, Smile } from 'lucide-react';
import { ProfileImageStyle } from '@/hooks/useGenerateProfileImage';

interface StylePreviewCardProps {
  style: ProfileImageStyle;
  isSelected: boolean;
  onSelect: (style: ProfileImageStyle) => void;
  isLoading?: boolean;
}

const styleConfigs = {
  simple: {
    name: 'Human Character',
    description: 'Clean, friendly human portrait',
    icon: User,
    colors: ['#3B82F6', '#8B5CF6'],
    gradient: 'from-blue-500 to-purple-600'
  },
  professional: {
    name: 'Business Person',
    description: 'Professional human character',
    icon: Building2,
    colors: ['#1F2937', '#3B82F6'],
    gradient: 'from-gray-800 to-blue-600'
  },
  creative: {
    name: 'Fantasy Character',
    description: 'Magical, colorful character',
    icon: Sparkles,
    colors: ['#EC4899', '#8B5CF6', '#06B6D4'],
    gradient: 'from-pink-500 via-purple-500 to-cyan-500'
  },
  gaming: {
    name: 'Gaming Character',
    description: 'Cool gaming avatar',
    icon: Zap,
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    gradient: 'from-red-400 via-cyan-400 to-blue-500'
  },
  minimalist: {
    name: 'Cute Animal',
    description: 'Adorable animal character',
    icon: Cat,
    colors: ['#F3F4F6', '#9CA3AF'],
    gradient: 'from-gray-100 to-gray-400'
  },
  corporate: {
    name: 'Robot Character',
    description: 'Futuristic robot avatar',
    icon: Cpu,
    colors: ['#1E40AF', '#374151'],
    gradient: 'from-blue-800 to-gray-700'
  },
  tech: {
    name: 'Alien Character',
    description: 'Extraterrestrial being',
    icon: Crown,
    colors: ['#10B981', '#3B82F6', '#6366F1'],
    gradient: 'from-green-500 via-blue-500 to-indigo-500'
  },
  artistic: {
    name: 'Anime Character',
    description: 'Stylized anime avatar',
    icon: Brush,
    colors: ['#F59E0B', '#EC4899', '#8B5CF6'],
    gradient: 'from-yellow-500 via-pink-500 to-purple-500'
  },
  mood: {
    name: 'Happy Mood',
    description: 'Cheerful, optimistic character',
    icon: Heart,
    colors: ['#F59E0B', '#EC4899', '#8B5CF6'],
    gradient: 'from-yellow-500 via-pink-500 to-purple-500'
  },
  mood2: {
    name: 'Calm Mood',
    description: 'Peaceful, serene character',
    icon: Star,
    colors: ['#10B981', '#3B82F6', '#6366F1'],
    gradient: 'from-green-500 via-blue-500 to-indigo-500'
  },
  mood3: {
    name: 'Energetic Mood',
    description: 'Dynamic, lively character',
    icon: Rocket,
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    gradient: 'from-red-400 via-cyan-400 to-blue-500'
  },
  mood4: {
    name: 'Thoughtful Mood',
    description: 'Contemplative, intellectual character',
    icon: Smile,
    colors: ['#F3F4F6', '#9CA3AF'],
    gradient: 'from-gray-100 to-gray-400'
  }
};

export const StylePreviewCard = ({ style, isSelected, onSelect, isLoading }: StylePreviewCardProps) => {
  const config = styleConfigs[style];
  const IconComponent = config.icon;

  return (
    <div
      className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
      }`}
      onClick={() => onSelect(style)}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 rounded-xl flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Icon and gradient preview */}
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          
          {isSelected && (
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
        </div>

        {/* Style info */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
            {config.name}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {config.description}
          </p>
        </div>

        {/* Color preview */}
        <div className="flex gap-1">
          {config.colors.map((color, index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-600"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface StylePreviewGridProps {
  selectedStyle: ProfileImageStyle | null;
  onStyleSelect: (style: ProfileImageStyle) => void;
  loadingStyle?: ProfileImageStyle | null;
}

export const StylePreviewGrid = ({ selectedStyle, onStyleSelect, loadingStyle }: StylePreviewGridProps) => {
  const styles: ProfileImageStyle[] = [
    'simple', 'professional', 'creative', 'gaming', 
    'minimalist', 'corporate', 'tech', 'artistic',
    'mood', 'mood2', 'mood3', 'mood4'
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Choose Character Style
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select a character type for your AI-generated profile picture
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {styles.map((style) => (
          <StylePreviewCard
            key={style}
            style={style}
            isSelected={selectedStyle === style}
            onSelect={onStyleSelect}
            isLoading={loadingStyle === style}
          />
        ))}
      </div>
    </div>
  );
};