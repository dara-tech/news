#!/usr/bin/env node

/**
 * Test script for Data Quality Routes
 * Verifies that all data quality endpoints are accessible
 */

import express from 'express';
import dataQualityRoutes from './routes/dataQuality.mjs';

const app = express();
app.use(express.json());

// Mount the data quality routes
app.use('/api/admin/data-quality', dataQualityRoutes);

// Test route to verify server is running
app.get('/test', (req, res) => {
  res.json({ message: 'Test server is running' });
});

// List all routes
app.get('/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.regexp.toString().split('|').forEach((path) => {
        if (path && path !== '^\\/') {
          routes.push({
            path: path.replace(/[\\^$]/g, ''),
            methods: ['GET', 'POST', 'PUT', 'DELETE']
          });
        }
      });
    }
  });
  res.json({ routes });
});

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Test endpoints:');
  console.log(`- GET http://localhost:${PORT}/test`);
  console.log(`- GET http://localhost:${PORT}/routes`);
  console.log(`- GET http://localhost:${PORT}/api/admin/data-quality/enhanced-sentinel/status`);
});
