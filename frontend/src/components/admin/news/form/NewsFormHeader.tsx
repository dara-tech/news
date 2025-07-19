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
  status: "draft" | "published"
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4">
        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => router.push("/admin/news")}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-2">Back</span>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">
              {isEditMode ? "Edit Article" : "Create Article"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {isEditMode ? `Editing: ${originalTitle}` : "Fill out the form to publish a new article."}
            </p>
          </div>
        </div>
        
        {/* Mobile-optimized action buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Status badges - smaller on mobile */}
          {isSaving && (
            <Badge variant="secondary" className="text-xs">
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              <span className="hidden sm:inline">Saving...</span>
              <span className="sm:hidden">Saving</span>
            </Badge>
          )}
          {lastSaved && !isSaving && (
            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">Saved</span>
              <span className="sm:hidden">✓</span>
            </Badge>
          )}
          
          {/* Action buttons - responsive sizing */}
          {isEditMode && hasUnsavedChanges && (
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={onRevert} 
              disabled={isSubmitting}
              className="text-xs sm:text-sm"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Revert</span>
            </Button>
          )}
          
          <Button 
            type="submit" 
            disabled={isSubmitting || isSaving}
            size="sm"
            className="text-xs sm:text-sm min-w-[80px] sm:min-w-[100px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                <span className="ml-1 sm:ml-2">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="ml-1 sm:ml-2">
                  {status === "published" ? "Publish" : "Save"}
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}

export default NewsFormHeader
