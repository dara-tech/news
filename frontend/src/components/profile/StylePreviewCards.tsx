'use client';

import React from 'react';
import {
  User,
  Cat,
  Sparkles,
  Zap,
  Building2,
  Cpu,
  Brush,
  Crown,
  Heart,
  Star,
  Rocket,
  Smile,
  Shield,
  Flame,
  Stethoscope,
  Syringe,
  BookOpen,
  GraduationCap,
  Award,
  Brain,
  Camera,
  Music,
  Code,
  Gavel,
  ChefHat,
  Plane,
  Home,
  PenTool,
  FileText,
  Microscope,
  Calculator,
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  Landmark,
  HardHat,
  Wrench,
  Scissors,
  Trees,
  Factory,
  Truck,
  Lock,
  Search,
  FlaskConical,
  Palette,
  HeartHandshake,
  Globe,
  Gamepad2,
  MinusCircle,
  Bot,
  Sparkle,
  Sun,
  Moon,
  BatteryCharging,
  CloudLightning,
} from 'lucide-react';
import type { ProfileImageStyle } from '@/hooks/useGenerateProfileImage';

// Extend the style config to match all styles from the hook
type StyleConfig = {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  colors: string[];
  gradient: string;
};

const styleConfigs: Record<string, StyleConfig> = {
  // Base Styles
  simple: {
    name: 'Simple',
    description: 'Clean, minimalist portrait',
    icon: User,
    colors: ['#3B82F6', '#6B7280'],
    gradient: 'from-blue-500 to-gray-500',
  },
  professional: {
    name: 'Professional',
    description: 'Business professional',
    icon: Briefcase,
    colors: ['#1F2937', '#3B82F6', '#E5E7EB'],
    gradient: 'from-gray-800 to-blue-600',
  },
  corporate: {
    name: 'Corporate',
    description: 'Executive presence',
    icon: Building2,
    colors: ['#111827', '#4B5563', '#2563EB'],
    gradient: 'from-gray-900 to-blue-700',
  },
  minimalist: {
    name: 'Minimalist',
    description: 'Geometric simplicity',
    icon: MinusCircle,
    colors: ['#1F2937', '#E5E7EB'],
    gradient: 'from-gray-800 to-gray-200',
  },
  
  // Military & Emergency
  army: {
    name: 'Army Officer',
    description: 'Military leadership',
    icon: Shield,
    colors: ['#134E4A', '#365314', '#713F12'],
    gradient: 'from-green-900 to-yellow-700',
  },
  police: {
    name: 'Police Officer',
    description: 'Law enforcement',
    icon: Shield,
    colors: ['#1E3A8A', '#1F2937', '#DC2626'],
    gradient: 'from-blue-900 to-red-600',
  },
  fire: {
    name: 'Firefighter',
    description: 'Emergency responder',
    icon: Flame,
    colors: ['#DC2626', '#F59E0B', '#1F2937'],
    gradient: 'from-red-600 to-yellow-500',
  },
  
  // Medical
  doctor: {
    name: 'Doctor',
    description: 'Medical professional',
    icon: Stethoscope,
    colors: ['#FFFFFF', '#3B82F6', '#10B981'],
    gradient: 'from-blue-500 to-green-500',
  },
  nurse: {
    name: 'Nurse',
    description: 'Healthcare hero',
    icon: HeartHandshake,
    colors: ['#F0F9FF', '#06B6D4', '#E0F2FE'],
    gradient: 'from-cyan-400 to-blue-300',
  },
  dentist: {
    name: 'Dentist',
    description: 'Dental professional',
    icon: Smile,
    colors: ['#FFFFFF', '#3B82F6', '#E5E7EB'],
    gradient: 'from-blue-400 to-gray-300',
  },
  veterinarian: {
    name: 'Veterinarian',
    description: 'Animal doctor',
    icon: Cat,
    colors: ['#10B981', '#F59E0B', '#EC4899'],
    gradient: 'from-green-500 to-pink-500',
  },
  pharmacist: {
    name: 'Pharmacist',
    description: 'Medicine expert',
    icon: FlaskConical,
    colors: ['#FFFFFF', '#10B981', '#3B82F6'],
    gradient: 'from-green-500 to-blue-500',
  },
  
  // Education
  teacher: {
    name: 'Teacher',
    description: 'Educator',
    icon: BookOpen,
    colors: ['#3B82F6', '#10B981', '#F59E0B'],
    gradient: 'from-blue-500 to-yellow-500',
  },
  student: {
    name: 'Student',
    description: 'Learner',
    icon: GraduationCap,
    colors: ['#6366F1', '#EC4899', '#10B981'],
    gradient: 'from-indigo-500 to-green-500',
  },
  principal: {
    name: 'Principal',
    description: 'School leader',
    icon: Award,
    colors: ['#1E3A8A', '#DC2626', '#F59E0B'],
    gradient: 'from-blue-800 to-yellow-500',
  },
  professor: {
    name: 'Professor',
    description: 'Academic scholar',
    icon: Brain,
    colors: ['#4B5563', '#7C3AED', '#F59E0B'],
    gradient: 'from-gray-600 to-purple-600',
  },
  
  // Creative & Arts
  creative: {
    name: 'Creative',
    description: 'Imaginative artist',
    icon: Sparkles,
    colors: ['#EC4899', '#8B5CF6', '#06B6D4', '#10B981'],
    gradient: 'from-pink-500 via-purple-500 to-cyan-500',
  },
  artistic: {
    name: 'Artistic',
    description: 'Fine arts master',
    icon: Palette,
    colors: ['#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4'],
    gradient: 'from-yellow-500 via-pink-500 to-purple-500',
  },
  designer: {
    name: 'Designer',
    description: 'Creative professional',
    icon: PenTool,
    colors: ['#6366F1', '#EC4899', '#F3F4F6'],
    gradient: 'from-indigo-500 to-pink-500',
  },
  photographer: {
    name: 'Photographer',
    description: 'Visual storyteller',
    icon: Camera,
    colors: ['#1F2937', '#F59E0B', '#EF4444'],
    gradient: 'from-gray-800 to-red-500',
  },
  musician: {
    name: 'Musician',
    description: 'Music creator',
    icon: Music,
    colors: ['#7C3AED', '#EC4899', '#2563EB'],
    gradient: 'from-purple-600 to-blue-600',
  },
  artist: {
    name: 'Artist',
    description: 'Creative soul',
    icon: Brush,
    colors: ['#F59E0B', '#EC4899', '#8B5CF6'],
    gradient: 'from-yellow-500 to-purple-600',
  },
  
  // Tech & Engineering
  tech: {
    name: 'Tech Professional',
    description: 'Digital innovator',
    icon: Code,
    colors: ['#10B981', '#3B82F6', '#6366F1', '#1F2937'],
    gradient: 'from-green-500 to-indigo-600',
  },
  engineer: {
    name: 'Engineer',
    description: 'Problem solver',
    icon: HardHat,
    colors: ['#2563EB', '#F59E0B', '#6B7280'],
    gradient: 'from-blue-600 to-gray-500',
  },
  data_scientist: {
    name: 'Data Scientist',
    description: 'Data wizard',
    icon: Brain,
    colors: ['#06B6D4', '#8B5CF6', '#10B981'],
    gradient: 'from-cyan-500 to-green-500',
  },
  cybersecurity_analyst: {
    name: 'Cybersecurity',
    description: 'Digital guardian',
    icon: Lock,
    colors: ['#DC2626', '#1F2937', '#10B981'],
    gradient: 'from-red-600 to-green-500',
  },
  
  // Business & Finance
  entrepreneur: {
    name: 'Entrepreneur',
    description: 'Business innovator',
    icon: TrendingUp,
    colors: ['#F59E0B', '#EC4899', '#6366F1'],
    gradient: 'from-yellow-500 to-indigo-600',
  },
  ceo: {
    name: 'CEO',
    description: 'Chief Executive',
    icon: Crown,
    colors: ['#1F2937', '#F59E0B', '#3B82F6'],
    gradient: 'from-gray-800 to-blue-600',
  },
  banker: {
    name: 'Banker',
    description: 'Finance professional',
    icon: DollarSign,
    colors: ['#1E3A8A', '#10B981', '#F59E0B'],
    gradient: 'from-blue-800 to-yellow-500',
  },
  accountant: {
    name: 'Accountant',
    description: 'Numbers expert',
    icon: Calculator,
    colors: ['#374151', '#3B82F6', '#10B981'],
    gradient: 'from-gray-700 to-green-500',
  },
  
  // Legal
  lawyer: {
    name: 'Lawyer',
    description: 'Legal professional',
    icon: Gavel,
    colors: ['#1F2937', '#991B1B', '#F3F4F6'],
    gradient: 'from-gray-800 to-red-800',
  },
  judge: {
    name: 'Judge',
    description: 'Justice guardian',
    icon: Landmark,
    colors: ['#1F2937', '#7C2D12', '#F59E0B'],
    gradient: 'from-gray-900 to-yellow-600',
  },
  
  // Service & Other
  chef: {
    name: 'Chef',
    description: 'Culinary artist',
    icon: ChefHat,
    colors: ['#FFFFFF', '#DC2626', '#1F2937'],
    gradient: 'from-red-500 to-gray-800',
  },
  pilot: {
    name: 'Pilot',
    description: 'Aviation expert',
    icon: Plane,
    colors: ['#3B82F6', '#1F2937', '#F59E0B'],
    gradient: 'from-blue-600 to-yellow-500',
  },
  architect: {
    name: 'Architect',
    description: 'Design visionary',
    icon: Home,
    colors: ['#4B5563', '#3B82F6', '#E5E7EB'],
    gradient: 'from-gray-600 to-blue-500',
  },
  scientist: {
    name: 'Scientist',
    description: 'Research expert',
    icon: Microscope,
    colors: ['#10B981', '#6366F1', '#06B6D4'],
    gradient: 'from-green-500 to-cyan-500',
  },
  psychologist: {
    name: 'Psychologist',
    description: 'Mind healer',
    icon: Brain,
    colors: ['#8B5CF6', '#EC4899', '#6366F1'],
    gradient: 'from-purple-600 to-indigo-600',
  },
  writer: {
    name: 'Writer',
    description: 'Wordsmith',
    icon: PenTool,
    colors: ['#1F2937', '#F59E0B', '#EC4899'],
    gradient: 'from-gray-800 to-pink-500',
  },
  journalist: {
    name: 'Journalist',
    description: 'Truth seeker',
    icon: FileText,
    colors: ['#DC2626', '#1F2937', '#3B82F6'],
    gradient: 'from-red-600 to-blue-600',
  },
  
  // Mood-based
  mood: {
    name: 'Happy',
    description: 'Joyful & optimistic',
    icon: Sun,
    colors: ['#F59E0B', '#EF4444', '#EC4899', '#FBBF24'],
    gradient: 'from-yellow-500 to-pink-500',
  },
  mood2: {
    name: 'Calm',
    description: 'Peaceful & serene',
    icon: Moon,
    colors: ['#06B6D4', '#93C5FD', '#E0E7FF'],
    gradient: 'from-cyan-500 to-indigo-200',
  },
  mood3: {
    name: 'Energetic',
    description: 'Dynamic & lively',
    icon: BatteryCharging,
    colors: ['#EF4444', '#F59E0B', '#10B981', '#06B6D4'],
    gradient: 'from-red-500 to-cyan-500',
  },
  mood4: {
    name: 'Thoughtful',
    description: 'Deep & introspective',
    icon: CloudLightning,
    colors: ['#6366F1', '#4B5563', '#9CA3AF'],
    gradient: 'from-indigo-600 to-gray-400',
  },
  
  // Gaming
  gaming: {
    name: 'Gaming',
    description: 'Esports champion',
    icon: Gamepad2,
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#A855F7'],
    gradient: 'from-red-400 via-cyan-400 to-purple-500',
  },
  
  // Additional professions with fallback icons
  translator: {
    name: 'Translator',
    description: 'Language expert',
    icon: Globe,
    colors: ['#06B6D4', '#F59E0B', '#EC4899'],
    gradient: 'from-cyan-500 to-pink-500',
  },
  social_worker: {
    name: 'Social Worker',
    description: 'Community helper',
    icon: Users,
    colors: ['#10B981', '#EC4899', '#F59E0B'],
    gradient: 'from-green-500 to-yellow-500',
  },
};

export interface StylePreviewCardProps {
  style: ProfileImageStyle;
  isSelected: boolean;
  onSelect: (style: ProfileImageStyle) => void;
  isLoading?: boolean;
}

export const StylePreviewCard = ({
  style,
  isSelected,
  onSelect,
  isLoading,
}: StylePreviewCardProps) => {
  const config = styleConfigs[style] || {
    name: style.charAt(0).toUpperCase() + style.slice(1).replace(/_/g, ' '),
    description: 'Professional avatar',
    icon: User,
    colors: ['#3B82F6', '#8B5CF6'],
    gradient: 'from-blue-500 to-purple-600',
  };
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
          <div
            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
          >
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
          {config.colors.map((color: string, index: number) => (
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

export interface StylePreviewGridProps {
  selectedStyle: ProfileImageStyle | null;
  onStyleSelect: (style: ProfileImageStyle) => void;
  loadingStyle?: ProfileImageStyle | null;
}

export const StylePreviewGrid = ({
  selectedStyle,
  onStyleSelect,
  loadingStyle,
}: StylePreviewGridProps) => {
  // Organize styles by category
  const styleCategories: Record<string, string[]> = {
    'Base Styles': ['simple', 'professional', 'corporate', 'minimalist'],
    'Emergency & Military': ['army', 'police', 'fire'],
    'Medical': ['doctor', 'nurse', 'dentist', 'veterinarian', 'pharmacist'],
    'Education': ['teacher', 'student', 'principal', 'professor'],
    'Creative & Arts': ['creative', 'artistic', 'designer', 'photographer', 'musician', 'artist'],
    'Tech & Engineering': ['tech', 'engineer', 'data_scientist', 'cybersecurity_analyst'],
    'Business & Finance': ['entrepreneur', 'ceo', 'banker', 'accountant'],
    'Legal': ['lawyer', 'judge'],
    'Service & Other': ['chef', 'pilot', 'architect', 'scientist', 'psychologist', 'writer', 'journalist', 'translator', 'social_worker'],
    'Mood-based': ['mood', 'mood2', 'mood3', 'mood4'],
    'Special': ['gaming'],
  };

  const [showAll, setShowAll] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  // Get styles to display based on filters
  const getStylesToDisplay = () => {
    if (selectedCategory) {
      return styleCategories[selectedCategory] || [];
    }
    
    if (showAll) {
      return Object.values(styleCategories).flat();
    }
    
    // Show popular styles by default
    return [
      'simple', 'professional', 'tech', 'creative',
      'doctor', 'teacher', 'artist', 'engineer',
      'mood', 'gaming', 'corporate', 'minimalist'
    ];
  };

  const stylesToDisplay = getStylesToDisplay();

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

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setSelectedCategory(null);
            setShowAll(false);
          }}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            !selectedCategory && !showAll
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Popular
        </button>
        
        {Object.keys(styleCategories).map((category) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              setShowAll(false);
            }}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
        
        <button
          onClick={() => {
            setSelectedCategory(null);
            setShowAll(true);
          }}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            showAll
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Show All
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stylesToDisplay.map((style) => (
          <StylePreviewCard
            key={style}
            style={style as ProfileImageStyle}
            isSelected={selectedStyle === style}
            onSelect={onStyleSelect}
            isLoading={loadingStyle === style}
          />
        ))}
      </div>

      {/* Show count */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
        Showing {stylesToDisplay.length} of {Object.values(styleCategories).flat().length} available styles
      </p>
    </div>
  );
};