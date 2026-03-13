import { useEffect, useState } from 'react';

interface WebSocketMessage {
  type: string;
  message?: string;
  data?: any;
  timestamp?: string;
}

const useWebSocket = (url: string) => {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    socket.onmessage = (event) => {
      console.log('Message from server:', event.data);
      setMessage(event.data);
    };

    socket.onerror = (error) => {
      console.log('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    // Cleanup on unmount
    return () => {
      socket.close();
    };
  }, [url]);

  return message;
};

export default useWebSocket;
