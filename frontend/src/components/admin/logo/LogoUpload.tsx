'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileImage, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/lib/api';

interface LogoUploadProps {
  onUploadSuccess?: (logoUrl: string) => void;
  onDeleteSuccess?: () => void;
  currentLogo?: {
    url: string;
    width: number;
    height: number;
    format: string;
    size: number;
    lastUpdated: string;
  };
}

export function LogoUpload({ onUploadSuccess, onDeleteSuccess, currentLogo }: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or SVG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('logo', selectedFile);
      
      // Upload to backend
      const response = await api.post('/admin/settings/logo/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        const logoUrl = response.data.logo.url;
        onUploadSuccess?.(logoUrl);
        toast.success('Logo uploaded successfully!');
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete from backend
      const response = await api.delete('/admin/settings/logo');
      
      if (response.data.success) {
        onDeleteSuccess?.();
        toast.success('Logo deleted successfully!');
      } else {
        throw new Error(response.data.message || 'Delete failed');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete logo');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Logo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag & Drop Area */}
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <FileImage className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click to select or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              PNG, JPG, SVG up to 5MB
            </p>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileImage className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Preview */}
              {previewUrl && (
                <div className="mt-4">
                  <img
                    src={previewUrl}
                    alt="Logo preview"
                    className="max-h-32 mx-auto rounded border"
                  />
                </div>
              )}
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 'Upload Logo'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Current Logo Section */}
      {currentLogo && currentLogo.url && typeof currentLogo.url === 'string' && currentLogo.url.trim() !== '' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              Current Logo
            </CardTitle>
            <div className="text-xs text-gray-500 mt-2">
              Debug: URL={currentLogo.url}, Format={currentLogo.format}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={currentLogo.url}
                  alt="Current logo"
                  className="h-16 w-auto rounded border"
                  onError={(e) => {
                    console.error('Failed to load current logo:', currentLogo.url);
                    e.currentTarget.style.display = 'none';
                    // Show a placeholder instead
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="h-16 w-16 bg-gray-200 rounded border flex items-center justify-center"><FileImage class="h-8 w-8 text-gray-400" /></div>';
                    }
                  }}
                  onLoad={() => {
                    console.log('Current logo loaded successfully:', currentLogo.url);
                  }}
                  onAbort={(e) => {
                    console.error('Logo load aborted:', currentLogo.url);
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">Current Logo</p>
                <p className="text-sm text-gray-500">
                  {currentLogo.width || 0} × {currentLogo.height || 0} • {currentLogo.format?.toUpperCase() || 'Unknown'} • {formatFileSize(currentLogo.size || 0)}
                </p>
                <p className="text-xs text-gray-400">
                  Updated: {currentLogo.lastUpdated ? formatDate(currentLogo.lastUpdated) : 'Unknown'}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 