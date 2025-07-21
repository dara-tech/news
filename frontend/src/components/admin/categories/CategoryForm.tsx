'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Palette } from 'lucide-react';
import Link from 'next/link';

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
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
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
      color: initialData?.color || predefinedColors[0],
      isActive: initialData?.isActive ?? true,
    };
  });

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
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
            kh: generateSlug(value) // You might want to handle Khmer separately
          }
        : prev.slug;
      
      return {
        ...prev,
        name: newName,
        slug: newSlug,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/admin/categories">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            {isEditing ? 'Edit Category' : 'Create New Category'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="name-en" className="text-sm font-medium">
                    English Name *
                  </Label>
                  <Input
                    id="name-en"
                    value={getStringValue(formData.name, 'en')}
                    onChange={(e) => handleNameChange(e.target.value, 'en')}
                    placeholder="Enter category name in English"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="name-kh" className="text-sm font-medium">
                    Khmer Name *
                  </Label>
                  <Input
                    id="name-kh"
                    value={getStringValue(formData.name, 'kh')}
                    onChange={(e) => handleNameChange(e.target.value, 'kh')}
                    placeholder="Enter category name in Khmer"
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="slug-en" className="text-sm font-medium">
                    English URL Slug *
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
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="slug-kh" className="text-sm font-medium">
                    Khmer URL Slug *
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
                    placeholder="category-url-slug-kh"
                    required
                    className="mt-1"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  This will be used in the URL: /category/{getStringValue(formData.slug, 'en')}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="description-en" className="text-sm font-medium">
                    English Description
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
                    rows={2}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description-kh" className="text-sm font-medium">
                    Khmer Description
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
                    placeholder="Brief description in Khmer"
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Category Color</Label>
              <div className="flex flex-wrap gap-3">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color 
                        ? 'border-gray-900 dark:border-white scale-110' 
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-8 p-1 border rounded"
                />
                <span className="text-sm text-gray-600">Custom color</span>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
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
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isActive: checked }))
                }
              />
            </div>

            {/* Preview */}
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Preview
              </Label>
              <div className="flex items-center gap-3 mt-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: formData.color }}
                />
                <div>
                  <div className="font-semibold">
                    {getStringValue(formData.name, 'en') || 'Category Name'}
                    {getStringValue(formData.name, 'kh') && (
                      <span className="block text-sm text-gray-600 dark:text-gray-400">
                        {getStringValue(formData.name, 'kh')}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {getStringValue(formData.description, 'en') || 'Category description'}
                    {getStringValue(formData.description, 'kh') && (
                      <div className="mt-1">
                        <span className="text-xs text-gray-500">KH: </span>
                        {getStringValue(formData.description, 'kh')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
  );
}
