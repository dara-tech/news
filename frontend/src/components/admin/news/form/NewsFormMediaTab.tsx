"use client"

import type React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { UploadCloud, X } from "lucide-react"

interface NewsFormMediaTabProps {
  thumbnailPreview: string | null;
  imagePreviews: string[];
  metaImagePreview: string | null;
  categoryImagePreview: string | null;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, type: "thumbnail" | "images" | "metaImage") => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: "thumbnail" | "images" | "metaImage") => void;
  onRemoveThumbnail: () => void;
  onRemoveImage: (index: number) => void;
  onRemoveMetaImage: () => void;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
}

const NewsFormMediaTab: React.FC<NewsFormMediaTabProps> = ({
  thumbnailPreview,
  imagePreviews,
  metaImagePreview,
  categoryImagePreview,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onRemoveThumbnail,
  onRemoveImage,
  onRemoveMetaImage,
  onGenerateImage,
  isGeneratingImage,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Assets</CardTitle>
        <CardDescription>Upload a thumbnail and any additional images for the article.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <Label className="text-base font-semibold">Thumbnail Image</Label>
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, "thumbnail")}
            className={`mt-2 relative border-2 border-dashed rounded-xl p-8 transition-all ${
              isDragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400"
            }`}>
            {thumbnailPreview ? (
              <>
                <Image
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  width={500}
                  height={281}
                  className="w-full h-auto object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={onRemoveThumbnail}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="text-center flex flex-col items-center gap-2">
                <UploadCloud className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="mb-2">Drop your thumbnail here or</p>
                <Label htmlFor="thumbnail-upload" className="cursor-pointer text-blue-600 font-semibold hover:underline">
                  browse files
                </Label>
                <input
                  type="file"
                  name="thumbnail"
                  accept="image/*"
                  onChange={(e) => onFileChange(e, "thumbnail")}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-60 mt-2"
                  onClick={onGenerateImage}
                  disabled={isGeneratingImage}
                >
                  {isGeneratingImage ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
            )}
          </div>
        </div>
        <Separator />
        <div>
          <Label className="text-base font-semibold">Additional Images</Label>
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, "images")}
            className={`mt-2 border-2 border-dashed rounded-xl p-6 transition-all ${
              isDragOver ? "border-green-500 bg-green-50" : "border-slate-300 hover:border-slate-400"
            }`}>
            <div className="text-center">
              <UploadCloud className="mx-auto h-8 w-8 text-slate-400 mb-3" />
              <p>Drop additional images here or</p>
              <Label htmlFor="images-upload" className="cursor-pointer text-green-600 font-semibold hover:underline">
                browse files
              </Label>
              <input
                type="file"
                name="images"
                accept="image/*"
                multiple
                onChange={(e) => onFileChange(e, "images")}
                className="hidden"
                id="images-upload"
              />
            </div>
          </div>
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
              {imagePreviews.map((src, index) => (
                <div key={src} className="relative group">
                  <Image
                    src={src}
                    alt={`Preview ${index + 1}`}
                    width={200}
                    height={120}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100"
                    onClick={() => onRemoveImage(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Separator />
        {/* Meta Image Section */}
        <div>
          <Label className="text-base font-semibold">Meta (SEO) Image</Label>
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, "metaImage")}
            className={`mt-2 relative border-2 border-dashed rounded-xl p-8 transition-all ${
              isDragOver ? "border-purple-500 bg-purple-50" : "border-slate-300 hover:border-slate-400"
            }`}>
            {metaImagePreview ? (
              <>
                <Image
                  src={metaImagePreview}
                  alt="Meta image preview"
                  width={500}
                  height={281}
                  className="w-full h-auto object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={onRemoveMetaImage}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="mb-2">Drop your meta image here or</p>
                <Label htmlFor="meta-image-upload" className="cursor-pointer text-purple-600 font-semibold hover:underline">
                  browse files
                </Label>
                <input
                  type="file"
                  name="metaImage"
                  accept="image/*"
                  onChange={(e) => onFileChange(e, "metaImage")}
                  className="hidden"
                  id="meta-image-upload"
                />
              </div>
            )}
          </div>
        </div>

        {/* Category Image Section - Display Only */}
        {categoryImagePreview && (
          <>
            <Separator />
            <div>
              <Label className="text-base font-semibold">Category Image (from selected category)</Label>
              <div className="mt-2 relative">
                <Image
                  src={categoryImagePreview}
                  alt="Category image preview"
                  width={500}
                  height={281}
                  className="w-full h-auto object-cover rounded-lg border"
                />
                <p className="text-sm text-slate-500 mt-2">This image is inherited from the selected category and cannot be changed here.</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default NewsFormMediaTab
