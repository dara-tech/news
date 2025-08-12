'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Globe, 
  Newspaper, 
  Rss, 
  Settings,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { SentinelConfig } from './types';

interface Source {
  id: string;
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
  keywords?: string[];
  filters?: {
    language?: string;
    region?: string;
    minLength?: number;
    maxLength?: number;
  };
}

interface SourceManagerProps {
  sentinel: SentinelConfig | null;
  onUpdate: () => void;
}

export default function SourceManager({ sentinel, onUpdate }: SourceManagerProps) {
  const [sources, setSources] = useState<Source[]>(sentinel?.sources || []);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState<Partial<Source>>({
    type: 'rss',
    category: 'international',
    priority: 'medium',
    enabled: true
  });

  const addSource = async () => {
    if (!newSource.name || !newSource.url) {
      toast.error('Name and URL are required');
      return;
    }

    try {
      const sourceToAdd: Source = {
        id: Date.now().toString(),
        name: newSource.name,
        url: newSource.url,
        type: newSource.type || 'rss',
        category: newSource.category || 'international',
        priority: newSource.priority || 'medium',
        enabled: newSource.enabled || true,
        keywords: newSource.keywords || [],
        filters: newSource.filters || {}
      };

      const updatedSources = [...sources, sourceToAdd];
      const { data } = await api.put('/admin/system/sentinel', { sources: updatedSources });
      
      if (data?.success) {
        setSources(updatedSources);
        setNewSource({ type: 'rss', category: 'international', priority: 'medium', enabled: true });
        setShowAddForm(false);
        toast.success('Source added successfully');
        onUpdate();
      } else {
        toast.error('Failed to add source');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to add source');
    }
  };

  const updateSource = async (sourceId: string, updates: Partial<Source>) => {
    try {
      const updatedSources = sources.map(s => 
        s.id === sourceId ? { ...s, ...updates } : s
      );
      
      const { data } = await api.put('/admin/system/sentinel', { sources: updatedSources });
      
      if (data?.success) {
        setSources(updatedSources);
        setEditingSource(null);
        toast.success('Source updated successfully');
        onUpdate();
      } else {
        toast.error('Failed to update source');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update source');
    }
  };

  const deleteSource = async (sourceId: string) => {
    try {
      const updatedSources = sources.filter(s => s.id !== sourceId);
      const { data } = await api.put('/admin/system/sentinel', { sources: updatedSources });
      
      if (data?.success) {
        setSources(updatedSources);
        toast.success('Source deleted successfully');
        onUpdate();
      } else {
        toast.error('Failed to delete source');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete source');
    }
  };

  const toggleSource = async (sourceId: string, enabled: boolean) => {
    await updateSource(sourceId, { enabled });
  };

  const testSource = async (sourceId: string) => {
    try {
      const { data } = await api.post(`/admin/system/sentinel/test-source/${sourceId}`);
      if (data?.success) {
        toast.success('Source test successful');
      } else {
        toast.error('Source test failed');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Source test failed');
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'rss': return <Rss className="h-4 w-4" />;
      case 'api': return <Globe className="h-4 w-4" />;
      case 'scraper': return <Newspaper className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'local': return 'text-blue-600 bg-blue-50';
      case 'international': return 'text-purple-600 bg-purple-50';
      case 'tech': return 'text-green-600 bg-green-50';
      case 'development': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-slate-200/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Globe className="h-4 w-4" />
                Source Management
              </CardTitle>
              <CardDescription className="text-xs">
                Manage content sources for Sentinel scanning
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Plus className="h-3 w-3 mr-2" />
              Add Source
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Add Source Form */}
      {showAddForm && (
        <Card className="border-slate-200/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Add New Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Source Name</Label>
                <Input
                  value={newSource.name || ''}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  placeholder="BBC News"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">URL</Label>
                <Input
                  value={newSource.url || ''}
                  onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                  placeholder="https://feeds.bbci.co.uk/news/rss.xml"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={newSource.type} onValueChange={(value) => setNewSource({ ...newSource, type: value as any })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rss">RSS Feed</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="scraper">Web Scraper</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Category</Label>
                <Select value={newSource.category} onValueChange={(value) => setNewSource({ ...newSource, category: value as any })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local News</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Priority</Label>
                <Select value={newSource.priority} onValueChange={(value) => setNewSource({ ...newSource, priority: value as any })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newSource.enabled || false}
                  onCheckedChange={(checked) => setNewSource({ ...newSource, enabled: checked })}
                />
                <Label className="text-xs">Enabled</Label>
              </div>
            </div>
            
            <div>
              <Label className="text-xs">Keywords (comma-separated)</Label>
              <Input
                value={newSource.keywords?.join(', ') || ''}
                onChange={(e) => setNewSource({ 
                  ...newSource, 
                  keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                })}
                placeholder="technology, AI, innovation"
                className="h-8 text-xs"
              />
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={addSource} className="bg-green-600 hover:bg-green-700">
                <Save className="h-3 w-3 mr-2" />
                Add Source
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                <X className="h-3 w-3 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sources List */}
      <div className="space-y-3">
        {sources.map((source) => (
          <Card key={source.id} className="border-slate-200/50 shadow-sm">
            <CardContent className="p-4">
              {editingSource?.id === source.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={editingSource.name}
                        onChange={(e) => setEditingSource({ ...editingSource, name: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">URL</Label>
                      <Input
                        value={editingSource.url}
                        onChange={(e) => setEditingSource({ ...editingSource, url: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Select value={editingSource.type} onValueChange={(value) => setEditingSource({ ...editingSource, type: value as any })}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rss">RSS Feed</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                          <SelectItem value="scraper">Web Scraper</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Category</Label>
                      <Select value={editingSource.category} onValueChange={(value) => setEditingSource({ ...editingSource, category: value as any })}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Local News</SelectItem>
                          <SelectItem value="international">International</SelectItem>
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="development">Development</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => updateSource(source.id, editingSource)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-3 w-3 mr-2" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingSource(null)}>
                      <X className="h-3 w-3 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getSourceIcon(source.type)}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{source.name}</div>
                        <div className="text-xs text-slate-500 truncate">{source.url}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getCategoryColor(source.category)}`}>
                        {source.category}
                      </Badge>
                      <Badge className={`text-xs ${getPriorityColor(source.priority)}`}>
                        {source.priority}
                      </Badge>
                      <Badge variant={source.enabled ? 'default' : 'secondary'} className="text-xs">
                        {source.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={source.enabled}
                      onCheckedChange={(checked) => toggleSource(source.id, checked)}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testSource(source.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Activity className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSource(source)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteSource(source.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {sources.length === 0 && (
        <Card className="border-slate-200/50 shadow-sm">
          <CardContent className="p-8 text-center">
            <Globe className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <div className="text-sm text-slate-500 mb-2">No sources configured</div>
            <div className="text-xs text-slate-400">Add your first content source to get started</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
