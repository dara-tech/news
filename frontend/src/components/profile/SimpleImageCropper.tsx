'use client';

import React, { useRef, useEffect, useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface SimpleImageCropperProps {
  imageSrc: string;
  onCrop: (croppedImage: Blob) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export const SimpleImageCropper = ({ imageSrc, onCrop, onCancel, isProcessing }: SimpleImageCropperProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [previewStyle, setPreviewStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      img.onload = () => {
        // Preview that shows the full image fitted into square

        const previewSize = 256; // Preview container size
        
        // Always show the full image fitted into the square preview
        setPreviewStyle({
          width: `${previewSize}px`,
          height: `${previewSize}px`,
          objectFit: 'contain', // 'contain' preserves full image, 'cover' would crop
          objectPosition: 'center center',
          backgroundColor: '#ffffff', // White background for letterboxing
        });

        // Auto-crop the image
        autoCropImage();
      };
    }
  }, [imageSrc]);

  const autoCropImage = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    const outputSize = 512; // Increased to 512px for much better detail and quality
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Full image preservation - fit entire image into square
  
    
    // Always use the full image - no cropping
    // The scaling will be handled in the canvas drawing to fit the square

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outputSize, outputSize);

    // Calculate how to fit the entire image into the square
    const imgAspectRatio = img.naturalWidth / img.naturalHeight;
    let drawWidth, drawHeight, drawX, drawY;

    if (imgAspectRatio > 1) {
      // Wide image - fit width, center vertically
      drawWidth = outputSize;
      drawHeight = outputSize / imgAspectRatio;
      drawX = 0;
      drawY = (outputSize - drawHeight) / 2;
    } else {
      // Tall image - fit height, center horizontally
      drawWidth = outputSize * imgAspectRatio;
      drawHeight = outputSize;
      drawX = (outputSize - drawWidth) / 2;
      drawY = 0;
    }

    // Draw the full image scaled to fit in the square
    ctx.drawImage(
      img,
      0, 0, img.naturalWidth, img.naturalHeight, // Use full source image
      drawX, drawY, drawWidth, drawHeight // Fit in square with proper scaling
    );
  };

  const handleCrop = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        onCrop(blob);
      }
    }, 'image/jpeg', 0.9); // High quality for better detail preservation
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fit to Square</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Preserves your full image</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close cropper"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Preview */}
          <div className="relative mx-auto w-64 h-64 border-2 border-blue-500 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
            <Image
              ref={imageRef}
              src={imageSrc}
              alt="Preview"
              className="w-full h-full"
              style={previewStyle}
              draggable={false}
              width={300}
              height={300}
            />
            {/* Crop overlay to show what will be cropped */}
            <div className="absolute inset-0 border-4 border-white/50 pointer-events-none">
              <div className="grid grid-cols-3 grid-rows-3 h-full">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-white/30" />
                ))}
              </div>
            </div>
          </div>

          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Info */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              High-quality square format with full image preserved
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              512px resolution • 90% quality • No detail loss
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCrop}
              disabled={isProcessing}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Fit to Square
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};