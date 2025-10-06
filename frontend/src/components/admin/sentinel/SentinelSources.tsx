'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Globe, 
  Rss, 
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Source {
  id?: string;
  name: string;
  url: string;
  type: 'rss' | 'api' | 'scraper' | 'manual';
  category: 'local' | 'international' | 'tech' | 'development';
  priority: 'high' | 'medium' | 'low';
  enabled: boolean;
  lastChecked?: string;
  lastSuccess?: string;
  errorCount?: number;
  successRate?: number;
}

interface SentinelSourcesProps {
  sources: Source[];
  onUpdate: () => void;
}

export default function SentinelSources({ sources, onUpdate }: SentinelSourcesProps) {
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [newSource, setNewSource] = useState<Partial<Source>>({
    name: '',
    url: '',
    type: 'rss',
    category: 'international',
    priority: 'medium',
    enabled: true
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddSource = async () => {
    if (!newSource.name || !newSource.url) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await api.put('/admin/system/sentinel', {
        sources: [...sources, { ...newSource, id: Date.now().toString() }]
      });

      if (response.data?.success) {
        toast.success('Source added successfully');
        setNewSource({
          name: '',
          url: '',
          type: 'rss',
          category: 'international',
          priority: 'medium',
          enabled: true
        });
        setShowAddForm(false);
        onUpdate();
      } else {
        toast.error('Failed to add source');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add source');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSource = async (updatedSource: Source) => {
    try {
      setLoading(true);
      const updatedSources = sources.map(s => 
        (s.id && updatedSource.id && s.id === updatedSource.id) ? updatedSource : s
      );
      
      const response = await api.put('/admin/system/sentinel', {
        sources: updatedSources
      });

      if (response.data?.success) {
        toast.success('Source updated successfully');
        setEditingSource(null);
        onUpdate();
      } else {
        toast.error('Failed to update source');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update source');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      setLoading(true);
      const updatedSources = sources.filter(s => s.id !== sourceId);
      
      const response = await api.put('/admin/system/sentinel', {
        sources: updatedSources
      });

      if (response.data?.success) {
        toast.success('Source deleted successfully');
        onUpdate();
      } else {
        toast.error('Failed to delete source');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete source');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSource = async (sourceId: string, enabled: boolean) => {
    const source = sources.find(s => s.id === sourceId);
    if (source && source.id) {
      await handleUpdateSource({ ...source, enabled });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rss': return <Rss className="h-4 w-4" />;
      case 'api': return <Globe className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Source Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Add New Source</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newSource.name || ''}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  placeholder="Source name"
                />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={newSource.url || ''}
                  onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                  placeholder="https://example.com/feed.xml"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newSource.type || 'rss'}
                  onValueChange={(value) => setNewSource({ ...newSource, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rss">RSS Feed</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="scraper">Scraper</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newSource.priority || 'medium'}
                  onValueChange={(value) => setNewSource({ ...newSource, priority: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSource}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Add Source
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sources List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>News Sources ({sources.length})</span>
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sources.map((source, index) => (
              <div
                key={source.id || `source-${index}`}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(source.type)}
                    <span className="font-medium">{source.name}</span>
                  </div>
                  <Badge className={getPriorityColor(source.priority)}>
                    {source.priority}
                  </Badge>
                  <Badge variant={source.enabled ? "default" : "secondary"}>
                    {source.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  {source.successRate && (
                    <Badge variant="outline">
                      {source.successRate}% success
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={source.enabled}
                    onCheckedChange={(enabled) => handleToggleSource(source.id || '', enabled)}
                    disabled={loading}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSource(source)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSource(source.id || '')}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
