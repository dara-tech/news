export interface Category {
  _id: string;
  name: { en: string; kh: string };
  slug?: { en: string; kh: string };
  description?: { en: string; kh: string };
}

export interface Article {
  _id: string;
  slug: string;
  title: { en: string; kh: string };
  content: { en: string; kh: string };
  description: { en: string; kh: string };
  category: {
    _id: string;
    name: { en: string; kh: string };
    slug?: { en: string; kh: string };
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
