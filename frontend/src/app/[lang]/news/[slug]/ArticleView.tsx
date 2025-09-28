import { getArticle } from '@/lib/articles';
import { notFound } from 'next/navigation';
import NewsArticleLoader from './NewsArticleLoader';

interface ArticleViewProps {
  params: Promise<{ id: string; lang: 'en' | 'kh' }>;
}

export default async function ArticleView({ params }: ArticleViewProps) {
  const { id, lang } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  const locale = lang === 'kh' ? 'kh' : 'en';

  return <NewsArticleLoader article={article} locale={locale} />;
}