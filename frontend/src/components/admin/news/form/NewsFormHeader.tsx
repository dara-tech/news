"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, RefreshCw, Loader2, CheckCircle2, Save } from "lucide-react"

interface NewsFormHeaderProps {
  isEditMode: boolean
  originalTitle: string
  isSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  isSubmitting: boolean
  status: "draft" | "published" | "archived"
  onRevert: () => void
}

const NewsFormHeader: React.FC<NewsFormHeaderProps> = ({
  isEditMode,
  originalTitle,
  isSaving,
  lastSaved,
  hasUnsavedChanges,
  isSubmitting,
  status,
  onRevert,
}) => {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      {/* Mobile layout: Stack all elements vertically */}
      <div className="flex flex-col gap-3 my-2  sm:hidden">
        {/* Mobile header row */}
        <div className="flex items-center justify-between">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => router.push("/admin/news")}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            {isSaving && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                <Loader2 className="h-3 w-3 animate-spin" />
              </Badge>
            )}
            {lastSaved && !isSaving && (
              <Badge variant="default" className="bg-green-100 text-green-800 text-xs px-2 py-1">
                <CheckCircle2 className="h-3 w-3" />
              </Badge>
            )}
          </div>
        </div>
        
        {/* Mobile title section */}
        <div className="min-w-0">
          <h1 className="text-lg font-bold truncate">
            {isEditMode ? "Edit Article" : "Create Article"}
          </h1>
          <p className="text-xs text-muted-foreground truncate mt-1">
            {isEditMode ? `Editing: ${originalTitle}` : "Fill out the form to publish a new article."}
          </p>
        </div>
        
        {/* Mobile action buttons */}
        <div className="flex items-center gap-2 ">
          {isEditMode && hasUnsavedChanges && (
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={onRevert} 
              disabled={isSubmitting}
              className="text-xs flex-1"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Revert
            </Button>
          )}
          
          <Button 
            type="submit" 
            disabled={isSubmitting || isSaving}
            size="sm"
            className="text-xs flex-1 min-h-[36px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3 w-3 mr-1" />
                {status === "published" ? "Publish" : "Save"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Desktop layout: Single row with proper spacing */}
      <div className="hidden sm:flex sm:items-center sm:justify-between gap-4 p-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => router.push("/admin/news")}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl lg:text-2xl font-bold truncate">
              {isEditMode ? "Edit Article" : "Create Article"}
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              {isEditMode ? `Editing: ${originalTitle}` : "Fill out the form to publish a new article."}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isSaving && (
            <Badge variant="secondary" className="text-xs">
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Saving...
            </Badge>
          )}
          {lastSaved && !isSaving && (
            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Saved
            </Badge>
          )}
          
          {isEditMode && hasUnsavedChanges && (
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={onRevert} 
              disabled={isSubmitting}
              className="text-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Revert
            </Button>
          )}
          
          <Button 
            type="submit" 
            disabled={isSubmitting || isSaving}
            size="sm"
            className="text-sm min-w-[100px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {status === "published" ? "Publish" : "Save"}
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}

export default NewsFormHeader
