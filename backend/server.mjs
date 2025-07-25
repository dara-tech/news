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

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config()

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
    domain: isProduction ? 'news-eta-vert.vercel.app' : undefined, // Set your domain in production
  }
}));

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

let server = app.listen(PORT, () => {
})

// --- Prevent server from sleeping (keep-alive ping every 5 minutes) ---
const keepAlive = () => {
  // Always reload to https://news-eta-vert.vercel.app
  const targetUrl = "https://news-eta-vert.vercel.app";
  const timeout = parseInt(process.env.AUTO_RELOAD_TIMEOUT) || 10000; // 10 seconds

  const https = require('https');
  const protocol = https;

  const request = protocol.get(targetUrl, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      if (res.statusCode >= 400) {
      }
    });
  });

  request.on("error", (err) => {
  });

  request.on("timeout", () => {
    request.destroy();
  });

  request.setTimeout(timeout);
};

// Keep-alive scheduler (every 5 minutes, no sleep)
const startKeepAlive = () => {
  const interval = 5 * 60 * 1000; // 5 minutes
  const enabled = process.env.AUTO_RELOAD_ENABLED !== 'false'; // Enabled by default

  if (!enabled) {
    return;
  }

  // Initial ping after 1 minute
  setTimeout(() => {
    keepAlive();
  }, 60000);

  // Set up recurring pings every 5 minutes
  setInterval(() => {
    keepAlive();
  }, interval);
};

// Health check with keep-alive info
app.get("/auto-reload-status", (req, res) => {
  res.status(200).json({
    status: "OK",
    keepAlive: {
      enabled: process.env.AUTO_RELOAD_ENABLED !== 'false',
      url: "https://news-eta-vert.vercel.app",
      interval: `5 minutes`,
      timeout: `${parseInt(process.env.AUTO_RELOAD_TIMEOUT) || 10000}ms`
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Start keep-alive if in production
if (process.env.NODE_ENV === 'production') {
  startKeepAlive();
}

// Graceful shutdown handlers
process.on("unhandledRejection", (err, promise) => {
  server.close(() => process.exit(1))
})

process.on("SIGTERM", () => {
  server.close(() => {
  })
})

export default app
