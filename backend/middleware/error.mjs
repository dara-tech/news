const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log error

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found"
    error = { message, statusCode: 404 }
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered"
    error = { message, statusCode: 400 }
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ")
    error = { message, statusCode: 400 }
  }

  // Determine the status code to use
  let statusCode = 500;
  
  // If response status has been set (like 401, 403, 404), use it
  if (res.statusCode !== 200) {
    statusCode = res.statusCode;
  }
  // Otherwise use error.statusCode if available
  else if (error.statusCode) {
    statusCode = error.statusCode;
  }
  // For auth-related errors, default to 401
  else if (error.message && error.message.includes('Not authorized')) {
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

export default errorHandler
