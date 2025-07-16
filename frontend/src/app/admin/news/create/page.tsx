"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TooltipProvider } from "@/components/ui/tooltip"

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
} from "lucide-react"

interface FormData {
  title: { en: string; kh: string }
  content: { en: string; kh: string }
  description: { en: string; kh: string }
  category: string
  tags: string
  isFeatured: boolean
  isBreaking: boolean
  status: "draft" | "published"
  thumbnail: File | null
  images: File[]
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

const CreateNewsPage = () => {
  const [formData, setFormData] = useState<FormData>({
    title: { en: "", kh: "" },
    content: { en: "", kh: "" },
    description: { en: "", kh: "" },
    category: "",
    tags: "",
    isFeatured: false,
    isBreaking: false,
    status: "draft",
    thumbnail: null,
    images: [],
    meta: {
      title: { en: "", kh: "" },
      description: { en: "", kh: "" },
      keywords: "",
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isDragOver, setIsDragOver] = useState(false)
  const [activeTab, setActiveTab] = useState("content")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [formStats, setFormStats] = useState<FormStats>({
    wordCount: { en: 0, kh: 0 },
    completionPercentage: 0,
    estimatedReadTime: 0,
  })

  const router = useRouter()
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculateStats = useCallback((data: FormData): FormStats => {
    const enWords = data.content.en.split(/\s+/).filter(Boolean).length
    const khWords = data.content.kh.split(/\s+/).filter(Boolean).length

    const requiredFields = [
      data.title.en, data.title.kh,
      data.description.en, data.description.kh,
      data.content.en, data.content.kh,
      data.category,
    ]
    const completedFields = requiredFields.filter((field) => field.trim()).length
    const completionPercentage = Math.round((completedFields / requiredFields.length) * 100)
    const estimatedReadTime = Math.max(1, Math.ceil(enWords / 200))

    return {
      wordCount: { en: enWords, kh: khWords },
      completionPercentage,
      estimatedReadTime,
    }
  }, [])

  useEffect(() => {
    setFormStats(calculateStats(formData))
  }, [formData, calculateStats])

  const autoSave = useCallback(async () => {
    if (!formData.title.en && !formData.title.kh) return;
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setLastSaved(new Date());
      toast.info("Draft auto-saved.", { duration: 2000 });
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [formData.title.en, formData.title.kh]);

  useEffect(() => {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => { autoSave() }, 5000); // 5-second delay
    return () => { if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current) };
  }, [formData, autoSave]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    if (!formData.title.en.trim()) errors["title.en"] = "English title is required"
    if (!formData.title.kh.trim()) errors["title.kh"] = "Khmer title is required"
    if (!formData.description.en.trim()) errors["description.en"] = "English description is required"
    if (!formData.description.kh.trim()) errors["description.kh"] = "Khmer description is required"
    if (!formData.content.en.trim()) errors["content.en"] = "English content is required"
    if (!formData.content.kh.trim()) errors["content.kh"] = "Khmer content is required"
    if (!formData.category.trim()) errors.category = "Category is required"
    if (formData.meta.title.en.length > 60) errors["meta.title.en"] = "Meta title should be under 60 characters"
    if (formData.meta.title.kh.length > 60) errors["meta.title.kh"] = "Meta title should be under 60 characters"
    if (formData.meta.description.en.length > 160) errors["meta.description.en"] = "Meta description should be under 160 characters"
    if (formData.meta.description.kh.length > 160) errors["meta.description.kh"] = "Meta description should be under 160 characters"
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Corrected generic handler for text inputs using structuredClone for immutability
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = structuredClone(prev); // Deep copy to prevent state mutation
      const keys = name.split(".");
      
      let currentLevel: { [key: string]: any } = updatedData;
      for (let i = 0; i < keys.length - 1; i++) {
        currentLevel = currentLevel[keys[i]];
      }
      currentLevel[keys[keys.length - 1]] = value;

      return updatedData;
    });

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleValueChange = (value: string, name: 'category' | 'status') => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean, name: 'isFeatured' | 'isBreaking') => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };

  const handleDrop = (e: React.DragEvent, type: "thumbnail" | "images") => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
    if (type === "thumbnail" && files[0]) handleThumbnailChange(files[0]);
    else if (type === "images") handleImagesChange(files);
  };

  const handleThumbnailChange = (file: File) => {
    setFormData((prev) => ({ ...prev, thumbnail: file }));
    const previewUrl = URL.createObjectURL(file);
    if (thumbnailPreview?.startsWith("blob:")) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview(previewUrl);
  };

  const handleImagesChange = (files: File[]) => {
    const newImageFiles = [...formData.images, ...files];
    setFormData((prev) => ({ ...prev, images: newImageFiles }));
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, name: 'thumbnail' | 'images') => {
    const { files } = e.target;
    if (!files) return;
    if (name === "thumbnail" && files[0]) handleThumbnailChange(files[0]);
    else if (name === "images") handleImagesChange(Array.from(files));
    e.target.value = ''; // Allow re-uploading same file
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData((prev) => ({ ...prev, images: newImages }));

    const newPreviews = [...imagePreviews];
    const removedUrl = newPreviews.splice(index, 1)[0];
    if (removedUrl.startsWith("blob:")) URL.revokeObjectURL(removedUrl);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting.")
      const errorFields = Object.keys(validationErrors)
      if (errorFields.some((f) => f.includes("title") || f.includes("content") || f.includes("description"))) setActiveTab("content");
      else if (errorFields.some((f) => f.includes("meta"))) setActiveTab("seo");
      else if (errorFields.includes("category")) setActiveTab("details");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    const submissionData = new FormData();
    submissionData.append("title", JSON.stringify(formData.title));
    submissionData.append("content", JSON.stringify(formData.content));
    submissionData.append("description", JSON.stringify(formData.description));
    submissionData.append("meta", JSON.stringify(formData.meta));
    submissionData.append("category", formData.category);
    submissionData.append("tags", formData.tags);
    submissionData.append("isFeatured", String(formData.isFeatured));
    submissionData.append("isBreaking", String(formData.isBreaking));
    submissionData.append("status", formData.status);

    if (formData.thumbnail) submissionData.append("thumbnail", formData.thumbnail);
    formData.images.forEach((image) => submissionData.append("images", image));

    try {
      await api.post("/news", submissionData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadProgress(percent);
        }
      });

      toast.success(`Article "${formData.title.en}" created successfully!`);
      router.push("/admin/news");
    } catch (err) {
      toast.error("Failed to create news article.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <form onSubmit={handleSubmit}>
          <header className="sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
             <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Create News Article</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Fill out the form to publish a new article.</p>
                </div>
                <div className="flex items-center gap-3">
                  {isSaving && <Badge variant="secondary"><Loader2 className="mr-2 h-3 w-3 animate-spin" />Saving Draft...</Badge>}
                  {lastSaved && !isSaving && <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle2 className="mr-2 h-3 w-3" />Saved</Badge>}
                  <Button type="button" variant="outline" onClick={() => router.push("/admin/news")}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting || isSaving}>
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" />{formData.status === "published" ? "Publish" : "Save Draft"}</>
                    )}
                  </Button>
                </div>
             </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            <div className="grid gap-8 lg:grid-cols-4">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="content" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />Content
                      {Object.keys(validationErrors).some(k => k.includes("title") || k.includes("content") || k.includes("description")) && <AlertCircle className="h-3 w-3 text-red-500 ml-1" />}
                    </TabsTrigger>
                    <TabsTrigger value="media" className="flex items-center gap-2"><Camera className="h-4 w-4" />Media</TabsTrigger>
                    <TabsTrigger value="seo" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />SEO
                      {Object.keys(validationErrors).some(k => k.includes("meta")) && <AlertCircle className="h-3 w-3 text-red-500 ml-1" />}
                    </TabsTrigger>
                    <TabsTrigger value="details" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />Settings
                      {validationErrors.category && <AlertCircle className="h-3 w-3 text-red-500 ml-1" />}
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Tabs Content Sections */}
                  <TabsContent value="content">
                    <Card><CardHeader><CardTitle>Article Content</CardTitle><CardDescription>Write the main body of your article in English and Khmer.</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2"><Label htmlFor="title.en">Title (English)</Label><Input id="title.en" name="title.en" value={formData.title.en} onChange={handleInputChange} className={validationErrors["title.en"] ? "border-red-500" : ""}/>{validationErrors["title.en"] && <p className="text-sm text-red-500">{validationErrors["title.en"]}</p>}</div>
                          <div className="space-y-2"><Label htmlFor="title.kh">Title (Khmer)</Label><Input id="title.kh" name="title.kh" value={formData.title.kh} onChange={handleInputChange} className={validationErrors["title.kh"] ? "border-red-500" : ""}/>{validationErrors["title.kh"] && <p className="text-sm text-red-500">{validationErrors["title.kh"]}</p>}</div>
                        </div>
                        <Separator/>
                        <div className="space-y-2"><Label htmlFor="description.en">Description (English)</Label><Textarea id="description.en" name="description.en" value={formData.description.en} onChange={handleInputChange} rows={3} className={validationErrors["description.en"] ? "border-red-500" : ""}/>{validationErrors["description.en"] && <p className="text-sm text-red-500">{validationErrors["description.en"]}</p>}</div>
                        <div className="space-y-2"><Label htmlFor="description.kh">Description (Khmer)</Label><Textarea id="description.kh" name="description.kh" value={formData.description.kh} onChange={handleInputChange} rows={3} className={validationErrors["description.kh"] ? "border-red-500" : ""}/>{validationErrors["description.kh"] && <p className="text-sm text-red-500">{validationErrors["description.kh"]}</p>}</div>
                        <Separator/>
                        <div className="space-y-2"><Label htmlFor="content.en">Main Content (English)</Label><Textarea id="content.en" name="content.en" value={formData.content.en} onChange={handleInputChange} rows={12} className={validationErrors["content.en"] ? "border-red-500" : ""}/>{validationErrors["content.en"] && <p className="text-sm text-red-500">{validationErrors["content.en"]}</p>}</div>
                        <div className="space-y-2"><Label htmlFor="content.kh">Main Content (Khmer)</Label><Textarea id="content.kh" name="content.kh" value={formData.content.kh} onChange={handleInputChange} rows={12} className={validationErrors["content.kh"] ? "border-red-500" : ""}/>{validationErrors["content.kh"] && <p className="text-sm text-red-500">{validationErrors["content.kh"]}</p>}</div>
                    </CardContent></Card>
                  </TabsContent>
                  <TabsContent value="media">
                    <Card><CardHeader><CardTitle>Media Assets</CardTitle><CardDescription>Upload a thumbnail and any additional images for the article.</CardDescription></CardHeader>
                    <CardContent className="space-y-8">
                        <div><Label className="text-base font-semibold">Thumbnail Image</Label>
                          <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, "thumbnail")} className={`mt-2 relative border-2 border-dashed rounded-xl p-8 transition-all ${isDragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400"}`}>
                            {thumbnailPreview ? (<>
                              <Image src={thumbnailPreview} alt="Thumbnail preview" width={500} height={281} className="w-full h-auto object-cover rounded-lg"/>
                              <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => {setThumbnailPreview(null); setFormData(p => ({...p, thumbnail: null}));}}><X className="h-4 w-4"/></Button>
                            </>) : (<div className="text-center"><UploadCloud className="mx-auto h-12 w-12 text-slate-400 mb-4"/><p className="mb-2">Drop your thumbnail here or</p><Label htmlFor="thumbnail-upload" className="cursor-pointer text-blue-600 font-semibold hover:underline">browse files</Label><input type="file" name="thumbnail" accept="image/*" onChange={(e) => handleFileChange(e, 'thumbnail')} className="hidden" id="thumbnail-upload"/></div>)}
                          </div>
                        </div><Separator/>
                        <div><Label className="text-base font-semibold">Additional Images</Label>
                          <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, "images")} className={`mt-2 border-2 border-dashed rounded-xl p-6 transition-all ${isDragOver ? "border-green-500 bg-green-50" : "border-slate-300 hover:border-slate-400"}`}>
                            <div className="text-center"><UploadCloud className="mx-auto h-8 w-8 text-slate-400 mb-3"/><p>Drop additional images here or</p><Label htmlFor="images-upload" className="cursor-pointer text-green-600 font-semibold hover:underline">browse files</Label><input type="file" name="images" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'images')} className="hidden" id="images-upload"/></div>
                          </div>
                          {imagePreviews.length > 0 && <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">{imagePreviews.map((src, index) => (<div key={src} className="relative group"><Image src={src} alt={`Preview ${index + 1}`} width={200} height={120} className="w-full h-32 object-cover rounded-lg border"/><Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveImage(index)}><X className="h-4 w-4"/></Button></div>))}</div>}
                        </div>
                    </CardContent></Card>
                  </TabsContent>
                  <TabsContent value="seo">
                    <Card><CardHeader><CardTitle>SEO Optimization</CardTitle><CardDescription>Optimize your article for search engines and social media.</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div><Label htmlFor="meta.title.en">Meta Title (English)</Label><Input id="meta.title.en" name="meta.title.en" value={formData.meta.title.en} onChange={handleInputChange} placeholder="SEO title..." className={validationErrors["meta.title.en"] ? "border-red-500" : ""}/><p className="text-xs text-slate-500 mt-1">{formData.meta.title.en.length}/60</p>{validationErrors["meta.title.en"] && <p className="text-xs text-red-500">{validationErrors["meta.title.en"]}</p>}</div>
                          <div><Label htmlFor="meta.title.kh">Meta Title (Khmer)</Label><Input id="meta.title.kh" name="meta.title.kh" value={formData.meta.title.kh} onChange={handleInputChange} placeholder="ចំណងជើង SEO..." className={validationErrors["meta.title.kh"] ? "border-red-500" : ""}/><p className="text-xs text-slate-500 mt-1">{formData.meta.title.kh.length}/60</p>{validationErrors["meta.title.kh"] && <p className="text-xs text-red-500">{validationErrors["meta.title.kh"]}</p>}</div>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div><Label htmlFor="meta.description.en">Meta Description (English)</Label><Textarea id="meta.description.en" name="meta.description.en" value={formData.meta.description.en} onChange={handleInputChange} rows={3} className={validationErrors["meta.description.en"] ? "border-red-500" : ""}/><p className="text-xs text-slate-500 mt-1">{formData.meta.description.en.length}/160</p>{validationErrors["meta.description.en"] && <p className="text-xs text-red-500">{validationErrors["meta.description.en"]}</p>}</div>
                          <div><Label htmlFor="meta.description.kh">Meta Description (Khmer)</Label><Textarea id="meta.description.kh" name="meta.description.kh" value={formData.meta.description.kh} onChange={handleInputChange} rows={3} className={validationErrors["meta.description.kh"] ? "border-red-500" : ""}/><p className="text-xs text-slate-500 mt-1">{formData.meta.description.kh.length}/160</p>{validationErrors["meta.description.kh"] && <p className="text-xs text-red-500">{validationErrors["meta.description.kh"]}</p>}</div>
                        </div>
                        <div><Label htmlFor="meta.keywords">Meta Keywords</Label><Input id="meta.keywords" name="meta.keywords" value={formData.meta.keywords} onChange={handleInputChange} placeholder="keyword1, keyword2..."/><p className="text-xs text-slate-500 mt-1">Comma-separated keywords.</p></div>
                    </CardContent></Card>
                  </TabsContent>
                  <TabsContent value="details">
                    <Card><CardHeader><CardTitle>Article Settings</CardTitle><CardDescription>Configure category, tags, and publication settings.</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div><Label htmlFor="category">Category</Label><Select name="category" value={formData.category} onValueChange={(v) => handleValueChange(v, "category")}><SelectTrigger className={validationErrors.category ? "border-red-500" : ""}><SelectValue placeholder="Select category"/></SelectTrigger><SelectContent><SelectItem value="politics">Politics</SelectItem><SelectItem value="business">Business</SelectItem><SelectItem value="technology">Technology</SelectItem><SelectItem value="health">Health</SelectItem><SelectItem value="sports">Sports</SelectItem><SelectItem value="entertainment">Entertainment</SelectItem></SelectContent></Select>{validationErrors.category && <p className="text-sm text-red-500 mt-1">{validationErrors.category}</p>}</div>
                          <div><Label htmlFor="tags">Tags</Label><Input id="tags" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="tag1, tag2..."/><p className="text-xs text-slate-500 mt-1">Comma-separated tags.</p></div>
                        </div><Separator/>
                        <div className="space-y-4">
                            <h4 className="font-semibold">Article Flags</h4>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="flex items-center justify-between p-4 border rounded-lg"><div className="flex items-center gap-3"><Star className="h-5 w-5 text-yellow-500"/><Label htmlFor="isFeatured">Featured Article</Label></div><Switch id="isFeatured" checked={formData.isFeatured} onCheckedChange={(c) => handleSwitchChange(c, "isFeatured")}/></div>
                              <div className="flex items-center justify-between p-4 border rounded-lg"><div className="flex items-center gap-3"><Zap className="h-5 w-5 text-red-500"/><Label htmlFor="isBreaking">Breaking News</Label></div><Switch id="isBreaking" checked={formData.isBreaking} onCheckedChange={(c) => handleSwitchChange(c, "isBreaking")}/></div>
                            </div>
                        </div>
                    </CardContent></Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 space-y-6">
                  <Card><CardHeader><CardTitle>Publication</CardTitle></CardHeader>
                  <CardContent><div className="space-y-2"><Label htmlFor="status">Status</Label><Select name="status" value={formData.status} onValueChange={(v: "draft" | "published") => handleValueChange(v, "status")}><SelectTrigger><SelectValue placeholder="Set status"/></SelectTrigger><SelectContent><SelectItem value="draft"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-yellow-500"/>Draft</div></SelectItem><SelectItem value="published"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500"/>Published</div></SelectItem></SelectContent></Select></div>
                  {isSubmitting && uploadProgress > 0 && <div className="space-y-2 pt-4"><div className="flex items-center justify-between text-sm"><span>Uploading...</span><span>{uploadProgress}%</span></div><Progress value={uploadProgress} className="h-2"/></div>}
                  </CardContent></Card>
                  <Card><CardHeader><CardTitle>Form Statistics</CardTitle></CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between"><span>Completion</span><span className="font-semibold">{formStats.completionPercentage}%</span></div><Progress value={formStats.completionPercentage}/>
                    <div className="flex justify-between"><span>Word Count (EN/KH)</span><span className="font-semibold">{formStats.wordCount.en} / {formStats.wordCount.kh}</span></div>
                    <div className="flex justify-between"><span>Read Time</span><span className="font-semibold">~{formStats.estimatedReadTime} min</span></div>
                    <div className="flex justify-between"><span>Images</span><span className="font-semibold">{formData.images.length + (formData.thumbnail ? 1 : 0)}</span></div>
                  </CardContent></Card>
                </div>
              </div>
            </div>
          </main>
        </form>
      </div>
    </TooltipProvider>
  )
}

export default CreateNewsPage