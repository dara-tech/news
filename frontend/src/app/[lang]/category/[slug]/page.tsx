import type { Metadata } from "next"
import CategoryPageClient from "./CategoryPageClient"

// ----- INTERFACES & API FUNCTIONS -----

interface CategoryPageProps {
  params: Promise<{ lang: string; slug: string }>
}

async function getCategoryBySlug(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
    const response = await fetch(`${apiUrl}/api/categories/slug/${slug}`, { cache: "no-store" })
    if (!response.ok) return null
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error("Error fetching category:", error)
    return null
  }
}

// Fetch latest news for a category, sorted by newest first
async function getLatestNewsByCategory(categorySlug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
    const response = await fetch(`${apiUrl}/api/news/category/${encodeURIComponent(categorySlug)}`);
    const data = await response.json();
    console.log(data)
    return data.success ? data.news : [];

  } catch (error) {
    console.error("Error fetching latest news for category:", error);
    return [];
  }
}

// ----- METADATA & HELPER -----
function getLocalizedText(
  text: string | { [key: string]: string | undefined } | undefined,
  lang: string
): string {
  const safeLang = lang === 'km' ? 'kh' : lang;
  if (!text) return '';
  if (typeof text === 'string') return text;
  if (typeof text === 'object') {
    if (typeof text[safeLang] === 'string') return text[safeLang]!;
    const values = Object.values(text).filter(Boolean);
    if (values.length > 0) return values[0] as string;
  }
  return '';
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  // Await the params Promise
  const { lang, slug } = await params

  const category = await getCategoryBySlug(slug)
  if (!category) {
    return {
      title: lang === "kh" ? "រកមិនឃើញប្រភេទ" : "Category Not Found",
    }
  }

  const title = getLocalizedText(category.name, lang) || "Category";
  const description = getLocalizedText(category.description, lang) || `${title}`;
  const siteName = lang === "kh" ? "ព័ត៌មានថ្មីៗ" : "Latest News"

  return {
    title: `${title} - ${siteName}`,
    description: description || `${title} - ${siteName}`,
    alternates: {
      canonical: `https://yourdomain.com/${lang}/category/${slug}`,
      languages: {
        "en-US": `https://yourdomain.com/en/category/${slug}`,
        "km-KH": `https://yourdomain.com/km/category/${slug}`,
      },
    },
    openGraph: {
      title: `${title} - ${siteName}`,
      description: description || `${title} - ${siteName}`,
      url: `https://yourdomain.com/${lang}/category/${slug}`,
      siteName: siteName,
      locale: lang === "kh" ? "km_KH" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - ${siteName}`,
      description: description || `${title} - ${siteName}`,
    },
  }
}

// ----- PAGE COMPONENT -----
export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return <div>Category not found</div>;
  }
  const articles = await getLatestNewsByCategory(category.slug);
  return <CategoryPageClient params={resolvedParams} category={{ category, articles }} />;
}
