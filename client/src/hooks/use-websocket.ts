import { useEffect, useRef, useState } from 'react';
import { WebSocketMessage, QueueState } from '@shared/schema';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'queue_updated':
              if (message.data.rooms && message.data.tickets) {
                setQueueState(message.data);
              }
              break;
            case 'ticket_generated':
            case 'ticket_called':
              // Refresh queue state
              fetchQueueState();
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      // Retry connection after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    }
  };

  const fetchQueueState = async () => {
    try {
      const response = await fetch('/api/queue/state');
      if (response.ok) {
        const state: QueueState = await response.json();
        setQueueState(state);
      }
    } catch (error) {
      console.error('Failed to fetch queue state:', error);
    }
  };

  useEffect(() => {
    connect();
    fetchQueueState();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    queueState,
    refreshState: fetchQueueState,
  };
}
