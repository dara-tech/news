'use client';

import { useState } from 'react';
import { Sparkles, Download, RefreshCw, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGenerateLogo, type LogoStyle } from '@/hooks/useGenerateLogo';
import { toast } from 'sonner';

interface LogoGeneratorProps {
  onLogoGenerated?: (logoUrl: string) => void;
}

export function LogoGenerator({ onLogoGenerated }: LogoGeneratorProps) {
  const {
    isGenerating,
    error,
    generatedLogos,
    generateLogo,
    generateMultipleLogos,
    clearGeneratedLogos,
    recommendStyle,
    getSmartColors,
  } = useGenerateLogo();

  const [logoText, setLogoText] = useState('My Company');
  const [selectedStyle, setSelectedStyle] = useState<LogoStyle>('modern');
  const [industry, setIndustry] = useState('');
  const [format, setFormat] = useState<'svg' | 'png' | 'jpg'>('svg');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');

  const handleGenerateSingle = async () => {
    if (!logoText.trim()) {
      toast.error('Please enter logo text');
      return;
    }

    try {
      const colors = getSmartColors(selectedStyle, industry);
      console.log('Generating logo with:', { text: logoText.trim(), style: selectedStyle, colors });
      
      const result = await generateLogo({
        text: logoText.trim(),
        style: selectedStyle,
        colors,
        size,
        format,
        preferences: {
          industry,
        },
      });

      if (result) {
        console.log('Logo generated successfully:', result);
        onLogoGenerated?.(result.url);
      } else {
        console.error('Logo generation failed - no result returned');
        toast.error('Failed to generate logo');
      }
    } catch (error) {
      console.error('Error generating logo:', error);
      toast.error('Failed to generate logo');
    }
  };

  const handleGenerateMultiple = async () => {
    if (!logoText.trim()) {
      toast.error('Please enter logo text');
      return;
    }

    try {
      const colors = getSmartColors(selectedStyle, industry);
      const styles: LogoStyle[] = ['minimal', 'modern', 'classic', 'playful', 'corporate', 'tech'];
      
      console.log('Generating multiple logos with:', { text: logoText.trim(), styles, colors });
      
      const results = await generateMultipleLogos({
        text: logoText.trim(),
        styles,
        colors,
        size,
        format,
        preferences: {
          industry,
        },
      }, 6);
      
      console.log('Multiple logos generated:', results);
    } catch (error) {
      console.error('Error generating multiple logos:', error);
      toast.error('Failed to generate multiple logos');
    }
  };

  const handleStyleRecommendation = () => {
    if (industry) {
      const recommendedStyle = recommendStyle(industry);
      setSelectedStyle(recommendedStyle);
      toast.success(`Recommended style: ${recommendedStyle}`);
    } else {
      toast.error('Please enter an industry for style recommendation');
    }
  };

  const handleDownload = (logo: any) => {
    const link = document.createElement('a');
    link.href = logo.url;
    link.download = `logo-${logo.style}-${Date.now()}.${logo.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Logo downloaded!');
  };

  const handleUseLogo = (logo: any) => {
    onLogoGenerated?.(logo.url);
    toast.success('Logo applied!');
  };

  return (
    <div className="space-y-6">
      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Logo Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logoText">Logo Text</Label>
              <Input
                id="logoText"
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                placeholder="Enter your company name..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry (Optional)</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., technology, healthcare..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Select value={selectedStyle} onValueChange={(value) => setSelectedStyle(value as LogoStyle)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="elegant">Elegant</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="vintage">Vintage</SelectItem>
                  <SelectItem value="geometric">Geometric</SelectItem>
                  <SelectItem value="monogram">Monogram</SelectItem>
                  <SelectItem value="wordmark">Wordmark</SelectItem>
                  <SelectItem value="emblem">Emblem</SelectItem>
                  <SelectItem value="badge">Badge</SelectItem>
                  <SelectItem value="shield">Shield</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select value={format} onValueChange={(value) => setFormat(value as 'svg' | 'png' | 'jpg')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="svg">SVG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Select value={size} onValueChange={(value) => setSize(value as 'small' | 'medium' | 'large')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleGenerateSingle}
              disabled={isGenerating || !logoText.trim()}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate Single Logo
            </Button>

            <Button
              onClick={handleGenerateMultiple}
              disabled={isGenerating || !logoText.trim()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Generate Multiple Styles
            </Button>

            <Button
              onClick={handleStyleRecommendation}
              disabled={!industry.trim()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Palette className="h-4 w-4" />
              Get Style Recommendation
            </Button>

            {generatedLogos.length > 0 && (
              <Button
                onClick={clearGeneratedLogos}
                variant="destructive"
                size="sm"
              >
                Clear All
              </Button>
            )}
          </div>

          {isGenerating && (
            <div className="text-blue-600 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating logo with AI... Please wait.
            </div>
          )}
          
          {error && (
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Logos */}
      {generatedLogos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Logos ({generatedLogos.length})</CardTitle>
            <div className="text-xs text-gray-500">
              Debug: {generatedLogos.length} logos available
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedLogos.map((logo) => (
                <div
                  key={logo.id}
                  className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center p-4">
                    <img
                      src={logo.url}
                      alt={`${logo.text} logo`}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        console.error('Failed to load logo image:', logo.url);
                        console.error('Logo object:', logo);
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('Logo image loaded successfully:', logo.url);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{logo.style}</span>
                      <span className="text-xs text-gray-500 uppercase">{logo.format}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400">{logo.text}</p>
                    
                    <div className="flex gap-1">
                      {logo.colors.slice(0, 3).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUseLogo(logo)}
                        className="flex-1"
                      >
                        Use Logo
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(logo)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 