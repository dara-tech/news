'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  Crop, 
  Check, 
  X,
  Undo,
  Redo,
  Move,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
}

interface LogoCropperProps {
  imageUrl: string;
  onCrop: (settings: CropSettings) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export default function LogoCropper({ 
  imageUrl, 
  onCrop, 
  onCancel, 
  aspectRatio = 3.33 // Default aspect ratio for logos (200x60)
}: LogoCropperProps) {
  const [cropSettings, setCropSettings] = useState<CropSettings>({
    x: 0,
    y: 0,
    width: 200,
    height: 60,
    scale: 1,
    rotation: 0
  });

  const [history, setHistory] = useState<CropSettings[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const addToHistory = useCallback((settings: CropSettings) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(settings);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const updateCropSettings = useCallback((newSettings: Partial<CropSettings>) => {
    const updated = { ...cropSettings, ...newSettings };
    setCropSettings(updated);
    addToHistory(updated);
  }, [cropSettings, addToHistory]);

  const handleZoom = (direction: 'in' | 'out') => {
    const zoomFactor = direction === 'in' ? 1.1 : 0.9;
    const newScale = Math.max(0.1, Math.min(5, cropSettings.scale * zoomFactor));
    updateCropSettings({ scale: newScale });
  };

  const handleRotate = (direction: 'cw' | 'ccw') => {
    const rotationStep = 15;
    const newRotation = direction === 'cw' 
      ? cropSettings.rotation + rotationStep 
      : cropSettings.rotation - rotationStep;
    updateCropSettings({ rotation: newRotation });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCropSettings(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCropSettings(history[historyIndex + 1]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    updateCropSettings({
      x: cropSettings.x + deltaX,
      y: cropSettings.y + deltaY
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    onCrop(cropSettings);
  };

  const resetCrop = () => {
    const resetSettings = {
      x: 0,
      y: 0,
      width: 200,
      height: 60,
      scale: 1,
      rotation: 0
    };
    setCropSettings(resetSettings);
    addToHistory(resetSettings);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Crop Logo</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetCrop}
          >
            <Crop className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative border rounded-lg overflow-hidden bg-gray-100">
        <div
          className="relative w-full h-96 cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Logo preview"
            className="w-full h-full object-contain"
            style={{
              transform: `scale(${cropSettings.scale}) rotate(${cropSettings.rotation}deg)`,
              transformOrigin: 'center',
            }}
          />
          
          {/* Crop overlay */}
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/20"
            style={{
              left: `${cropSettings.x}px`,
              top: `${cropSettings.y}px`,
              width: `${cropSettings.width}px`,
              height: `${cropSettings.height}px`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-blue-600 text-xs font-medium bg-white/80 px-2 py-1 rounded">
                {Math.round(cropSettings.width)} × {Math.round(cropSettings.height)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Zoom</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoom('out')}
                disabled={cropSettings.scale <= 0.1}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm min-w-[3rem] text-center">
                {Math.round(cropSettings.scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoom('in')}
                disabled={cropSettings.scale >= 5}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rotation</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotate('ccw')}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <span className="text-sm min-w-[3rem] text-center">
                {cropSettings.rotation}°
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotate('cw')}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Crop Size</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Width</label>
              <Slider
                value={[cropSettings.width]}
                onValueChange={([value]) => updateCropSettings({ width: value })}
                max={400}
                min={50}
                step={1}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Height</label>
              <Slider
                value={[cropSettings.height]}
                onValueChange={([value]) => updateCropSettings({ height: value })}
                max={200}
                min={20}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Position</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">X</label>
              <Slider
                value={[cropSettings.x]}
                onValueChange={([value]) => updateCropSettings({ x: value })}
                max={300}
                min={-100}
                step={1}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Y</label>
              <Slider
                value={[cropSettings.y]}
                onValueChange={([value]) => updateCropSettings({ y: value })}
                max={300}
                min={-100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleCrop}>
          <Check className="h-4 w-4 mr-2" />
          Apply Crop
        </Button>
      </div>
    </div>
  );
} 