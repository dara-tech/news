"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { toast } from "sonner"
import NewsForm from "@/components/admin/news/NewsForm"

const CreateNewsPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleCreateArticle = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await api.post("/news", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      toast.success("Article created successfully!")
      router.push("/admin/news")
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } } }
      const errorMessage = apiError.response?.data?.message || "Failed to create news article."
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <NewsForm
      onSubmit={handleCreateArticle}
      isEditMode={false}
      isLoading={false}
      isSubmitting={isSubmitting}
    />
  )
}

export default CreateNewsPage