import type { Metadata } from "next"
import CategoryPageClient from "./CategoryPageClient"

// ----- INTERFACES & API FUNCTIONS -----

interface CategoryPageProps {
  params: Promise<{ lang: string; slug: string }>
  searchParams?: Promise<{ page?: string }>
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

// ----- METADATA & HELPER -----
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  // Await the params Promise
  const { lang, slug } = await params

  const category = await getCategoryBySlug(slug)
  if (!category) {
    return {
      title: lang === "kh" ? "រកមិនឃើញប្រភេទ" : "Category Not Found",
    }
  }

  const title =
    typeof category.name === "string"
      ? category.name
      : category.name[lang as "en" | "kh"] || category.name.en || "Category"
  const description =
    typeof category.description === "string"
      ? category.description
      : category.description?.[lang as "en" | "kh"] || category.description?.en || ""
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
export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  return <CategoryPageClient params={resolvedParams} searchParams={resolvedSearchParams} />
}
