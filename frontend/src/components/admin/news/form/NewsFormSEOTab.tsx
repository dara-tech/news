"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import type { NewsFormData } from "../NewsForm"

interface NewsFormSEOTabProps {
  formData: NewsFormData;
  validationErrors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const NewsFormSEOTab: React.FC<NewsFormSEOTabProps> = ({ formData, validationErrors, onInputChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Configuration</CardTitle>
        <CardDescription>Optimize your article for search engines.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="meta-title-en">Meta Title (English)</Label>
            <Input
              id="meta-title-en"
              name="seo.metaTitle.en"
              value={formData.seo.metaTitle.en || ''}
              onChange={onInputChange}
              maxLength={70}
              placeholder="Enter English meta title (max 70 chars)"
            />
            <p className="text-sm text-muted-foreground">
              {(formData.seo.metaTitle.en?.length || 0)}/70
            </p>
            {validationErrors["seo.metaTitle.en"] && (
              <p className="text-sm text-red-500">{validationErrors["seo.metaTitle.en"]}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="meta-title-kh">Meta Title (Khmer)</Label>
            <Input
              id="meta-title-kh"
              name="seo.metaTitle.kh"
              value={formData.seo.metaTitle.kh || ''}
              onChange={onInputChange}
              maxLength={70}
              placeholder="Enter Khmer meta title (max 70 chars)"
            />
            <p className="text-sm text-muted-foreground">
              {(formData.seo.metaTitle.kh?.length || 0)}/70
            </p>
            {validationErrors["seo.metaTitle.kh"] && (
              <p className="text-sm text-red-500">{validationErrors["seo.metaTitle.kh"]}</p>
            )}
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="meta-description-en">Meta Description (English)</Label>
            <Textarea
              id="meta-description-en"
              name="seo.metaDescription.en"
              value={formData.seo.metaDescription.en || ''}
              onChange={onInputChange}
              maxLength={160}
              placeholder="Enter English meta description (max 160 chars)"
              className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
              {(formData.seo.metaDescription.en?.length || 0)}/160
            </p>
            {validationErrors["seo.metaDescription.en"] && (
              <p className="text-sm text-red-500">{validationErrors["seo.metaDescription.en"]}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="meta-description-kh">Meta Description (Khmer)</Label>
            <Textarea
              id="meta-description-kh"
              name="seo.metaDescription.kh"
              value={formData.seo.metaDescription.kh || ''}
              onChange={onInputChange}
              maxLength={160}
              placeholder="Enter Khmer meta description (max 160 chars)"
              className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
              {(formData.seo.metaDescription.kh?.length || 0)}/160
            </p>
            {validationErrors["seo.metaDescription.kh"] && (
              <p className="text-sm text-red-500">{validationErrors["seo.metaDescription.kh"]}</p>
            )}
          </div>
        </div>
        <Separator />
        <div className="grid gap-2">
          <Label htmlFor="keywords">Keywords</Label>
          <Input
            id="keywords"
            name="seo.keywords"
            value={formData.seo.keywords || ''}
            onChange={onInputChange}
            placeholder="Enter comma-separated keywords"
          />
          <p className="text-sm text-muted-foreground">
            Separate keywords with a comma (e.g., technology, AI, news).
          </p>
          {validationErrors["seo.keywords"] && (
            <p className="text-sm text-red-500">{validationErrors["seo.keywords"]}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default NewsFormSEOTab
