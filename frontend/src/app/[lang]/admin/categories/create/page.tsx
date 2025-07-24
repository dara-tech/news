'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
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
      console.error('Error creating category:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      toast.error('Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Category</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Add a new news category to organize your articles.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="flex items-center gap-2"
        >
          <Link href={`/${lang}/admin/categories`}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg border border-muted-foreground/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-2 py-1 text-xs font-semibold">
              New
            </Badge>
            Category Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            isEditing={false}
          />
          {isSubmitting && (
            <div className="flex items-center gap-2 mt-6 text-primary">
              <Loader2 className="animate-spin w-5 h-5" />
              <span>Creating category...</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 mt-6 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span>Category created successfully! Redirecting...</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
