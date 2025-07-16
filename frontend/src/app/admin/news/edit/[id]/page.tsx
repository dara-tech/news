"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import {
  UploadCloud,
  X,
  Save,
  Globe,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Star,
  Zap,
  Settings,
  FileText,
  Camera,
  ArrowLeft,
  RefreshCw,
} from "lucide-react"

interface NewsFormData {
  title: { en: string; kh: string }
  content: { en: string; kh: string }
  description: { en: string; kh: string }
  category: string
  tags: string[]
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
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [originalThumbnailUrl, setOriginalThumbnailUrl] = useState<string | null>(null); // State for original URL
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

  const calculateStats = useCallback((data: NewsFormData): FormStats => {
    const enWords = data.content.en.split(/\s+/).filter(Boolean).length
    const khWords = data.content.kh.split(/\s+/).filter(Boolean).length
    const requiredFields = [
      data.title.en,
      data.title.kh,
      data.description.en,
      data.description.kh,
      data.content.en,
      data.content.kh,
      data.category,
    ]
    const completedFields = requiredFields.filter((field) => typeof field === "string" && field.trim()).length
    const completionPercentage = Math.round((completedFields / requiredFields.length) * 100)
    const estimatedReadTime = Math.max(1, Math.ceil(enWords / 200))

    return {
      wordCount: { en: enWords, kh: khWords },
      completionPercentage,
      estimatedReadTime,
    }
  }, [])

  useEffect(() => {
    if (formData) {
      setFormStats(calculateStats(formData))
    }
  }, [formData, calculateStats])

  useEffect(() => {
    if (id) {
      const fetchNewsArticle = async () => {
        setIsLoading(true)
        try {
          const response = await api.get(`/news/${id}`)
          if (response.data?.success) {
            const articleData = response.data.data
            const processedData: NewsFormData = {
              ...articleData,
              tags: articleData.tags || [],
              thumbnail: null,
              images: articleData.images || [],
              meta: {
                title: { en: articleData.meta?.title?.en || "", kh: articleData.meta?.title?.kh || "" },
                description: { en: articleData.meta?.description?.en || "", kh: articleData.meta?.description?.kh || "" },
                keywords: articleData.meta?.keywords || "",
              },
            }
            setFormData(processedData)
            setOriginalData(JSON.parse(JSON.stringify(processedData))) // Deep copy for comparison

            if (articleData.thumbnail) {
              const url = articleData.thumbnail as string;
              setThumbnailPreview(url);
              setOriginalThumbnailUrl(url); // Store the original URL
            }
            
            if (articleData.images) setImagePreviews(articleData.images as string[])
          } else {
            throw new Error(response.data.message || "Failed to fetch news article.")
          }
        } catch {
          toast.error("Failed to fetch news article.")
          router.push("/admin/news")
        } finally {
          setIsLoading(false)
        }
      }
      fetchNewsArticle()
    }
  }, [id, router])

  const autoSave = useCallback(async () => {
    if (!formData || !hasUnsavedChanges) return
    setIsSaving(true)
    try {
      // This is a mock save. In a real app, you would send a draft update to your API.
      // await api.put(`/news/draft/${id}`, formData);
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setOriginalData(JSON.parse(JSON.stringify(formData))) // Update baseline after save
      setLastSaved(new Date())
      toast.success("Changes auto-saved", { duration: 2000 })
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error("Auto-save failed:", error)
      toast.error("Auto-save failed.")
    } finally {
      setIsSaving(false)
    }
  }, [formData, hasUnsavedChanges])

  useEffect(() => {
    if (!formData || !originalData) return
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)
    setHasUnsavedChanges(hasChanges)
    if (hasChanges) {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)
      autoSaveTimeoutRef.current = setTimeout(() => autoSave(), 5000) // 5-second delay for auto-save
    }
    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)
    }
  }, [formData, originalData, autoSave])

  useEffect(() => {
    return () => {
      if (thumbnailPreview?.startsWith("blob:")) URL.revokeObjectURL(thumbnailPreview)
      imagePreviews.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [thumbnailPreview, imagePreviews])

  const validateForm = useCallback((): boolean => {
    if (!formData) return false
    const errors: ValidationErrors = {}
    if (!formData.title.en.trim()) errors["title.en"] = "English title is required"
    if (!formData.title.kh.trim()) errors["title.kh"] = "Khmer title is required"
    if (!formData.description.en.trim()) errors["description.en"] = "English description is required"
    if (!formData.description.kh.trim()) errors["description.kh"] = "Khmer description is required"
    if (!formData.content.en.trim()) errors["content.en"] = "English content is required"
    if (!formData.content.kh.trim()) errors["content.kh"] = "Khmer content is required"
    if (!formData.category.trim()) errors.category = "Category is required"
    if (formData.meta.title.en.length > 70) errors["meta.title.en"] = "Meta title should be under 70 characters"
    if (formData.meta.title.kh.length > 70) errors["meta.title.kh"] = "Meta title should be under 70 characters"
    if (formData.meta.description.en.length > 160) errors["meta.description.en"] = "Meta description should be under 160 characters"
    if (formData.meta.description.kh.length > 160) errors["meta.description.kh"] = "Meta description should be under 160 characters"
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      if (!prev) return prev
      const newFormData = structuredClone(prev)
      const keys = name.split(".")
      if (keys.length === 3 && keys[0] === "meta") {
        const [, subfield, lang] = keys as ["meta", "title" | "description", "en" | "kh"]
        if (subfield === "title" || subfield === "description") newFormData.meta[subfield][lang] = value
      } else if (keys.length === 2) {
        const [field, key2] = keys
        if (field === "title" || field === "content" || field === "description") {
          newFormData[field][key2 as "en" | "kh"] = value
        } else if (field === "meta" && key2 === "keywords") {
          newFormData.meta.keywords = value
        }
      } else if (name === "tags") {
        newFormData.tags = value.split(",").map((tag) => tag.trim()).filter(Boolean)
      }
      return newFormData
    })
    if (validationErrors[name]) setValidationErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleSwitchChange = (checked: boolean, name: "isFeatured" | "isBreaking") => {
    setFormData((prev) => (prev ? { ...prev, [name]: checked } : prev))
  }

  const handleSelectChange = (value: string, name: "category" | "status") => {
    setFormData((prev) => (prev ? { ...prev, [name]: value as NewsFormData[typeof name] } : prev))
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
    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
    if (type === "thumbnail" && files.length > 0) handleThumbnailChange(files[0])
    else if (type === "images") handleImagesChange(files)
  }

  const handleThumbnailChange = (file: File) => {
    setFormData((prev) => (prev ? { ...prev, thumbnail: file } : prev))
    const previewUrl = URL.createObjectURL(file)
    if (thumbnailPreview?.startsWith("blob:")) URL.revokeObjectURL(thumbnailPreview)
    setThumbnailPreview(previewUrl)
  }

  const handleImagesChange = (files: File[]) => {
    setFormData((prev) => (prev ? { ...prev, images: [...prev.images, ...files] } : prev))
    const newPreviews = files.map(URL.createObjectURL)
    setImagePreviews((prev) => [...prev, ...newPreviews])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "thumbnail" | "images") => {
    const { files } = e.target
    if (!files) return
    if (type === "thumbnail" && files.length > 0) handleThumbnailChange(files[0])
    else if (type === "images") handleImagesChange(Array.from(files))
    e.target.value = "" // Reset input value to allow re-uploading the same file
  }

  const handleRemoveImage = (index: number) => {
    const newPreviews = [...imagePreviews]
    const removedUrl = newPreviews.splice(index, 1)[0]
    if (removedUrl?.startsWith("blob:")) URL.revokeObjectURL(removedUrl)
    setImagePreviews(newPreviews)

    setFormData((prev) => {
      if (!prev) return prev
      const newImages = [...prev.images]
      newImages.splice(index, 1)
      return { ...prev, images: newImages }
    })
  }
  
  const resetForm = () => {
    if (originalData) {
      const deepCopiedData = JSON.parse(JSON.stringify(originalData));
      setFormData(deepCopiedData);
      setValidationErrors({});
  
      // Use the stored original URL to reset the preview
      setThumbnailPreview(originalThumbnailUrl); 
  
      setImagePreviews(originalData.images.filter((img): img is string => typeof img === "string"));
      toast.info("Changes have been reverted.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !formData) {
      toast.error("Please fix the errors before submitting.")
      const firstErrorKey = Object.keys(validationErrors)[0]
      if (firstErrorKey.includes("title") || firstErrorKey.includes("content") || firstErrorKey.includes("description")) {
        setActiveTab("content")
      } else if (firstErrorKey.includes("meta")) {
        setActiveTab("seo")
      } else if (firstErrorKey.includes("category")) {
        setActiveTab("details")
      }
      return
    }
    setIsSubmitting(true)

    try {
      const submissionData = new FormData()

      submissionData.append("title", JSON.stringify(formData.title))
      submissionData.append("content", JSON.stringify(formData.content))
      submissionData.append("description", JSON.stringify(formData.description))
      submissionData.append("meta", JSON.stringify(formData.meta))
      submissionData.append("tags", JSON.stringify(formData.tags))

      submissionData.append("category", formData.category)
      submissionData.append("isFeatured", String(formData.isFeatured))
      submissionData.append("isBreaking", String(formData.isBreaking))
      submissionData.append("status", formData.status)

      if (formData.thumbnail) {
        submissionData.append("thumbnail", formData.thumbnail)
      }

      const existingImages = formData.images.filter((img) => typeof img === "string")
      const newImages = formData.images.filter((img) => img instanceof File)

      submissionData.append("existingImages", JSON.stringify(existingImages))
      newImages.forEach((file) => {
        submissionData.append("images", file as File)
      })

      await api.put(`/news/${id}`, submissionData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },

      })
      toast.success("Article updated successfully! ✅")
      router.push("/admin/news")
    } catch (error) {
      console.error(error)
      toast.error("Failed to update article.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-1/3" />
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load article data. Please go back and try again.</AlertDescription>
           <Button variant="outline" onClick={() => router.push("/admin/news")} className="mt-4">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to News List
           </Button>
        </Alert>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <form onSubmit={handleSubmit}>
          <header className="sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button type="button" variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Edit News Article</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">ID: {id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {isSaving && (
                     <Badge variant="secondary"><Loader2 className="mr-2 h-3 w-3 animate-spin" />Auto-saving...</Badge>
                  )}
                  {hasUnsavedChanges && !isSaving &&(
                     <Badge variant="destructive"><AlertCircle className="mr-2 h-3 w-3" />Unsaved Changes</Badge>
                  )}
                  {!hasUnsavedChanges && lastSaved && (
                     <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle2 className="mr-2 h-3 w-3" />Saved</Badge>
                  )}
                  <Button type="button" variant="outline" onClick={resetForm} disabled={!hasUnsavedChanges || isSubmitting}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isSaving}>
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" />Update Article</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            <div className="grid gap-8 lg:grid-cols-4">
              <div className="lg:col-span-3 space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                     <TabsTrigger value="content">
                        <FileText className="mr-2 h-4 w-4" />Content
                        {Object.keys(validationErrors).some(k => ["title", "content", "description"].some(p => k.startsWith(p))) && <AlertCircle className="ml-2 h-4 w-4 text-red-500" />}
                     </TabsTrigger>
                     <TabsTrigger value="media"><Camera className="mr-2 h-4 w-4" />Media</TabsTrigger>
                     <TabsTrigger value="seo">
                        <Globe className="mr-2 h-4 w-4" />SEO
                        {Object.keys(validationErrors).some(k => k.startsWith("meta")) && <AlertCircle className="ml-2 h-4 w-4 text-red-500" />}
                    </TabsTrigger>
                     <TabsTrigger value="details">
                        <Settings className="mr-2 h-4 w-4" />Settings
                        {Object.keys(validationErrors).some(k => k.startsWith("category")) && <AlertCircle className="ml-2 h-4 w-4 text-red-500" />}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="content" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Article Content</CardTitle>
                        <CardDescription>Enter the primary content for the article in both languages.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                         <div className="grid gap-6 md:grid-cols-2">
                           <div className="space-y-2">
                             <Label htmlFor="title.en">Title (English)</Label>
                             <Input id="title.en" name="title.en" value={formData.title.en} onChange={handleInputChange} className={validationErrors["title.en"] ? "border-red-500" : ""} />
                             {validationErrors["title.en"] && <p className="text-sm text-red-500">{validationErrors["title.en"]}</p>}
                           </div>
                           <div className="space-y-2">
                             <Label htmlFor="title.kh">Title (Khmer)</Label>
                             <Input id="title.kh" name="title.kh" value={formData.title.kh} onChange={handleInputChange} className={validationErrors["title.kh"] ? "border-red-500" : ""} />
                             {validationErrors["title.kh"] && <p className="text-sm text-red-500">{validationErrors["title.kh"]}</p>}
                           </div>
                         </div>
                         <Separator/>
                         <div className="space-y-4">
                            <Label htmlFor="description.en">Description (English)</Label>
                            <Textarea id="description.en" name="description.en" value={formData.description.en} onChange={handleInputChange} className={validationErrors["description.en"] ? "border-red-500" : ""} rows={3}/>
                            {validationErrors["description.en"] && <p className="text-sm text-red-500">{validationErrors["description.en"]}</p>}
                         </div>
                         <div className="space-y-4">
                            <Label htmlFor="description.kh">Description (Khmer)</Label>
                            <Textarea id="description.kh" name="description.kh" value={formData.description.kh} onChange={handleInputChange} className={validationErrors["description.kh"] ? "border-red-500" : ""} rows={3}/>
                            {validationErrors["description.kh"] && <p className="text-sm text-red-500">{validationErrors["description.kh"]}</p>}
                         </div>
                         <Separator/>
                         <div className="space-y-4">
                           <Label htmlFor="content.en">Main Content (English)</Label>
                           <Textarea id="content.en" name="content.en" value={formData.content.en} onChange={handleInputChange} rows={15} className={validationErrors["content.en"] ? "border-red-500" : ""} />
                           {validationErrors["content.en"] && <p className="text-sm text-red-500">{validationErrors["content.en"]}</p>}
                         </div>
                         <div className="space-y-4">
                           <Label htmlFor="content.kh">Main Content (Khmer)</Label>
                           <Textarea id="content.kh" name="content.kh" value={formData.content.kh} onChange={handleInputChange} rows={15} className={validationErrors["content.kh"] ? "border-red-500" : ""} />
                           {validationErrors["content.kh"] && <p className="text-sm text-red-500">{validationErrors["content.kh"]}</p>}
                         </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="media" className="space-y-6">
                      <Card>
                          <CardHeader><CardTitle>Media Management</CardTitle></CardHeader>
                          <CardContent className="space-y-6">
                              <div className="space-y-2">
                                  <Label>Thumbnail Image</Label>
                                  <div className={`relative aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-4 transition-colors duration-300 group hover:border-blue-500 dark:border-slate-600 dark:hover:border-blue-500 ${isDragOver && 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, 'thumbnail')}>
                                      <input type="file" id="thumbnail-upload" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'thumbnail')} />
                                      {thumbnailPreview ? (
                                          <>
                                              <Image src={thumbnailPreview} alt="Thumbnail preview" fill className="object-cover rounded-lg" />
                                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <Label htmlFor="thumbnail-upload" className="text-white cursor-pointer font-semibold">Change Thumbnail</Label>
                                              </div>
                                          </>
                                      ) : (
                                          <div className="space-y-2 text-slate-500 dark:text-slate-400">
                                              <UploadCloud className="mx-auto h-12 w-12" />
                                              <p className="font-semibold">Drag & drop or <Label htmlFor="thumbnail-upload" className="text-blue-500 cursor-pointer hover:underline">click to upload</Label></p>
                                              <p className="text-xs">Recommended: 16:9 aspect ratio</p>
                                          </div>
                                      )}
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <Label>Additional Images</Label>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                      {imagePreviews.map((src, index) => (
                                          <div key={index} className="relative group aspect-video">
                                              <Image src={src} alt={`Image preview ${index + 1}`} fill className="object-cover rounded-md border" />
                                              <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"><X className="h-4 w-4" /></button>
                                          </div>
                                      ))}
                                      <label className="relative aspect-video flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                                          <UploadCloud className="h-8 w-8 text-slate-400" />
                                          <span className="mt-2 text-sm text-slate-500">Add Images</span>
                                          <input type="file" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0" onChange={(e) => handleFileChange(e, 'images')} />
                                      </label>
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  </TabsContent>
                  <TabsContent value="seo" className="space-y-6">
                      <Card>
                        <CardHeader>
                            <CardTitle>SEO Optimization</CardTitle>
                            <CardDescription>Optimize metadata for better search engine visibility.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                           <div className="grid gap-6 md:grid-cols-2">
                             <div className="space-y-2">
                               <Label htmlFor="meta.title.en">Meta Title (English)</Label>
                               <Input id="meta.title.en" name="meta.title.en" value={formData.meta.title.en} onChange={handleInputChange} className={validationErrors["meta.title.en"] ? "border-red-500" : ""} />
                               {validationErrors["meta.title.en"] && <p className="text-sm text-red-500">{validationErrors["meta.title.en"]}</p>}
                             </div>
                             <div className="space-y-2">
                               <Label htmlFor="meta.title.kh">Meta Title (Khmer)</Label>
                               <Input id="meta.title.kh" name="meta.title.kh" value={formData.meta.title.kh} onChange={handleInputChange} className={validationErrors["meta.title.kh"] ? "border-red-500" : ""} />
                               {validationErrors["meta.title.kh"] && <p className="text-sm text-red-500">{validationErrors["meta.title.kh"]}</p>}
                             </div>
                           </div>
                           <div className="grid gap-6 md:grid-cols-2">
                               <div className="space-y-2">
                                 <Label htmlFor="meta.description.en">Meta Description (English)</Label>
                                 <Textarea id="meta.description.en" name="meta.description.en" value={formData.meta.description.en} onChange={handleInputChange} className={validationErrors["meta.description.en"] ? "border-red-500" : ""} />
                                 {validationErrors["meta.description.en"] && <p className="text-sm text-red-500">{validationErrors["meta.description.en"]}</p>}
                               </div>
                               <div className="space-y-2">
                                 <Label htmlFor="meta.description.kh">Meta Description (Khmer)</Label>
                                 <Textarea id="meta.description.kh" name="meta.description.kh" value={formData.meta.description.kh} onChange={handleInputChange} className={validationErrors["meta.description.kh"] ? "border-red-500" : ""} />
                                 {validationErrors["meta.description.kh"] && <p className="text-sm text-red-500">{validationErrors["meta.description.kh"]}</p>}
                               </div>
                           </div>
                           <div className="space-y-2">
                             <Label htmlFor="meta.keywords">Meta Keywords</Label>
                             <Input id="meta.keywords" name="meta.keywords" placeholder="e.g. cambodia news, breaking news" value={formData.meta.keywords} onChange={handleInputChange} />
                           </div>
                        </CardContent>
                      </Card>
                  </TabsContent>
                   <TabsContent value="details" className="space-y-6">
                      <Card>
                        <CardHeader>
                            <CardTitle>Article Settings</CardTitle>
                            <CardDescription>Configure categorization, tags, and visibility.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                           <div className="grid gap-6 md:grid-cols-2">
                             <div className="space-y-2">
                               <Label htmlFor="category">Category</Label>
                               <Select value={formData.category} onValueChange={(value) => handleSelectChange(value, "category")}>
                                 <SelectTrigger className={validationErrors.category ? "border-red-500" : ""}><SelectValue placeholder="Select a category" /></SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="technology">Technology</SelectItem>
                                   <SelectItem value="business">Business</SelectItem>
                                   <SelectItem value="world">World</SelectItem>
                                   <SelectItem value="sports">Sports</SelectItem>
                                   <SelectItem value="politics">Politics</SelectItem>
                                   <SelectItem value="health">Health</SelectItem>
                                 </SelectContent>
                               </Select>
                               {validationErrors.category && <p className="text-sm text-red-500">{validationErrors.category}</p>}
                             </div>
                             <div className="space-y-2">
                               <Label htmlFor="tags">Tags</Label>
                               <Input id="tags" name="tags" placeholder="e.g. politics, economy" value={formData.tags.join(", ")} onChange={handleInputChange} />
                               <p className="text-xs text-slate-500">Separate tags with a comma.</p>
                             </div>
                           </div>
                           <div className="space-y-2">
                              <Label htmlFor="status">Status</Label>
                              <Select value={formData.status} onValueChange={(value) => handleSelectChange(value, "status")}>
                                <SelectTrigger><SelectValue placeholder="Set status" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="published">Published</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                           <div className="space-y-4">
                             <h4 className="font-semibold">Article Flags</h4>
                             <div className="grid gap-4 md:grid-cols-2">
                               <div className="flex items-center justify-between p-4 border rounded-lg">
                                 <div className="flex items-center gap-3"><Star className="h-5 w-5 text-yellow-500" /><Label htmlFor="isFeatured">Featured Article</Label></div>
                                 <Switch id="isFeatured" checked={formData.isFeatured} onCheckedChange={(checked) => handleSwitchChange(checked, "isFeatured")} />
                               </div>
                               <div className="flex items-center justify-between p-4 border rounded-lg">
                                 <div className="flex items-center gap-3"><Zap className="h-5 w-5 text-red-500" /><Label htmlFor="isBreaking">Breaking News</Label></div>
                                 <Switch id="isBreaking" checked={formData.isBreaking} onCheckedChange={(checked) => handleSwitchChange(checked, "isBreaking")} />
                               </div>
                             </div>
                           </div>
                        </CardContent>
                      </Card>
                   </TabsContent>
                </Tabs>
              </div>

              <aside className="lg:col-span-1">
                <div className="sticky top-28 space-y-6">
                    <Card>
                       <CardHeader><CardTitle>Form Statistics</CardTitle></CardHeader>
                       <CardContent className="space-y-4 text-sm">
                           <div className="space-y-2">
                              <div className="flex justify-between"><span>Completion</span><span className="font-semibold">{formStats.completionPercentage}%</span></div>
                              <Progress value={formStats.completionPercentage} />
                           </div>
                           <div className="flex justify-between"><span>Word Count (EN/KH)</span><span className="font-semibold">{formStats.wordCount.en} / {formStats.wordCount.kh}</span></div>
                           <div className="flex justify-between"><span>Read Time</span><span className="font-semibold">~{formStats.estimatedReadTime} min</span></div>
                           <div className="flex justify-between">
                               <span>Image Count</span>
                               <span className="font-semibold">
                                 {formData.images.length + (formData.thumbnail || thumbnailPreview ? 1 : 0)}
                               </span>
                           </div>
                       </CardContent>
                     </Card>
                     {Object.keys(validationErrors).length > 0 && (
                        <Card className="border-red-500/50 bg-red-50 dark:bg-red-900/20">
                           <CardHeader>
                             <CardTitle className="text-red-700 dark:text-red-400 text-base flex items-center gap-2"><AlertCircle className="h-5 w-5" />Validation Issues</CardTitle>
                           </CardHeader>
                           <CardContent>
                              <ul className="list-disc pl-5 space-y-1 text-sm text-red-700 dark:text-red-400">
                                {Object.entries(validationErrors).map(([key, value]) => <li key={key}>{value}</li>)}
                              </ul>
                           </CardContent>
                         </Card>
                     )}
                </div>
              </aside>
            </div>
          </main>
        </form>
      </div>
    </TooltipProvider>
  )
}

export default EditNewsPage