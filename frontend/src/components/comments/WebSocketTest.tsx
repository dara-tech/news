import {  useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function WebSocketTest() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [messages, setMessages] = useState<string[]>([]);

  const connect = () => {
    setStatus('connecting');
    
    // Try different ports
    const ports = ['5001', '3001', '8080', window.location.port];
    let currentPortIndex = 0;
    
    const tryConnect = () => {
      if (currentPortIndex >= ports.length) {
        setStatus('error');
        setMessages(prev => [...prev, 'All ports failed']);
        return;
      }
      
      const port = ports[currentPortIndex];
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname;
      const wsUrl = `${protocol}//${host}:${port}`;
      
      setMessages(prev => [...prev, `Trying ${wsUrl}...`]);
      
      const newWs = new WebSocket(wsUrl);
      
      newWs.onopen = () => {
        setStatus('connected');
        setWs(newWs);
        setMessages(prev => [...prev, `Connected to ${wsUrl}`]);
        
        // Send a test message
        newWs.send(JSON.stringify({
          type: 'subscribe',
          newsId: 'test-news-id'
        }));
      };
      
      newWs.onmessage = (event) => {
        setMessages(prev => [...prev, `Received: ${event.data}`]);
      };
      
      newWs.onerror = (error) => {
        setMessages(prev => [...prev, `Error on ${wsUrl}: ${error}`]);
        currentPortIndex++;
        setTimeout(tryConnect, 1000);
      };
      
      newWs.onclose = (event) => {
        setMessages(prev => [...prev, `Closed ${wsUrl}: ${event.code} ${event.reason}`]);
        if (status === 'connecting') {
          currentPortIndex++;
          setTimeout(tryConnect, 1000);
        }
      };
    };
    
    tryConnect();
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
      setWs(null);
      setStatus('disconnected');
    }
  };

  const sendTestMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'subscribe',
        newsId: 'test-news-id'
      }));
      setMessages(prev => [...prev, 'Sent test message']);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">WebSocket Test</h3>
      
      <div className="flex gap-2 mb-4">
        <Button 
          onClick={connect} 
          disabled={status === 'connecting' || status === 'connected'}
          variant="outline"
        >
          Connect
        </Button>
        <Button 
          onClick={disconnect} 
          disabled={status === 'disconnected'}
          variant="outline"
        >
          Disconnect
        </Button>
        <Button 
          onClick={sendTestMessage} 
          disabled={status !== 'connected'}
          variant="outline"
        >
          Send Test
        </Button>
      </div>
      
      <div className="mb-4">
        <Badge variant={status === 'connected' ? 'default' : status === 'connecting' ? 'secondary' : 'destructive'}>
          {status}
        </Badge>
      </div>
      
      <div className="bg-gray-100 p-2 rounded text-sm max-h-40 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="mb-1">{msg}</div>
        ))}
      </div>
    </div>
  );
} 