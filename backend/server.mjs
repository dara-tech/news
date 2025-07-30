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
import authRoutes from "./routes/auth.mjs"
import userRoutes from "./routes/users.mjs"
import newsRoutes from "./routes/news.mjs"
import categoryRoutes from "./routes/categoryRoutes.mjs"
import dashboardRoutes from "./routes/dashboard.mjs"
import notificationRoutes from "./routes/notifications.mjs"
import likeRoutes from "./routes/likes.mjs"
import commentRoutes from "./routes/comments.mjs"
import http from 'http';
import https from 'https';
import CommentWebSocket from './websocket.mjs';

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

// Trust first proxy (important for production with HTTPS)
app.set('trust proxy', 1);

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
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(pattern => {
      if (typeof pattern === 'string') {
        return pattern === origin;
      } else if (pattern instanceof RegExp) {
        return pattern.test(origin);
      }
      return false;
    });

    if (!isAllowed) {
      const msg = `CORS: Origin ${origin} not allowed`;
      return callback(new Error(msg), false);
    }
    
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
  app.use(morgan("dev"))
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/news", newsRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/likes", likeRoutes)
app.use("/api/comments", commentRoutes)

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

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "News API Server",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
  })
})

// 404 handler for undefined routes
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

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
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

// --- Auto-Reload (Keep-Alive) Ping ---
// Fix: Always ping the deployed Render URL, not the current server's own URL.
// This keeps the Render instance alive, regardless of which deployment is running this code.

const RENDER_URL = "https://news-vzdx.onrender.com"; // The Render deployment URL to keep alive
const AUTO_RELOAD_INTERVAL = 1000 * 60 * 5; // 5 minutes

function pingRender() {
  const url = RENDER_URL;
  const isHttps = url.startsWith('https://');
  const protocol = isHttps ? https : http;
  console.log(`[${new Date().toISOString()}] 🔄 Pinging Render at: ${url}`);
  protocol.get(url, (res) => {
    console.log(`[${new Date().toISOString()}] 🔄 Render ping status: ${res.statusCode}`);
  }).on("error", (err) => {
    console.log(`[${new Date().toISOString()}] ❌ Render ping failed: ${err.message}`);
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
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
} else {
  // In development, ignore SIGINT to keep server running
  process.on('SIGINT', () => {
    console.log('SIGINT received in development mode - ignoring to keep server running');
    console.log('Use Ctrl+C again to force quit, or stop the process manually');
  });
  
  // Also ignore SIGTERM in development
  process.on('SIGTERM', () => {
    console.log('SIGTERM received in development mode - ignoring to keep server running');
  });
}

export default app;
