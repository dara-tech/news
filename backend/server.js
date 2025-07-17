import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import fileUpload from "express-fileupload"
import connectDB from "./config/db.js"
import connectCloudinary from "./utils/cloudinary.js"
import errorHandler from "./middleware/error.js"
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import newsRoutes from "./routes/news.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import dashboardRoutes from "./routes/dashboard.js"

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

// CORS configuration for separate frontend deployment
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

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

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
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
