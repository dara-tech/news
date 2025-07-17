"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { NewsFormData, FormStats } from "../NewsForm"

import { Switch } from "@/components/ui/switch";

interface NewsFormSidebarProps {
  formData: NewsFormData;
  formStats: FormStats;
  isSubmitting: boolean;
  onStatusChange: (value: "draft" | "published") => void;
  onSwitchChange: (checked: boolean, name: "isFeatured" | "isBreaking") => void;
}

const NewsFormSidebar: React.FC<NewsFormSidebarProps> = ({
  formData,
  formStats,
  onStatusChange,
  onSwitchChange,
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Publication</CardTitle>
          <CardDescription>Manage article visibility and status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={onStatusChange}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label htmlFor="isFeatured">Featured Article</Label>
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => onSwitchChange(checked, "isFeatured")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isBreaking">Breaking News</Label>
            <Switch
              id="isBreaking"
              checked={formData.isBreaking}
              onCheckedChange={(checked) => onSwitchChange(checked, "isBreaking")}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
          <CardDescription>Live counts of your content.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Word Count:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{formStats.wordCount.en} (EN) / {formStats.wordCount.kh} (KH)</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Character Count:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{formStats.charCount.en} (EN) / {formStats.charCount.kh} (KH)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NewsFormSidebar
