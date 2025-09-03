#!/usr/bin/env node

/**
 * Test Enhanced Sentinel Service
 */

import enhancedSentinelService from './services/enhancedSentinelService.mjs';

async function testEnhancedSentinel() {
  try {
    console.log('Testing Enhanced Sentinel Service...');
    
    // Test getStatus method
    console.log('Testing getStatus method...');
    const status = await enhancedSentinelService.getStatus();
    console.log('Status result:', JSON.stringify(status, null, 2));
    
    // Test if the method exists
    console.log('getStatus method exists:', typeof enhancedSentinelService.getStatus);
    console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(enhancedSentinelService)));
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testEnhancedSentinel();
