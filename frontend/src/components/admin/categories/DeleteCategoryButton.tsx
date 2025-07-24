"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import api from "@/lib/api" // Import your axios client
import { AxiosError } from "axios"

interface DeleteCategoryButtonProps {
  id: string
  name: string | { en: string; kh?: string }
  onDelete?: () => void
}

export default function DeleteCategoryButton({ id, name, onDelete }: DeleteCategoryButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDelete = async () => {
    setIsDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    setIsDialogOpen(false)
    setIsDeleting(true)

    try {
      // Validate ID format - ensure it's a non-empty string
      if (!id || typeof id !== "string" || id.trim() === "") {
        throw new Error("Invalid category ID: ID is required")
      }

      const categoryId = id.trim()

      // Ensure the ID is a valid MongoDB ObjectId format (24 hex characters)
      const objectIdRegex = /^[0-9a-fA-F]{24}$/
      if (!objectIdRegex.test(categoryId)) {
        throw new Error("Invalid category ID format. Must be a valid MongoDB ObjectId")
      }

      // Use axios client for the delete request
      const response = await api.delete(`/categories/${categoryId}`)

      if (response.data.success !== false) {
        const message = response.data.message || "Category deleted successfully"
        toast.success(message)

        if (onDelete) {
          onDelete()
        } else {
          router.refresh()
        }
      } else {
        throw new Error(response.data.message || "Failed to delete category")
      }
    } catch (error: unknown) {

      let errorMessage = "Failed to delete category"

      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.message) {
          errorMessage = error.message
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const categoryName = typeof name === "string" ? name : name.en || name.kh || "this category"

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-700"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label={`Delete ${categoryName}`}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category &quot;{categoryName}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
