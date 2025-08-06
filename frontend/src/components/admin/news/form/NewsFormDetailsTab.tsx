"use client"

import type React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { NewsFormData, Category, ValidationErrors } from "../NewsForm";
import { Button } from "@/components/ui/button";
import { MdOutlineSmartToy } from "react-icons/md";
  
interface NewsFormDetailsTabProps {
  formData: NewsFormData;
  categories: Category[];
  validationErrors: ValidationErrors;
  onSwitchChange: (checked: boolean, name: "isFeatured" | "isBreaking") => void;
  onCategoryChange: (value: string) => void;
  onTagsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateTags: () => void;
  isGeneratingTags: boolean;
}

const NewsFormDetailsTab: React.FC<NewsFormDetailsTabProps> = ({ 
  formData, 
  categories, 
  validationErrors, 
  onSwitchChange, 
  onCategoryChange, 
  onTagsChange, 
  onGenerateTags, 
  isGeneratingTags
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Article Details</CardTitle>
        <CardDescription>Configure organizational and visibility settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={typeof formData.category === 'object' && formData.category !== null ? formData.category._id : formData.category || ''} onValueChange={onCategoryChange}>
            <SelectTrigger id="category" className={validationErrors.category ? "border-red-500 w-full" : ""}>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name.en} ({category.name.kh})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.category && <p className="text-sm text-red-500">{validationErrors.category}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Input
              id="tags"
              name="tags"
              value={Array.isArray(formData.tags) ? formData.tags.join(", ") : formData.tags}
              onChange={onTagsChange}
              placeholder="e.g., AI, Startups, Cambodia"
              className="flex-1"
            />
            <Button
              type="button"
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs sm:text-sm font-medium rounded bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-60 w-full sm:w-auto"
              onClick={onGenerateTags}
              disabled={isGeneratingTags}
            >
              <MdOutlineSmartToy className="mr-2 text-sm sm:text-base" />
              {isGeneratingTags ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
          <p className="text-xs text-slate-500">Separate tags with commas.</p>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="isFeatured" className="text-base">Featured Article</Label>
            <p className="text-sm text-slate-500 dark:text-slate-400">Feature this article on the homepage.</p>
          </div>
          <Switch
            id="isFeatured"
            checked={formData.isFeatured}
            onCheckedChange={(checked) => onSwitchChange(checked, "isFeatured")}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="isBreaking" className="text-base">Breaking News</Label>
            <p className="text-sm text-slate-500 dark:text-slate-400">Mark this as breaking news.</p>
          </div>
          <Switch
            id="isBreaking"
            checked={formData.isBreaking}
            onCheckedChange={(checked) => onSwitchChange(checked, "isBreaking")}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsFormDetailsTab
