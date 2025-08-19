'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';
import CategoryForm, { CategoryData, BilingualText } from '@/components/admin/categories/CategoryForm';
import { toast } from 'sonner';
import api from '@/lib/api';

const getBilingualValue = (value: string | BilingualText): BilingualText => {
  if (typeof value === 'string') {
    return { en: value, kh: value };
  }
  return value;
};

export default function CreateCategoryClientPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || 'en';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: CategoryData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        name: getBilingualValue(formData.name),
        slug: getBilingualValue(formData.slug),
        description: getBilingualValue(formData.description || ''),
        color: formData.color,
        isActive: formData.isActive ?? true,
      };

      await api.post('/categories', payload);
      setSuccess(true);
      toast.success('Category created successfully!');
      setTimeout(() => {
        router.push(`/${lang}/admin/categories`);
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      toast.error('Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Plus className="w-8 h-8 text-blue-600" />
            Create New Category
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Add a new news category to organize your articles with bilingual support.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="flex items-center gap-2"
        >
          <Link href={`/${lang}/admin/categories`}>
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Link>
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span>Category created successfully! Redirecting...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isSubmitting && (
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating category...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Form */}
      <CategoryForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        isEditing={false}
      />
    </div>
  );
}
