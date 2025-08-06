'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  Palette, 
  Globe, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export interface BilingualText {
  en: string;
  kh: string;
}

export interface CategoryData {
  id?: string;
  name: string | BilingualText;
  slug: string | BilingualText;
  description: string | BilingualText;
  color: string;
  isActive: boolean;
}

interface CategoryFormProps {
  initialData?: CategoryData;
  isEditing?: boolean;
  onSubmit: (data: CategoryData) => Promise<void>;
  isLoading: boolean;
}

const predefinedColors = [
  { name: 'Blue', value: '#3B82F6', class: 'bg-blue-500' },
  { name: 'Green', value: '#10B981', class: 'bg-green-500' },
  { name: 'Purple', value: '#8B5CF6', class: 'bg-purple-500' },
  { name: 'Orange', value: '#F97316', class: 'bg-orange-500' },
  { name: 'Pink', value: '#EC4899', class: 'bg-pink-500' },
  { name: 'Cyan', value: '#06B6D4', class: 'bg-cyan-500' },
  { name: 'Yellow', value: '#F59E0B', class: 'bg-yellow-500' },
  { name: 'Red', value: '#EF4444', class: 'bg-red-500' },
  { name: 'Lime', value: '#84CC16', class: 'bg-lime-500' },
  { name: 'Gray', value: '#6B7280', class: 'bg-gray-500' },
];

export default function CategoryForm({ initialData, isEditing = false, onSubmit, isLoading }: CategoryFormProps) {

  // Helper to get string value from bilingual field
  const getStringValue = (value: string | BilingualText, lang: 'en' | 'kh' = 'en'): string => {
    if (!value) return '';
    return typeof value === 'string' ? value : value[lang] || '';
  };

  const [formData, setFormData] = useState<CategoryData>(() => {
    // Handle both string and BilingualText initial data
    const initialName = initialData?.name || { en: '', kh: '' };
    const initialSlug = initialData?.slug || { en: '', kh: '' };
    const initialDescription = initialData?.description || { en: '', kh: '' };
    
    return {
      name: typeof initialName === 'string' ? { en: initialName, kh: initialName } : initialName,
      slug: typeof initialSlug === 'string' ? { en: initialSlug, kh: initialSlug } : initialSlug,
      description: typeof initialDescription === 'string' 
        ? { en: initialDescription, kh: initialDescription } 
        : initialDescription,
      color: initialData?.color || predefinedColors[0].value,
      isActive: initialData?.isActive ?? true,
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!getStringValue(formData.name, 'en').trim()) {
      newErrors.nameEn = 'English name is required';
    }
    
    if (!getStringValue(formData.slug, 'en').trim()) {
      newErrors.slugEn = 'English slug is required';
    }
    
    if (getStringValue(formData.slug, 'en').includes(' ')) {
      newErrors.slugEn = 'Slug cannot contain spaces';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNameChange = (value: string, lang: 'en' | 'kh' = 'en') => {
    setFormData(prev => {
      const currentName = typeof prev.name === 'string' 
        ? { en: prev.name, kh: prev.name }
        : { ...prev.name };
      
      const newName = { ...currentName, [lang]: value };
      
      // Only auto-generate slug when editing English name and not in edit mode
      const newSlug = !isEditing && lang === 'en'
        ? { 
            en: generateSlug(value),
            kh: generateSlug(value)
          }
        : prev.slug;
      
      return {
        ...prev,
        name: newName,
        slug: newSlug,
      };
    });
    
    // Clear validation errors
    if (errors[`name${lang === 'en' ? 'En' : 'Kh'}`]) {
      setErrors(prev => ({ ...prev, [`name${lang === 'en' ? 'En' : 'Kh'}`]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    await onSubmit(formData);
  };

  const currentColor = predefinedColors.find(c => c.value === formData.color) || predefinedColors[0];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/admin/categories">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                {isEditing ? 'Edit Category' : 'Create New Category'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="en" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="en" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      English
                    </TabsTrigger>
                    <TabsTrigger value="kh" className="flex items-center gap-2">
                      🇰🇭 Khmer
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="en" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name-en" className="text-sm font-medium">
                        Category Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name-en"
                        value={getStringValue(formData.name, 'en')}
                        onChange={(e) => handleNameChange(e.target.value, 'en')}
                        placeholder="Enter category name in English"
                        className={errors.nameEn ? 'border-red-500' : ''}
                      />
                      {errors.nameEn && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.nameEn}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug-en" className="text-sm font-medium">
                        URL Slug <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="slug-en"
                        value={getStringValue(formData.slug, 'en')}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          slug: {
                            ...(typeof prev.slug === 'object' ? prev.slug : { en: prev.slug, kh: '' }),
                            en: e.target.value
                          }
                        }))}
                        placeholder="category-url-slug"
                        className={errors.slugEn ? 'border-red-500' : ''}
                      />
                      {errors.slugEn && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.slugEn}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        URL: /category/{getStringValue(formData.slug, 'en') || 'your-slug'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description-en" className="text-sm font-medium">
                        Description
                      </Label>
                      <Textarea
                        id="description-en"
                        value={getStringValue(formData.description, 'en')}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          description: {
                            ...(typeof prev.description === 'object' ? prev.description : { en: prev.description, kh: '' }),
                            en: e.target.value
                          }
                        }))}
                        placeholder="Brief description in English"
                        rows={3}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="kh" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name-kh" className="text-sm font-medium">
                        ឈ្មោះប្រភេទ (Category Name)
                      </Label>
                      <Input
                        id="name-kh"
                        value={getStringValue(formData.name, 'kh')}
                        onChange={(e) => handleNameChange(e.target.value, 'kh')}
                        placeholder="បញ្ចូលឈ្មោះប្រភេទជាភាសាខ្មែរ"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug-kh" className="text-sm font-medium">
                        URL Slug (ខ្មែរ)
                      </Label>
                      <Input
                        id="slug-kh"
                        value={getStringValue(formData.slug, 'kh')}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          slug: {
                            ...(typeof prev.slug === 'object' ? prev.slug : { en: '', kh: prev.slug }),
                            kh: e.target.value
                          }
                        }))}
                        placeholder="category-slug-kh"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description-kh" className="text-sm font-medium">
                        ការពិពណ៌នា (Description)
                      </Label>
                      <Textarea
                        id="description-kh"
                        value={getStringValue(formData.description, 'kh')}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          description: {
                            ...(typeof prev.description === 'object' ? prev.description : { en: '', kh: prev.description }),
                            kh: e.target.value
                          }
                        }))}
                        placeholder="ការពិពណ៌នាខ្លីជាភាសាខ្មែរ"
                        rows={3}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <Separator />

                {/* Color Selection */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Category Color</Label>
                  <div className="grid grid-cols-5 gap-3">
                    {predefinedColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`relative w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                          formData.color === color.value 
                            ? 'border-gray-900 dark:border-white scale-110 ring-2 ring-offset-2 ring-blue-500' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                        title={color.name}
                      >
                        {formData.color === color.value && (
                          <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-white bg-gray-900 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-8 p-1 border rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">Custom color</span>
                    <Badge variant="outline" className="text-xs">
                      {currentColor.name}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Active Status */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    {formData.isActive ? (
                      <Eye className="w-5 h-5 text-green-600" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <Label htmlFor="isActive" className="text-base font-medium">
                        Active Status
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {formData.isActive 
                          ? 'This category is visible to users' 
                          : 'This category is hidden from users'
                        }
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isActive: checked }))
                    }
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading 
                      ? 'Saving...' 
                      : isEditing 
                        ? 'Update Category' 
                        : 'Create Category'
                    }
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/admin/categories">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Category Preview */}
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: formData.color }}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {getStringValue(formData.name, 'en') || 'Category Name'}
                      </div>
                      {getStringValue(formData.name, 'kh') && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {getStringValue(formData.name, 'kh')}
                        </div>
                      )}
                    </div>
                    <Badge 
                      variant={formData.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {(getStringValue(formData.description, 'en') || getStringValue(formData.description, 'kh')) && (
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      {getStringValue(formData.description, 'en') || getStringValue(formData.description, 'kh')}
                    </div>
                  )}
                </div>

                {/* URL Preview */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">URL Preview</div>
                  <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    /category/{getStringValue(formData.slug, 'en') || 'your-slug'}
                  </div>
                </div>

                {/* Color Info */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xs text-gray-500 mb-2">Selected Color</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: formData.color }}
                    />
                    <span className="text-sm font-mono">{formData.color}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
