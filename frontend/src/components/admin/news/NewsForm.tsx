"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import api from "@/lib/api"
import { toast } from "sonner"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

import NewsFormHeader from "./form/NewsFormHeader"
import NewsFormContentTab from "./form/NewsFormContentTab"
import NewsFormMediaTab from "./form/NewsFormMediaTab"
import NewsFormSEOTab from "./form/NewsFormSEOTab"
import { useGenerateSEO } from '@/hooks/useGenerateSEO'
import NewsFormDetailsTab from "./form/NewsFormDetailsTab"
import NewsFormSidebar from "./form/NewsFormSidebar"
import { useGenerateContent } from '@/hooks/useGenerateContent'
import { useGenerateImage } from '@/hooks/useGenerateImage'

export interface NewsFormData {
  id?: string;
  title: { en: string; kh: string };
  content: { en: string; kh: string };
  description: { en: string; kh: string };
  category: { _id: string; name: { en: string; kh: string }; image?: string } | string;
  tags: string[];
  isFeatured: boolean;
  isBreaking: boolean;
  status: "draft" | "published" | "archived";
  scheduledAt: Date | null;
  thumbnail: File | string | null;
  images: (File | string)[];
  authorId: string;
  seo: {
    metaTitle: { en: string; kh: string };
    metaDescription: { en: string; kh: string };
    keywords: string;
    metaImage: File | string | null;
  };
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface Category {
  _id: string;
  name: { en: string; kh: string };
  slug: string;
}

export interface FormStats {
  wordCount: { en: number; kh: number };
  charCount: { en: number; kh: number };
  completionPercentage: number;
  estimatedReadTime: number;
}

interface NewsFormProps {
  initialData?: NewsFormData | null;
  onSubmit: (data: FormData) => Promise<void>;
  isEditMode: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
}

type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};

const NewsForm = ({ initialData, onSubmit, isEditMode, isLoading, isSubmitting }: NewsFormProps): React.ReactElement | null => {
  const [formData, setFormData] = useState<NewsFormData | null>(null);
  const [originalData, setOriginalData] = useState<NewsFormData | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [originalThumbnailUrl, setOriginalThumbnailUrl] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [metaImagePreview, setMetaImagePreview] = useState<string | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formStats, setFormStats] = useState<FormStats>({
    wordCount: { en: 0, kh: 0 },
    charCount: { en: 0, kh: 0 },
    completionPercentage: 0,
    estimatedReadTime: 0,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        if (response.data.success) {
          setCategories(response.data.data);
        } else {
          toast.error('Could not load categories.');
        }
      } catch {
        toast.error('An error occurred while fetching categories.');
      }
    };
    fetchCategories();
  }, []);

  const calculateStats = useCallback((data: NewsFormData): FormStats => {
    const enWords = data.content.en.split(/\s+/).filter(Boolean).length;
    const khWords = data.content.kh.split(/\s+/).filter(Boolean).length;
    const enChars = data.content.en.length;
    const khChars = data.content.kh.length;
    const requiredFields = [
      data.title.en, data.title.kh,
      data.description.en, data.description.kh,
      data.content.en, data.content.kh,
      data.category,
      data.seo.metaTitle.en, data.seo.metaTitle.kh,
      data.seo.metaDescription.en, data.seo.metaDescription.kh,
      data.seo.keywords,
    ];
    const completedFields = requiredFields.filter(field => typeof field === 'string' && field.trim()).length;
    const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);
    const estimatedReadTime = Math.max(1, Math.ceil(enWords / 200));
    return {
      wordCount: { en: enWords, kh: khWords },
      charCount: { en: enChars, kh: khChars },
      completionPercentage,
      estimatedReadTime
    };
  }, []);

  useEffect(() => {
    if (isEditMode && initialData) {
      const processedData = {
        ...initialData,
        category: (initialData.category && typeof initialData.category === 'object' && '_id' in initialData.category) ? initialData.category._id : initialData.category || "",
        tags: Array.isArray(initialData.tags) ? initialData.tags : (initialData.tags ? [initialData.tags] : []),
        seo: {
          metaTitle: initialData.title || { en: "", kh: "" },
          metaDescription: ('metaDescription' in initialData && initialData.metaDescription) ? initialData.metaDescription as { en: string; kh: string } : (initialData.seo?.metaDescription || { en: "", kh: "" }),
          keywords: ('keywords' in initialData && initialData.keywords) ? initialData.keywords as string : (initialData.seo?.keywords || ""),
          metaImage: null,
        },
      };
      setFormData(processedData as unknown as NewsFormData);
      setOriginalData(JSON.parse(JSON.stringify(processedData)) as NewsFormData);
      if (initialData.thumbnail && typeof initialData.thumbnail === 'string') {
        setThumbnailPreview(initialData.thumbnail);
        setOriginalThumbnailUrl(initialData.thumbnail);
      }
      if (initialData.images) {
        const imageUrls = initialData.images.filter(img => typeof img === 'string') as string[];
        setImagePreviews(imageUrls);
      }
      if (initialData.seo?.metaImage && typeof initialData.seo.metaImage === 'string') {
        setMetaImagePreview(initialData.seo.metaImage);
      }
      if (typeof initialData.category === 'object' && initialData.category.image) {
        setCategoryImagePreview(initialData.category.image);
      }
    } else if (!isEditMode) {
      const emptyForm: NewsFormData = {
        title: { en: "", kh: "" },
        description: { en: "", kh: "" },
        content: { en: "", kh: "" },
        category: "",
        tags: [],
        status: "draft",
        isFeatured: false,
        isBreaking: false,
        scheduledAt: null,
        thumbnail: null,
        images: [],
        authorId: "",
        seo: {
          metaTitle: { en: "", kh: "" },
          metaDescription: { en: "", kh: "" },
          keywords: "",
          metaImage: null,
        },
      };
      setFormData(emptyForm);
      setOriginalData(JSON.parse(JSON.stringify(emptyForm)));
    }
  }, [initialData, categories, isEditMode]);

  useEffect(() => {
    if (formData) {
      setFormStats(calculateStats(formData));
    }
  }, [formData, calculateStats]);

  const autoSave = useCallback(async () => {
    if (!formData || !hasUnsavedChanges) return;
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOriginalData(JSON.parse(JSON.stringify(formData)));
      setLastSaved(new Date());
      toast.success("Changes auto-saved", { duration: 2000 });
      setHasUnsavedChanges(false);
    } catch {
      toast.error("Auto-save failed.");
    } finally {
      setIsSaving(false);
    }
  }, [formData, hasUnsavedChanges]);

  useEffect(() => {
    if (!isEditMode || !formData || !originalData) return;
    if (formData && originalData) {
      setHasUnsavedChanges(JSON.stringify(formData) !== JSON.stringify(originalData));
    }
  }, [formData, originalData, isEditMode]);

  useEffect(() => {
    return () => {
      if (thumbnailPreview?.startsWith("blob:")) URL.revokeObjectURL(thumbnailPreview);
      imagePreviews.forEach(url => { if (url.startsWith("blob:")) URL.revokeObjectURL(url); });
    };
  }, [thumbnailPreview, imagePreviews]);

  const validateForm = useCallback((): boolean => {
    if (!formData) return false;
    const errors: ValidationErrors = {};
    if (!formData.title.en.trim()) errors["title.en"] = "English title is required";
    if (!formData.title.kh.trim()) errors["title.kh"] = "Khmer title is required";
    if (!formData.description.en.trim()) errors["description.en"] = "English description is required";
    if (!formData.description.kh.trim()) errors["description.kh"] = "Khmer description is required";
    if (!formData.content.en.trim()) errors["content.en"] = "English content is required";
    if (!formData.content.kh.trim()) errors["content.kh"] = "Khmer content is required";
    if (!formData.category || (typeof formData.category === 'string' && !formData.category.trim())) errors.category = "Category is required";
    if (!formData.seo.metaTitle.en.trim()) errors["seo.metaTitle.en"] = "Meta title (English) is required";
    if (!formData.seo.metaTitle.kh.trim()) errors["seo.metaTitle.kh"] = "Meta title (Khmer) is required";
    if (formData.seo.metaTitle.en.length > 70) errors["seo.metaTitle.en"] = "Meta title (English) should be under 70 characters";
    if (formData.seo.metaTitle.kh.length > 70) errors["seo.metaTitle.kh"] = "Meta title (Khmer) should be under 70 characters";
    if (formData.seo.metaDescription.en.length > 160) errors["seo.metaDescription.en"] = "Meta description (English) should be under 160 characters";
    if (formData.seo.metaDescription.kh.length > 160) errors["seo.metaDescription.kh"] = "Meta description (Khmer) should be under 160 characters";
    if (!formData.seo.keywords.trim()) errors["seo.keywords"] = "Keywords are required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return prev;
      const newState = structuredClone(prev) as DeepMutable<NewsFormData>;
      const keys = name.split('.');
      let current: unknown = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        if (
          typeof current === "object" &&
          current !== null &&
          keys[i] in current
        ) {
          current = (current as Record<string, unknown>)[keys[i]];
        }
      }
      if (
        typeof current === "object" &&
        current !== null &&
        keys[keys.length - 1] in current
      ) {
        (current as Record<string, unknown>)[keys[keys.length - 1]] = value;
      }
      return newState;
    });
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSwitchChange = (checked: boolean, name: "isFeatured" | "isBreaking") => {
    setFormData(prev => prev ? { ...prev, [name]: checked } : prev);
  };

  // Only allow a single string value for status, never an array
  const handleStatusChange = (value: "draft" | "published") => {
    setFormData(prev => prev ? { ...prev, status: value } : prev);
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => {
      if (!prev) return prev;
      return { ...prev, category: value };
    });
    if (validationErrors.category) {
      setValidationErrors(prev => ({ ...prev, category: "" }));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => prev ? { ...prev, tags: tagsArray } : prev);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnail' | 'images' | 'metaImage') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (field === 'thumbnail') {
      const file = files[0];
      if (file) {
        setFormData(prev => prev ? { ...prev, thumbnail: file } : null);
        setThumbnailPreview(URL.createObjectURL(file));
        setHasUnsavedChanges(true);
      }
    } else if (field === 'images') {
      if (files.length > 0) {
        const newFiles = Array.from(files);
        setFormData(prev => prev ? { ...prev, images: [...prev.images, ...newFiles] } : null);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
        setHasUnsavedChanges(true);
      }
    } else if (field === 'metaImage') {
      if (files[0]) {
        setFormData(prev => prev ? { ...prev, seo: { ...prev.seo, metaImage: files[0] } } : null);
        setMetaImagePreview(URL.createObjectURL(files[0]));
        setHasUnsavedChanges(true);
      }
    }
  };

  const handleRemoveThumbnail = () => {
    if (thumbnailPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setFormData(prev => prev ? { ...prev, thumbnail: null } : prev);
    setThumbnailPreview(null);
    setOriginalThumbnailUrl(null);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const urlToRemove = imagePreviews[indexToRemove];
    if (urlToRemove.startsWith("blob:")) {
      URL.revokeObjectURL(urlToRemove);
    }
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    setFormData(prev => {
      if (!prev) return prev;
      const updatedImages = prev.images.filter((_, index) => index !== indexToRemove);
      return { ...prev, images: updatedImages };
    });
  };

  const handleRemoveMetaImage = () => {
    setFormData(prev => prev ? { ...prev, seo: { ...prev.seo, metaImage: null } } : null);
    setMetaImagePreview(null);
    setHasUnsavedChanges(true);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, field: 'thumbnail' | 'images' | 'metaImage') => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (!droppedFiles.length) return;
    if (field === 'thumbnail') {
      if (droppedFiles[0]) {
        setFormData(prev => prev ? { ...prev, thumbnail: droppedFiles[0] } : null);
        setThumbnailPreview(URL.createObjectURL(droppedFiles[0]));
        setHasUnsavedChanges(true);
      }
    } else if (field === 'images') {
      if (droppedFiles.length > 0) {
        const newFiles = Array.from(droppedFiles);
        setFormData(prev => prev ? { ...prev, images: [...prev.images, ...newFiles] } : null);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
        setHasUnsavedChanges(true);
      }
    } else if (field === 'metaImage') {
      if (droppedFiles[0]) {
        setFormData(prev => prev ? { ...prev, seo: { ...prev.seo, metaImage: droppedFiles[0] } } : null);
        setMetaImagePreview(URL.createObjectURL(droppedFiles[0]));
        setHasUnsavedChanges(true);
      }
    }
  }, []);

  const handleRevertChanges = useCallback(() => {
    if (originalData) {
      setFormData(JSON.parse(JSON.stringify(originalData)));
      setHasUnsavedChanges(false);
      if (originalThumbnailUrl) {
        setThumbnailPreview(originalThumbnailUrl);
      } else if (thumbnailPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
        setThumbnailPreview(null);
      } else {
        setThumbnailPreview(null);
      }
      if (Array.isArray(originalData.images)) {
        setImagePreviews(originalData.images.filter((img): img is string => typeof img === 'string'));
      } else {
        setImagePreviews([]);
      }
      toast.info("Changes have been reverted.", { duration: 2000 });
    }
  }, [originalData, originalThumbnailUrl, thumbnailPreview]);

  const { isGenerating, error: generationError, generateSEO } = useGenerateSEO();
  const { isGenerating: isGeneratingContent, error: contentGenerationError, generateContent, isGeneratingTags, tagsError, generateTags } = useGenerateContent();
  const { isGeneratingImage, imageGenerationError, generateImage } = useGenerateImage();

  const handleGenerateSEO = async () => {
    if (!formData?.title.en) {
      toast.error("Please enter an English title first to generate SEO content.");
      return;
    }
    const result = await generateSEO(formData.title.en);
    if (result) {
      setFormData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          seo: {
            ...prev.seo,
            metaTitle: {
              en: result.metaTitle.en,
              kh: result.metaTitle.kh,
            },
            metaDescription: {
              en: result.metaDescription.en,
              kh: result.metaDescription.kh,
            },
            keywords: result.keywords,
          },
        };
      });
      toast.success("SEO content generated successfully!");
    } else if (generationError) {
      toast.error(generationError);
    }
  };

  const handleGenerateContent = async () => {
    if (!formData?.title.en) {
      toast.error("Please enter an English title first to generate content.");
      return;
    }
    const result = await generateContent(formData.title.en);
    if (result) {
      setFormData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          title: result.title,
          description: result.description,
          content: result.content,
        };
      });
      toast.success("Content generated successfully!");
    } else if (contentGenerationError) {
      toast.error(contentGenerationError);
    }
  };

  const handleGenerateTags = async () => {
    if (!formData?.title.en && !formData?.content.en) {
      toast.error("Please enter a title or content to generate tags.");
      return;
    }
    const tags = await generateTags({ title: formData.title.en, content: formData.content.en });
    if (tags && tags.length > 0) {
      setFormData(prev => prev ? { ...prev, tags } : prev);
      toast.success("Tags generated successfully!");
    } else if (tagsError) {
      toast.error(tagsError);
    }
  };

  const handleGenerateImage = async () => {
    if (!formData?.title.en) {
      toast.error("Please enter an English title to generate an image.");
      return;
    }
    const result = await generateImage(formData.title.en);
    if (result && result.file) {
      setFormData(prev => prev ? { ...prev, thumbnail: result.file } : prev);
      setThumbnailPreview(URL.createObjectURL(result.file));
      toast.success("Image generated and set as thumbnail!");
    } else if (imageGenerationError) {
      toast.error(imageGenerationError);
    }
  };

  // --- FIX: Only append a single string value for status, never an array ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    if (hasUnsavedChanges) {
      await autoSave();
    }
    if (!validateForm()) {
      toast.error("Please correct the validation errors.", { duration: 3000 });
      const errorKeys = Object.keys(validationErrors);
      if (errorKeys.some(key => key.startsWith("title") || key.startsWith("description") || key.startsWith("content"))) {
        setActiveTab("content");
      } else if (errorKeys.some(key => key.includes("thumbnail") || key.includes("images"))) {
        setActiveTab("media");
      } else if (errorKeys.some(key => key.startsWith("seo"))) {
        setActiveTab("seo");
      } else if (errorKeys.some(key => key === "category" || key.includes("tags"))) {
        setActiveTab("details");
      }
      return;
    }

    const data = new FormData();

    // Only append primitive fields (not objects/arrays) except for status, which is always a string
    Object.entries(formData).forEach(([key, value]) => {
      if (
        key !== 'thumbnail' &&
        key !== 'images' &&
        key !== 'tags' &&
        key !== 'seo' &&
        key !== 'content' &&
        key !== 'description' &&
        key !== 'title' &&
        key !== 'category' &&
        typeof value !== 'object'
      ) {
        data.append(key, value != null ? value.toString() : "");
      }
    });

    // Always append status as a single string value
    data.set('status', formData.status);

    // Append complex fields
    data.append('title', JSON.stringify(formData.title));
    data.append('content', JSON.stringify(formData.content));
    data.append('description', JSON.stringify(formData.description));
    const categoryId = typeof formData.category === 'object' ? formData.category._id : formData.category;
    data.append('category', categoryId);
    data.append('tags', Array.isArray(formData.tags) ? formData.tags.join(',') : formData.tags);

    // Handle SEO, excluding the metaImage File object
    const { metaImage, ...restOfSeo } = formData.seo;
    data.append('seo', JSON.stringify(restOfSeo));

    if (metaImage instanceof File) {
      data.append('metaImage', metaImage);
    }
    if (formData.thumbnail instanceof File) {
      data.append('thumbnail', formData.thumbnail);
    }
    if (formData.seo.metaImage instanceof File) {
      data.append('metaImage', formData.seo.metaImage);
    } else if (formData.thumbnail === null && originalThumbnailUrl) {
      data.append("removeThumbnail", "true");
    }

    try {
      await onSubmit(data);
      setHasUnsavedChanges(false);
      setOriginalData(JSON.parse(JSON.stringify(formData)));
    } catch {
      // Error toast is handled by the parent page component
    }
  };

  if (isLoading || formData === null) {
    return (
      <div className="p-6">
        <Skeleton className="h-12 w-1/3 mb-4" />
        <Skeleton className="h-8 w-1/2 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Article data could not be loaded. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-muted/10">
        <div className="mx-auto max-w-7xl p-3 sm:p-4 lg:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="w-full">
              <NewsFormHeader
                isEditMode={isEditMode}
                isSaving={isSaving}
                lastSaved={lastSaved}
                hasUnsavedChanges={hasUnsavedChanges}
                onRevert={handleRevertChanges}
                originalTitle={initialData?.title?.en || "Create News Article"}
                status={formData.status}
                isSubmitting={isSubmitting}
              />
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                  <TabsTrigger value="content" className="text-xs sm:text-sm py-2 sm:py-2.5">Content</TabsTrigger>
                  <TabsTrigger value="media" className="text-xs sm:text-sm py-2 sm:py-2.5">Media</TabsTrigger>
                  <TabsTrigger value="seo" className="text-xs sm:text-sm py-2 sm:py-2.5">SEO</TabsTrigger>
                  <TabsTrigger value="details" className="text-xs sm:text-sm py-2 sm:py-2.5">Details</TabsTrigger>
                </TabsList>
                <TabsContent value="content">
                  <NewsFormContentTab
                    formData={formData}
                    validationErrors={validationErrors}
                    onInputChange={handleInputChange}
                    onGenerateContent={handleGenerateContent}
                    isGenerating={isGeneratingContent}
                  />
                </TabsContent>
                <TabsContent value="media">
                  <NewsFormMediaTab
                    thumbnailPreview={thumbnailPreview}
                    imagePreviews={imagePreviews}
                    metaImagePreview={metaImagePreview}
                    categoryImagePreview={categoryImagePreview}
                    isDragOver={isDragOver}
                    onFileChange={handleFileChange}
                    onRemoveThumbnail={handleRemoveThumbnail}
                    onRemoveImage={handleRemoveImage}
                    onRemoveMetaImage={handleRemoveMetaImage}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onGenerateImage={handleGenerateImage}
                    isGeneratingImage={isGeneratingImage}
                  />
                </TabsContent>
                <TabsContent value="seo">
                  <NewsFormSEOTab
                    formData={formData}
                    validationErrors={validationErrors}
                    onInputChange={handleInputChange}
                    onGenerateSEO={handleGenerateSEO}
                    isGenerating={isGenerating}
                  />
                </TabsContent>
                <TabsContent value="details">
                  <NewsFormDetailsTab
                    formData={formData}
                    categories={categories}
                    validationErrors={validationErrors}
                    onCategoryChange={handleCategoryChange}
                    onTagsChange={handleTagsChange}
                    onSwitchChange={handleSwitchChange}
                    onGenerateTags={handleGenerateTags}
                    isGeneratingTags={isGeneratingTags}
                  />
                </TabsContent>
              </Tabs>
              {Object.keys(validationErrors).some(key => validationErrors[key]) && (
                <Alert variant="destructive" className="mt-3 sm:mt-4 lg:mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm sm:text-base">Validation Error</AlertTitle>
                  <AlertDescription className="text-xs sm:text-sm">
                    Please fix the validation errors before submitting.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <div className="w-full">
              <NewsFormSidebar
                isSubmitting={isSubmitting}
                formData={formData}
                formStats={formStats}
                onStatusChange={handleStatusChange}
                onSwitchChange={handleSwitchChange}
              />
            </div>
          </form>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default NewsForm;