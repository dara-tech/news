#!/usr/bin/env node

/**
 * Simple test server to debug the enhancedSentinelService issue
 */

import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Test route to check if the service can be imported
app.get('/test-import', async (req, res) => {
  try {
    const enhancedSentinelService = await import('./services/enhancedSentinelService.mjs');
    
    if (typeof enhancedSentinelService.default.getStatus === 'function') {
      const status = await enhancedSentinelService.default.getStatus();
      res.json({ success: true, status });
    } else {
      res.json({ success: false, error: 'getStatus is not a function' });
    }
  } catch (error) {res.json({ success: false, error: error.message });
  }
});

const PORT = 5002;
app.listen(PORT, () => {
  // Test server running on port 5002
  // Test endpoint: http://localhost:5002/test-import
});