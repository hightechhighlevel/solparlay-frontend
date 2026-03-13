'use client'

import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';

interface ConnectionStatus {
  backend: boolean;
  websocket: boolean;
  backendLatency?: number;
}

const StatusChecker = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    backend: false,
    websocket: false,
  });

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const start = Date.now();
        const backendURL = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:5000';
        const response = await fetch(`${backendURL}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const end = Date.now();
        
        setStatus(prev => ({
          ...prev,
          backend: response.ok,
          backendLatency: end - start,
        }));
      } catch (error) {
        console.error('Backend health check failed:', error);
        setStatus(prev => ({ ...prev, backend: false }));
      }
    };

    const checkWebSocket = () => {
      try {
        const wsURL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
        const ws = new WebSocket(wsURL);
        
        ws.onopen = () => {
          setStatus(prev => ({ ...prev, websocket: true }));
          ws.close();
        };
        
        ws.onerror = () => {
          setStatus(prev => ({ ...prev, websocket: false }));
        };
      } catch (error) {
        console.error('WebSocket check failed:', error);
        setStatus(prev => ({ ...prev, websocket: false }));
      }
    };

    checkBackend();
    checkWebSocket();
    
    // Recheck every 30 seconds
    const interval = setInterval(() => {
      checkBackend();
      checkWebSocket();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="text-xs font-semibold mb-2">Connection Status</div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs">Backend:</span>
          <Badge variant={status.backend ? 'success' : 'destructive'}>
            {status.backend ? 'Online' : 'Offline'}
          </Badge>
        </div>
        {status.backendLatency && (
          <div className="text-xs text-gray-500">
            Latency: {status.backendLatency}ms
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs">WebSocket:</span>
          <Badge variant={status.websocket ? 'success' : 'destructive'}>
            {status.websocket ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default StatusChecker;