const WebSocket = require('ws');

console.log('Testing WebSocket connection to ws://localhost:5001');

const ws = new WebSocket('ws://localhost:5001');

ws.on('open', function open() {
  console.log('✅ WebSocket connected successfully!');
  
  // Send a test subscription message
  const message = {
    type: 'subscribe',
    newsId: 'test-news-id'
  };
  
  console.log('Sending message:', message);
  ws.send(JSON.stringify(message));
});

ws.on('message', function message(data) {
  console.log('📨 Received message:', data.toString());
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err.message);
});

ws.on('close', function close(code, reason) {
  console.log('🔌 WebSocket closed:', code, reason);
});

// Close after 5 seconds
setTimeout(() => {
  console.log('Closing connection...');
  ws.close();
}, 5000); 