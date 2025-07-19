export type Locale = 'en' | 'kh';

export type LocalizedString = {
  [key in Locale]?: string;
};

export interface Category {
  _id: string;
  name: LocalizedString;
  slug?: LocalizedString;
  description?: LocalizedString;
}

export interface Article {
  _id: string;
  slug: LocalizedString;
  title: LocalizedString;
  content: LocalizedString;
  description: LocalizedString;
  category: {
    _id: string;
    name: LocalizedString;
    slug?: LocalizedString;
  };
  thumbnail?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
  };
  tags?: string[];
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  token?: string;
}
