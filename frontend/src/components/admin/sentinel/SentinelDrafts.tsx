'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Globe,
  Clock,
  User,
  Tag,
  Image as ImageIcon,
  FileText,
  Calendar,
  RefreshCw
} from 'lucide-react';

interface Draft {
  _id: string;
  title: string | {
    en: string;
    kh?: string;
  };
  description: string | {
    en: string;
    kh?: string;
  };
  content: string | {
    en: string;
    kh?: string;
  };
  status: 'draft' | 'published' | 'archived';
  author: string | {
    _id: string;
    username: string;
  };
  category: string | {
    _id: string;
    name: string;
  };
  source: string | {
    name: string;
    url?: string;
  };
  tags: string[];
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  ingestion: {
    method: string;
    qualityScore?: number;
    safetyScore?: number;
  };
  isComplete?: boolean;
  missingFields?: string[];
}

interface DraftsResponse {
  success: boolean;
  articles: Draft[];
  totalArticles: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export default function SentinelDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [publishing, setPublishing] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<'all' | 'complete' | 'incomplete'>('all');

  // Helper function to safely render any value
  const safeRender = (value: any, fallback: string = ''): string => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
      // Handle multilingual objects
      if (value.en) return value.en;
      if (value.kh) return value.kh;
      // Handle other objects
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Check if draft is complete
  const checkDraftCompleteness = (draft: Draft): { isComplete: boolean; missingFields: string[] } => {
    const missingFields: string[] = [];
    
    // Handle multilingual content structure
    const title = typeof draft.title === 'string' ? draft.title : draft.title?.en;
    const description = typeof draft.description === 'string' ? draft.description : draft.description?.en;
    const content = typeof draft.content === 'string' ? draft.content : draft.content?.en;
    
    // Handle author structure
    const authorId = typeof draft.author === 'string' ? draft.author : draft.author?._id;
    const categoryId = typeof draft.category === 'string' ? draft.category : draft.category?._id;
    
    if (!title) missingFields.push('English Title');
    if (!description) missingFields.push('English Description');
    if (!content) missingFields.push('English Content');
    if (!authorId) missingFields.push('Author');
    if (!categoryId) missingFields.push('Category');
    if (!draft.tags || draft.tags.length === 0) missingFields.push('Tags');
    if (!draft.thumbnail) missingFields.push('Thumbnail');
    
    return {
      isComplete: missingFields.length === 0,
      missingFields
    };
  };

  // Fetch drafts
  const fetchDrafts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/news/admin?status=draft&page=${page}&limit=20`);
      const data: DraftsResponse = await response.json();
      
      if (data.success) {
        // Debug: Log the first draft to see its structure
        if (data.articles.length > 0) {
          console.log('Sample draft structure:', JSON.stringify(data.articles[0], null, 2));
        }
        
        // Check completeness for each draft
        const draftsWithCompleteness = data.articles.map(draft => {
          const completeness = checkDraftCompleteness(draft);
          return {
            ...draft,
            isComplete: completeness.isComplete,
            missingFields: completeness.missingFields
          };
        });
        
        setDrafts(draftsWithCompleteness);
        setTotalPages(data.totalPages);
      } else {
        setError('Failed to fetch drafts');
      }
    } catch (err) {
      setError('Error fetching drafts');
      console.error('Error fetching drafts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Publish single draft
  const publishDraft = async (draftId: string) => {
    try {
      setPublishing(prev => [...prev, draftId]);
      setError(null); // Clear any previous errors
      
      const response = await fetch(`/api/news/${draftId}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Remove from drafts list
        setDrafts(prev => prev.filter(draft => draft._id !== draftId));
        setSelectedDrafts(prev => prev.filter(id => id !== draftId));
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(`Failed to publish draft: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      setError('Error publishing draft');
      console.error('Error publishing draft:', err);
    } finally {
      setPublishing(prev => prev.filter(id => id !== draftId));
    }
  };

  // Publish selected drafts
  const publishSelected = async () => {
    try {
      console.log('Publishing selected drafts:', selectedDrafts);
      setPublishing(selectedDrafts);
      
      const promises = selectedDrafts.map(draftId => 
        fetch(`/api/news/${draftId}/publish`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      
      const results = await Promise.allSettled(promises);
      const successful = results
        .map((result, index) => ({ result, index }))
        .filter(({ result }) => result.status === 'fulfilled' && result.value.ok)
        .map(({ index }) => selectedDrafts[index]);
      
      // Remove successful drafts from list
      setDrafts(prev => prev.filter(draft => !successful.includes(draft._id)));
      setSelectedDrafts([]);
      
      if (successful.length < selectedDrafts.length) {
        const failed = selectedDrafts.length - successful.length;
        setError(`Published ${successful.length} of ${selectedDrafts.length} drafts. ${failed} failed.`);
      } else if (successful.length > 0) {
        setError(null); // Clear any previous errors
      }
    } catch (err) {
      setError('Error publishing drafts');
      console.error('Error publishing drafts:', err);
    } finally {
      setPublishing([]);
    }
  };

  // Delete draft
  const deleteDraft = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;
    
    try {
      const response = await fetch(`/api/news/${draftId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setDrafts(prev => prev.filter(draft => draft._id !== draftId));
        setSelectedDrafts(prev => prev.filter(id => id !== draftId));
      } else {
        setError('Failed to delete draft');
      }
    } catch (err) {
      setError('Error deleting draft');
      console.error('Error deleting draft:', err);
    }
  };

  // Toggle draft selection
  const toggleDraftSelection = (draftId: string) => {
    setSelectedDrafts(prev => 
      prev.includes(draftId) 
        ? prev.filter(id => id !== draftId)
        : [...prev, draftId]
    );
  };

  // Select all drafts
  const selectAllDrafts = () => {
    const filteredDrafts = filter === 'all' 
      ? drafts 
      : filter === 'complete' 
        ? drafts.filter(d => d.isComplete)
        : drafts.filter(d => !d.isComplete);
    
    const draftIds = filteredDrafts.map(d => d._id);
    console.log('Selecting all drafts:', { filter, totalDrafts: drafts.length, filteredDrafts: filteredDrafts.length, draftIds });
    setSelectedDrafts(draftIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedDrafts([]);
  };

  // Filter drafts
  const filteredDrafts = filter === 'all' 
    ? drafts 
    : filter === 'complete' 
      ? drafts.filter(d => d.isComplete)
      : drafts.filter(d => !d.isComplete);

  useEffect(() => {
    fetchDrafts();
  }, [page, filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading drafts...</span>
      </div>
    );
  }

  // Error boundary for any remaining object rendering issues
  try {
    return (
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sentinel Drafts</h2>
          <p className="text-muted-foreground">
            Review and manage AI-generated draft articles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchDrafts}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter:</span>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({drafts.length})
            </Button>
            <Button
              variant={filter === 'complete' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('complete')}
            >
              Complete ({drafts.filter(d => d.isComplete).length})
            </Button>
            <Button
              variant={filter === 'incomplete' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('incomplete')}
            >
              Incomplete ({drafts.filter(d => !d.isComplete).length})
            </Button>
          </div>
        </div>

        {selectedDrafts.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedDrafts.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
            >
              Clear
            </Button>
            <Button
              onClick={publishSelected}
              disabled={publishing.length > 0}
              size="sm"
            >
              {publishing.length > 0 ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Publish Selected
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Drafts List */}
      {filteredDrafts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No drafts found</h3>
            <p className="text-muted-foreground text-center">
              {filter === 'all' 
                ? 'No draft articles available. The sentinel service will create drafts automatically.'
                : filter === 'complete'
                  ? 'No complete drafts available.'
                  : 'No incomplete drafts available.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
            <Checkbox
              checked={selectedDrafts.length === filteredDrafts.length && filteredDrafts.length > 0}
              onCheckedChange={(checked) => {
                if (checked) {
                  selectAllDrafts();
                } else {
                  clearSelection();
                }
              }}
            />
            <span className="text-sm font-medium">
              Select all {filteredDrafts.length} drafts
            </span>
          </div>

          {/* Draft Cards */}
          {filteredDrafts.map((draft) => (
            <Card key={draft._id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={selectedDrafts.includes(draft._id)}
                      onCheckedChange={() => toggleDraftSelection(draft._id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg line-clamp-2">
                          {safeRender(draft.title, 'Untitled')}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          {draft.isComplete ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Incomplete
                            </Badge>
                          )}
                          {draft.ingestion?.method === 'sentinel' && (
                            <Badge variant="outline">
                              <Tag className="h-3 w-3 mr-1" />
                              AI Generated
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <CardDescription className="line-clamp-2">
                        {safeRender(draft.description, 'No description available')}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {draft.thumbnail && (
                    <div className="ml-4 flex-shrink-0">
                      <img
                        src={draft.thumbnail}
                        alt="Thumbnail"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{safeRender(typeof draft.author === 'object' ? draft.author?.username : draft.author, 'Unknown')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span>{safeRender(typeof draft.category === 'object' ? draft.category?.name : draft.category, 'Uncategorized')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(draft.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{safeRender(typeof draft.source === 'object' ? draft.source?.name : draft.source, 'Unknown Source')}</span>
                  </div>
                </div>

                {/* Missing Fields */}
                {!draft.isComplete && draft.missingFields && draft.missingFields.length > 0 && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Missing fields:</strong> {Array.isArray(draft.missingFields) ? draft.missingFields.join(', ') : 'Unknown'}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Tags */}
                {draft.tags && Array.isArray(draft.tags) && draft.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {draft.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {safeRender(tag)}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/en/admin/news/edit/${draft._id}`, '_blank')}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/en/news/${draft._id}`, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    onClick={() => publishDraft(draft._id)}
                    disabled={publishing.includes(draft._id) || !draft.isComplete}
                    size="sm"
                  >
                    {publishing.includes(draft._id) ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        Publish
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteDraft(draft._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
    );
  } catch (error) {
    console.error('Error rendering SentinelDrafts:', error);
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error rendering drafts. Please check the console for details.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}
