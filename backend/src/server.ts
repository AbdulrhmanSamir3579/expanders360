import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { getOverview, getTimeline, getAnomalies } from './controllers/statsController';
import { initializeWebSocket } from './services/websocket';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Simulate 5% random server errors
app.use((req: Request, res: Response, next) => {
  // Skip health check and static assets if any
  if (req.path === '/health') {
    return next();
  }

  if (Math.random() < 0.05) {
    console.log(`[SIMULATION] 💥 Injecting 500 Error for ${req.method} ${req.path}`);
    res.status(500).json({ 
      error: 'Simulated Internal Server Error',
      message: 'Random failure injection for testing resilience'
    });
    return;
  }
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/stats/overview', getOverview);
app.get('/stats/timeline', getTimeline);
app.get('/stats/anomalies', getAnomalies);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
initializeWebSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET  /health`);
  console.log(`  GET  /stats/overview`);
  console.log(`  GET  /stats/timeline`);
  console.log(`  GET  /stats/anomalies`);
  console.log(`  WS   ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
