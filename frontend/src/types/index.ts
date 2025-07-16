export interface Category {
  _id: string;
  name: string;
  description?: string;
}

export interface Article {
  _id: string;
  slug: string;
  title: { en: string; kh: string };
  content: { en: string; kh: string };
  description: { en: string; kh: string };
  category: string;
  thumbnail?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
  };
  tags?: string[];
}
