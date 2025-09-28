import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import AuthorsPageClient from './AuthorsPageClient';

interface AuthorsPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export async function generateMetadata({ params }: AuthorsPageProps): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: 'Authors' });
  
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
    },
  };
}

export default async function AuthorsPage({ params }: AuthorsPageProps) {
  const { lang } = await params;
  return <AuthorsPageClient locale={lang as 'en' | 'kh'} />;
}
