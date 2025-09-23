"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import type { NewsFormData } from "../NewsForm"
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { MdOutlineSmartToy } from "react-icons/md"

const TiptapEditor = dynamic(() => import("./TiptapEditor"), { ssr: false });

interface NewsFormContentTabProps {
  formData: NewsFormData;
  validationErrors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onGenerateContent: () => void;
  isGenerating: boolean;
}

// Helper to create a synthetic event compatible with onInputChange
function createSyntheticInputEvent(
  name: string,
  value: string
): React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> {
  return {
    target: {
      name,
      value,
    },
  } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
}

const NewsFormContentTab: React.FC<NewsFormContentTabProps> = ({
  formData,
  validationErrors,
  onInputChange,
  onGenerateContent,
  isGenerating,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Article Content</CardTitle>
            <CardDescription>
              Write your article content. Auto-processing (formatting, translation, analysis) will be handled automatically by the Sentinel system when you save.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
              onClick={onGenerateContent}
              disabled={isGenerating}
            >
              <MdOutlineSmartToy className="mr-2 text-base" />
              {isGenerating ? "Generating Expert Content..." : "Generate Expert Content"}
            </Button>
            <div className="text-xs text-gray-500 text-center sm:text-left">
              AI-powered journalism with professional formatting
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title.en" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Title (English) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title.en"
              name="title.en"
              value={formData.title.en}
              onChange={onInputChange}
              placeholder="Enter compelling, SEO-optimized headline..."
              className={`text-lg font-medium ${validationErrors["title.en"] ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"} focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200`}
            />
            <div className="text-xs text-gray-500">
              {formData.title.en.length}/70 characters • SEO-optimized headlines perform better
            </div>
            {validationErrors["title.en"] && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {validationErrors["title.en"]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title.kh" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Title (Khmer) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title.kh"
              name="title.kh"
              value={formData.title.kh}
              onChange={onInputChange}
              placeholder="បញ្ចូលចំណងជើងគួរឱ្យចាប់អារម្មណ៍..."
              className={`text-lg font-medium ${validationErrors["title.kh"] ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"} focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200`}
            />
            <div className="text-xs text-gray-500">
              {formData.title.kh.length}/70 characters • ចំណងជើងដែលមានប្រសិទ្ធភាពសម្រាប់ SEO
            </div>
            {validationErrors["title.kh"] && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {validationErrors["title.kh"]}
              </p>
            )}
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label htmlFor="description.en" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Meta Description (English) <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description.en"
            name="description.en"
            value={formData.description.en}
            onChange={onInputChange}
            rows={3}
            placeholder="Write compelling meta description that drives clicks and engagement..."
            className={`text-base ${validationErrors["description.en"] ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"} focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200`}
          />
          <div className="text-xs text-gray-500">
            {formData.description.en.length}/160 characters • Optimized for search engines and social media
          </div>
          {validationErrors["description.en"] && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {validationErrors["description.en"]}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description.kh" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Meta Description (Khmer) <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description.kh"
            name="description.kh"
            value={formData.description.kh}
            onChange={onInputChange}
            rows={3}
            placeholder="សរសេរការពិពណ៌នាមេតាដែលគួរឱ្យចាប់អារម្មណ៍..."
            className={`text-base ${validationErrors["description.kh"] ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"} focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200`}
          />
          <div className="text-xs text-gray-500">
            {formData.description.kh.length}/160 characters • បង្កើនប្រសិទ្ធភាពសម្រាប់ម៉ាស៊ីនស្វែងរក
          </div>
          {validationErrors["description.kh"] && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {validationErrors["description.kh"]}
            </p>
          )}
        </div>
        <Separator />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Article Content (English) <span className="text-red-500">*</span>
            </Label>
            <div className="text-xs text-gray-500">
              Professional journalism with expert formatting
            </div>
          </div>
          <TiptapEditor
            value={formData.content.en}
            onChange={val =>
              onInputChange(createSyntheticInputEvent("content.en", val))
            }
            error={validationErrors["content.en"]}
            label=""
            placeholder="Write comprehensive, well-researched article content with proper structure, quotes, and analysis..."
          />
          {validationErrors["content.en"] && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {validationErrors["content.en"]}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Article Content (Khmer) <span className="text-red-500">*</span>
            </Label>
            <div className="text-xs text-gray-500">
              ការសរសេរអត្ថបទដែលមានគុណភាពខ្ពស់
            </div>
          </div>
          <TiptapEditor
            value={formData.content.kh}
            onChange={val =>
              onInputChange(createSyntheticInputEvent("content.kh", val))
            }
            error={validationErrors["content.kh"]}
            label=""
            placeholder="សរសេរអត្ថបទដែលមានគុណភាពខ្ពស់ មានរចនាសម្ព័ន្ធល្អ និងការវិភាគ..."
          />
          {validationErrors["content.kh"] && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {validationErrors["content.kh"]}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsFormContentTab;
