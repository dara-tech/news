'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  X,
  Loader2,
  Sparkles,
  RefreshCw,
  Settings,
  Globe,
  Camera,
  Palette,
  Zap,
  Crop,
  RotateCcw,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { SimpleImageCropper } from './SimpleImageCropper';
import { StylePreviewGrid } from './StylePreviewCards';
import { SmartSuggestions } from './SmartSuggestions';
import { ColorCustomizer } from './ColorCustomizer';
import { MultiPlatformExport } from './MultiPlatformExport';
import {
  useGenerateProfileImage,
  ProfileImageStyle,
  GeneratedProfileImage,
} from '@/hooks/useGenerateProfileImage';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUpload: (file: File) => void;
  username: string;
  user: {
    username: string;
    profession?: string;
    interests?: string[];
    age?: number;
    company?: string;
    industry?: string;
    experience?: 'junior' | 'mid' | 'senior' | 'executive';
  };
}

export const ImageUploadModal = ({
  isOpen,
  onClose,
  onImageUpload,
  username,
  user,
}: ImageUploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null); // Store original file
  const [preview, setPreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<ProfileImageStyle | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedProfileImage[]>([]);
  const [showBatchResults, setShowBatchResults] = useState(false);
  const [customColors, setCustomColors] = useState<string[]>(['#3B82F6', '#8B5CF6']);
  const [activeTab, setActiveTab] = useState<'upload' | 'ai' | 'advanced'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    generateProfileImage,
    generateBatchProfileImages,
    isGeneratingProfileImage,
  } = useGenerateProfileImage();

  // File selection and optional cropping
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setOriginalFile(file); // Store the original
      setSelectedFile(file); // Current working file
      setPreview(URL.createObjectURL(file));
      // Don't auto-show cropper, let user choose
      setShowCropper(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setOriginalFile(file); // Store the original
      setSelectedFile(file); // Current working file
      setPreview(URL.createObjectURL(file));
      // Don't auto-show cropper, let user choose
      setShowCropper(false);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleCropComplete = (croppedFile: File) => {
    setSelectedFile(croppedFile);
    setPreview(URL.createObjectURL(croppedFile));
    setShowCropper(false);
  };

  // Upload handler for current selected file (could be processed)
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }
    try {
      onImageUpload(selectedFile);
      toast.success('Profile image uploaded successfully!');
      onClose();
    } catch {
      toast.error('Failed to upload image');
    }
  };

  // Handler for uploading original unprocessed file
  const handleUploadOriginal = async () => {
    if (!originalFile) {
      toast.error('Please select an image first');
      return;
    }
    try {
      onImageUpload(originalFile);
      toast.success('Original image uploaded successfully!');
      onClose();
    } catch {
      toast.error('Failed to upload image');
    }
  };

  // AI generation
  const handleAIGenerate = async () => {
    if (!selectedStyle) {
      toast.error('Please select a style first');
      return;
    }
    try {
      const result = await generateProfileImage(username, {
        style: selectedStyle,
        colors: customColors,
      });
      if (result) {
        setSelectedFile(result.file);
        setPreview(result.previewUrl);
        toast.success(`${selectedStyle} character generated!`);
      }
    } catch {
      toast.error('Failed to generate character');
    }
  };

  // Platform-specific generation
  const handleGenerateForPlatform = async (
    platform: string,
    style: ProfileImageStyle,
    colors: string[]
  ): Promise<File | null> => {
    try {
      const result = await generateProfileImage(username, {
        style,
        colors,
        platform,
      });
      if (result) {
        return result.file;
      }
      return null;
    } catch (error) {return null;
    }
  };

  // Batch AI generation
  const handleBatchGenerate = async () => {
    try {
      const results = await generateBatchProfileImages(username);
      setGeneratedImages(results);
      setShowBatchResults(true);
      toast.success(`Generated ${results.length} character options!`);
    } catch {
      toast.error('Failed to generate batch characters');
    }
  };

  const handleSelectGeneratedImage = (image: GeneratedProfileImage) => {
    setSelectedFile(image.file);
    setPreview(image.previewUrl);
    setSelectedStyle(image.style);
    setShowBatchResults(false);
    toast.success(`Selected ${image.style} character!`);
  };

  // Custom color AI generation
  const handleCustomGenerate = async () => {
    if (!selectedStyle) {
      toast.error('Please select a style first');
      return;
    }
    try {
      const result = await generateProfileImage(username, {
        style: selectedStyle,
        colors: customColors,
      });
      if (result) {
        setSelectedFile(result.file);
        setPreview(result.previewUrl);
        toast.success(`Custom ${selectedStyle} character generated!`);
      }
    } catch {
      toast.error('Failed to generate custom character');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Profile Picture Generator
            </h2>
          </div>
          <Button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel */}
          <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700">
            {/* Tab Navigation */}
            <div className="flex-shrink-0 p-6 pb-4">
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 shadow-inner">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'upload'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-lg transform scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'ai'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-lg transform scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  AI Generate
                </button>
                <button
                  onClick={() => setActiveTab('advanced')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'advanced'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-lg transform scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Advanced
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 pt-0">
              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <div className="space-y-6">
                  {!preview ? (
                    <div
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Upload Profile Picture
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Drag and drop an image here, or click to browse
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        Choose File
                      </button>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="flex justify-center">
                          <Image
                            src={preview}
                            alt="Preview"
                            width={180}
                            height={180}
                            className="rounded-xl shadow-lg object-cover"
                          />
                        </div>
                        {showCropper && (
                          <SimpleImageCropper
                            imageSrc={preview}
                            onCrop={(croppedBlob) => {
                              const croppedFile = new File(
                                [croppedBlob],
                                'cropped-image.jpg',
                                { type: 'image/jpeg' }
                              );
                              handleCropComplete(croppedFile);
                            }}
                            onCancel={() => setShowCropper(false)}
                            isProcessing={false}
                          />
                        )}
                      </div>
                      <div className="space-y-3">
                        {/* Primary action: Use Original */}
                        <button
                          onClick={handleUploadOriginal}
                          className="w-full relative group overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <ImageIcon className="w-4 h-4 inline mr-2" />
                          Use Original Image
                        </button>
                        
                        {/* Secondary actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowCropper(true)}
                            className="flex-1 px-3 py-2 relative group border-2 border-blue-500/50 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl hover:bg-blue-100/70 dark:hover:bg-blue-900/30 hover:border-blue-500/70 transition-all duration-300 font-medium shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 text-sm"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                            <Crop className="w-4 h-4 inline mr-1" />
                            Fit Square
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFile(null);
                              setOriginalFile(null);
                              setPreview(null);
                              setShowCropper(false);
                            }}
                            className="flex-1 px-3 py-2 relative group border-2 border-gray-300/50 text-gray-700 dark:text-gray-300 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl hover:bg-gray-200/70 dark:hover:bg-gray-700/70 hover:border-gray-400/70 transition-all duration-300 font-medium shadow-lg hover:shadow-gray-500/25 transform hover:-translate-y-0.5 text-sm"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                            <RotateCcw className="w-4 h-4 inline mr-1" />
                            Choose New
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Generate Tab */}
              {activeTab === 'ai' && (
                <div className="space-y-6">
                  <StylePreviewGrid
                    selectedStyle={selectedStyle}
                    onStyleSelect={setSelectedStyle}
                    loadingStyle={isGeneratingProfileImage ? selectedStyle : null}
                  />

                  {selectedStyle && (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <button
                          onClick={handleAIGenerate}
                          disabled={isGeneratingProfileImage}
                          className="flex-1 relative group overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          {isGeneratingProfileImage ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-3 animate-spin inline" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5 mr-3 inline" />
                              Generate Character
                            </>
                          )}
                        </button>

                        <button
                          onClick={handleBatchGenerate}
                          disabled={isGeneratingProfileImage}
                          className="relative group px-6 py-4 border-2 border-purple-500/50 text-purple-300 bg-purple-500/10 backdrop-blur-sm rounded-xl hover:bg-purple-500/20 hover:border-purple-400/70 hover:text-purple-200 transition-all duration-300 font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 disabled:transform-none disabled:opacity-50"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                          <RefreshCw className="w-5 h-5 mr-2 inline" />
                          Generate All
                        </button>
                      </div>

                      {/* Quick Platform Export */}
                      <button
                        onClick={() => setActiveTab('advanced')}
                        className="w-full relative group overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-4 px-6 rounded-xl hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Globe className="w-5 h-5 mr-3 inline" />
                        Multi-Platform Export
                      </button>
                    </div>
                  )}

                  {/* Batch Results */}
                  {showBatchResults && generatedImages.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Generated Characters ({generatedImages.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {generatedImages.map((image, index) => (
                          <div
                            key={index}
                            className="cursor-pointer rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
                            onClick={() => handleSelectGeneratedImage(image)}
                          >
                            <Image
                              src={image.previewUrl}
                              alt={`${image.style} character`}
                              width={150}
                              height={150}
                              className="rounded-lg w-full"
                            />
                            <div className="p-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                {image.style}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Advanced Tab */}
              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Color Customizer */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-purple-600" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Color Customization
                        </h4>
                      </div>
                      <ColorCustomizer
                        onColorsChange={setCustomColors}
                        initialColors={customColors}
                      />

                      {selectedStyle && (
                        <button
                          onClick={handleCustomGenerate}
                          disabled={isGeneratingProfileImage}
                          className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 disabled:opacity-50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          {isGeneratingProfileImage ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-3 animate-spin inline" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5 mr-3 inline" />
                              Generate with Custom Colors
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Smart Suggestions */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Smart Suggestions
                        </h4>
                      </div>
                      <SmartSuggestions
                        user={user}
                        onStyleSelect={setSelectedStyle}
                        selectedStyle={selectedStyle}
                      />
                    </div>
                  </div>

                  {/* Multi-Platform Export */}
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <MultiPlatformExport
                      username={username}
                      selectedStyle={selectedStyle}
                      customColors={customColors}
                      onGenerateForPlatform={handleGenerateForPlatform}
                      isGenerating={isGeneratingProfileImage}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-72 p-4 bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Preview
            </h3>

            {preview ? (
              <div className="space-y-3">
                <div className="relative">
                  <div className="flex justify-center">
                    <Image
                      src={preview}
                      alt="Profile preview"
                      width={120}
                      height={120}
                      className="rounded-full border-3 border-white dark:border-gray-700 shadow-lg object-cover"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedStyle ? `${selectedStyle} character` : 'Uploaded image'}
                  </p>
                  {selectedFile && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {((selectedFile.size || 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>

                <button
                  onClick={handleUpload}
                  className="w-full relative group overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  Use This Image
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload or generate an image to see preview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};