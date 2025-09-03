import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import validator from 'validator';
import logger from '../utils/logger.mjs';

class EnhancedSecurityMiddleware {
  constructor() {
    this.suspiciousIPs = new Map();
    this.failedAttempts = new Map();
    this.blockedIPs = new Set();
    this.trustedIPs = new Set();
    
    // Load trusted IPs from environment
    if (process.env.TRUSTED_IPS) {
      process.env.TRUSTED_IPS.split(',').forEach(ip => {
        this.trustedIPs.add(ip.trim());
      });
    }
  }

  /**
   * Enhanced rate limiting with IP-based tracking
   */
  createRateLimit(options = {}) {
    const defaultOptions = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        const ip = this.getClientIP(req);
        this.trackSuspiciousActivity(ip, 'rate_limit_exceeded');
        
        logger.warn(`Rate limit exceeded for IP: ${ip}`, {
          ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
          method: req.method
        });
        
        res.status(429).json({
          success: false,
          message: 'Too many requests from this IP, please try again later.',
          retryAfter: Math.round(options.windowMs / 1000)
        });
      }
    };

    return rateLimit({ ...defaultOptions, ...options });
  }

  /**
   * Authentication rate limiting
   */
  createAuthRateLimit() {
    return this.createRateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 login attempts per windowMs
      skipSuccessfulRequests: true,
      handler: (req, res) => {
        const ip = this.getClientIP(req);
        this.trackFailedAttempt(ip, 'auth_failed');
        
        logger.warn(`Authentication rate limit exceeded for IP: ${ip}`, {
          ip,
          userAgent: req.get('User-Agent'),
          email: req.body?.email
        });
        
        res.status(429).json({
          success: false,
          message: 'Too many authentication attempts, please try again later.',
          retryAfter: 900 // 15 minutes in seconds
        });
      }
    });
  }

  /**
   * API rate limiting
   */
  createAPIRateLimit() {
    return this.createRateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 API requests per windowMs
      message: {
        error: 'API rate limit exceeded',
        retryAfter: '15 minutes'
      }
    });
  }

  /**
   * Enhanced helmet configuration
   */
  createHelmetConfig() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          connectSrc: ["'self'", "https://api.google.com", "wss:", "ws:"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          manifestSrc: ["'self'"],
          workerSrc: ["'self'", "blob:"],
          childSrc: ["'self'", "blob:"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"]
        }
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    });
  }

  /**
   * Input validation middleware
   */
  validateInput(schema) {
    return (req, res, next) => {
      try {
        const errors = [];
        
        // Validate request body
        if (req.body) {
          Object.keys(schema).forEach(field => {
            const rules = schema[field];
            const value = req.body[field];
            
            if (rules.required && (!value || value.toString().trim() === '')) {
              errors.push(`${field} is required`);
              return;
            }
            
            if (value && rules.type) {
              switch (rules.type) {
                case 'email':
                  if (!validator.isEmail(value)) {
                    errors.push(`${field} must be a valid email address`);
                  }
                  break;
                case 'url':
                  if (!validator.isURL(value)) {
                    errors.push(`${field} must be a valid URL`);
                  }
                  break;
                case 'string':
                  if (typeof value !== 'string') {
                    errors.push(`${field} must be a string`);
                  } else if (rules.minLength && value.length < rules.minLength) {
                    errors.push(`${field} must be at least ${rules.minLength} characters long`);
                  } else if (rules.maxLength && value.length > rules.maxLength) {
                    errors.push(`${field} must be no more than ${rules.maxLength} characters long`);
                  }
                  break;
                case 'number':
                  if (!validator.isNumeric(value.toString())) {
                    errors.push(`${field} must be a number`);
                  }
                  break;
                case 'boolean':
                  if (typeof value !== 'boolean') {
                    errors.push(`${field} must be a boolean`);
                  }
                  break;
              }
            }
            
            // Sanitize input
            if (value && rules.sanitize) {
              if (rules.sanitize === 'escape') {
                req.body[field] = validator.escape(value);
              } else if (rules.sanitize === 'trim') {
                req.body[field] = value.toString().trim();
              }
            }
          });
        }
        
        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
          });
        }
        
        next();
      } catch (error) {
        logger.error('Input validation error:', error);
        res.status(500).json({
          success: false,
          message: 'Validation error'
        });
      }
    };
  }

  /**
   * IP whitelist middleware
   */
  ipWhitelist(allowedIPs = []) {
    return (req, res, next) => {
      const clientIP = this.getClientIP(req);
      
      if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
        logger.warn(`Access denied for IP: ${clientIP}`, {
          ip: clientIP,
          path: req.path,
          userAgent: req.get('User-Agent')
        });
        
        return res.status(403).json({
          success: false,
          message: 'Access denied from this IP address'
        });
      }
      
      next();
    };
  }

  /**
   * Suspicious activity detection
   */
  detectSuspiciousActivity() {
    return (req, res, next) => {
      const ip = this.getClientIP(req);
      const userAgent = req.get('User-Agent');
      
      // Check for suspicious patterns
      const suspiciousPatterns = [
        /sqlmap/i,
        /nikto/i,
        /nmap/i,
        /masscan/i,
        /zap/i,
        /burp/i,
        /w3af/i,
        /havij/i,
        /sqlninja/i
      ];
      
      // Check user agent
      if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
        this.trackSuspiciousActivity(ip, 'suspicious_user_agent', { userAgent });
        logger.warn(`Suspicious user agent detected: ${userAgent}`, { ip, userAgent });
      }
      
      // Check for SQL injection patterns
      const sqlPatterns = [
        /union\s+select/i,
        /drop\s+table/i,
        /delete\s+from/i,
        /insert\s+into/i,
        /update\s+set/i,
        /or\s+1\s*=\s*1/i,
        /'or'1'='1/i,
        /admin'--/i
      ];
      
      const queryString = JSON.stringify(req.query);
      const bodyString = JSON.stringify(req.body);
      const combinedString = queryString + bodyString;
      
      if (sqlPatterns.some(pattern => pattern.test(combinedString))) {
        this.trackSuspiciousActivity(ip, 'sql_injection_attempt', { 
          query: req.query, 
          body: req.body 
        });
        logger.warn(`SQL injection attempt detected from IP: ${ip}`, { 
          ip, 
          query: req.query, 
          body: req.body 
        });
      }
      
      // Check for XSS patterns
      const xssPatterns = [
        /<script/i,
        /javascript:/i,
        /onload=/i,
        /onerror=/i,
        /onclick=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i
      ];
      
      if (xssPatterns.some(pattern => pattern.test(combinedString))) {
        this.trackSuspiciousActivity(ip, 'xss_attempt', { 
          query: req.query, 
          body: req.body 
        });
        logger.warn(`XSS attempt detected from IP: ${ip}`, { 
          ip, 
          query: req.query, 
          body: req.body 
        });
      }
      
      next();
    };
  }

  /**
   * Request logging middleware
   */
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      const ip = this.getClientIP(req);
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
          ip,
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          duration,
          userAgent: req.get('User-Agent'),
          referer: req.get('Referer'),
          contentLength: res.get('Content-Length')
        };
        
        if (res.statusCode >= 400) {
          logger.warn('HTTP Request', logData);
        } else {
          logger.info('HTTP Request', logData);
        }
      });
      
      next();
    };
  }

  /**
   * Security headers middleware
   */
  securityHeaders() {
    return (req, res, next) => {
      // Remove server information
      res.removeHeader('X-Powered-By');
      
      // Add security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      
      next();
    };
  }

  /**
   * Helper methods
   */
  getClientIP(req) {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           req.headers['x-forwarded-for']?.split(',')[0] ||
           '127.0.0.1';
  }

  trackSuspiciousActivity(ip, type, metadata = {}) {
    if (!this.suspiciousIPs.has(ip)) {
      this.suspiciousIPs.set(ip, []);
    }
    
    const activities = this.suspiciousIPs.get(ip);
    activities.push({
      type,
      timestamp: new Date(),
      metadata
    });
    
    // Keep only last 10 activities
    if (activities.length > 10) {
      activities.splice(0, activities.length - 10);
    }
    
    // Block IP if too many suspicious activities
    if (activities.length >= 5) {
      this.blockedIPs.add(ip);
      logger.warn(`IP blocked due to suspicious activity: ${ip}`, { activities });
    }
  }

  trackFailedAttempt(ip, type) {
    if (!this.failedAttempts.has(ip)) {
      this.failedAttempts.set(ip, []);
    }
    
    const attempts = this.failedAttempts.get(ip);
    attempts.push({
      type,
      timestamp: new Date()
    });
    
    // Keep only last 10 attempts
    if (attempts.length > 10) {
      attempts.splice(0, attempts.length - 10);
    }
  }

  isIPBlocked(ip) {
    return this.blockedIPs.has(ip);
  }

  isIPTrusted(ip) {
    return this.trustedIPs.has(ip);
  }

  /**
   * Get security statistics
   */
  getSecurityStats() {
    return {
      suspiciousIPs: this.suspiciousIPs.size,
      blockedIPs: this.blockedIPs.size,
      trustedIPs: this.trustedIPs.size,
      failedAttempts: this.failedAttempts.size
    };
  }

  /**
   * Clear old security data
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    // Clean up old suspicious activities
    for (const [ip, activities] of this.suspiciousIPs.entries()) {
      const recentActivities = activities.filter(activity => 
        now - activity.timestamp.getTime() < maxAge
      );
      
      if (recentActivities.length === 0) {
        this.suspiciousIPs.delete(ip);
      } else {
        this.suspiciousIPs.set(ip, recentActivities);
      }
    }
    
    // Clean up old failed attempts
    for (const [ip, attempts] of this.failedAttempts.entries()) {
      const recentAttempts = attempts.filter(attempt => 
        now - attempt.timestamp.getTime() < maxAge
      );
      
      if (recentAttempts.length === 0) {
        this.failedAttempts.delete(ip);
      } else {
        this.failedAttempts.set(ip, recentAttempts);
      }
    }
    
    logger.info('Security data cleanup completed');
  }
}

export default new EnhancedSecurityMiddleware();
