import type React from "react"
import { Layers, Package, ServerCrash } from "lucide-react"
import Link from "next/link"

// --- TYPES ---
// It's a good practice to have your types defined in a central file (e.g., @/types/index.ts)
// For this example, I'll define them here.
interface CategoryName {
  en: string
  kh: string
  [key: string]: string
}

interface Category {
  _id: string
  slug?: CategoryName
  name?: CategoryName
  color?: string
  articlesCount?: number
}

// --- CONSTANTS ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

// This forces the page to be dynamically rendered, ensuring fresh data on every request.
export const dynamic = "force-dynamic"

// --- DATA FETCHING ---
async function getCategories(): Promise<{ data: Category[] | null; error: string | null }> {
  try {
    // Using `cache: 'no-store'` ensures we always get the latest data.
    // For categories that don't change often, consider revalidation: `next: { revalidate: 3600 }`
    const res = await fetch(`${API_URL}/api/categories`, { cache: "no-store" })

    if (!res.ok) {
      // Handle non-2xx responses from the API
      throw new Error(`API Error: ${res.status} ${res.statusText}`)
    }

    const result = await res.json()

    if (!result.success) {
      throw new Error("API returned success: false")
    }

    return { data: result.data || [], error: null }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return { data: null, error: errorMessage }
  }
}

// --- UI COMPONENTS ---
/**
 * A skeleton loader component to display while category data is being fetched.
 */
const CategoryCardSkeleton = () => (
  <div className="w-full p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl animate-pulse">
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 mb-4 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      <div className="w-3/4 h-5 mb-2 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
      <div className="w-1/2 h-4 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
    </div>
  </div>
)

/**
 * A card component to display a single category.
 */
const CategoryCard = ({ category, lang }: { category: Category; lang: string }) => {
  const categoryName = category.name?.[lang] || category.name?.en || "Untitled Category"
  const articleText = category.articlesCount === 1 ? "article" : "articles"

  return (
    <Link
      href={`/${lang}/category/${String(category.slug?.[lang] || category.slug?.en || category._id || 'unknown').replace(/[^a-zA-Z0-9-_]/g, '-')}`}
      className="group relative flex flex-col items-center text-center p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out"
    >
      <div
        className="absolute top-0 left-0 w-full h-full rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle, ${category.color || "#3B82F6"} 0%, transparent 70%)` }}
      />
      <div
        className="relative flex items-center justify-center w-16 h-16 mb-4 rounded-full text-white shadow-inner"
        style={{ backgroundColor: category.color || "#3B82F6" }}
      >
        <Layers size={28} />
      </div>
      <span className="font-bold text-gray-800 dark:text-white z-10">{categoryName}</span>
      <span className="text-sm text-gray-500 dark:text-gray-400 z-10">
        {category.articlesCount || 0} {articleText}
      </span>
    </Link>
  )
}

/**
 * A component to display an error or empty state message.
 */
const StateMessage = ({
  icon: Icon,
  title,
  message,
}: {
  icon: React.ElementType
  title: string
  message: string
}) => (
  <div className="col-span-full flex flex-col items-center justify-center text-center bg-gray-100 dark:bg-gray-800/50 p-12 rounded-2xl">
    <Icon className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
    <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">{title}</h2>
    <p className="text-gray-500 dark:text-gray-400 mt-2">{message}</p>
  </div>
)

// --- MAIN PAGE COMPONENT ---
interface CategoriesPageProps {
  params: Promise<{ lang: string }>
}

export default async function CategoriesPage({ params }: CategoriesPageProps) {
  // Await the params since they're now async in Next.js 15
  const { lang } = await params
  const { data: categories, error } = await getCategories()

  const renderContent = () => {
    // Error State
    if (error) {
      return (
        <StateMessage
          icon={ServerCrash}
          title="Could Not Load Categories"
          message="There was an issue connecting to the server. Please try again later."
        />
      )
    }

    // Loading State (simulated by checking if categories is null without an error)
    // In a client component with useEffect, you'd have a dedicated `isLoading` state.
    if (categories === null) {
      return Array.from({ length: 12 }).map((_, i) => <CategoryCardSkeleton key={i} />)
    }

    // Empty State
    if (categories.length === 0) {
      return (
        <StateMessage
          icon={Package}
          title="No Categories Found"
          message="It looks like there are no categories available at the moment."
        />
      )
    }

    // Success State
    return categories.map((category) => <CategoryCard key={category._id} category={category} lang={lang} />)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Explore Our Categories
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover articles, guides, and resources on a wide range of topics.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {renderContent()}
        </div>
      </section>
    </div>
  )
}
