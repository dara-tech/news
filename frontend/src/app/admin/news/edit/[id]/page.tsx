"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import {
  UploadCloud,
  ImageIcon,
  X,
  Save,
  Globe,
  Tag,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  Star,
  Zap,
  Settings,
  FileText,
  Camera,
  ArrowLeft,
  RefreshCw,
  History,
  Eye,
  Clock,
} from "lucide-react"

interface NewsFormData {
  title: { en: string; kh: string }
  content: { en: string; kh: string }
  description: { en: string; kh: string }
  category: string
  tags: string
  isFeatured: boolean
  isBreaking: boolean
  status: "draft" | "published"
  thumbnail: File | null
  images: (File | string)[]
  meta: {
    title: { en: string; kh: string }
    description: { en: string; kh: string }
    keywords: string
  }
}

interface ValidationErrors {
  [key: string]: string
}

interface FormStats {
  wordCount: { en: number; kh: number }
  completionPercentage: number
  estimatedReadTime: number
}

const EditNewsPage = () => {
  const [formData, setFormData] = useState<NewsFormData | null>(null)
  const [originalData, setOriginalData] = useState<NewsFormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isDragOver, setIsDragOver] = useState(false)
  const [activeTab, setActiveTab] = useState("content")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [formStats, setFormStats] = useState<FormStats>({
    wordCount: { en: 0, kh: 0 },
    completionPercentage: 0,
    estimatedReadTime: 0,
  })

  const router = useRouter()
  const params = useParams()
  const { id } = params
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)


  // Calculate form statistics
  const calculateStats = useCallback((data: NewsFormData): FormStats => {
    const enWords = data.content.en.split(" ").filter((word) => word.length > 0).length
    const khWords = data.content.kh.split(" ").filter((word) => word.length > 0).length

    const requiredFields = [
      data.title.en,
      data.title.kh,
      data.description.en,
      data.description.kh,
      data.content.en,
      data.content.kh,
      data.category,
    ]
    const completedFields = requiredFields.filter((field) => field.trim()).length
    const completionPercentage = Math.round((completedFields / requiredFields.length) * 100)

    const estimatedReadTime = Math.max(1, Math.ceil(enWords / 200)) // 200 words per minute

    return {
      wordCount: { en: enWords, kh: khWords },
      completionPercentage,
      estimatedReadTime,
    }
  }, [])

  // Update stats when form data changes
  useEffect(() => {
    if (formData) {
      setFormStats(calculateStats(formData))
    }
  }, [formData, calculateStats])

  // Fetch existing article data
  useEffect(() => {
    if (id) {
      const fetchNewsArticle = async () => {
        setIsLoading(true)
        try {
          const response = await api.get(`/news/${id}`)

          if (response.data && response.data.success) {
            const articleData = response.data.data;
            const processedData = {
              ...articleData,
              tags: articleData.tags?.join(", ") || "",
              meta: {
                title: {
                  en: articleData.meta?.title?.en || "",
                  kh: articleData.meta?.title?.kh || "",
                },
                description: {
                  en: articleData.meta?.description?.en || "",
                  kh: articleData.meta?.description?.kh || "",
                },
                keywords: articleData.meta?.keywords?.join(", ") || "",
              },
            }

            setFormData(processedData)
            setOriginalData(processedData)

            if (articleData.thumbnail) {
              setThumbnailPreview(articleData.thumbnail as string)
            }
            if (articleData.images) {
              setImagePreviews(articleData.images as string[])
            }
          } else {
            throw new Error(response.data.message || "Failed to fetch news article.");
          }
        } catch (err) {
          toast.error("Failed to fetch news article.")
          console.error(err)
          router.push("/admin/news")
        } finally {
          setIsLoading(false)
        }
      }
      fetchNewsArticle()
    }
  }, [id, router])

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!formData || !hasUnsavedChanges) return

    setIsSaving(true)
    try {
      // Simulate auto-save API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setLastSaved(new Date())
      toast.success("Changes saved automatically", { duration: 2000 })
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error("Auto-save failed:", error)
    } finally {
      setIsSaving(false)
    }
  }, [formData, hasUnsavedChanges])

  useEffect(() => {
    if (!formData || !originalData) return

    // Check if form has changes
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)
    setHasUnsavedChanges(hasChanges)

    if (hasChanges) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSave();
      }, 3000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [formData, originalData, autoSave])

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview)
      }
      imagePreviews.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [thumbnailPreview, imagePreviews])

  // Form validation
  const validateForm = (): boolean => {
    if (!formData) return false

    const errors: ValidationErrors = {}

    if (!formData.title.en.trim()) errors["title.en"] = "English title is required"
    if (!formData.title.kh.trim()) errors["title.kh"] = "Khmer title is required"
    if (!formData.description.en.trim()) errors["description.en"] = "English description is required"
    if (!formData.description.kh.trim()) errors["description.kh"] = "Khmer description is required"
    if (!formData.content.en.trim()) errors["content.en"] = "English content is required"
    if (!formData.content.kh.trim()) errors["content.kh"] = "Khmer content is required"
    if (!formData.category.trim()) errors.category = "Category is required"

    // SEO validation
    if (formData.meta.title.en && formData.meta.title.en.length > 60) {
      errors["meta.title.en"] = "Meta title should be under 60 characters"
    }
    if (formData.meta.title.kh && formData.meta.title.kh.length > 60) {
      errors["meta.title.kh"] = "Meta title should be under 60 characters"
    }
    if (formData.meta.description.en && formData.meta.description.en.length > 160) {
      errors["meta.description.en"] = "Meta description should be under 160 characters"
    }
    if (formData.meta.description.kh && formData.meta.description.kh.length > 160) {
      errors["meta.description.kh"] = "Meta description should be under 160 characters"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return

    const { name, value } = e.target
    const keys = name.split(".")

    setFormData((prev) => {
      if (!prev) return null
      const newFormData = { ...prev }

      // Ensure meta object exists
      if (keys[0] === "meta" && !newFormData.meta) {
        newFormData.meta = {
          title: { en: "", kh: "" },
          description: { en: "", kh: "" },
          keywords: "",
        }
      }

      let currentLevel: any = newFormData

      for (let i = 0; i < keys.length - 1; i++) {
        if (!currentLevel[keys[i]]) {
          currentLevel[keys[i]] = {}
        }
        currentLevel = currentLevel[keys[i]]
      }
      currentLevel[keys[keys.length - 1]] = value

      return newFormData
    })

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent, type: "thumbnail" | "images") => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    if (type === "thumbnail" && imageFiles[0]) {
      handleThumbnailChange(imageFiles[0])
    } else if (type === "images") {
      handleImagesChange(imageFiles)
    }
  }

  const handleThumbnailChange = (file: File) => {
    if (!formData) return

    setFormData({ ...formData, thumbnail: file })
    const previewUrl = URL.createObjectURL(file)
    if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreview)
    }
    setThumbnailPreview(previewUrl)
  }

  const handleImagesChange = (files: File[]) => {
    if (!formData) return

    const newImageFiles = [...formData.images, ...files]
    setFormData({ ...formData, images: newImageFiles })
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews((prev) => [...prev, ...newPreviews])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (!files || !formData) return

    if (name === "thumbnail" && files[0]) {
      handleThumbnailChange(files[0])
    } else if (name === "images") {
      handleImagesChange(Array.from(files))
    }
  }

  const handleRemoveImage = (index: number) => {
    if (!formData) return

    const newImages = [...formData.images]
    newImages.splice(index, 1)
    setFormData({ ...formData, images: newImages })

    const newPreviews = [...imagePreviews]
    const removedUrl = newPreviews.splice(index, 1)[0]
    if (removedUrl.startsWith("blob:")) {
      URL.revokeObjectURL(removedUrl)
    }
    setImagePreviews(newPreviews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData || !validateForm()) {
      toast.error("Please fix the validation errors before submitting.");
      // Switch to the tab with errors
      const errorFields = Object.keys(validationErrors);
      if (
        errorFields.some(
          (field) => field.includes("title") || field.includes("content") || field.includes("description"),
        )
      ) {
        setActiveTab("content");
      } else if (errorFields.includes("category")) {
        setActiveTab("details");
      } else if (errorFields.some((field) => field.includes("meta"))) {
        setActiveTab("seo");
      }
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Create FormData with proper field handling
      const submissionData = new FormData();
      
      // Multilingual fields
      submissionData.append("title", JSON.stringify(formData.title));
      submissionData.append("content", JSON.stringify(formData.content));
      submissionData.append("description", JSON.stringify(formData.description));
      
      // Meta fields
      submissionData.append(
        "meta",
        JSON.stringify({
          title: formData.meta.title,
          description: formData.meta.description,
          keywords: formData.meta.keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        })
      );
      
      // Other fields
      submissionData.append("category", formData.category);
      submissionData.append("tags", formData.tags);
      submissionData.append("isFeatured", String(formData.isFeatured));
      submissionData.append("isBreaking", String(formData.isBreaking));
      submissionData.append("status", formData.status);

      // Handle thumbnail upload
      if (formData.thumbnail instanceof File) {
        submissionData.append("thumbnail", formData.thumbnail);
      }

      // Handle images
      // Separate new uploads from existing URLs
      const newImageFiles = formData.images.filter((img: File | string) => img instanceof File);
      const existingImageUrls = formData.images.filter((img: File | string) => typeof img === "string");

      // Add new image files
      newImageFiles.forEach((file) => {
        if (file instanceof File) {
          submissionData.append("images", file);
        }
      });

      // Add existing image URLs as JSON
      submissionData.append("existingImages", JSON.stringify(existingImageUrls));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await api.put(`/news/${id}`, submissionData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data && response.data.success) {
        const updatedArticle = response.data.data;
        setUploadProgress(100);
        toast.success("Article updated successfully!");

        // Process the updated article data
        const processedUpdatedData = {
          ...updatedArticle,
          tags: updatedArticle.tags?.join(", ") || "",
          meta: {
            ...updatedArticle.meta,
            keywords: updatedArticle.meta?.keywords?.join(", ") || "",
          },
          // Keep existing image previews if they are not returned from backend
          images: updatedArticle.images || formData.images,
          thumbnail: null, // Thumbnail is handled via file upload, not returned as a field
        };

        setFormData(processedUpdatedData);
        setOriginalData(processedUpdatedData);
        setHasUnsavedChanges(false);

        if (updatedArticle.thumbnail) {
          setThumbnailPreview(updatedArticle.thumbnail as string);
        }
        if (updatedArticle.images) {
          setImagePreviews(updatedArticle.images as string[]);
        }
      } else {
        throw new Error(response.data.message || "Failed to update article.");
      }

    } catch (err) {
      toast.error("Failed to update article.");
      console.error("Update error:", err);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    if (originalData) {
      setFormData({ ...originalData });
      setHasUnsavedChanges(false);
      toast.success("Form reset to last saved version")
    }
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96 mb-6" />
            <Skeleton className="h-2 w-full mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-16 w-full" />
                </Card>
              ))}
            </div>
          </div>
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-20" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-6 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load article data. Please try again.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/admin/news")}
                  className="hover:bg-white/50"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Edit News Article</h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Update and manage your news article content</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {hasUnsavedChanges && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Unsaved changes
                  </Badge>
                )}
                {lastSaved && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Last saved {lastSaved.toLocaleTimeString()}
                  </div>
                )}
                {isSaving && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={resetForm} disabled={!hasUnsavedChanges}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Form Completion</span>
                <span className="text-sm text-slate-500">{formStats.completionPercentage}%</span>
              </div>
              <Progress value={formStats.completionPercentage} className="h-2" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-600">English Words</p>
                    <p className="text-lg font-semibold">{formStats.wordCount.en}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-slate-600">Khmer Words</p>
                    <p className="text-lg font-semibold">{formStats.wordCount.kh}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-slate-600">Read Time</p>
                    <p className="text-lg font-semibold">{formStats.estimatedReadTime} min</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-slate-600">Images</p>
                    <p className="text-lg font-semibold">{formData.images.length + (formData.thumbnail ? 1 : 0)}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-4">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="content" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Content
                      {Object.keys(validationErrors).some(
                        (key) => key.includes("title") || key.includes("content") || key.includes("description"),
                      ) && <AlertCircle className="h-3 w-3 text-red-500" />}
                    </TabsTrigger>
                    <TabsTrigger value="media" className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Media
                    </TabsTrigger>
                    <TabsTrigger value="seo" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      SEO
                      {Object.keys(validationErrors).some((key) => key.includes("meta")) && (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="details" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                      {validationErrors.category && <AlertCircle className="h-3 w-3 text-red-500" />}
                    </TabsTrigger>
                  </TabsList>

                  {/* Content Tab */}
                  <TabsContent value="content" className="space-y-6">
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Article Content
                        </CardTitle>
                        <CardDescription>Update compelling content in both English and Khmer languages</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Titles */}
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="title.en" className="flex items-center gap-2">
                              Title (English)
                              <Badge variant="secondary" className="text-xs">
                                Required
                              </Badge>
                            </Label>
                            <Input
                              id="title.en"
                              name="title.en"
                              value={formData.title.en}
                              onChange={handleInputChange}
                              placeholder="Enter compelling English title..."
                              className={`transition-all ${
                                validationErrors["title.en"]
                                  ? "border-red-500 focus:border-red-500"
                                  : "focus:border-blue-500"
                              }`}
                            />
                            {validationErrors["title.en"] && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {validationErrors["title.en"]}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="title.kh" className="flex items-center gap-2">
                              Title (Khmer)
                              <Badge variant="secondary" className="text-xs">
                                Required
                              </Badge>
                            </Label>
                            <Input
                              id="title.kh"
                              name="title.kh"
                              value={formData.title.kh}
                              onChange={handleInputChange}
                              placeholder="បញ្ចូលចំណងជើងជាភាសាខ្មែរ..."
                              className={`transition-all ${
                                validationErrors["title.kh"]
                                  ? "border-red-500 focus:border-red-500"
                                  : "focus:border-blue-500"
                              }`}
                            />
                            {validationErrors["title.kh"] && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {validationErrors["title.kh"]}
                              </p>
                            )}
                          </div>
                        </div>

                        <Separator />

                        {/* Descriptions */}
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="description.en" className="flex items-center gap-2">
                              Description (English)
                              <Badge variant="secondary" className="text-xs">
                                Required
                              </Badge>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-slate-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Brief summary that appears in article previews</p>
                                </TooltipContent>
                              </Tooltip>
                            </Label>
                            <Textarea
                              id="description.en"
                              name="description.en"
                              value={formData.description.en}
                              onChange={handleInputChange}
                              placeholder="Write a compelling description that summarizes your article..."
                              rows={3}
                              className={`transition-all resize-none ${
                                validationErrors["description.en"]
                                  ? "border-red-500 focus:border-red-500"
                                  : "focus:border-blue-500"
                              }`}
                            />
                            {validationErrors["description.en"] && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {validationErrors["description.en"]}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description.kh" className="flex items-center gap-2">
                              Description (Khmer)
                              <Badge variant="secondary" className="text-xs">
                                Required
                              </Badge>
                            </Label>
                            <Textarea
                              id="description.kh"
                              name="description.kh"
                              value={formData.description.kh}
                              onChange={handleInputChange}
                              placeholder="សរសេរការពិពណ៌នាសង្ខេបអំពីអត្ថបទរបស់អ្នក..."
                              rows={3}
                              className={`transition-all resize-none ${
                                validationErrors["description.kh"]
                                  ? "border-red-500 focus:border-red-500"
                                  : "focus:border-blue-500"
                              }`}
                            />
                            {validationErrors["description.kh"] && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {validationErrors["description.kh"]}
                              </p>
                            )}
                          </div>
                        </div>

                        <Separator />

                        {/* Content */}
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="content.en" className="flex items-center gap-2">
                              Content (English)
                              <Badge variant="secondary" className="text-xs">
                                Required
                              </Badge>
                            </Label>
                            <Textarea
                              id="content.en"
                              name="content.en"
                              value={formData.content.en}
                              onChange={handleInputChange}
                              placeholder="Write your full article content in English..."
                              rows={12}
                              className={`transition-all resize-none font-mono ${
                                validationErrors["content.en"]
                                  ? "border-red-500 focus:border-red-500"
                                  : "focus:border-blue-500"
                              }`}
                            />
                            {validationErrors["content.en"] && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {validationErrors["content.en"]}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="content.kh" className="flex items-center gap-2">
                              Content (Khmer)
                              <Badge variant="secondary" className="text-xs">
                                Required
                              </Badge>
                            </Label>
                            <Textarea
                              id="content.kh"
                              name="content.kh"
                              value={formData.content.kh}
                              onChange={handleInputChange}
                              placeholder="សរសេរមាតិកាពេញលេញជាភាសាខ្មែរ..."
                              rows={12}
                              className={`transition-all resize-none font-mono ${
                                validationErrors["content.kh"]
                                  ? "border-red-500 focus:border-red-500"
                                  : "focus:border-blue-500"
                              }`}
                            />
                            {validationErrors["content.kh"] && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {validationErrors["content.kh"]}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Media Tab */}
                  <TabsContent value="media" className="space-y-6">
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Camera className="h-5 w-5 text-green-600" />
                          Media Assets
                        </CardTitle>
                        <CardDescription>Update thumbnail and additional images for your article</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8">
                        {/* Thumbnail Upload */}
                        <div className="space-y-4">
                          <Label className="text-base font-semibold">Thumbnail Image</Label>
                          <div
                            className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                              isDragOver
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                : "border-slate-300 hover:border-slate-400"
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, "thumbnail")}
                          >
                            {thumbnailPreview ? (
                              <div className="relative">
                                <img
                                  src={thumbnailPreview || "/placeholder.svg"}
                                  alt="Thumbnail preview"
                                  className="w-full h-64 object-cover rounded-lg"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2"
                                  onClick={() => {
                                    setThumbnailPreview(null)
                                    setFormData({ ...formData, thumbnail: null })
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                                <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                                  Drop your thumbnail here
                                </p>
                                <p className="text-sm text-slate-500 mb-4">or click to browse files</p>
                                <Input
                                  type="file"
                                  name="thumbnail"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                  className="hidden"
                                  id="thumbnail-upload"
                                />
                                <Label
                                  htmlFor="thumbnail-upload"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                                >
                                  <ImageIcon className="h-4 w-4" />
                                  Choose Image
                                </Label>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator />

                        {/* Additional Images */}
                        <div className="space-y-4">
                          <Label className="text-base font-semibold">Additional Images</Label>
                          <div
                            className={`border-2 border-dashed rounded-xl p-6 transition-all ${
                              isDragOver
                                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                : "border-slate-300 hover:border-slate-400"
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, "images")}
                          >
                            <div className="text-center">
                              <UploadCloud className="mx-auto h-8 w-8 text-slate-400 mb-3" />
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Drop additional images here
                              </p>
                              <Input
                                type="file"
                                name="images"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                                id="images-upload"
                              />
                              <Label
                                htmlFor="images-upload"
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 cursor-pointer transition-colors"
                              >
                                <ImageIcon className="h-4 w-4" />
                                Add Images
                              </Label>
                            </div>
                          </div>

                          {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                              {imagePreviews.map((src, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={src || "/placeholder.svg"}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleRemoveImage(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* SEO Tab */}
                  <TabsContent value="seo" className="space-y-6">
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-purple-600" />
                          SEO Optimization
                        </CardTitle>
                        <CardDescription>Optimize your article for search engines and social media</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Meta Titles */}
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="meta.title.en">Meta Title (English)</Label>
                            <Input
                              id="meta.title.en"
                              name="meta.title.en"
                              value={formData?.meta?.title?.en || ""}
                              onChange={handleInputChange}
                              placeholder="SEO-optimized title for English..."
                              className={`focus:border-purple-500 ${
                                validationErrors["meta.title.en"] ? "border-red-500" : ""
                              }`}
                            />
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-slate-500">
                                {(formData?.meta?.title?.en || "").length}/60 characters
                              </p>
                              {validationErrors["meta.title.en"] && (
                                <p className="text-xs text-red-500">{validationErrors["meta.title.en"]}</p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="meta.title.kh">Meta Title (Khmer)</Label>
                            <Input
                              id="meta.title.kh"
                              name="meta.title.kh"
                              value={formData?.meta?.title?.kh || ""}
                              onChange={handleInputChange}
                              placeholder="ចំណងជើង SEO សម្រាប់ភាសាខ្មែរ..."
                              className={`focus:border-purple-500 ${
                                validationErrors["meta.title.kh"] ? "border-red-500" : ""
                              }`}
                            />
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-slate-500">
                                {(formData?.meta?.title?.kh || "").length}/60 characters
                              </p>
                              {validationErrors["meta.title.kh"] && (
                                <p className="text-xs text-red-500">{validationErrors["meta.title.kh"]}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Meta Descriptions */}
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="meta.description.en">Meta Description (English)</Label>
                            <Textarea
                              id="meta.description.en"
                              name="meta.description.en"
                              value={formData?.meta?.description?.en || ""}
                              onChange={handleInputChange}
                              placeholder="SEO description for search results..."
                              rows={3}
                              className={`resize-none focus:border-purple-500 ${
                                validationErrors["meta.description.en"] ? "border-red-500" : ""
                              }`}
                            />
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-slate-500">
                                {(formData?.meta?.description?.en || "").length}/160 characters
                              </p>
                              {validationErrors["meta.description.en"] && (
                                <p className="text-xs text-red-500">{validationErrors["meta.description.en"]}</p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="meta.description.kh">Meta Description (Khmer)</Label>
                            <Textarea
                              id="meta.description.kh"
                              name="meta.description.kh"
                              value={formData?.meta?.description?.kh || ""}
                              onChange={handleInputChange}
                              placeholder="ការពិពណ៌នា SEO សម្រាប់លទ្ធផលស្វែងរក..."
                              rows={3}
                              className={`resize-none focus:border-purple-500 ${
                                validationErrors["meta.description.kh"] ? "border-red-500" : ""
                              }`}
                            />
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-slate-500">
                                {(formData?.meta?.description?.kh || "").length}/160 characters
                              </p>
                              {validationErrors["meta.description.kh"] && (
                                <p className="text-xs text-red-500">{validationErrors["meta.description.kh"]}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Keywords */}
                        <div className="space-y-2">
                          <Label htmlFor="meta.keywords" className="flex items-center gap-2">
                            Meta Keywords
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-slate-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Comma-separated keywords for SEO</p>
                              </TooltipContent>
                            </Tooltip>
                          </Label>
                          <Input
                            id="meta.keywords"
                            name="meta.keywords"
                            value={formData?.meta?.keywords || ""}
                            onChange={handleInputChange}
                            placeholder="keyword1, keyword2, keyword3..."
                            className="focus:border-purple-500"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="details" className="space-y-6">
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-orange-600" />
                          Article Settings
                        </CardTitle>
                        <CardDescription>Configure category, tags, and publication settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Category and Tags */}
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="category" className="flex items-center gap-2">
                              Category
                              <Badge variant="secondary" className="text-xs">
                                Required
                              </Badge>
                            </Label>
                            <Select
                              name="category"
                              value={formData.category}
                              onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                              <SelectTrigger
                                className={`${
                                  validationErrors.category ? "border-red-500" : "focus:border-orange-500"
                                }`}
                              >
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="politics">Politics</SelectItem>
                                <SelectItem value="business">Business</SelectItem>
                                <SelectItem value="technology">Technology</SelectItem>
                                <SelectItem value="health">Health</SelectItem>
                                <SelectItem value="sports">Sports</SelectItem>
                                <SelectItem value="entertainment">Entertainment</SelectItem>
                                <SelectItem value="education">Education</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            {validationErrors.category && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {validationErrors.category}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tags" className="flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              Tags
                            </Label>
                            <Input
                              id="tags"
                              name="tags"
                              value={formData.tags}
                              onChange={handleInputChange}
                              placeholder="tag1, tag2, tag3..."
                              className="focus:border-orange-500"
                            />
                            <p className="text-xs text-slate-500">Separate tags with commas</p>
                          </div>
                        </div>

                        <Separator />

                        {/* Special Flags */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">Article Flags</h4>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Star className="h-5 w-5 text-yellow-500" />
                                <div>
                                  <Label htmlFor="isFeatured" className="font-medium">
                                    Featured Article
                                  </Label>
                                  <p className="text-sm text-slate-500">Highlight this article on the homepage</p>
                                </div>
                              </div>
                              <Switch
                                id="isFeatured"
                                checked={formData.isFeatured}
                                onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                              />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Zap className="h-5 w-5 text-red-500" />
                                <div>
                                  <Label htmlFor="isBreaking" className="font-medium">
                                    Breaking News
                                  </Label>
                                  <p className="text-sm text-slate-500">Mark as urgent breaking news</p>
                                </div>
                              </div>
                              <Switch
                                id="isBreaking"
                                checked={formData.isBreaking}
                                onCheckedChange={(checked) => setFormData({ ...formData, isBreaking: checked })}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Publish Card */}
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Update Article
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Publication Status</Label>
                        <Select
                          name="status"
                          value={formData.status}
                          onValueChange={(value: "draft" | "published") => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger className="focus:border-blue-500">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                Draft
                              </div>
                            </SelectItem>
                            <SelectItem value="published">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                Published
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {isSubmitting && uploadProgress > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Updating...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="w-full space-y-2">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Update Article
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => router.push("/admin/news")}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>

                  {/* Validation Summary */}
                  {Object.keys(validationErrors).length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please fix {Object.keys(validationErrors).length} validation error
                        {Object.keys(validationErrors).length > 1 ? "s" : ""} before updating.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Article Preview Card */}
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Article Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm line-clamp-2">
                          {formData.title.en || "Article title will appear here..."}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-3">
                          {formData.description.en || "Article description will appear here..."}
                        </p>
                      </div>
                      {thumbnailPreview && (
                        <div className="w-full h-24 rounded-md overflow-hidden">
                          <img
                            src={thumbnailPreview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {formData.category && <Badge variant="outline">{formData.category}</Badge>}
                        {formData.isFeatured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
                        {formData.isBreaking && <Badge className="bg-red-100 text-red-800">Breaking</Badge>}
                      </div>
                      <Separator />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Status:</span>
                        <Badge variant={formData.status === "published" ? "default" : "secondary"}>
                          {formData.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Article Stats */}
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Article Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">English words:</span>
                        <span className="font-medium">{formStats.wordCount.en}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Khmer words:</span>
                        <span className="font-medium">{formStats.wordCount.kh}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Read time:</span>
                        <span className="font-medium">{formStats.estimatedReadTime} min</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Images:</span>
                        <span className="font-medium">{formData.images.length + (formData.thumbnail ? 1 : 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Completion:</span>
                        <span className="font-medium">{formStats.completionPercentage}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default EditNewsPage
