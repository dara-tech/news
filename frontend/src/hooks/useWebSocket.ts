import { useEffect, useRef, useCallback } from 'react';
import { config } from '@/lib/config';

export interface WebSocketComment {
  _id: string;
  content: string;
  user: {
    _id: string;
    username: string;
    profileImage?: string;
    avatar?: string;
  };
  news: string;
  parentComment?: string;
  isEdited: boolean;
  editedAt?: string;
  likes: string[];
  replies?: WebSocketComment[];
  repliesCount?: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface WebSocketStats {
  likes: number;
  comments: number;
  [key: string]: unknown;
}

export interface WebSocketMessage {
  type: string;
  updateType?: string;
  data: WebSocketComment | WebSocketStats | { commentId: string } | unknown;
  timestamp: string;
}

export interface UseWebSocketOptions {
  onCommentCreated?: (comment: WebSocketComment) => void;
  onCommentUpdated?: (comment: WebSocketComment) => void;
  onCommentDeleted?: (commentId: string) => void;
  onCommentLiked?: (comment: WebSocketComment) => void;
  onStatsUpdated?: (stats: WebSocketStats) => void;
  onError?: (error: Error | string) => void;
}

// Fix: Replace (message: any) with a proper type for sendMessage argument
type OutgoingWebSocketMessage =
  | { type: 'subscribe'; newsId: string }
  | { type: 'ping'; timestamp: number }
  | Record<string, unknown>;

export const useWebSocket = (newsId: string, options: UseWebSocketOptions = {}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = config.websocket.reconnectAttempts;
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isConnectingRef = useRef(false);
  const shouldConnectRef = useRef(true);

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Use the backend API URL from config
    const apiUrl = config.api.baseUrl;
    const url = new URL(apiUrl);
    const host = url.hostname;
    const port = url.port || (window.location.protocol === 'https:' ? '443' : '80');


    return `${protocol}//${host}:${port}`;
  }, []);

  // --- handleCommentUpdate must be defined before connect for correct closure ---
  const handleCommentUpdate = useCallback((message: WebSocketMessage) => {
    switch (message.updateType) {
      case 'created':
        if (options.onCommentCreated && typeof message.data === 'object') {
          options.onCommentCreated(message.data as WebSocketComment);
        }
        break;
      case 'updated':
        if (options.onCommentUpdated && typeof message.data === 'object') {
          options.onCommentUpdated(message.data as WebSocketComment);
        }
        break;
      case 'deleted':
        if (
          options.onCommentDeleted &&
          typeof message.data === 'object' &&
          message.data !== null &&
          'commentId' in message.data
        ) {
          options.onCommentDeleted((message.data as { commentId: string }).commentId);
        }
        break;
      case 'liked':
        if (options.onCommentLiked && typeof message.data === 'object') {
          options.onCommentLiked(message.data as WebSocketComment);
        }
        break;
      case 'stats_updated':
        if (options.onStatsUpdated && typeof message.data === 'object') {
          options.onStatsUpdated(message.data as WebSocketStats);
        }
        break;
      default:
        break;
    }
  }, [
    options.onCommentCreated,
    options.onCommentUpdated,
    options.onCommentDeleted,
    options.onCommentLiked,
    options.onStatsUpdated
  ]);

  const disconnect = useCallback(() => {
    shouldConnectRef.current = false;
    
    // Clear heartbeat interval
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close WebSocket connection
    if (wsRef.current) {
      // Only close if not already closing or closed
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, 'Component unmounting');
      }
      wsRef.current = null;
    }

    isConnectingRef.current = false;
  }, []);

  const connect = useCallback(() => {
    // Don't connect if WebSocket is disabled
    if (!config.websocket.enabled) {
      return;
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Don't connect if component is unmounting
    if (!shouldConnectRef.current) {
      return;
    }

    isConnectingRef.current = true;

    try {
      const wsUrl = getWebSocketUrl();

      // Wrap WebSocket creation in try-catch to prevent unhandled errors
      let ws: WebSocket;
      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;
      } catch (wsError) {isConnectingRef.current = false;
        options.onError?.(wsError instanceof Error ? wsError : new Error('WebSocket creation failed'));
        return;
      }

      ws.onmessage = (event: MessageEvent) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          switch (message.type) {
            case 'comment_update':
              handleCommentUpdate(message);
              break;
            case 'pong':
              // Heartbeat response - connection is alive
              break;
            default:
              break;
          }
        } catch (error) {}
      };

      ws.onerror = (error: Event) => {
        // Don't call onError for connection errors - let onclose handle reconnection
        if (ws.readyState !== WebSocket.CONNECTING) {
          options.onError?.(error instanceof Error ? error : new Error('WebSocket error'));
        }
      };

      // Add timeout for connection
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {ws.close();
          options.onError?.('Connection timeout');
        }
      }, config.websocket.connectionTimeout);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        isConnectingRef.current = false;
        reconnectAttemptsRef.current = 0;

        // Subscribe to comments for this news article
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'subscribe',
            newsId
          }));
        }

        // Start heartbeat to keep connection alive
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'ping',
              timestamp: Date.now()
            }));
          }
        }, config.websocket.heartbeatInterval);
      };

      ws.onclose = (event: CloseEvent) => {
        clearTimeout(connectionTimeout);
        isConnectingRef.current = false;

        // Clear heartbeat interval
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }


        // Don't reconnect if component is unmounting or if it was a normal closure
        if (!shouldConnectRef.current || event.code === 1000) {
          return;
        }

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {options.onError?.('Max reconnection attempts reached');
        }
      };

    } catch (error) {
      isConnectingRef.current = false;options.onError?.(error instanceof Error ? error : new Error('WebSocket connection error'));
    }
  }, [newsId, getWebSocketUrl, handleCommentUpdate, maxReconnectAttempts, options.onError]);

  // Connect on mount and when newsId changes
  useEffect(() => {
    shouldConnectRef.current = true;
    
    // Small delay to ensure component is fully mounted
    const connectTimeout = setTimeout(() => {
      if (shouldConnectRef.current) {
        connect();
      }
    }, 100);

    return () => {
      shouldConnectRef.current = false;
      clearTimeout(connectTimeout);
      disconnect();
    };
  }, [newsId, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldConnectRef.current = false;
      disconnect();
    };
  }, [disconnect]);

  // Fix: Specify a proper type for sendMessage argument instead of 'any'
  const sendMessage = useCallback((message: OutgoingWebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    sendMessage,
    disconnect
  };
};