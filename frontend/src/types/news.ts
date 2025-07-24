export interface NewsArticle {
  _id: string;
  title: { en: string; kh: string };
  category?: { _id: string; name: { en: string; kh: string } };
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  isBreaking: boolean;
  createdAt: string;
  content: { en: string; kh: string };
  description: { en: string; kh: string };
  slug: string;
  tags: string[];
  thumbnail?: string;
  images?: string[];
  author: { _id: string; name: string; email: string };
  publishedAt?: string;
  views: number;
  meta?: {
    title?: { en: string; kh: string };
    description?: { en: string; kh: string };
    keywords?: string[];
  };
}
