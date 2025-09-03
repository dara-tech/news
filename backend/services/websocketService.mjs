import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.mjs';
import logger from '../utils/logger.mjs';

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
    this.rooms = new Map();
    this.messageHistory = new Map(); // Store message history per room
    this.maxHistorySize = 100;
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    logger.info('WebSocket service initialized');
    return this.io;
  }

  /**
   * Setup authentication middleware
   */
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`User connected: ${socket.userId} (${socket.user.name})`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        user: socket.user,
        connectedAt: new Date(),
        lastActivity: new Date()
      });

      // Send connection confirmation
      socket.emit('connected', {
        message: 'Connected to real-time updates',
        userId: socket.userId,
        timestamp: new Date()
      });

      // Handle joining rooms
      socket.on('join_room', (data) => {
        this.handleJoinRoom(socket, data);
      });

      // Handle leaving rooms
      socket.on('leave_room', (data) => {
        this.handleLeaveRoom(socket, data);
      });

      // Handle sending messages
      socket.on('send_message', (data) => {
        this.handleSendMessage(socket, data);
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        this.handleTypingStart(socket, data);
      });

      socket.on('typing_stop', (data) => {
        this.handleTypingStop(socket, data);
      });

      // Handle user activity
      socket.on('user_activity', (data) => {
        this.handleUserActivity(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`Socket error for user ${socket.userId}:`, error);
      });
    });
  }

  /**
   * Handle joining a room
   */
  handleJoinRoom(socket, data) {
    try {
      const { roomId, roomType = 'general' } = data;
      
      if (!roomId) {
        socket.emit('error', { message: 'Room ID is required' });
        return;
      }

      socket.join(roomId);
      
      // Initialize room if it doesn't exist
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, {
          id: roomId,
          type: roomType,
          users: new Set(),
          createdAt: new Date(),
          lastActivity: new Date()
        });
        this.messageHistory.set(roomId, []);
      }

      // Add user to room
      const room = this.rooms.get(roomId);
      room.users.add(socket.userId);
      room.lastActivity = new Date();

      // Send room join confirmation
      socket.emit('room_joined', {
        roomId,
        roomType,
        message: `Joined room: ${roomId}`,
        timestamp: new Date()
      });

      // Notify other users in the room
      socket.to(roomId).emit('user_joined', {
        userId: socket.userId,
        userName: socket.user.name,
        roomId,
        timestamp: new Date()
      });

      // Send recent message history
      const history = this.messageHistory.get(roomId) || [];
      socket.emit('message_history', {
        roomId,
        messages: history.slice(-20) // Last 20 messages
      });

      logger.info(`User ${socket.userId} joined room ${roomId}`);
    } catch (error) {
      logger.error('Join room error:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  /**
   * Handle leaving a room
   */
  handleLeaveRoom(socket, data) {
    try {
      const { roomId } = data;
      
      if (!roomId) {
        socket.emit('error', { message: 'Room ID is required' });
        return;
      }

      socket.leave(roomId);
      
      // Remove user from room
      const room = this.rooms.get(roomId);
      if (room) {
        room.users.delete(socket.userId);
        room.lastActivity = new Date();
        
        // Clean up empty rooms
        if (room.users.size === 0) {
          this.rooms.delete(roomId);
        }
      }

      // Notify other users in the room
      socket.to(roomId).emit('user_left', {
        userId: socket.userId,
        userName: socket.user.name,
        roomId,
        timestamp: new Date()
      });

      socket.emit('room_left', {
        roomId,
        message: `Left room: ${roomId}`,
        timestamp: new Date()
      });

      logger.info(`User ${socket.userId} left room ${roomId}`);
    } catch (error) {
      logger.error('Leave room error:', error);
      socket.emit('error', { message: 'Failed to leave room' });
    }
  }

  /**
   * Handle sending messages
   */
  handleSendMessage(socket, data) {
    try {
      const { roomId, message, messageType = 'text' } = data;
      
      if (!roomId || !message) {
        socket.emit('error', { message: 'Room ID and message are required' });
        return;
      }

      const messageData = {
        id: Date.now().toString(),
        roomId,
        userId: socket.userId,
        userName: socket.user.name,
        userRole: socket.user.role,
        message,
        messageType,
        timestamp: new Date()
      };

      // Store message in history
      const history = this.messageHistory.get(roomId) || [];
      history.push(messageData);
      
      // Limit history size
      if (history.length > this.maxHistorySize) {
        history.shift();
      }
      this.messageHistory.set(roomId, history);

      // Send message to all users in the room
      this.io.to(roomId).emit('new_message', messageData);

      // Update room activity
      const room = this.rooms.get(roomId);
      if (room) {
        room.lastActivity = new Date();
      }

      logger.info(`Message sent in room ${roomId} by user ${socket.userId}`);
    } catch (error) {
      logger.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  /**
   * Handle typing start
   */
  handleTypingStart(socket, data) {
    try {
      const { roomId } = data;
      
      if (!roomId) return;

      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name,
        roomId,
        isTyping: true,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Typing start error:', error);
    }
  }

  /**
   * Handle typing stop
   */
  handleTypingStop(socket, data) {
    try {
      const { roomId } = data;
      
      if (!roomId) return;

      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name,
        roomId,
        isTyping: false,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Typing stop error:', error);
    }
  }

  /**
   * Handle user activity
   */
  handleUserActivity(socket, data) {
    try {
      const userConnection = this.connectedUsers.get(socket.userId);
      if (userConnection) {
        userConnection.lastActivity = new Date();
      }
    } catch (error) {
      logger.error('User activity error:', error);
    }
  }

  /**
   * Handle disconnection
   */
  handleDisconnect(socket) {
    try {
      logger.info(`User disconnected: ${socket.userId}`);
      
      // Remove from connected users
      this.connectedUsers.delete(socket.userId);
      
      // Remove from all rooms
      for (const [roomId, room] of this.rooms.entries()) {
        if (room.users.has(socket.userId)) {
          room.users.delete(socket.userId);
          room.lastActivity = new Date();
          
          // Notify other users
          socket.to(roomId).emit('user_left', {
            userId: socket.userId,
            userName: socket.user?.name || 'Unknown',
            roomId,
            timestamp: new Date()
          });
          
          // Clean up empty rooms
          if (room.users.size === 0) {
            this.rooms.delete(roomId);
          }
        }
      }
    } catch (error) {
      logger.error('Disconnect error:', error);
    }
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, {
        ...data,
        timestamp: new Date()
      });
      logger.info(`Broadcasted event: ${event}`);
    }
  }

  /**
   * Broadcast to specific room
   */
  broadcastToRoom(roomId, event, data) {
    if (this.io) {
      this.io.to(roomId).emit(event, {
        ...data,
        timestamp: new Date()
      });
      logger.info(`Broadcasted to room ${roomId}: ${event}`);
    }
  }

  /**
   * Broadcast to specific user
   */
  broadcastToUser(userId, event, data) {
    const userConnection = this.connectedUsers.get(userId);
    if (userConnection && this.io) {
      this.io.to(userConnection.socketId).emit(event, {
        ...data,
        timestamp: new Date()
      });
      logger.info(`Broadcasted to user ${userId}: ${event}`);
    }
  }

  /**
   * Broadcast news update
   */
  broadcastNewsUpdate(newsData) {
    this.broadcast('news_update', {
      type: 'news_published',
      news: newsData
    });
  }

  /**
   * Broadcast notification
   */
  broadcastNotification(notificationData) {
    this.broadcast('notification', notificationData);
  }

  /**
   * Broadcast system message
   */
  broadcastSystemMessage(message, roomId = null) {
    const systemMessage = {
      id: Date.now().toString(),
      type: 'system',
      message,
      timestamp: new Date()
    };

    if (roomId) {
      this.broadcastToRoom(roomId, 'system_message', systemMessage);
    } else {
      this.broadcast('system_message', systemMessage);
    }
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  /**
   * Get room information
   */
  getRoomInfo(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      id: room.id,
      type: room.type,
      userCount: room.users.size,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity
    };
  }

  /**
   * Get all rooms
   */
  getAllRooms() {
    const rooms = [];
    for (const [roomId, room] of this.rooms.entries()) {
      rooms.push({
        id: roomId,
        type: room.type,
        userCount: room.users.size,
        createdAt: room.createdAt,
        lastActivity: room.lastActivity
      });
    }
    return rooms;
  }

  /**
   * Get user statistics
   */
  getStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      totalRooms: this.rooms.size,
      totalMessages: Array.from(this.messageHistory.values()).reduce((total, history) => total + history.length, 0)
    };
  }

  /**
   * Cleanup inactive connections
   */
  cleanupInactiveConnections() {
    const now = Date.now();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [userId, connection] of this.connectedUsers.entries()) {
      if (now - connection.lastActivity.getTime() > inactiveThreshold) {
        logger.info(`Cleaning up inactive connection: ${userId}`);
        this.connectedUsers.delete(userId);
      }
    }
  }
}

export default new WebSocketService();
