"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
// Removed useRouter as it's not directly used in this component,
// and NewsFormHeader should manage its own routing.
// import { useRouter } from "next/navigation"

import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import api from "@/lib/api"; // Assuming you have an api utility for fetching categories
import { toast } from "sonner"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Import sub-components
import NewsFormHeader from "./form/NewsFormHeader"
import NewsFormContentTab from "./form/NewsFormContentTab"
import NewsFormMediaTab from "./form/NewsFormMediaTab"
import NewsFormSEOTab from "./form/NewsFormSEOTab"
import NewsFormDetailsTab from "./form/NewsFormDetailsTab"
import NewsFormSidebar from "./form/NewsFormSidebar"

// Defines the structure for news article data, including multilingual fields and file types.
export interface NewsFormData {
  title: { en: string; kh: string };
  content: { en: string; kh: string };
  description: { en: string; kh: string };
  category: string;
  tags: string[] | string; // Allows string for initial input (comma-separated) or array for internal use
  isFeatured: boolean;
  isBreaking: boolean;
  status: "draft" | "published";
  thumbnail: File | string | null; // Can be File object (new upload) or string (existing URL)
  images: (File | string)[]; // Can be File objects (new uploads) or strings (existing URLs)
  seo: { // Renamed from 'meta' to 'seo'
    metaTitle: { en: string; kh: string };
    metaDescription: { en: string; kh: string };
    keywords: string;
  };
}

// Interface for validation error messages.
export interface ValidationErrors {
  [key: string]: string;
}

// Interface for a single category, including multilingual names.
export interface Category {
  _id: string;
  name: { en: string; kh: string };
  slug: string;
}

// Interface for form statistics like word count and completion.
export interface FormStats {
  wordCount: { en: number; kh: number };
  charCount: { en: number; kh: number };
  completionPercentage: number;
  estimatedReadTime: number;
}

// Props for the NewsForm component.
interface NewsFormProps {
  initialData?: NewsFormData | null; // Optional initial data for editing
  onSubmit: (data: FormData) => Promise<void>; // Function to call on form submission
  isEditMode: boolean; // Flag to determine if the form is in edit mode
  isLoading: boolean; // Flag for initial data loading state
  isSubmitting: boolean; // Flag for form submission state
}

const NewsForm = ({ initialData, onSubmit, isEditMode, isLoading, isSubmitting }: NewsFormProps): React.ReactElement | null => {
  const [formData, setFormData] = useState<NewsFormData | null>(null);
  const [originalData, setOriginalData] = useState<NewsFormData | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [originalThumbnailUrl, setOriginalThumbnailUrl] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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

  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Effect to fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        if (response.data.success) {
          setCategories(response.data.data);
        } else {
          toast.error('Could not load categories.');
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error('An error occurred while fetching categories.');
      }
    };
    fetchCategories();
  }, []);

  // Memoized function to calculate form statistics based on current form data.
  const calculateStats = useCallback((data: NewsFormData): FormStats => {
    const enWords = data.content.en.split(/\s+/).filter(Boolean).length;
    const khWords = data.content.kh.split(/\s+/).filter(Boolean).length;
    const enChars = data.content.en.length;
    const khChars = data.content.kh.length;

    // Define required fields for completion percentage calculation.
    const requiredFields = [
      data.title.en, data.title.kh,
      data.description.en, data.description.kh,
      data.content.en, data.content.kh,
      data.category,
      data.seo.metaTitle.en, data.seo.metaTitle.kh,
      data.seo.metaDescription.en, data.seo.metaDescription.kh,
      data.seo.keywords,
    ];
    // Count how many required fields are non-empty.
    const completedFields = requiredFields.filter(field => typeof field === 'string' && field.trim()).length;
    // Calculate completion percentage.
    const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);
    // Estimate read time based on English word count (200 words per minute).
    const estimatedReadTime = Math.max(1, Math.ceil(enWords / 200));

    return {
      wordCount: { en: enWords, kh: khWords },
      charCount: { en: enChars, kh: khChars },
      completionPercentage,
      estimatedReadTime
    };
  }, []);

  // Effect to initialize form data when the component mounts or initialData/categories change.
  useEffect(() => {
    const emptyForm: NewsFormData = {
      title: { en: "", kh: "" }, content: { en: "", kh: "" }, description: { en: "", kh: "" },
      category: "", tags: "", isFeatured: false, isBreaking: false, status: "draft",
      thumbnail: null, images: [],
      seo: { metaTitle: { en: "", kh: "" }, metaDescription: { en: "", kh: "" }, keywords: "" },
    };

    if (isEditMode && initialData) {
      // Ensure categories are loaded before processing initialData for category ID
      if (categories.length === 0 && initialData.category) {
        // If categories are not loaded yet, wait for them. This useEffect will re-run when categories change.
        return;
      }

      const processedData = { ...emptyForm, ...initialData };

      // Convert category slug/name to ID if in edit mode and category is not already an ID
      if (typeof processedData.category === 'string' && !/^[0-9a-fA-F]{24}$/.test(processedData.category)) {
        const categoryObject = categories.find(c => c.slug === processedData.category || c.name.en === processedData.category || c.name.kh === processedData.category);
        if (categoryObject) {
          processedData.category = categoryObject._id;
        } else {
          // If category not found, set to empty to indicate an issue or allow user to select
          console.warn(`Category "${initialData.category}" not found in fetched categories.`);
          processedData.category = "";
        }
      }

      // Convert tags array to comma-separated string for the input field.
      if (Array.isArray(initialData.tags)) {
        processedData.tags = initialData.tags.join(', ');
      }

      setFormData(processedData as NewsFormData);
      setOriginalData(JSON.parse(JSON.stringify(processedData)) as NewsFormData); // Deep copy original data

      // Set thumbnail preview if an initial thumbnail URL is provided.
      if (typeof initialData.thumbnail === 'string') {
        setThumbnailPreview(initialData.thumbnail);
        setOriginalThumbnailUrl(initialData.thumbnail); // Store original URL for reset
      }
      // Set image previews for existing images.
      if (initialData.images?.length) {
        setImagePreviews(initialData.images.filter((img): img is string => typeof img === 'string'));
      }
    } else if (!isEditMode) {
      // If not in edit mode, or if initialData is null, start with an empty form.
      setFormData(emptyForm);
      setOriginalData(JSON.parse(JSON.stringify(emptyForm))); // Also set original for new forms to track changes
    }
  }, [initialData, categories, isEditMode]); // Added categories to dependency array

  // Effect to recalculate form statistics whenever formData changes.
  useEffect(() => {
    if (formData) {
      setFormStats(calculateStats(formData));
    }
  }, [formData, calculateStats]);

  // Memoized function for auto-saving form data.
  const autoSave = useCallback(async () => {
    // Only auto-save if formData exists and there are unsaved changes.
    if (!formData || !hasUnsavedChanges) return;
    setIsSaving(true);
    try {
      // Simulate a network request delay.
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Update originalData to reflect the current saved state.
      setOriginalData(JSON.parse(JSON.stringify(formData)));
      setLastSaved(new Date()); // Record save time
      toast.success("Changes auto-saved", { duration: 2000 });
      setHasUnsavedChanges(false); // Reset unsaved changes flag
    } catch (error) {
      console.error("Auto-save failed:", error);
      toast.error("Auto-save failed.");
    } finally {
      setIsSaving(false);
    }
  }, [formData, hasUnsavedChanges]);

  // Effect to manage auto-save trigger based on form data changes.
  useEffect(() => {
    // Only enable auto-save in edit mode and if data is loaded.
    if (!isEditMode || !formData || !originalData) return;
    // Check if current formData is different from originalData.
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasUnsavedChanges(hasChanges); // Update unsaved changes flag

    if (hasChanges) {
      // If there are changes, clear any existing auto-save timeout and set a new one.
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = setTimeout(autoSave, 5000); // Auto-save after 5 seconds of inactivity
    }
    // Cleanup function to clear the timeout when the component unmounts or dependencies change.
    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [formData, originalData, autoSave, isEditMode]);

  // Effect to revoke object URLs when component unmounts or previews change, to prevent memory leaks.
  useEffect(() => {
    return () => {
      if (thumbnailPreview?.startsWith("blob:")) URL.revokeObjectURL(thumbnailPreview);
      imagePreviews.forEach(url => { if (url.startsWith("blob:")) URL.revokeObjectURL(url); });
    };
  }, [thumbnailPreview, imagePreviews]);

  // Memoized function to validate the form data.
  const validateForm = useCallback((): boolean => {
    if (!formData) return false;
    const errors: ValidationErrors = {};
    // Basic validation for required fields.
    if (!formData.title.en.trim()) errors["title.en"] = "English title is required";
    if (!formData.title.kh.trim()) errors["title.kh"] = "Khmer title is required";
    if (!formData.description.en.trim()) errors["description.en"] = "English description is required";
    if (!formData.description.kh.trim()) errors["description.kh"] = "Khmer description is required";
    if (!formData.content.en.trim()) errors["content.en"] = "English content is required";
    if (!formData.content.kh.trim()) errors["content.kh"] = "Khmer content is required";
    if (!formData.category.trim()) errors.category = "Category is required";

    // Validation for SEO meta fields.
    if (!formData.seo.metaTitle.en.trim()) errors["seo.metaTitle.en"] = "Meta title (English) is required";
    if (!formData.seo.metaTitle.kh.trim()) errors["seo.metaTitle.kh"] = "Meta title (Khmer) is required";
    if (formData.seo.metaTitle.en.length > 70) errors["seo.metaTitle.en"] = "Meta title (English) should be under 70 characters";
    if (formData.seo.metaTitle.kh.length > 70) errors["seo.metaTitle.kh"] = "Meta title (Khmer) should be under 70 characters";
    if (formData.seo.metaDescription.en.length > 160) errors["seo.metaDescription.en"] = "Meta description (English) should be under 160 characters";
    if (formData.seo.metaDescription.kh.length > 160) errors["seo.metaDescription.kh"] = "Meta description (Khmer) should be under 160 characters";

    setValidationErrors(errors); // Update validation errors state.
    return Object.keys(errors).length === 0; // Return true if no errors.
  }, [formData]);

  // Generic handler for nested input changes (e.g., title.en, seo.metaTitle.kh)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return prev;
      const newState = structuredClone(prev); // Deep copy to avoid direct mutation
      const keys = name.split('.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = newState; // Use 'any' here as the path is dynamic and type inference is complex
      // Traverse the object path to find the correct nested property
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value; // Set the value of the target property
      return newState;
    });
    // Clear validation error for the changed field if it exists.
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handles switch (toggle) changes for 'isFeatured' and 'isBreaking'.
  const handleSwitchChange = (checked: boolean, name: "isFeatured" | "isBreaking") => {
    setFormData(prev => prev ? { ...prev, [name]: checked } : prev);
  };

  // Handles select (dropdown) changes for 'status'.
  const handleStatusChange = (value: "draft" | "published") => {
    setFormData(prev => prev ? { ...prev, status: value } : prev);
  };

  // Handles select (dropdown) changes for 'category'.
  const handleCategoryChange = (value: string) => {
    setFormData(prev => prev ? { ...prev, category: value } : prev);
    if (validationErrors.category) setValidationErrors(prev => ({ ...prev, category: "" }));
  };

  // Handles changes for the 'tags' input field.
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => prev ? { ...prev, tags: e.target.value } : prev);
  };

  // Handles file input changes for thumbnail or additional images.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "thumbnail" | "images") => {
    const files = e.target.files;
    if (!files) return;

    if (type === "thumbnail") {
      const file = files[0];
      setFormData(prev => prev ? { ...prev, thumbnail: file } : prev);
      if (thumbnailPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      const newFiles = Array.from(files);
      setFormData(prev => {
        if (!prev) return prev;
        // Filter out any non-file entries from prev.images if they exist, then add new files
        const currentImages = prev.images.filter((img): img is File => img instanceof File);
        return { ...prev, images: [...currentImages, ...newFiles] };
      });
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // Removes the thumbnail image.
  const handleRemoveThumbnail = () => {
    setFormData(prev => prev ? { ...prev, thumbnail: null } : prev);
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailPreview(null);
  };

  // Removes an image from the list and revokes its object URL.
  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      if (!prev) return prev;
      const updatedImages = [...prev.images];
      updatedImages.splice(index, 1); // Remove from formData
      return { ...prev, images: updatedImages };
    });
    setImagePreviews(prev => {
      const updatedPreviews = [...prev];
      const removedUrl = updatedPreviews.splice(index, 1)[0]; // Remove from previews
      if (removedUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(removedUrl);
      }
      return updatedPreviews;
    });
  };

  // Handles drag over event for file drop areas.
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  // Handles drag leave event for file drop areas.
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Handles file drop event for thumbnail or additional images.
  const handleDrop = (e: React.DragEvent, type: "thumbnail" | "images") => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    // Simulate a change event to reuse handleFileChange logic
    const changeEvent = { target: { files } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileChange(changeEvent, type);
  };

  // Resets the form to its original state (last saved or initial data).
  const handleRevertChanges = () => {
    if (originalData) {
      setFormData(JSON.parse(JSON.stringify(originalData))); // Deep copy original data
      setValidationErrors({}); // Clear any validation errors
      setHasUnsavedChanges(false); // No unsaved changes after reset

      // Revert thumbnail preview to original URL or null
      setThumbnailPreview(originalThumbnailUrl);

      // Revert image previews to original string URLs (filter out File objects if any were added)
      setImagePreviews(originalData.images.filter((img): img is string => typeof img === "string"));
      toast.info("Changes have been reverted.");
    }
  };

  // Handles the main form submission.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm() || !formData) {
      toast.error("Please fix the errors before submitting.");
      // Automatically switch to the tab containing the first error.
      const errorKeys = Object.keys(validationErrors);
      const firstErrorField = errorKeys.length > 0 ? errorKeys[0] : "";
      if (firstErrorField.startsWith("title") || firstErrorField.startsWith("description") || firstErrorField.startsWith("content")) {
        setActiveTab("content");
      } else if (firstErrorField.startsWith("seo")) {
        setActiveTab("seo");
      } else if (firstErrorField.startsWith("category")) {
        setActiveTab("details");
      }
      return;
    }

    const data = new FormData();
    const dataToSubmit = structuredClone(formData); // Deep copy for manipulation

    // Handle tags: convert comma-separated string to array for submission
    if (typeof dataToSubmit.tags === 'string') {
      dataToSubmit.tags = dataToSubmit.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    // Separate file fields from the main data object before stringifying
    const thumbnailFile = dataToSubmit.thumbnail instanceof File ? dataToSubmit.thumbnail : null;
    const newImageFiles = (dataToSubmit.images as (string | File)[]).filter((img): img is File => img instanceof File);

    // Append file fields to FormData
    if (thumbnailFile) data.append('thumbnail', thumbnailFile);
    newImageFiles.forEach(file => data.append('images', file));

    // Update dataToSubmit to only include existing image URLs and original thumbnail URL
    dataToSubmit.images = (dataToSubmit.images as (string | File)[]).filter((img): img is string => typeof img === 'string');
    dataToSubmit.thumbnail = typeof originalData?.thumbnail === 'string' ? originalData.thumbnail : null; // Ensure existing thumbnail URL is preserved

    // Append the rest of the form data as a JSON string
    data.append('data', JSON.stringify(dataToSubmit));

    await onSubmit(data);
  };

  // Display skeleton loading state while initial data is being fetched.
  if (isLoading) {
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

  // Display an error message if form data could not be loaded.
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

  // Main form rendering.
  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          {/* Header component */}
          <NewsFormHeader
            isEditMode={isEditMode}
            isSaving={isSaving}
            lastSaved={lastSaved}
            hasUnsavedChanges={hasUnsavedChanges}
            onRevert={handleRevertChanges}
            originalTitle={initialData?.title?.en || "Create News Article"}
            status={formData.status}
            isSubmitting={isSubmitting} // Pass isSubmitting to header for button state
          />
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="content">
              <NewsFormContentTab
                formData={formData}
                validationErrors={validationErrors}
                onInputChange={handleInputChange}
              />
            </TabsContent>
            <TabsContent value="media">
              <NewsFormMediaTab
                thumbnailPreview={thumbnailPreview}
                imagePreviews={imagePreviews}
                isDragOver={isDragOver}
                onFileChange={handleFileChange}
                onRemoveThumbnail={handleRemoveThumbnail}
                onRemoveImage={handleRemoveImage}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                // validationErrors={validationErrors} // Pass if media-specific validation is needed
              />
            </TabsContent>
            <TabsContent value="seo">
              <NewsFormSEOTab
                formData={formData}
                validationErrors={validationErrors}
                onInputChange={handleInputChange}
              />
            </TabsContent>
            <TabsContent value="details">
              <NewsFormDetailsTab
                formData={formData}
                categories={categories} // Pass categories to details tab
                validationErrors={validationErrors}
                onCategoryChange={handleCategoryChange}
                onTagsChange={handleTagsChange}
                onSwitchChange={handleSwitchChange} // Pass switch handler to details tab
              />
            </TabsContent>
          </Tabs>
          {Object.keys(validationErrors).some(key => validationErrors[key]) && (
            <Alert variant="destructive" className="mt-6"> {/* Added margin-top */}
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Error</AlertTitle> {/* More specific title */}
              <AlertDescription>
                Please fix the validation errors before submitting.
              </AlertDescription>
            </Alert>
          )}
        </div>
        {/* Sidebar component */}
        <NewsFormSidebar
          isSubmitting={isSubmitting} // Pass isSubmitting to sidebar if it contains a submit button or needs to react to submission state
          formData={formData}
          formStats={formStats}
          onStatusChange={handleStatusChange}
          onSwitchChange={handleSwitchChange} // Pass switch handler to sidebar if it controls featured/breaking
          // Note: category and tags handlers are now passed to DetailsTab, not Sidebar directly.
          // Sidebar only needs formData.status for its own display.
        />
      </form>
    </TooltipProvider>
  );
};

export default NewsForm;
