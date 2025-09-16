'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Palette, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ColorCustomizerProps {
  onColorsChange: (colors: string[]) => void;
  initialColors?: string[];
}

interface ColorState {
  colors: string[];
  showPreview: boolean;
  activeScheme: string | null;
}

const presetColorSchemes = {
  professional: ['#1F2937', '#3B82F6', '#6B7280'],
  creative: ['#EC4899', '#8B5CF6', '#06B6D4'],
  gaming: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
  tech: ['#10B981', '#3B82F6', '#6366F1'],
  corporate: ['#1E40AF', '#374151', '#6B7280'],
  artistic: ['#F59E0B', '#EC4899', '#8B5CF6'],
  minimalist: ['#F3F4F6', '#9CA3AF', '#D1D5DB'],
  simple: ['#3B82F6', '#8B5CF6', '#A855F7']
};

export const ColorCustomizer = ({ onColorsChange, initialColors = ['#3B82F6', '#8B5CF6'] }: ColorCustomizerProps) => {
  const [state, setState] = useState<ColorState>({
    colors: initialColors,
    showPreview: true,
    activeScheme: null
  });

  const updateState = useCallback((updates: Partial<ColorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleColorChange = useCallback((index: number, color: string) => {
    const newColors = [...state.colors];
    newColors[index] = color;
    updateState({ 
      colors: newColors,
      activeScheme: null // Clear preset when manually changing
    });
    // Notify parent immediately
    onColorsChange(newColors);
  }, [state.colors, updateState, onColorsChange]);

  const addColor = useCallback(() => {
    if (state.colors.length < 5) {
      const newColors = [...state.colors, '#6B7280'];
      updateState({ 
        colors: newColors,
        activeScheme: null
      });
      onColorsChange(newColors);
    }
  }, [state.colors, updateState, onColorsChange]);

  const removeColor = useCallback((index: number) => {
    if (state.colors.length > 1) {
      const newColors = state.colors.filter((_, i) => i !== index);
      updateState({ 
        colors: newColors,
        activeScheme: null
      });
      onColorsChange(newColors);
    }
  }, [state.colors, updateState, onColorsChange]);

  const applyPreset = useCallback((schemeName: string) => {
    const scheme = presetColorSchemes[schemeName as keyof typeof presetColorSchemes];
    if (scheme) {
      updateState({ 
        colors: scheme,
        activeScheme: schemeName
      });
      onColorsChange(scheme);
    }
  }, [updateState, onColorsChange]);

  const resetColors = useCallback(() => {
    updateState({ 
      colors: initialColors,
      activeScheme: null
    });
    onColorsChange(initialColors);
  }, [initialColors, updateState, onColorsChange]);

  const togglePreview = useCallback(() => {
    updateState({ showPreview: !state.showPreview });
  }, [state.showPreview, updateState]);

  // Memoize gradient generation
  const gradient = useMemo(() => {
    return `linear-gradient(135deg, ${state.colors.join(', ')})`;
  }, [state.colors]);

  // Memoize color swatches
  const colorSwatches = useMemo(() => 
    state.colors.map((color, index) => (
      <div
        key={index}
        className="w-4 h-4 rounded border border-gray-200 dark:border-gray-600"
        style={{ backgroundColor: color }}
      />
    )), [state.colors]);

  // Memoize color inputs
  const colorInputs = useMemo(() => 
    state.colors.map((color, index) => (
      <div key={index} className="flex items-center gap-3">
        <Input
          type="color"
          value={color}
          onChange={(e) => handleColorChange(index, e.target.value)}
          className="w-10 h-10 rounded border border-gray-200 dark:border-gray-700 cursor-pointer"
        />
        <div className="flex-1">
          <Input
            type="text"
            value={color}
            onChange={(e) => handleColorChange(index, e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="#000000"
          />
        </div>
        {state.colors.length > 1 && (
          <Button
            onClick={() => removeColor(index)}
            className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Remove color"
          >
            ×
          </Button>
        )}
      </div>
    )), [state.colors, handleColorChange, removeColor]);

  // Memoize preset scheme buttons
  const presetButtons = useMemo(() => 
    Object.entries(presetColorSchemes).map(([name, scheme]) => (
      <Button
        key={name}
        onClick={() => applyPreset(name)}
        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
          state.activeScheme === name
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        <div className="flex gap-1 mb-2">
          {scheme.map((color, index) => (
            <div
              key={index}
              className="w-3 h-3 rounded border border-gray-200 dark:border-gray-600"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-gray-900 dark:text-white capitalize">
          {name}
        </span>
      </Button>
    )), [state.activeScheme, applyPreset]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Customize Colors
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={togglePreview}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title={state.showPreview ? 'Hide preview' : 'Show preview'}
          >
            {state.showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            onClick={resetColors}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Reset colors"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Color Preview */}
      {state.showPreview && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Preview
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {state.colors.length} colors
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div 
              className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-700"
              style={{ background: gradient }}
            />
            <div className="flex-1">
              <div className="flex gap-1 mb-2">
                {colorSwatches}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Gradient preview
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Color Picker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Color Palette
          </span>
          <Button
            onClick={addColor}
            disabled={state.colors.length >= 5}
            className="text-xs px-2 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            + Add Color
          </Button>
        </div>

        <div className="space-y-2">
          {colorInputs}
        </div>
      </div>

      {/* Preset Schemes */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          Preset Schemes
        </span>
        
        <div className="grid grid-cols-2 gap-2">
          {presetButtons}
        </div>
      </div>
    </div>
  );
};