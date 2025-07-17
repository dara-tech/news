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
    <header className="sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" size="icon" onClick={() => router.push("/admin/news")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isEditMode ? "Edit News Article" : "Create News Article"}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-xs md:max-w-md">
              {isEditMode ? `Editing: ${originalTitle}` : "Fill out the form to publish a new article."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isSaving && (
            <Badge variant="secondary">
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Saving...
            </Badge>
          )}
          {lastSaved && !isSaving && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle2 className="mr-2 h-3 w-3" />
              Saved
            </Badge>
          )}
          {isEditMode && hasUnsavedChanges && (
            <Button type="button" variant="ghost" onClick={onRevert} disabled={isSubmitting}>
              <RefreshCw className="mr-2 h-4 w-4" /> Revert
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || isSaving}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {status === "published" ? "Publish" : "Save Draft"}
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}

export default NewsFormHeader
