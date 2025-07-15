export interface NewsArticle {
  _id: string;
  title: { en: string; kh: string };
  category: string;
  status: 'draft' | 'published';
  isFeatured: boolean;
  isBreaking: boolean;
  createdAt: string;
}
