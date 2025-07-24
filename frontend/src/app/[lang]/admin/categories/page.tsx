"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit, Trash2, Tag, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { CategorySkeleton } from "@/components/admin/categories/CategorySkeleton"
import { toast } from "sonner"
import api from "@/lib/api"
import { AxiosError } from "axios"

interface BilingualText {
  en: string
  kh: string
}

interface CategoryData {
  id?: string
  _id?: string
  name: BilingualText
  slug: string
  description: BilingualText
  color: string
  isActive: boolean
  articlesCount?: number
  createdAt?: string
  updatedAt?: string
  newsCount?: number
}

const getBilingualText = (text: BilingualText | undefined, lang: "en" | "kh" = "en"): string => {
  if (!text) return ""
  return text[lang] || text.en || ""
}

interface PageProps {
  params: Promise<{
    lang: "en" | "kh"
  }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

type BilingualInput = string | { en?: unknown; kh?: unknown } | undefined

function normalizeBilingual(val: BilingualInput): BilingualText {
  if (typeof val === "string") {
    return { en: val, kh: val }
  }
  if (val && typeof val === "object") {
    return {
      en: typeof (val as { en?: unknown }).en === "string" ? (val as { en: string }).en : "",
      kh: typeof (val as { kh?: unknown }).kh === "string" ? (val as { kh: string }).kh : "",
    }
  }
  return { en: "", kh: "" }
}

function extractSlug(slug: unknown): string {
  if (typeof slug === "string") return slug
  if (
    slug &&
    typeof slug === "object" &&
    "en" in slug &&
    typeof (slug as { en?: unknown }).en === "string"
  ) {
    return (slug as { en: string }).en
  }
  return ""
}

function mapApiCategory(cat: unknown): CategoryData {
  if (!cat || typeof cat !== "object") {
    return {
      name: { en: "", kh: "" },
      slug: "",
      description: { en: "", kh: "" },
      color: "",
      isActive: false,
    }
  }
  const c = cat as Record<string, unknown>
  return {
    id: typeof c.id === "string" ? c.id : undefined,
    _id: typeof c._id === "string" ? c._id : undefined,
    name: normalizeBilingual(c.name as BilingualInput),
    slug: extractSlug(c.slug),
    description: normalizeBilingual(c.description as BilingualInput),
    color: typeof c.color === "string" ? c.color : "",
    isActive: typeof c.isActive === "boolean" ? c.isActive : false,
    articlesCount:
      typeof c.articlesCount === "number"
        ? c.articlesCount
        : typeof c.newsCount === "number"
        ? c.newsCount
        : 0,
    createdAt: typeof c.createdAt === "string" ? c.createdAt : undefined,
    updatedAt: typeof c.updatedAt === "string" ? c.updatedAt : undefined,
    newsCount: typeof c.newsCount === "number" ? c.newsCount : undefined,
  }
}

export default function CategoriesPage({ params }: PageProps) {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentLang, setCurrentLang] = useState<"en" | "kh">("en")
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    categoryId: string | null
    categoryName: string
  }>({
    isOpen: false,
    categoryId: null,
    categoryName: "",
  })

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setCurrentLang(resolvedParams.lang)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!currentLang) return

    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const response = await api.get(`/categories?lang=${currentLang}`)
        if (response.data && response.data.success) {
          const apiCategories: CategoryData[] = Array.isArray(response.data.data)
            ? response.data.data.map(mapApiCategory)
            : []
          setCategories(apiCategories)
        } else {
          setCategories([])
          toast.error("Failed to load categories")
        }
      } catch {
        setCategories([])
        toast.error("Failed to load categories")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [currentLang])

  const openDeleteDialog = (categoryId: string, categoryName: string) => {
    setDeleteDialog({
      isOpen: true,
      categoryId,
      categoryName,
    })
  }

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/categories/${deleteDialog.categoryId}`)
      if (response.data && response.data.success !== false) {
        const categoriesResponse = await api.get(`/categories?lang=${currentLang}`)
        if (categoriesResponse.data && categoriesResponse.data.success) {
          const apiCategories: CategoryData[] = Array.isArray(categoriesResponse.data.data)
            ? categoriesResponse.data.data.map(mapApiCategory)
            : []
          setCategories(apiCategories)
        }
        setDeleteDialog((prev) => ({ ...prev, isOpen: false }))
        toast.success(response.data.message || "Category deleted successfully")
      } else {
        throw new Error(response.data?.message || "Failed to delete category")
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to delete category"
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.message) {
          errorMessage = error.message
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
    }
  }

  const totalCategories = categories.length
  const activeCategories = categories.filter((cat) => cat.isActive).length
  const totalArticles = categories.reduce((sum, cat) => sum + (cat.articlesCount || 0), 0)
  const avgArticles = totalCategories > 0 ? Math.round(totalArticles / totalCategories) : 0

  if (isLoading) {
    return <CategorySkeleton />
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Manage news categories and organize your content</p>
          </div>
          <Button asChild>
            <Link href={`/${currentLang}/admin/categories/create`} className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              New Category
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCategories}</div>
              <p className="text-xs text-muted-foreground">
                {totalCategories > 0 ? "All your categories" : "No categories yet"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCategories}</div>
              <p className="text-xs text-muted-foreground">
                {activeCategories > 0 ? "Currently visible" : "No active categories"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalArticles}</div>
              <p className="text-xs text-muted-foreground">Across all categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg per Category</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgArticles}</div>
              <p className="text-xs text-muted-foreground">Average articles per category</p>
            </CardContent>
          </Card>
        </div>

        {/* Categories List */}
        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No categories found</p>
                <Button className="mt-4" asChild>
                  <Link href={`/${currentLang}/admin/categories/create`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create your first category
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category._id || category.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                      <div>
                        <div className="font-medium">
                          {getBilingualText(category.name, "en")}
                          {getBilingualText(category.name, "kh") && (
                            <span className="block text-sm text-gray-500">{getBilingualText(category.name, "kh")}</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">/{category.slug}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-sm text-gray-500">{category.articlesCount || 0} articles</span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/${currentLang}/admin/categories/edit/${category._id || category.id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteDialog(category._id || category.id || "", getBilingualText(category.name, "en"))
                        }}
                        disabled={deleteDialog.isOpen}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleDelete}
        title="Delete Category"
        description={`Are you sure you want to delete &quot;${deleteDialog.categoryName}&quot;? This action cannot be undone.`}
        confirmText="Delete Category"
        isLoading={false}
      />
    </>
  )
}
