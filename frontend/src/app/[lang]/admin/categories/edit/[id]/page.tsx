"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, Palette, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import api from "@/lib/api"

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

interface PageProps {
  params: Promise<{
    id: string
    lang: "en" | "kh"
  }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function EditCategoryPage({ params }: PageProps) {
  const router = useRouter()
  const [category, setCategory] = useState<CategoryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentLang, setCurrentLang] = useState<"en" | "kh">("en")
  const [categoryId, setCategoryId] = useState<string>("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nameEn: "",
    nameKh: "",
    slugEn: "",
    slugKh: "",
    descriptionEn: "",
    descriptionKh: "",
    color: "#3B82F6",
    isActive: true,
  })

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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
        const response = await fetch(`${apiUrl}/api/categories/${categoryId}`, {
          credentials: "include",
          cache: "no-store",
        })

        if (response.ok) {
          const data = await response.json()
          const categoryData = data.success ? data.data : null

          if (categoryData) {
            setCategory(categoryData)

            // Populate form data
            const getName = (name: string | BilingualText) => {
              if (typeof name === "string") return { en: name, kh: "" }
              return name
            }

            const getSlug = (slug: string | BilingualText) => {
              if (typeof slug === "string") return { en: slug, kh: "" }
              return slug
            }

            const getDescription = (description: string | BilingualText) => {
              if (typeof description === "string") return { en: description, kh: "" }
              return description
            }

            const nameObj = getName(categoryData.name)
            const slugObj = getSlug(categoryData.slug)
            const descObj = getDescription(categoryData.description)

            setFormData({
              nameEn: nameObj.en || "",
              nameKh: nameObj.kh || "",
              slugEn: slugObj.en || "",
              slugKh: slugObj.kh || "",
              descriptionEn: descObj.en || "",
              descriptionKh: descObj.kh || "",
              color: categoryData.color || "#3B82F6",
              isActive: categoryData.isActive ?? true,
            })
          }
        } else {
          console.error("Failed to fetch category:", response.status)
          toast.error("Failed to load category")
          router.push(`/${currentLang}/admin/categories`)
        }
      } catch (error) {
        console.error("Error fetching category:", error)
        toast.error("Failed to load category")
        router.push(`/${currentLang}/admin/categories`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategory()
  }, [categoryId, currentLang, router])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nameEn.trim()) {
      setShowError("English name is required")
      toast.error("English name is required")
      return
    }

    if (!formData.slugEn.trim()) {
      setShowError("English slug is required")
      toast.error("English slug is required")
      return
    }

    try {
      setIsSaving(true)
      setShowError(null)

      const updateData = {
        name: {
          en: formData.nameEn.trim(),
          kh: formData.nameKh.trim(),
        },
        slug: {
          en: formData.slugEn.trim(),
          kh: formData.slugKh.trim(),
        },
        description: {
          en: formData.descriptionEn.trim(),
          kh: formData.descriptionKh.trim(),
        },
        color: formData.color,
        isActive: formData.isActive,
      }

      const response = await api.put(`/categories/${categoryId}`, updateData)

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update category")
      }

      setShowSuccess(true)
      toast.success("Category updated successfully")
      setTimeout(() => {
        router.push(`/${currentLang}/admin/categories`)
      }, 1200)
    } catch (error: unknown) {
      console.error("Error updating category:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update category"
      setShowError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
        <span className="text-gray-500 dark:text-gray-400 text-lg">Loading category...</span>
      </div>
    )
  }

  if (!category) {
    return (
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
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href={`/${currentLang}/admin/categories`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Category</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1 text-base">Update category information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-500" />
              Category Information
            </CardTitle>
            <CardDescription>
              Please fill out the details below to update the category.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* English Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                <span role="img" aria-label="English">🇬🇧</span> English
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nameEn">Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="nameEn"
                    value={formData.nameEn}
                    onChange={(e) => {
                      handleInputChange("nameEn", e.target.value)
                      // Auto-generate slug
                      if (!formData.slugEn || formData.slugEn === generateSlug(formData.nameEn)) {
                        handleInputChange("slugEn", generateSlug(e.target.value))
                      }
                    }}
                    placeholder="Enter category name"
                    required
                    className="focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slugEn">Slug <span className="text-red-500">*</span></Label>
                  <Input
                    id="slugEn"
                    value={formData.slugEn}
                    onChange={(e) => handleInputChange("slugEn", e.target.value)}
                    placeholder="category-slug"
                    required
                    className="focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionEn">Description</Label>
                <Textarea
                  id="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={(e) => handleInputChange("descriptionEn", e.target.value)}
                  placeholder="Enter category description"
                  rows={3}
                  className="focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Khmer Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
                <span role="img" aria-label="Khmer">🇰🇭</span> ខ្មែរ (Khmer)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nameKh">ឈ្មោះ (Name)</Label>
                  <Input
                    id="nameKh"
                    value={formData.nameKh}
                    onChange={(e) => {
                      handleInputChange("nameKh", e.target.value)
                      // Auto-generate slug
                      if (!formData.slugKh || formData.slugKh === generateSlug(formData.nameKh)) {
                        handleInputChange("slugKh", generateSlug(e.target.value))
                      }
                    }}
                    placeholder="បញ្ចូលឈ្មោះប្រភេទ"
                    className="focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slugKh">Slug</Label>
                  <Input
                    id="slugKh"
                    value={formData.slugKh}
                    onChange={(e) => handleInputChange("slugKh", e.target.value)}
                    placeholder="category-slug-kh"
                    className="focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionKh">ការពិពណ៌នា (Description)</Label>
                <Textarea
                  id="descriptionKh"
                  value={formData.descriptionKh}
                  onChange={(e) => handleInputChange("descriptionKh", e.target.value)}
                  placeholder="បញ្ចូលការពិពណ៌នាប្រភេទ"
                  rows={3}
                  className="focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <span role="img" aria-label="Settings">⚙️</span> Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange("color", e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 shadow"
                      style={{ background: formData.color }}
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => handleInputChange("color", e.target.value)}
                      placeholder="#3B82F6"
                      className="w-32"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-6 md:mt-0">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                  <Label htmlFor="isActive" className="text-gray-700">Active</Label>
                  {formData.isActive ? (
                    <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle2 className="w-4 h-4" /> Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-500 text-sm">
                      <XCircle className="w-4 h-4" /> Disabled
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback messages */}
        {showError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md">
            <XCircle className="w-5 h-5" />
            <span>{showError}</span>
          </div>
        )}
        {showSuccess && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md">
            <CheckCircle2 className="w-5 h-5" />
            <span>Category updated successfully!</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            asChild
            className="rounded-md px-6 py-2"
            disabled={isSaving}
          >
            <Link href={`/${currentLang}/admin/categories`}>Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-md px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Category
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
