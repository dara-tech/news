import { getArticle } from '@/lib/articles';
import { notFound } from 'next/navigation';
import NewsArticleLoader from './NewsArticleLoader';

interface ArticleViewProps {
  params: { id: string; lang: 'en' | 'km' };
}

export default async function ArticleView({ params }: ArticleViewProps) {
  const { id, lang } = params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  const locale = lang === 'km' ? 'kh' : 'en';

  return <NewsArticleLoader article={article} locale={locale} />;
}