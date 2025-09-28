'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Comment, CommentStats } from '@/lib/commentApi';
import api from '@/lib/api';
import { config } from '@/lib/config';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import WebSocketStatus from './WebSocketStatus';
import { useWebSocket, WebSocketComment, WebSocketStats } from '@/hooks/useWebSocket';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, MessageCircle } from 'lucide-react';

interface CommentSectionProps {
  newsId: string;
  className?: string;
  onCommentCreated?: () => void;
}

function wsCommentToComment(wsComment: WebSocketComment): Comment {
  return {
    _id: wsComment._id,
    content: wsComment.content,
    user: wsComment.user,
    news: wsComment.news,
    parentComment: wsComment.parentComment
      ? (typeof wsComment.parentComment === 'string'
          ? wsComment.parentComment
          : String(wsComment.parentComment))
      : undefined,
    isEdited: wsComment.isEdited,
    editedAt: wsComment.editedAt,
    likes: wsComment.likes || [],
    replies: wsComment.replies || [],
    repliesCount: wsComment.repliesCount,
    createdAt: wsComment.createdAt,
    updatedAt: wsComment.updatedAt,
  } as Comment;
}

function wsStatsToStats(wsStats: WebSocketStats): CommentStats {
  return {
    totalComments: wsStats.comments,
    totalReplies: 0,
    totalLikes: wsStats.likes,
  };
}

export default function CommentSection({ newsId, className, onCommentCreated }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<CommentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);

  const insertOrReplaceReplyInTree = useCallback((nodes: Comment[], newReply: Comment): Comment[] => {
    return nodes.map(node => {
      if (node._id?.toString() === newReply.parentComment?.toString()) {
        const existingReplies = node.replies || [];
        const idIdx = existingReplies.findIndex(r => r._id === newReply._id);
        if (idIdx !== -1) {
          const updated = [...existingReplies];
          updated[idIdx] = newReply;
          return { ...node, replies: updated };
        }
        return { ...node, replies: [...existingReplies, newReply] };
      }
      const childReplies = node.replies && node.replies.length > 0
        ? insertOrReplaceReplyInTree(node.replies, newReply)
        : node.replies;
      if (childReplies !== node.replies) {
        return { ...node, replies: childReplies };
      }
      return node;
    });
  }, []);

  const replaceCommentInTree = useCallback((nodes: Comment[], updated: Comment): Comment[] => {
    return nodes.map(node => {
      if (node._id === updated._id) {
        return updated;
      }
      const childReplies = node.replies && node.replies.length > 0
        ? replaceCommentInTree(node.replies, updated)
        : node.replies;
      if (childReplies !== node.replies) {
        return { ...node, replies: childReplies };
      }
      return node;
    });
  }, []);

  const deleteCommentInTree = useCallback((nodes: Comment[], idToRemove: string): Comment[] => {
    return nodes
      .map(node => {
        const childReplies = node.replies && node.replies.length > 0
          ? deleteCommentInTree(node.replies, idToRemove)
          : node.replies;
        if (childReplies !== node.replies) {
          return { ...node, replies: childReplies };
        }
        return node;
      })
      .filter(node => node._id !== idToRemove);
  }, []);

  const updateLikesInTree = useCallback((nodes: Comment[], targetId: string, newLikes: string[]): Comment[] => {
    return nodes.map(node => {
      if (node._id === targetId) {
        return { ...node, likes: newLikes };
      }
      if (node.replies && node.replies.length > 0) {
        const updatedReplies = updateLikesInTree(node.replies, targetId, newLikes);
        if (updatedReplies !== node.replies) {
          return { ...node, replies: updatedReplies };
        }
      }
      return node;
    });
  }, []);

  const loadComments = useCallback(async () => {
    try {
      const response = await api.get(`/comments/${newsId}`);
      setComments(response.data.data || []);
      setError(null);
    } catch {
      setError('Failed to load comments');
      setComments([]);
    }
  }, [newsId]);

  const loadStats = useCallback(async () => {
    try {
      const response = await api.get(`/comments/${newsId}/stats`);
      setStats(response.data.data || { totalComments: 0, totalReplies: 0, totalLikes: 0 });
    } catch {
      setStats({ totalComments: 0, totalReplies: 0, totalLikes: 0 });
    }
  }, [newsId]);

  const handleCommentCreated = (newComment: Comment) => {
    setComments((prev: Comment[]) => {
      // Check if comment already exists to prevent duplicates
      const commentExists = prev.some(comment => comment._id === newComment._id);
      if (commentExists) {
        return prev;
      }
      
      if (newComment.parentComment) {
        return insertOrReplaceReplyInTree(prev, newComment);
      }
      return [newComment, ...prev];
    });
    
    setStats((prev: CommentStats | null) => prev ? {
      ...prev,
      totalComments: prev.totalComments + (newComment.parentComment ? 0 : 1),
      totalReplies: (prev.totalReplies || 0) + (newComment.parentComment ? 1 : 0)
    } : null);

    // Call external callback to refresh comment count in parent component
    if (onCommentCreated) {
      onCommentCreated();
    }
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev: Comment[]) => deleteCommentInTree(prev, commentId));
    setStats((prev: CommentStats | null) => prev ? {
      ...prev,
      totalComments: Math.max(0, prev.totalComments - 1)
    } : null);
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments((prev: Comment[]) => replaceCommentInTree(prev, updatedComment));
  };

  const { user } = useAuth();

  const handleCommentLiked = (commentId: string, hasLiked: boolean) => {
    setComments((prev: Comment[]) => {
      const findLikes = (nodes: Comment[]): string[] | null => {
        for (const node of nodes) {
          if (node._id === commentId) return node.likes || [];
          if (node.replies && node.replies.length > 0) {
            const result = findLikes(node.replies);
            if (result) return result;
          }
        }
        return null;
      };

      const currentLikes = findLikes(prev) || [];
      const currentUserId = user?._id;
      if (!currentUserId) return prev;
      
      const newLikes = hasLiked
        ? [...currentLikes, currentUserId]
        : currentLikes.filter((id: string) => id !== currentUserId);
      return updateLikesInTree(prev, commentId, newLikes);
    });
  };

  const wsOptions = useMemo(() => ({
    onCommentCreated: (newComment: any) => {
      const comment = wsCommentToComment(newComment);
      setComments((prev: Comment[]) => {
        // Check if comment already exists to prevent duplicates
        const commentExists = prev.some(existingComment => existingComment._id === comment._id);
        if (commentExists) {
          return prev;
        }
        
        if (comment.parentComment) {
          return insertOrReplaceReplyInTree(prev, comment);
        }
        return [comment, ...prev];
      });
      setStats((prev: CommentStats | null) => prev ? {
        ...prev,
        totalComments: prev.totalComments + (comment.parentComment ? 0 : 1),
        totalReplies: (prev.totalReplies || 0) + (comment.parentComment ? 1 : 0)
      } : null);
    },
    onCommentUpdated: (updatedComment: any) => {
      const comment = wsCommentToComment(updatedComment);
      setComments((prev: Comment[]) => replaceCommentInTree(prev, comment));
    },
    onCommentDeleted: (commentId: string) => {
      setComments((prev: Comment[]) => deleteCommentInTree(prev, commentId));
      setStats((prev: CommentStats | null) => prev ? {
        ...prev,
        totalComments: Math.max(0, prev.totalComments - 1)
      } : null);
    },
    onCommentLiked: (updatedComment: any) => {
      const comment = wsCommentToComment(updatedComment);
      const newLikes = (comment.likes || []).map(id => id.toString());
      setComments((prev: Comment[]) => updateLikesInTree(prev, comment._id, newLikes));
    },
    onStatsUpdated: (newStats: any) => {
      setStats(wsStatsToStats(newStats));
    },
    onError: () => {
      setWsError('Real-time connection failed - using fallback mode');
    }
  }), []);

  const { isConnected } = useWebSocket(newsId, wsOptions);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadComments(), loadStats()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [newsId, loadComments, loadStats]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold">Comments</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5" />
          <div>
            <h3 className="text-lg font-semibold">Comments</h3>
            {stats && <p className="text-sm text-gray-500">{stats.totalComments} comments</p>}
          </div>
        </div>
        {config.features.realTimeComments && (
          <WebSocketStatus isConnected={isConnected} error={wsError} />
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Comment Form */}
      <CommentForm
        newsId={newsId}
        onCommentCreated={handleCommentCreated}
        onCancel={() => {}}
        placeholder="Share your thoughts on this article..."
      />

      <CommentList
        comments={comments}
        newsId={newsId}
        onCommentDeleted={handleCommentDeleted}
        onCommentLiked={handleCommentLiked}
        onCommentUpdated={handleCommentUpdated}
        onCommentCreated={handleCommentCreated}
      />

      {wsError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="text-yellow-800 text-sm">{wsError}</p>
        </div>
      )}
    </div>
  );
}