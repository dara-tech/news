import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WebSocketStatusProps {
  isConnected: boolean;
  error?: string | null;
}

export default function WebSocketStatus({ isConnected, error }: WebSocketStatusProps) {
  if (error) {
    return (
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 text-yellow-600" />
        <Badge variant="secondary" className="text-xs">
          Fallback Mode
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-green-500" />
          <Badge variant="secondary" className="text-xs">
            Live
          </Badge>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-gray-400" />
          <Badge variant="secondary" className="text-xs">
            Connecting...
          </Badge>
        </>
      )}
    </div>
  );
} 