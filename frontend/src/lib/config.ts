// App configuration
export const config = {
  // WebSocket configuration
  websocket: {
    enabled: true, // Enable WebSocket for all environments
    reconnectAttempts: 5,
    connectionTimeout: 5000,
    heartbeatInterval: 30000,
  },
  
  // API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
    timeout: 10000,
  },
  
  // Feature flags
  features: {
    realTimeComments: true, // Enable real-time comments
    realTimeNotifications: false, // Disabled for now
  },
} as const;

export default config; 