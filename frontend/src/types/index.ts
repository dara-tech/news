export type Locale = 'en' | 'kh';

export type LocalizedString = {
  [key in Locale]?: string;
};

export interface Category {
  newsCount: number;
  _id: string;
  name: LocalizedString;
  slug?: LocalizedString;
  description?: LocalizedString;
  color?: string;
  articlesCount?: number;
}

export interface Article {
  id: string;
  _id: string;
  slug: LocalizedString;
  title: LocalizedString;
  content: LocalizedString;
  description: LocalizedString;
  category: {
    _id: string;
    name: LocalizedString;
    slug?: LocalizedString;
    color?: string;
  };
  thumbnail?: string;
  images?: string[];
  createdAt: string;
  publishedAt: string;
  updatedAt: string;
  views?: number;
  likes?: number;
  comments?: number;
  author: {
    _id: string;
    avatar?: string;
    profileImage?: string;
    name?: string;
    username?: string;
    email?: string;
    role?: string;
  };
  tags?: string[];
  isBreaking?: boolean;
  isFeatured?: boolean;
  status?: string;
  keywords?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  profileImage?: string;
  token?: string;
  profession?: string;
  interests?: string[];
  age?: number;
  company?: string;
  industry?: string;
  experience?: 'junior' | 'mid' | 'senior' | 'executive';
}
