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
              Write the main body of your article in English and Khmer.
            </CardDescription>
          </div>
          <Button
            type="button"
            className="inline-flex items-center justify-center px-3 py-1.5 text-xs sm:text-sm font-medium rounded bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-60 w-full sm:w-auto"
            onClick={onGenerateContent}
            disabled={isGenerating}
          >
            <MdOutlineSmartToy className="mr-2 text-sm sm:text-base" />
            {isGenerating ? "Generating..." : "Generate Content"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title.en">Title (English)</Label>
            <Input
              id="title.en"
              name="title.en"
              value={formData.title.en}
              onChange={onInputChange}
              className={validationErrors["title.en"] ? "border-red-500" : ""}
            />
            {validationErrors["title.en"] && (
              <p className="text-sm text-red-500">
                {validationErrors["title.en"]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title.kh">Title (Khmer)</Label>
            <Input
              id="title.kh"
              name="title.kh"
              value={formData.title.kh}
              onChange={onInputChange}
              className={validationErrors["title.kh"] ? "border-red-500" : ""}
            />
            {validationErrors["title.kh"] && (
              <p className="text-sm text-red-500">
                {validationErrors["title.kh"]}
              </p>
            )}
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label htmlFor="description.en">Description (English)</Label>
          <Textarea
            id="description.en"
            name="description.en"
            value={formData.description.en}
            onChange={onInputChange}
            rows={3}
            className={validationErrors["description.en"] ? "border-red-500" : ""}
          />
          {validationErrors["description.en"] && (
            <p className="text-sm text-red-500">
              {validationErrors["description.en"]}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description.kh">Description (Khmer)</Label>
          <Textarea
            id="description.kh"
            name="description.kh"
            value={formData.description.kh}
            onChange={onInputChange}
            rows={3}
            className={validationErrors["description.kh"] ? "border-red-500" : ""}
          />
          {validationErrors["description.kh"] && (
            <p className="text-sm text-red-500">
              {validationErrors["description.kh"]}
            </p>
          )}
        </div>
        <Separator />
        <div className="space-y-2">
          <TiptapEditor
            value={formData.content.en}
            onChange={val =>
              onInputChange(createSyntheticInputEvent("content.en", val))
            }
            error={validationErrors["content.en"]}
            label="Main Content (English)"
          />
        </div>
        <div className="space-y-2">
          <TiptapEditor
            value={formData.content.kh}
            onChange={val =>
              onInputChange(createSyntheticInputEvent("content.kh", val))
            }
            error={validationErrors["content.kh"]}
            label="Main Content (Khmer)"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsFormContentTab;
