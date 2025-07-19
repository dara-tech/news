"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import api from "@/lib/api"
import { toast } from "sonner"
import NewsForm, { type NewsFormData } from '@/components/admin/news/NewsForm';

const EditNewsPage = () => {
  const [initialData, setInitialData] = useState<NewsFormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const params = useParams()
  const { id } = params

  useEffect(() => {
    if (id) {
      const fetchNewsArticle = async () => {
        setIsLoading(true)
        try {
          const response = await api.get(`/news/${id}`)
          if (response.data?.success) {
            setInitialData(response.data.data)
          } else {
            throw new Error(response.data.message || "Failed to fetch news article.")
          }
        } catch {
          toast.error("Failed to fetch news article.")
          router.push("/admin/news")
        } finally {
          setIsLoading(false)
        }
      }
      fetchNewsArticle()
    }
  }, [id, router])

  const handleSubmit = async (submissionData: FormData) => {
    // Append the metaImage file if it exists
    if (initialData?.seo?.metaImage instanceof File) {
      submissionData.append('metaImage', initialData.seo.metaImage);
    }
    setIsSubmitting(true)
    try {
      await api.put(`/news/${id}`, submissionData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      toast.success(`Article updated successfully!`)
      router.push("/admin/news")
    } catch (err) {
      toast.error("Failed to update news article.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <NewsForm
      initialData={initialData}
      onSubmit={handleSubmit}
      isEditMode={true}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
    />
  )
}

export default EditNewsPage