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
import api from "@/lib/api" // Import your axios client
import { AxiosError } from "axios"

interface BilingualText {
  en: string
  kh: string
}

interface CategoryData {
  id?: string
  _id?: string
  name: string | BilingualText
  slug: string | BilingualText
  description: string | BilingualText
  color: string
  isActive: boolean
  newsCount?: number
  createdAt?: string
  updatedAt?: string
}

// Helper function to get text from bilingual field
const getBilingualText = (text: string | BilingualText | undefined, lang: "en" | "kh" = "en"): string => {
  if (!text) return ""
  if (typeof text === "string") return text
  return text[lang] || text.en || ""
}

interface PageProps {
  params: Promise<{
    lang: "en" | "kh"
  }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
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

  // Resolve params and set current language
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setCurrentLang(resolvedParams.lang)
    }
    resolveParams()
  }, [params])

  // Fetch categories using axios client
  useEffect(() => {
    if (!currentLang) return // Wait for params to be resolved

    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const response = await api.get(`/categories?lang=${currentLang}`)

        if (response.data.success) {
          setCategories(response.data.data || [])
        } else {
          console.error("Failed to fetch categories:", response.data.message)
          toast.error("Failed to load categories")
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast.error("Failed to load categories")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [currentLang])

  // Handle delete confirmation dialog open
  const openDeleteDialog = (categoryId: string, categoryName: string) => {
    setDeleteDialog({
      isOpen: true,
      categoryId,
      categoryName,
    })
  }

  // Handle delete using axios client
  const handleDelete = async () => {
    try {
      console.log("Deleting category with ID:", deleteDialog.categoryId)

      const response = await api.delete(`/categories/${deleteDialog.categoryId}`)

      if (response.data.success !== false) {
        // Refresh the categories list
        const categoriesResponse = await api.get(`/categories?lang=${currentLang}`)
        if (categoriesResponse.data.success) {
          setCategories(categoriesResponse.data.data || [])
        }

        // Close the dialog and show success message
        setDeleteDialog((prev) => ({ ...prev, isOpen: false }))
        toast.success(response.data.message || "Category deleted successfully")
      } else {
        throw new Error(response.data.message || "Failed to delete category")
      }
    } catch (error: unknown) {
      console.error("Error deleting category:", error)

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

  // Calculate statistics
  const totalCategories = categories.length
  const activeCategories = categories.filter((cat) => cat.isActive).length
  const totalArticles = categories.reduce((sum, cat) => sum + (cat.newsCount || 0), 0)
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
                        <div className="text-sm text-gray-500">/{getBilingualText(category.slug, "en")}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-sm text-gray-500">{category.newsCount || 0} articles</span>
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
