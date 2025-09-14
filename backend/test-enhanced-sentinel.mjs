#!/usr/bin/env node

/**
 * Test Enhanced Sentinel Service
 */

import enhancedSentinelService from './services/enhancedSentinelService.mjs';

async function testEnhancedSentinel() {
  try {
    // Test getStatus method
    const status = await enhancedSentinelService.getStatus();
    
    // Test if the method exists
    const methodExists = typeof enhancedSentinelService.getStatus;
    const availableMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(enhancedSentinelService));
    
  } catch (error) {}
}

testEnhancedSentinel();
