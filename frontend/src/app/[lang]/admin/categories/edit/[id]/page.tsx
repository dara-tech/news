"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import CategoryForm, { CategoryData, BilingualText } from "@/components/admin/categories/CategoryForm"
import { toast } from "sonner"
import api from "@/lib/api"

interface PageProps {
  params: Promise<{
    id: string
    lang: "en" | "kh"
  }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

const getBilingualValue = (value: string | BilingualText): BilingualText => {
  if (typeof value === 'string') {
    return { en: value, kh: value };
  }
  return value;
};

export default function EditCategoryPage({ params }: PageProps) {
  const router = useRouter()
  const [category, setCategory] = useState<CategoryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentLang, setCurrentLang] = useState<"en" | "kh">("en")
  const [categoryId, setCategoryId] = useState<string>("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState<string | null>(null)

  // Resolve params and set current language and category ID
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setCurrentLang(resolvedParams.lang)
      setCategoryId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  // Fetch category data
  useEffect(() => {
    if (!categoryId) return // Wait for params to be resolved

    const fetchCategory = async () => {
      try {
        setIsLoading(true)
        const response = await api.get(`/categories/${categoryId}`)

        if (response.data.success) {
          const categoryData = response.data.data
          setCategory(categoryData)
        } else {
          toast.error("Failed to load category")
          router.push(`/${currentLang}/admin/categories`)
        }
      } catch {
        toast.error("Failed to load category")
        router.push(`/${currentLang}/admin/categories`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategory()
  }, [categoryId, currentLang, router])

  // Handle form submission
  const handleSubmit = async (formData: CategoryData) => {
    try {
      setIsSaving(true)
      setShowError(null)

      const updateData = {
        name: getBilingualValue(formData.name),
        slug: getBilingualValue(formData.slug),
        description: getBilingualValue(formData.description || ''),
        color: formData.color,
        isActive: formData.isActive,
      }

      await api.put(`/categories/${categoryId}`, updateData)
      setShowSuccess(true)
      toast.success("Category updated successfully")
      setTimeout(() => {
        router.push(`/${currentLang}/admin/categories`)
      }, 1200)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update category"
      setShowError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
          <span className="text-gray-500 dark:text-gray-400 text-lg">Loading category...</span>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center py-16">
          <XCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Category not found</p>
          <Button className="mt-2" asChild>
            <Link href={`/${currentLang}/admin/categories`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Edit className="w-8 h-8 text-blue-600" />
            Edit Category
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Update category information and settings.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="flex items-center gap-2"
        >
          <Link href={`/${currentLang}/admin/categories`}>
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Link>
        </Button>
      </div>

      {/* Success/Error Messages */}
      {showSuccess && (
        <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span>Category updated successfully! Redirecting...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {showError && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <XCircle className="w-5 h-5" />
              <span>{showError}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isSaving && (
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Updating category...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Form */}
      <CategoryForm
        initialData={category}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        isEditing={true}
      />
    </div>
  )
}
