export interface BilingualText {
  en: string;
  kh: string;
}

export interface CategoryData {
  id?: string;
  _id?: string;
  name: string | BilingualText;
  slug: string | BilingualText;
  description: string | BilingualText;
  color: string;
  isActive: boolean;
  newsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
