'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface NewsStatusChangerProps {
  articleId: string;
  currentStatus: 'draft' | 'published' | 'archived';
  onStatusChange: (id: string, newStatus: 'draft' | 'published' | 'archived') => void;
}

const NewsStatusChanger = ({ articleId, currentStatus, onStatusChange }: NewsStatusChangerProps) => {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: 'draft' | 'published' | 'archived') => {
    setIsUpdating(true);
    try {
      await api.patch(`/news/${articleId}/status`, { status: newStatus });
      setStatus(newStatus);
      onStatusChange(articleId, newStatus);
      toast.success(`Article status updated to ${newStatus}.`);
    } catch { // Error object is not used, so it can be omitted
      toast.error('Failed to update article status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'archived':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Select onValueChange={handleStatusChange} defaultValue={status} disabled={isUpdating}>
      <SelectTrigger className="w-32">
        <SelectValue
          placeholder=  
            <Badge variant={getBadgeVariant(status)}>{status}</Badge>
        />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">Draft</SelectItem>
        <SelectItem value="published">Published</SelectItem>
        <SelectItem value="archived">Archived</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default NewsStatusChanger;
