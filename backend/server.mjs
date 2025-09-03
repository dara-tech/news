import express from "express"
import dotenv from "dotenv"
dotenv.config();
import cors from "cors"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import session from 'express-session';
import MongoStore from 'connect-mongo';
import path from "path"
import { fileURLToPath } from "url"
import connectDB from "./config/db.mjs"
import connectCloudinary from "./utils/cloudinary.mjs"
import errorHandler from "./middleware/error.mjs"
import logger from "./utils/logger.mjs"
import { securityHeaders, apiRateLimit, authRateLimit, requestLogger } from "./middleware/security.mjs"
import authRoutes from "./routes/auth.mjs"
import userRoutes from "./routes/users.mjs"
import newsRoutes from "./routes/news.mjs"
import categoryRoutes from "./routes/categoryRoutes.mjs"
import dashboardRoutes from "./routes/dashboard.mjs"
import notificationRoutes from "./routes/notifications.mjs"
import likeRoutes from "./routes/likes.mjs"
import commentRoutes from "./routes/comments.mjs"
import adminCommentRoutes from "./routes/adminComments.mjs"
import adminLikeRoutes from "./routes/adminLikes.mjs"
import analyticsRoutes from "./routes/analytics.mjs"
import settingsRoutes from "./routes/settings.mjs"
import roleRoutes from "./routes/roles.mjs"
import activityRoutes from "./routes/activity.mjs"
import userActivityRoutes from "./routes/userActivity.mjs"
import userLoginRoutes from "./routes/userLogins.mjs"
import systemRoutes from "./routes/system.mjs"
import followRoutes from "./routes/follows.mjs"
import adminFollowRoutes from "./routes/adminFollows.mjs"
import seoRoutes from "./routes/seo.mjs"
import autoPublishRoutes from "./routes/autoPublish.mjs"
import translateRoutes from "./routes/translate.mjs"
import sentinelRoutes from "./routes/sentinel.mjs"
import tokenManagerRoutes from "./routes/tokenManager.mjs"
import dataQualityRoutes from "./routes/dataQualityTest.mjs"
import apiKeyManagementRoutes from "./routes/apiKeyManagement.mjs"
import enterpriseAnalyticsRoutes from "./routes/enterpriseAnalyticsTest.mjs"
import frontendSettingsRoutes from "./routes/frontendSettingsTest.mjs"
// AI routes removed - now frontend-only
import sourcesRoutes from "./routes/sources.mjs"
import http from 'http';
import https from 'https';
import CommentWebSocket from './websocket.mjs';
import sentinelService from './services/sentinelService.mjs';
import tokenManager from './services/tokenManager.mjs';
import integrationService from './services/integrationService.mjs';
import enhancedSecurityMiddleware from './middleware/enhancedSecurity.mjs';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config()

// Import passport after environment variables are loaded
import passport, { initializeGoogleOAuth } from "./config/passport.mjs"

// Connect to services
connectDB()
connectCloudinary()

// Initialize Express app
const app = express()

// Trust first proxy (important for production with HTTPS and real IP detection)
app.set('trust proxy', true);

// Enhanced Security middleware
app.use(enhancedSecurityMiddleware.createHelmetConfig());
app.use(enhancedSecurityMiddleware.requestLogger());
app.use(enhancedSecurityMiddleware.securityHeaders());
app.use(enhancedSecurityMiddleware.detectSuspiciousActivity());

// Middleware
app.use(express.json({ limit: "10mb" }))
app.use(cookieParser())

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || 'your-secret-key';
const isProduction = process.env.NODE_ENV === 'production';

// Session middleware
app.use(session({
  name: 'sessionId',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // 1 day
    autoRemove: 'native' // Default
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    secure: isProduction, // Only send over HTTPS in production
    sameSite: isProduction ? 'none' : 'lax', // Handle cross-site cookies in production
    // Remove domain restriction to allow cross-domain cookies
    // domain: isProduction ? 'news-eta-vert.vercel.app' : undefined, // This was incorrect
  }
}));

// Initialize Google OAuth strategy if not already initialized
if (!passport._strategies.google) {
  initializeGoogleOAuth();
}

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Log session info for debugging
app.use((req, res, next) => {
  next();
});

// CORS configuration with enhanced logging
const allowedOrigins = [
  // Exact string matches
  'http://localhost:3000',
  'http://localhost:3001',
  'https://www.razewire.online',    // Your new production domain
  'https://news-eta-vert.vercel.app', // Replace with your production domain
  'https://news-vzdx.onrender.com', 
  'https://newslys.netlify.app',  // Your current API domain
  // Regex patterns
  /^http:\/\/localhost(:\d+)?$/,    // Local development with any port
  /^https?:\/\/localhost(:\d+)?$/,  // Local development with any protocol
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/, // Localhost IP
  /^https?:\/\/.*\.vercel\.app$/,   // All Vercel deployments
  /^https?:\/\/.*\.onrender\.com$/, // All Render deployments
  /^https?:\/\/.*\.dara\.tech$/,    // Your custom domain
  /^https?:\/\/.*\.razewire\.online$/, // All Razewire subdomains
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      logger.info('CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    logger.info(`CORS: Checking origin: ${origin}`);
    
    const isAllowed = allowedOrigins.some(pattern => {
      if (typeof pattern === 'string') {
        const matches = pattern === origin;
        if (matches) logger.info(`CORS: Matched string pattern: ${pattern}`);
        return matches;
      } else if (pattern instanceof RegExp) {
        const matches = pattern.test(origin);
        if (matches) logger.info(`CORS: Matched regex pattern: ${pattern}`);
        return matches;
      }
      return false;
    });

    if (!isAllowed) {
      const msg = `CORS: Origin ${origin} not allowed. Allowed origins: ${allowedOrigins.map(o => typeof o === 'string' ? o : o.toString()).join(', ')}`;
      logger.error(msg);
      return callback(new Error(msg), false);
    }
    
    logger.info(`CORS: Origin ${origin} allowed`);
    return callback(null, true);
  },
  credentials: true, // Required for cookies
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', 'Cache-Control', 'Pragma'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  exposedHeaders: ['set-cookie'],
  maxAge: 86400 // 24 hours
};

// Apply CORS with options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Log all incoming requests
app.use((req, res, next) => {
  next();
});

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("combined", { stream: logger.stream }))
} else {
  app.use(morgan("combined", { stream: logger.stream }))
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// Apply maintenance mode middleware to non-admin API routes only
import { maintenanceModeMiddleware } from './middleware/settings.mjs';
import { trackPageView } from './middleware/analytics.mjs';

// Apply analytics tracking to all API routes
app.use('/api', trackPageView);

// Test route at the very beginning
app.get('/api/test-simple', (req, res) => {
  logger.info('🎯 SIMPLE TEST ROUTE CALLED');
  res.json({ success: true, message: 'Simple test route working!' });
});

// Note: Maintenance mode is now handled on the frontend
// Admin routes are not affected by maintenance mode

// Public maintenance status endpoint (with auth check)
app.get("/api/maintenance-status", async (req, res) => {
  try {
    // Import Settings model directly
    const Settings = (await import('./models/Settings.mjs')).default;
    
    // Get maintenance mode setting directly from database
    const maintenanceSetting = await Settings.findOne({ 
      category: 'general', 
      key: 'maintenanceMode' 
    });
    
    logger.info('Maintenance setting from DB:', maintenanceSetting);
    const isMaintenanceMode = maintenanceSetting?.value === true;
    logger.info('Is maintenance mode:', isMaintenanceMode);
    
    // Check if user is authenticated and is admin
    let isAdmin = false;
    let isAuthenticated = false;
    
    if (req.user) {
      isAuthenticated = true;
      isAdmin = req.user.role === 'admin';
    }
    
    // Set headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({
      success: true,
      maintenance: isMaintenanceMode,
      isAuthenticated: isAuthenticated,
      isAdmin: isAdmin,
      canAccess: isAdmin || !isMaintenanceMode
    });
  } catch (error) {
    logger.error('Error checking maintenance status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check maintenance status'
    });
  }
});

// Test endpoint to verify server is working
app.get("/api/test-maintenance", (req, res) => {
  res.json({
    success: true,
    message: "Server is working",
    maintenance: true,
    timestamp: new Date().toISOString()
  });
});

// API routes with enhanced rate limiting
app.use("/api/auth", enhancedSecurityMiddleware.createAuthRateLimit(), authRoutes)
app.use("/api/users", enhancedSecurityMiddleware.createAPIRateLimit(), userRoutes)
app.use("/api/news", enhancedSecurityMiddleware.createAPIRateLimit(), newsRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/likes", likeRoutes)
app.use("/api/follows", followRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/admin/comments", adminCommentRoutes)
app.use("/api/admin/likes", adminLikeRoutes)

app.use("/api/admin/settings", settingsRoutes)
app.use("/api/admin/roles", roleRoutes)
app.use("/api/admin/activity", activityRoutes)
app.use("/api/user/activity", userActivityRoutes)

// Public settings routes (no authentication required)
app.use("/api/settings", settingsRoutes)

// Direct public social media settings endpoint
app.get("/api/settings/public/social-media", async (req, res) => {
  try {
    const Settings = (await import('./models/Settings.mjs')).default;
    const settings = await Settings.getCategorySettings('social-media');
    
    // If no social links are configured, provide some default ones
    if (!settings.socialLinks || settings.socialLinks.length === 0) {
      settings.socialLinks = [
        {
          platform: 'facebook',
          url: '#',
          isActive: false,
          displayName: 'Facebook'
        },
        {
          platform: 'twitter',
          url: '#',
          isActive: false,
          displayName: 'Twitter'
        },
        {
          platform: 'linkedin',
          url: '#',
          isActive: false,
          displayName: 'LinkedIn'
        },
        {
          platform: 'instagram',
          url: '#',
          isActive: false,
          displayName: 'Instagram'
        },
        {
          platform: 'telegram',
          url: '#',
          isActive: false,
          displayName: 'Telegram'
        },
        {
          platform: 'youtube',
          url: '#',
          isActive: false,
          displayName: 'YouTube'
        },
        {
          platform: 'github',
          url: '#',
          isActive: false,
          displayName: 'GitHub'
        }
      ];
    }
    
    logger.info('Retrieved public social media settings:', settings);
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    logger.error('Error fetching public social media settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch social media settings'
    });
  }
});

// Enable user login routes
app.use("/api/admin/user-logins", userLoginRoutes)
app.use("/api/admin/system", systemRoutes)
app.use("/api/admin/follows", adminFollowRoutes)
app.use("/api/admin/seo", seoRoutes)
app.use("/api/admin/auto-publish", autoPublishRoutes)
app.use("/api/translate", translateRoutes)
app.use("/api/sentinel", sentinelRoutes)
app.use("/api/admin/tokens", tokenManagerRoutes)
app.use("/api/admin/data-quality", dataQualityRoutes)
app.use("/api/admin/api-keys", apiKeyManagementRoutes)
app.use("/api/admin/analytics", enterpriseAnalyticsRoutes)
app.use("/api/admin/frontend-settings", frontendSettingsRoutes)
app.use("/api/analytics", analyticsRoutes)

// AI routes
// AI routes removed - now frontend-only

// Sources routes
app.use("/api/ai/sources", sourcesRoutes)

// Enhanced Integration API Routes
app.get("/api/integration/health", async (req, res) => {
  try {
    const health = await integrationService.getHealthStatus();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/integration/stats", async (req, res) => {
  try {
    const stats = await integrationService.getSystemStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enhanced Analytics Routes
app.get("/api/analytics/dashboard", async (req, res) => {
  try {
    const dashboard = await integrationService.services.analytics.getDashboardData(req.query.timeRange || '7d');
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/content-performance", async (req, res) => {
  try {
    const performance = await integrationService.services.analytics.getContentPerformance(
      req.query.articleId, 
      req.query.timeRange || '30d'
    );
    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Enhancement Routes
app.post("/api/ai/summarize", async (req, res) => {
  try {
    const { content, maxLength } = req.body;
    const summary = await integrationService.services.ai.generateSummary(content, maxLength);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ai/fact-check", async (req, res) => {
  try {
    const { content } = req.body;
    const factCheck = await integrationService.services.ai.factCheck(content);
    res.json(factCheck);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ai/generate-tags", async (req, res) => {
  try {
    const { content, title, maxTags } = req.body;
    const tags = await integrationService.services.ai.generateTags(content, title, maxTags);
    res.json({ tags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Performance Optimization Routes
app.post("/api/performance/optimize-image", async (req, res) => {
  try {
    const { imagePath, options } = req.body;
    const optimized = await integrationService.services.performance.optimizeImage(imagePath, options);
    res.json(optimized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cache Management Routes
app.get("/api/cache/stats", (req, res) => {
  try {
    const stats = integrationService.services.cache.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/cache/clear", async (req, res) => {
  try {
    const { pattern } = req.body;
    if (pattern) {
      await integrationService.services.cache.deletePattern(pattern);
    } else {
      await integrationService.services.cache.clear();
    }
    res.json({ success: true, message: 'Cache cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Monetization Routes
app.get("/api/monetization/plans", (req, res) => {
  try {
    const plans = integrationService.services.monetization.getSubscriptionPlans();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/monetization/revenue", async (req, res) => {
  try {
    const report = await integrationService.services.monetization.getRevenueReport(req.query.timeRange || '30d');
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Content Management Routes
app.get("/api/content/analytics", async (req, res) => {
  try {
    const analytics = await integrationService.services.content.getContentAnalytics(req.query.timeRange || '30d');
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket Routes
app.get("/api/websocket/rooms", (req, res) => {
  try {
    const rooms = integrationService.services.websocket.getAllRooms();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/websocket/stats", (req, res) => {
  try {
    const stats = integrationService.services.websocket.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket test endpoint
app.get('/api/websocket-test', (req, res) => {
  res.json({ 
    message: 'WebSocket server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve Next.js frontend in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the Next.js output directory
  app.use(express.static(path.join(__dirname, '../frontend/out')));
  
  // Handle Next.js routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/out/index.html'));
  });
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "News API Server",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
  })
})

// 404 handler for undefined routesd
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Server configuration
const PORT = process.env.PORT || 5001

// Create HTTP server for WebSocket support
import { createServer } from 'http';
const server = createServer(app);

// Initialize integration services
server.listen(PORT, async () => {
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  
  // Initialize all integration services
  try {
    await integrationService.initialize(server);
    logger.info('✅ All integration services initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize integration services:', error);
  }
})

// Initialize WebSocket for real-time comments
const commentWebSocket = new CommentWebSocket(server);

// Connect WebSocket to comment controller
import { setCommentWebSocket } from './controllers/commentController.mjs';
setCommentWebSocket(commentWebSocket);

// Add WebSocket test endpoint
app.get('/api/websocket-test', (req, res) => {
  res.json({ 
    message: 'WebSocket server is running',
    timestamp: new Date().toISOString()
  });
});

// Start Sentinel if enabled
setTimeout(() => {
  sentinelService.start();
}, 2000);

// Start Token Manager
setTimeout(() => {
  tokenManager.start();
}, 3000);

// --- Auto-Reload (Keep-Alive) Ping ---
// Fix: Always ping the deployed Render URL, not the current server's own URL.
// This keeps the Render instance alive, regardless of which deployment is running this code.

const RENDER_URL = "https://news-vzdx.onrender.com"; // The Render deployment URL to keep alive
const AUTO_RELOAD_INTERVAL = 1000 * 60 * 5; // 5 minutes

function pingRender() {
  const url = RENDER_URL;
  const isHttps = url.startsWith('https://');
  const protocol = isHttps ? https : http;
  logger.info(`[${new Date().toISOString()}] 🔄 Pinging Render at: ${url}`);
  protocol.get(url, (res) => {
    logger.info(`[${new Date().toISOString()}] 🔄 Render ping status: ${res.statusCode}`);
  }).on("error", (err) => {
    logger.info(`[${new Date().toISOString()}] ❌ Render ping failed: ${err.message}`);
  });
}

// Only start pinging in production (never in development)
if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "development") {
  setInterval(pingRender, AUTO_RELOAD_INTERVAL);
  // Initial ping
  pingRender();
}

// Graceful shutdown - only in production
if (process.env.NODE_ENV === 'production') {
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    await integrationService.shutdown();
    server.close(() => {
      logger.info('Process terminated');
    });
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    await integrationService.shutdown();
    server.close(() => {
      logger.info('Process terminated');
    });
  });
} else {
  // In development, ignore SIGINT to keep server running
  process.on('SIGINT', () => {
    logger.info('SIGINT received in development mode - ignoring to keep server running');
    logger.info('Use Ctrl+C again to force quit, or stop the process manually');
  });
  
  // Also ignore SIGTERM in development
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received in development mode - ignoring to keep server running');
  });
}

export default app;
