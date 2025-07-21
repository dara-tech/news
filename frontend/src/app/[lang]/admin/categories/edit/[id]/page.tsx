"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

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
      toast.error("English name is required")
      return
    }

    if (!formData.slugEn.trim()) {
      toast.error("English slug is required")
      return
    }

    try {
      setIsSaving(true)

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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/categories/${categoryId}`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = (await response.json()) as { message: string }
        throw new Error(error.message || "Failed to update category")
      }

      toast.success("Category updated successfully")
      router.push(`/${currentLang}/admin/categories`)
    } catch (error: unknown) {
      console.error("Error updating category:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update category"
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Category not found</p>
        <Button className="mt-4" asChild>
          <Link href={`/${currentLang}/admin/categories`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${currentLang}/admin/categories`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Category</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Update category information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* English Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">English</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameEn">Name *</Label>
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slugEn">Slug *</Label>
                  <Input
                    id="slugEn"
                    value={formData.slugEn}
                    onChange={(e) => handleInputChange("slugEn", e.target.value)}
                    placeholder="category-slug"
                    required
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
                />
              </div>
            </div>

            {/* Khmer Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">ខ្មែរ (Khmer)</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slugKh">Slug</Label>
                  <Input
                    id="slugKh"
                    value={formData.slugKh}
                    onChange={(e) => handleInputChange("slugKh", e.target.value)}
                    placeholder="category-slug-kh"
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
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange("color", e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => handleInputChange("color", e.target.value)}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/${currentLang}/admin/categories`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Category
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
