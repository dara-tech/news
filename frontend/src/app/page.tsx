import api from '@/lib/api';
import { Article, Category } from '@/types';
import MaintenanceCheck from '@/components/MaintenanceCheck';
import HomePage from '@/components/home/HomePage';
import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.razewire.online';

interface HomeProps {
  params: Promise<{ lang: 'en' | 'kh' }>;
}

interface NewsData {
  breaking: Article[];
  featured: Article[];
  latest: Article[];
}

async function getNewsData(lang: 'en' | 'kh'): Promise<NewsData> {
  try {
    const [breakingRes, featuredRes, latestRes] = await Promise.all([
      api.get('/news/breaking', { params: { lang } }),
      api.get('/news/featured', { params: { lang } }),
      api.get('/news', { params: { lang } }),
    ]);

    return {
      breaking: breakingRes.data?.data || breakingRes.data || [],
      featured: featuredRes.data?.data || featuredRes.data || [],
      latest: latestRes.data?.news || latestRes.data?.data || latestRes.data || [],
    };
  } catch (error) {
    console.error('Error fetching news data:', error);
    throw new Error('Could not load news. Please try refreshing the page.');
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const response = await api.get('/categories', { timeout: 15000 });
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const { lang } = await params;
  const isKhmer = lang === 'kh';
  
  const title = isKhmer ? 'Razewire - ព័ត៌មានថ្មីៗ' : 'Razewire - Your Daily Source of News';
  const description = isKhmer 
    ? 'ព័ត៌មានថ្មីៗ និងព័ត៌មានចុងក្រោយពីពិភពលោក បច្ចេកវិទ្យា អាជីវកម្ម និងកីឡា។'
    : 'Your daily source for the latest news in tech, business, and sports. Stay informed, stay ahead.';
  
  const canonicalUrl = `${BASE_URL}/${lang}`;
  
  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: isKhmer ? '/en' : undefined,
        km: !isKhmer ? '/km' : undefined,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Razewire',
      locale: isKhmer ? 'km_KH' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@razewire',
    },
  };
}

export default async function Home({ params }: HomeProps) {
  const resolvedParams = await params;
  const [newsData, categories] = await Promise.all([
    getNewsData(resolvedParams.lang as 'en' | 'kh'),
    getCategories()
  ]);

  return (
    <MaintenanceCheck>
      <HomePage 
        lang={resolvedParams.lang as 'en' | 'kh'}
        newsData={newsData}
        categories={categories}
      />
    </MaintenanceCheck>
  );
}
