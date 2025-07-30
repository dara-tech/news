"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import type { NewsFormData, FormStats } from "../NewsForm"
import { Switch } from "@/components/ui/switch"
import { Save, Send, Loader2 } from "lucide-react";

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
  isSubmitting,
  onStatusChange,
  onSwitchChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {/* Publication Card */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Publication</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Manage article visibility and status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">Status</Label>
            <Select value={formData.status} onValueChange={onStatusChange}>
              <SelectTrigger id="status" className="h-9 sm:h-10">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-1">
            <Label htmlFor="isFeatured" className="text-sm font-medium flex-1">Featured Article</Label>
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => onSwitchChange(checked, "isFeatured")}
              className="ml-2"
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <Label htmlFor="isBreaking" className="text-sm font-medium flex-1">Breaking News</Label>
            <Switch
              id="isBreaking"
              checked={formData.isBreaking}
              onCheckedChange={(checked) => onSwitchChange(checked, "isBreaking")}
              className="ml-2"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Statistics Card */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Statistics</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Live counts of your content.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">Word Count:</span>
              <div className="text-xs sm:text-sm font-medium">
                <span className="inline-block">{formStats.wordCount.en} (EN)</span>
                <span className="mx-1 text-muted-foreground">/</span>
                <span className="inline-block">{formStats.wordCount.kh} (KH)</span>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">Character Count:</span>
              <div className="text-xs sm:text-sm font-medium">
                <span className="inline-block">{formStats.charCount.en} (EN)</span>
                <span className="mx-1 text-muted-foreground">/</span>
                <span className="inline-block">{formStats.charCount.kh} (KH)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Submit/Publish Button */}
      <div className="md:col-span-2">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full py-3 h-auto text-base font-semibold ${
            formData.status === 'published' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {formData.status === 'published' ? 'Publishing...' : 'Saving...'}
            </>
          ) : (
            <>
              {formData.status === 'published' ? (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Publish Article
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Draft
                </>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default NewsFormSidebar
