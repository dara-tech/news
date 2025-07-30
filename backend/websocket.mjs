import { WebSocketServer } from 'ws';
import { createServer } from 'http';

class CommentWebSocket {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Map(); // Map to store client connections by newsId
    
    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });
  }

  handleConnection(ws, req) {
    console.log('WebSocket client connected from:', req.socket.remoteAddress);
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received WebSocket message:', data);
        this.handleMessage(ws, data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      this.removeClient(ws);
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.removeClient(ws);
    });
  }

  handleMessage(ws, data) {
    switch (data.type) {
      case 'subscribe':
        this.subscribeToComments(ws, data.newsId);
        break;
      case 'unsubscribe':
        this.unsubscribeFromComments(ws, data.newsId);
        break;
      case 'ping':
        // Respond to heartbeat ping
        if (ws.readyState === 1) { // WebSocket.OPEN
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: data.timestamp
          }));
        }
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  subscribeToComments(ws, newsId) {
    if (!this.clients.has(newsId)) {
      this.clients.set(newsId, new Set());
    }
    this.clients.get(newsId).add(ws);
    ws.newsId = newsId;
    console.log(`Client subscribed to comments for news: ${newsId}. Total clients for this news: ${this.clients.get(newsId).size}`);
  }

  unsubscribeFromComments(ws, newsId) {
    if (this.clients.has(newsId)) {
      this.clients.get(newsId).delete(ws);
      if (this.clients.get(newsId).size === 0) {
        this.clients.delete(newsId);
      }
    }
    ws.newsId = null;
    console.log(`Client unsubscribed from comments for news: ${newsId}`);
  }

  removeClient(ws) {
    if (ws.newsId && this.clients.has(ws.newsId)) {
      this.clients.get(ws.newsId).delete(ws);
      if (this.clients.get(ws.newsId).size === 0) {
        this.clients.delete(ws.newsId);
      }
    }
  }

  // Broadcast comment updates to all clients subscribed to a specific news article
  broadcastCommentUpdate(newsId, updateType, data) {
    if (this.clients.has(newsId)) {
      const message = JSON.stringify({
        type: 'comment_update',
        updateType,
        data,
        timestamp: new Date().toISOString()
      });

      console.log(`Broadcasting ${updateType} to ${this.clients.get(newsId).size} clients for news: ${newsId}`);
      
      this.clients.get(newsId).forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(message);
        }
      });
    } else {
      console.log(`No clients subscribed to news: ${newsId} for ${updateType} broadcast`);
    }
  }

  // Broadcast comment creation
  broadcastCommentCreated(newsId, comment) {
    this.broadcastCommentUpdate(newsId, 'created', comment);
  }

  // Broadcast comment update
  broadcastCommentUpdated(newsId, comment) {
    this.broadcastCommentUpdate(newsId, 'updated', comment);
  }

  // Broadcast comment deletion
  broadcastCommentDeleted(newsId, commentId) {
    this.broadcastCommentUpdate(newsId, 'deleted', { commentId });
  }

  // Broadcast comment like toggle
  broadcastCommentLiked(newsId, comment) {
    this.broadcastCommentUpdate(newsId, 'liked', comment);
  }

  // Broadcast stats update
  broadcastStatsUpdate(newsId, stats) {
    this.broadcastCommentUpdate(newsId, 'stats_updated', stats);
  }
}

export default CommentWebSocket; 