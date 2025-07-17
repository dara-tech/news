import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import fileUpload from "express-fileupload"
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

// Middleware
app.use(express.json({ limit: "10mb" }))
app.use(cookieParser())
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  }),
)

// CORS configuration for development and production
const allowedOrigins = [
  // Local development
  /^http:\/\/localhost:\d+$/,
  // Vercel preview URLs
  /^https:\/\/news-.*-dara-techs-projects\.vercel\.app$/,
  // Production URLs
  "https://news-gzuqibcz3-dara-techs-projects.vercel.app",
  "https://news-eta-vert.vercel.app",
  "https://news-git-main-dara-techs-projects.vercel.app",
  "https://news-6hf4wcylj-dara-techs-projects.vercel.app",
  "https://news-xnk1.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if the origin matches any of the allowed patterns
      const isAllowed = allowedOrigins.some(pattern => {
        if (typeof pattern === 'string') {
          return pattern === origin;
        } else if (pattern instanceof RegExp) {
          return pattern.test(origin);
        }
        return false;
      });

      if (!isAllowed) {
        const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
        console.warn(msg);
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400 // 24 hours
  })
);

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
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  
  // Auto-restart every 5 minutes (300,000 milliseconds)
  const RESTART_INTERVAL = 5 * 60 * 1000;
  setInterval(() => {
    console.log('🔄 Auto-restarting server...');
    server.close(() => {
      console.log('🔒 Server closed');
      server = app.listen(PORT, () => {
        console.log(`🚀 Server restarted on port ${PORT}`);
      });
    });
  }, RESTART_INTERVAL);
})

// Graceful shutdown handlers
process.on("unhandledRejection", (err, promise) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`)
  server.close(() => process.exit(1))
})

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...")
  server.close(() => {
    console.log("💤 Process terminated")
  })
})

export default app
