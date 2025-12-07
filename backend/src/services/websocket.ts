import WebSocket from 'ws';
import { WebSocketMessage } from '../types';
import { mockDataService } from './mockData';

let wss: WebSocket.Server | null = null;
let broadcastInterval: NodeJS.Timeout | null = null;

export const initializeWebSocket = (server: any): void => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket client connected');

    // Send initial data
    const initialMessage: WebSocketMessage = {
      type: 'stats_update',
      data: mockDataService.getOverviewStats(),
      timestamp: new Date().toISOString()
    };
    ws.send(JSON.stringify(initialMessage));

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Broadcast events every 10-20 seconds
  startBroadcasting();
};

const startBroadcasting = (): void => {
  if (broadcastInterval) {
    clearInterval(broadcastInterval);
  }

  const broadcast = () => {
    if (!wss) return;

    // Generate random event (70% event, 30% anomaly)
    const randomEvent = mockDataService.generateRandomEvent();
    
    const message: WebSocketMessage = {
      type: randomEvent.type,
      data: randomEvent.data,
      timestamp: new Date().toISOString()
    };

    // Broadcast to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });

    // Also occasionally send stats updates
    if (Math.random() > 0.7) {
      const statsMessage: WebSocketMessage = {
        type: 'stats_update',
        data: mockDataService.getOverviewStats(),
        timestamp: new Date().toISOString()
      };

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(statsMessage));
        }
      });
    }

    const nextDelay = Math.floor(Math.random() * (400000 - 200000)) + 300000;
    setTimeout(broadcast, nextDelay);
  };

  setTimeout(broadcast, 5000);
};

export const getWebSocketServer = (): WebSocket.Server | null => {
  return wss;
};
