export interface PlatformConfig {
  name: string;
  displayName: string;
  dimensions: { width: number; height: number };
  recommendedStyles: string[];
  description: string;
  icon: string;
  color: string;
  cropType: 'square' | 'circle' | 'rounded';
  quality: 'high' | 'medium' | 'low';
}

export const platformConfigs: Record<string, PlatformConfig> = {
  linkedin: {
    name: 'linkedin',
    displayName: 'LinkedIn',
    dimensions: { width: 400, height: 400 },
    recommendedStyles: ['professional', 'simple', 'corporate'],
    description: 'Professional networking platform',
    icon: '',
    color: '#0077B5',
    cropType: 'square',
    quality: 'high'
  },
  twitter: {
    name: 'twitter',
    displayName: 'Twitter/X',
    dimensions: { width: 400, height: 400 },
    recommendedStyles: ['creative', 'gaming', 'artistic'],
    description: 'Social media platform',
    icon: '',
    color: '#1DA1F2',
    cropType: 'circle',
    quality: 'high'
  },
  instagram: {
    name: 'instagram',
    displayName: 'Instagram',
    dimensions: { width: 110, height: 110 },
    recommendedStyles: ['creative', 'artistic', 'minimalist'],
    description: 'Photo sharing platform',
    icon: '',
    color: '#E4405F',
    cropType: 'circle',
    quality: 'high'
  },
  github: {
    name: 'github',
    displayName: 'GitHub',
    dimensions: { width: 260, height: 260 },
    recommendedStyles: ['tech', 'corporate', 'simple'],
    description: 'Developer platform',
    icon: '',
    color: '#333333',
    cropType: 'square',
    quality: 'medium'
  },
  facebook: {
    name: 'facebook',
    displayName: 'Facebook',
    dimensions: { width: 170, height: 170 },
    recommendedStyles: ['simple', 'professional', 'minimalist'],
    description: 'Social networking',
    icon: '',
    color: '#1877F2',
    cropType: 'circle',
    quality: 'medium'
  },
  youtube: {
    name: 'youtube',
    displayName: 'YouTube',
    dimensions: { width: 800, height: 800 },
    recommendedStyles: ['creative', 'gaming', 'artistic'],
    description: 'Video platform',
    icon: '',
    color: '#FF0000',
    cropType: 'square',
    quality: 'high'
  },
  discord: {
    name: 'discord',
    displayName: 'Discord',
    dimensions: { width: 128, height: 128 },
    recommendedStyles: ['gaming', 'creative', 'tech'],
    description: 'Gaming community platform',
    icon: '',
    color: '#5865F2',
    cropType: 'circle',
    quality: 'medium'
  },
  slack: {
    name: 'slack',
    displayName: 'Slack',
    dimensions: { width: 192, height: 192 },
    recommendedStyles: ['professional', 'simple', 'corporate'],
    description: 'Team collaboration',
    icon: '',
    color: '#4A154B',
    cropType: 'square',
    quality: 'medium'
  }
};

export const getPlatformConfig = (platform: string): PlatformConfig | null => {
  return platformConfigs[platform] || null;
};

export const getAllPlatforms = (): PlatformConfig[] => {
  return Object.values(platformConfigs);
};

export const getRecommendedPlatforms = (): PlatformConfig[] => {
  return [platformConfigs.linkedin, platformConfigs.twitter, platformConfigs.github, platformConfigs.instagram];
};