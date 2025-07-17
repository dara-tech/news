import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload'; // Imported but not used in original, adding usage
import connectDB from './config/db.js';
import connectCloudinary from './utils/cloudinary.js';
import errorHandler from './middleware/error.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import newsRoutes from './routes/news.js';
import categoryRoutes from './routes/categoryRoutes.js';
import dashboardRoutes from './routes/dashboard.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
connectDB();

// Connect to Cloudinary for media management
connectCloudinary();

// Initialize Express app
const app = express();

// Middleware
// Parse JSON request bodies
app.use(express.json());
// Parse cookies attached to the request
app.use(cookieParser());
// Enable file uploads (e.g., for multipart/form-data)
// This middleware processes files uploaded via forms.
app.use(fileUpload());

// Enable CORS (Cross-Origin Resource Sharing)
// Configured to allow requests from the specified frontend URL with credentials (cookies).
app.use(cors({
  origin: process.env.FRONTEND_URL, // Your frontend URL from environment variables
  credentials: true
}));

// Logging middleware for development environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Log HTTP requests in 'dev' format
}

// Define API routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/users', userRoutes); // User management routes
app.use('/api/news', newsRoutes);   // News article routes
app.use('/api/categories', categoryRoutes); // Category management routes
app.use('/api/dashboard', dashboardRoutes); // Dashboard-specific routes

// Serve frontend in production
// This block handles serving the Next.js static build when deployed in production.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  // Serve static files from the Next.js 'out' directory (after `next build && next export`)
  app.use(express.static(path.join(__dirname, '../frontend/out')));

  // For any other GET request, serve the main index.html from the Next.js 'out' directory.
  // This ensures that client-side routing in Next.js works correctly for direct URL access.
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/out', 'index.html'));
  });
} else {
  // In development, provide a simple message for the root URL
  app.get('/', (req, res) => {
    res.send('API is running in development mode...');
  });
}

// Error handling middleware
// This should be the last middleware added to catch all errors.
app.use(errorHandler);

// Set the port for the server to listen on
const PORT = process.env.PORT || 5001;

// Start the server
const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
// This catches any promise rejections that are not explicitly handled,
// logs the error, and gracefully shuts down the server.
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
