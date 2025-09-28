import type { Metadata } from "next"
import AuthorPageClient from "./AuthorPageClient"
import { getAuthorProfile } from '@/lib/api'

// ----- INTERFACES & API FUNCTIONS -----

interface AuthorPageProps {
  params: Promise<{ lang: string; authorId: string }>
}

// ----- METADATA & HELPER -----
function getLocalizedText(
  text: string | { [key: string]: string | undefined } | undefined,
  lang: string
): string {
  const safeLang = lang === 'kh' ? 'kh' : 'en';
  if (!text) return '';
  if (typeof text === 'string') return text;
  if (typeof text === 'object') {
    if (typeof text[safeLang] === 'string') return text[safeLang]!;
    const values = Object.values(text).filter(Boolean);
    if (values.length > 0) return values[0] as string;
  }
  return '';
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  // Await the params Promise
  const { lang, authorId } = await params

  try {
    const authorData = await getAuthorProfile(authorId)
    
    if (!authorData || !authorData.success) {
      return {
        title: lang === "kh" ? "រកមិនឃើញអ្នកនិពន្ធ" : "Author Not Found",
      }
    }

    const authorName = authorData.author.username || authorData.author.email?.split('@')[0] || 'Author'
    const siteName = lang === "kh" ? "ព័ត៌មានថ្មីៗ" : "Latest News"

    return {
      title: `${authorName} - ${siteName}`,
      description: `Read articles by ${authorName} on ${siteName}`,
      alternates: {
        canonical: `https://yourdomain.com/${lang}/author/${authorId}`,
        languages: {
          "en-US": `https://yourdomain.com/en/author/${authorId}`,
          "km-KH": `https://yourdomain.com/kh/author/${authorId}`,
        },
      },
      openGraph: {
        title: `${authorName} - ${siteName}`,
        description: `Read articles by ${authorName} on ${siteName}`,
        url: `https://yourdomain.com/${lang}/author/${authorId}`,
        siteName: siteName,
        locale: lang === "kh" ? "km_KH" : "en_US",
        type: "profile",
      },
      twitter: {
        card: "summary_large_image",
        title: `${authorName} - ${siteName}`,
        description: `Read articles by ${authorName} on ${siteName}`,
      },
    }
  } catch {
    return {
      title: lang === "kh" ? "រកមិនឃើញអ្នកនិពន្ធ" : "Author Not Found",
    }
  }
}

// ----- PAGE COMPONENT -----
export default async function AuthorProfilePage({ params }: AuthorPageProps) {
  const resolvedParams = await params;
  const { authorId } = resolvedParams;
  
  let authorData = null;
  let error = null;

  try {
    authorData = await getAuthorProfile(authorId);
    if (!authorData || !authorData.success) {
      authorData = null;
    }
  } catch (err) {
    error = 'Failed to load author profile';
  }

  return <AuthorPageClient params={params} authorData={authorData} />;
}