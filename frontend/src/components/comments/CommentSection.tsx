'use client';

import { useState, useEffect, useCallback } from 'react';
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
import Link from 'next/link';

interface CommentSectionProps {
  newsId: string;
  className?: string;
}

// Helper to convert WebSocketComment to Comment
function wsCommentToComment(wsComment: WebSocketComment): Comment {
  return {
    _id: wsComment._id,
    content: wsComment.content,
    user: wsComment.user,
    news: wsComment.news,
    parentComment: wsComment.parentComment,
    isEdited: wsComment.isEdited,
    editedAt: wsComment.editedAt,
    likes: wsComment.likes || [],
    replies: wsComment.replies || [],
    repliesCount: wsComment.repliesCount,
    createdAt: wsComment.createdAt,
    updatedAt: wsComment.updatedAt,
  } as Comment;
}

// Helper to convert WebSocketStats to CommentStats
function wsStatsToStats(wsStats: WebSocketStats): CommentStats {
  return {
    totalComments: wsStats.comments,
    totalReplies: 0,
    totalLikes: wsStats.likes,
  };
}

export default function CommentSection({ newsId, className }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<CommentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);

  // Type for optimistic comments
  type OptimisticComment = Comment & { isOptimistic?: boolean };

  const loadComments = useCallback(async () => {
    try {
      const response = await api.get(`/comments/${newsId}`);
      if (response.data.success && response.data.data) {
        setComments(response.data.data || []);
      } else {
        setComments([]);
      }
      setError(null);
    } catch {
      setError('Failed to load comments');
      setComments([]);
    }
  }, [newsId]);

  const loadStats = useCallback(async () => {
    try {
      const response = await api.get(`/comments/${newsId}/stats`);
      if (response.data.success && response.data.data) {
        setStats(response.data.data);
      } else {
        setStats({
          totalComments: 0,
          totalReplies: 0,
          totalLikes: 0
        });
      }
    } catch {
      setStats({
        totalComments: 0,
        totalReplies: 0,
        totalLikes: 0
      });
    }
  }, [newsId]);

  const handleCommentCreated = (newComment: Comment) => {
    setComments((prev: Comment[]) => {
      // If this is a reply, add it to the parent comment's replies
      if (newComment.parentComment) {
        return prev.map(comment => {
          if (comment._id === newComment.parentComment) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newComment]
            };
          }
          return comment;
        });
      }
      // If this is a top-level comment, add it to the main array
      return [newComment, ...prev];
    });
    
    setStats((prev: CommentStats | null) => prev ? {
      ...prev,
      totalComments: prev.totalComments + 1
    } : null);
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev: Comment[]) => {
      // First, try to remove from main comments array
      const filteredMain = prev.filter(comment => comment._id !== commentId);
      
      // If the comment wasn't in main array, it might be a reply
      if (filteredMain.length === prev.length) {
        // Search for the reply in all parent comments' replies arrays
        return prev.map(comment => ({
          ...comment,
          replies: (comment.replies || []).filter(reply => reply._id !== commentId)
        }));
      }
      
      return filteredMain;
    });
    
    setStats((prev: CommentStats | null) => prev ? {
      ...prev,
      totalComments: Math.max(0, prev.totalComments - 1)
    } : null);
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments((prev: Comment[]) => prev.map(comment => 
      comment._id === updatedComment._id ? updatedComment : comment
    ));
  };

  const { user } = useAuth();

  const handleCommentLiked = (commentId: string, hasLiked: boolean) => {
    setComments((prev: Comment[]) => prev.map(comment => {
      if (comment._id === commentId) {
        const currentLikes = comment.likes || [];
        const userId = user?._id || 'current-user-id';

        if (hasLiked) {
          return {
            ...comment,
            likes: [...currentLikes, userId]
          };
        } else {
          return {
            ...comment,
            likes: currentLikes.filter((id: string) => id !== userId)
          };
        }
      }
      return comment;
    }));
  };

  // WebSocket real-time updates
  const { isConnected } = useWebSocket(newsId, {
    onCommentCreated: (newComment) => {
      const comment = wsCommentToComment(newComment);
      setComments((prev: OptimisticComment[]) => {
        // Check for existing comment by ID first
        const existingById = prev.find(c => c._id === comment._id);
        if (existingById) {
          return prev.map(c => c._id === comment._id ? comment : c);
        }

        // Check for optimistic comment by content and time
        const existingOptimistic = prev.find(c =>
          c.isOptimistic &&
          c.content === comment.content &&
          Math.abs(new Date(c.createdAt).getTime() - new Date(comment.createdAt).getTime()) < 15000
        );

        if (existingOptimistic) {
          return prev.map(c =>
            c._id === existingOptimistic._id ? comment : c
          );
        }

        // If this is a reply, add it to the parent comment's replies
        if (comment.parentComment) {
          return prev.map(c => {
            if (c._id === comment.parentComment) {
              return {
                ...c,
                replies: [...(c.replies || []), comment]
              };
            }
            return c;
          });
        }

        // If this is a top-level comment, add it to the main array
        return [comment, ...prev];
      });

      setStats((prev: CommentStats | null) => prev ? {
        ...prev,
        totalComments: prev.totalComments + 1
      } : null);
    },
    onCommentUpdated: (updatedComment) => {
      const comment = wsCommentToComment(updatedComment);
      setComments((prev: Comment[]) => prev.map(c =>
        c._id === comment._id ? comment : c
      ));
    },
    onCommentDeleted: (commentId) => {
      setComments((prev: Comment[]) => {
        // First, try to remove from main comments array
        const filteredMain = prev.filter(comment => comment._id !== commentId);
        
        // If the comment wasn't in main array, it might be a reply
        if (filteredMain.length === prev.length) {
          // Search for the reply in all parent comments' replies arrays
          return prev.map(comment => ({
            ...comment,
            replies: (comment.replies || []).filter(reply => reply._id !== commentId)
          }));
        }
        
        return filteredMain;
      });
      
      setStats((prev: CommentStats | null) => prev ? {
        ...prev,
        totalComments: Math.max(0, prev.totalComments - 1)
      } : null);
    },
    onCommentLiked: (updatedComment) => {
      const comment = wsCommentToComment(updatedComment);
      setComments((prev: Comment[]) => prev.map(c => {
        if (c._id === comment._id) {
          const currentLikes = c.likes || [];
          const newLikes = comment.likes || [];

          if (
            Array.isArray(currentLikes) &&
            Array.isArray(newLikes) &&
            (currentLikes.length !== newLikes.length ||
              !currentLikes.every(like => newLikes.includes(like)))
          ) {
            return comment;
          }
        }
        return c;
      }));
    },
    onStatsUpdated: (newStats) => {
      setStats(wsStatsToStats(newStats));
    },
    onError: () => {
      setWsError('Real-time connection failed - using fallback mode');
    }
  });

  useEffect(() => {
    if (!isConnected && !wsError) {
      return;
    }

    const pollInterval = setInterval(async () => {
      if (!isConnected) {
        try {
          await loadComments();
          await loadStats();
        } catch {
          // ignore polling error
        }
      }
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [isConnected, wsError, loadComments, loadStats]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadComments(), loadStats()]);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [newsId, loadComments, loadStats]);

  useEffect(() => {
    const cleanupOptimistic = setInterval(() => {
      setComments((prev: OptimisticComment[]) => {
        const now = Date.now();
        const filtered = prev.filter(comment => {
          if (comment.isOptimistic) {
            const commentTime = new Date(comment.createdAt).getTime();
            if (now - commentTime > 30000) {
              return false;
            }
          }
          return true;
        });
        return filtered;
      });
    }, 10000);

    return () => clearInterval(cleanupOptimistic);
  }, []);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Comments</h3>
          <WebSocketStatus isConnected={isConnected} error={wsError} />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Comments
            </h3>
            <p className="text-sm text-gray-500">
              {stats ? `${stats.totalComments} comments` : 'Join the conversation'}
            </p>
          </div>
        </div>
        {config.features.realTimeComments && (
          <WebSocketStatus isConnected={isConnected} error={wsError} />
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Comment Form or Login Prompt */}
      {user ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 shadow-sm">
          <CommentForm 
            newsId={newsId} 
            onCommentCreated={handleCommentCreated}
            onCommentFailed={() => {}}
            onCancel={() => {}}
          />
        </div>
      ) : (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-900/20 dark:via-blue-800/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="absolute -top-6 -right-6 opacity-20 pointer-events-none select-none">
            <LogIn className="w-24 h-24 sm:w-32 sm:h-32 text-blue-300" />
          </div>
          <div className="flex flex-col items-center z-10">
            <div className="flex items-center mb-3">
              <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2" />
              <span className="text-base sm:text-lg font-semibold text-blue-800 dark:text-blue-200">
                Join the Conversation
              </span>
            </div>
            <p className="text-blue-700 dark:text-blue-300 mb-4 text-sm text-center max-w-sm">
              You need to be logged in to add a comment and interact with others.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/en/login'}
              className="flex items-center gap-2 px-4 py-2 text-blue-700 border-blue-400 hover:bg-blue-100 hover:border-blue-500 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-900/20 transition-all duration-200 shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span className="font-medium">Login to Comment</span>
            </Button>
            <div className="mt-3 text-xs text-blue-500 dark:text-blue-400">
              Don&apos;t have an account?{' '}
              <Link href="/en/register" className="underline hover:text-blue-700 dark:hover:text-blue-300">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 shadow-sm">
        <CommentList
          comments={comments}
          newsId={newsId}
          onCommentDeleted={handleCommentDeleted}
          onCommentLiked={handleCommentLiked}
          onCommentUpdated={handleCommentUpdated}
        />
      </div>

      {wsError && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">{wsError}</p>
        </div>
      )}
    </div>
  );
}