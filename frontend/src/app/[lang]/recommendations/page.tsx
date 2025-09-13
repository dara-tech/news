import { Metadata } from 'next';
import RecommendationEngine from '@/components/recommendations/RecommendationEngine';

interface RecommendationsPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export const metadata: Metadata = {
  title: 'AI-Powered Recommendations | Razewire',
  description: 'Discover personalized content recommendations powered by AI. Get tailored news and articles based on your interests and reading behavior.',
  keywords: 'recommendations, AI, personalized content, news, articles, discovery',
  openGraph: {
    title: 'AI-Powered Recommendations | Razewire',
    description: 'Discover personalized content recommendations powered by AI.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-Powered Recommendations | Razewire',
    description: 'Discover personalized content recommendations powered by AI.',
  },
};

export default async function RecommendationsPage({ params }: RecommendationsPageProps) {
  const { lang } = await params;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <RecommendationEngine 
          initialTab="for-you"
          className="max-w-7xl mx-auto"
        />
      </div>
    </div>
  );
}

