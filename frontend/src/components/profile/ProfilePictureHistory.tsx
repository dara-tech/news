'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Clock, Download, Trash2, CheckCircle, Sparkles, Upload } from 'lucide-react';

interface ProfilePictureHistoryItem {
  id: string;
  imageUrl: string;
  style?: string;
  method: 'upload' | 'ai-generated' | 'cropped';
  changedAt: Date;
  isActive: boolean;
  file?: File;
}

interface ProfilePictureHistoryProps {
  history: ProfilePictureHistoryItem[];
  onSelectImage: (item: ProfilePictureHistoryItem) => void;
  onDeleteImage: (id: string) => void;
  currentImageUrl?: string;
}

export const ProfilePictureHistory = ({ 
  history, 
  onSelectImage, 
  onDeleteImage,
  currentImageUrl 
}: ProfilePictureHistoryProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    // Set current image as selected
    const currentItem = history.find(item => item.imageUrl === currentImageUrl);
    if (currentItem) {
      setSelectedId(currentItem.id);
    }
  }, [currentImageUrl, history]);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'ai-generated':
        return <Sparkles className="w-3 h-3" />;
      case 'upload':
        return <Upload className="w-3 h-3" />;
      case 'cropped':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'ai-generated':
        return 'AI Generated';
      case 'upload':
        return 'Uploaded';
      case 'cropped':
        return 'Cropped';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">No profile picture history yet</p>
        <p className="text-xs mt-1">Your profile picture changes will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Picture History</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {history.length} {history.length === 1 ? 'image' : 'images'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {history.map((item) => (
          <div
            key={item.id}
            className={`relative group cursor-pointer rounded-lg border-2 transition-all duration-200 ${
              selectedId === item.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => {
              setSelectedId(item.id);
              onSelectImage(item);
            }}
          >
            {/* Active indicator */}
            {item.isActive && (
              <div className="absolute top-2 right-2 bg-green-500 w-2 h-2 rounded-full border border-white dark:border-gray-900" />
            )}

            {/* Image */}
            <div className="relative w-full h-24 rounded-t-lg overflow-hidden">
              <Image
                src={item.imageUrl}
                alt="Profile picture"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Info */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  {getMethodIcon(item.method)}
                  <span>{getMethodLabel(item.method)}</span>
                </div>
                {item.style && (
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 capitalize">
                    {item.style}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(item.changedAt)}
                </span>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectImage(item);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Use this image"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteImage(item.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Click on any image to use it as your current profile picture
          </p>
        </div>
      )}
    </div>
  );
};