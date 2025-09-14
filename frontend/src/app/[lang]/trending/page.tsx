import TrendingPageClient from './TrendingPageClient'

interface TrendingPageProps {
  params: Promise<{
    lang: string
  }>
}

export default async function TrendingPage({ params }: TrendingPageProps) {
  const { lang } = await params
  
  return <TrendingPageClient lang={lang} />
}
