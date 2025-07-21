'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CategoryForm, { CategoryData, BilingualText } from '@/components/admin/categories/CategoryForm';

const getBilingualValue = (value: string | BilingualText): BilingualText => {
  if (typeof value === 'string') {
    return { en: value, kh: value }; // or just `{ en: value }` if truly English-only
  }
  return value;
};

export default function CreateCategoryClientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: CategoryData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: getBilingualValue(formData.name),
        slug: getBilingualValue(formData.slug),
        description: getBilingualValue(formData.description || ''),
        color: formData.color,
        isActive: formData.isActive ?? true,
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create category');
      }

      router.push(`/admin/categories`);
      router.refresh();
    } catch (err: unknown) {
      console.error('Error creating category:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create New Category</h1>
        <Button variant="outline" onClick={() => router.push(`/admin/categories`)}>
          Back to Categories
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Information</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            isEditing={false}
          />
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
