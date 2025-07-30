'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, RotateCw, Check, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageCropperProps {
  imageSrc: string;
  onCrop: (croppedImage: Blob) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export const ImageCropper = ({ imageSrc, onCrop, onCancel, isProcessing }: ImageCropperProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      img.onload = () => {
        // Auto-fit image to square crop area
        const containerSize = 300;
        const imgAspectRatio = img.naturalWidth / img.naturalHeight;
        
        if (imgAspectRatio > 1) {
          // Landscape image - fit to height
          const newScale = containerSize / img.naturalHeight;
          setScale(newScale);
          setPosition({ x: -(img.naturalWidth * newScale - containerSize) / 2, y: 0 });
        } else {
          // Portrait image - fit to width
          const newScale = containerSize / img.naturalWidth;
          setScale(newScale);
          setPosition({ x: 0, y: -(img.naturalHeight * newScale - containerSize) / 2 });
        }
      };
    }
  }, [imageSrc]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const rotateImage = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const cropImage = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cropSize = 300;
    canvas.width = cropSize;
    canvas.height = cropSize;

    // Clear canvas
    ctx.clearRect(0, 0, cropSize, cropSize);

    // Save context
    ctx.save();

    // Move to center of canvas
    ctx.translate(cropSize / 2, cropSize / 2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply scale and position
    ctx.scale(scale, scale);
    ctx.translate(-position.x / scale, -position.y / scale);

    // Draw image
    ctx.drawImage(imageRef.current, 0, 0);

    // Restore context
    ctx.restore();

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        onCrop(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Crop Image</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close cropper"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Crop Area */}
          <div 
            ref={containerRef}
            className="relative mx-auto w-[300px] h-[300px] border-2 border-blue-500 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <Image
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              className="absolute w-full h-full object-cover"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: 'center',
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
              draggable={false}
              width={300}
              height={300}
            />
            
            {/* Crop Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="grid grid-cols-3 grid-rows-3 h-full">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-white/30" />
                ))}
              </div>
            </div>
          </div>

          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={rotateImage}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <RotateCw className="mr-2 h-4 w-4" />
              Rotate
            </button>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Scroll to zoom • Drag to move
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={cropImage}
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
                  Crop & Upload
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