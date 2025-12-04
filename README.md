# Legal Workflow Monitoring & Anomaly Detection Dashboard

A real-time monitoring dashboard for legal workflow analytics with WebSocket-powered live updates, anomaly detection, and comprehensive visualization.

![Dashboard Preview](https://img.shields.io/badge/Angular-18-red) ![Node.js](https://img.shields.io/badge/Node.js-20-green) ![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-blue) ![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)

## 🎯 Features

✅ **Real-Time Monitoring**
- WebSocket-powered live event streaming
- Auto-updating metrics and charts
- Configurable update pause/resume

✅ **Comprehensive Visualizations**
- Real-time event timeline
- Anomaly heatmap (hour × severity)
- Workflow volume charts with time filters (6h/12h/24h)
- Interactive status cards

✅ **State Management**
- Angular Signals for reactive state
- Computed properties for derived data
- LocalStorage persistence for theme

✅ **Dark/Light Mode**
- System preference detection
- Manual toggle with smooth transitions
- Neutral chart colors optimized for both themes

✅ **Error Handling & Resilience**
- 5% random error injection for testing
- Automatic retry with exponential backoff
- Toast notifications for user feedback
- WebSocket auto-reconnection

✅ **Filtering & Controls**
- Event category filtering
- Anomaly type filtering
- Time range selection

✅ **Production Ready**
- Docker & Docker Compose
- Health checks
- Responsive design (mobile/tablet/desktop)

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Ports 3000 and 4200 available

### One-Command Start

```bash
docker-compose up --build
```

That's it! The application will be available at:
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **WebSocket**: ws://localhost:3000

## 📊 Tech Stack

### Frontend
- **Framework**: Angular 18 (Standalone Components)
- **State Management**: Angular Signals
- **Charts**: ECharts via custom abstraction layer
- **Styling**: Custom CSS with CSS Variables
- **HTTP Client**: Angular HttpClient with interceptors
- **WebSocket**: Native WebSocket API

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express + TypeScript
- **Real-time**: WebSocket (ws library)
- **Data**: Mock data generators
- **Error Simulation**: 5% random failure injection

### DevOps
- **Containerization**: Docker multi-stage builds
- **Orchestration**: Docker Compose
- **Web Server**: Nginx (for production frontend)

## 🏗️ Architecture

```
exp360/
├── backend/              # Node.js + Express + WebSocket
│   ├── src/
│   │   ├── server.ts           # Main server & WebSocket init
│   │   ├── controllers/         # REST API controllers
│   │   ├── services/           # Mock data & WebSocket
│   │   └── types/              # TypeScript interfaces
│   └── Dockerfile
├── frontend/             # Angular 18 Application
│   ├── src/app/
│   │   ├── core/               # Singleton services
│   │   │   ├── services/       # API, WebSocket, Theme
│   │   │   ├── models/         # TypeScript interfaces
│   │   │   └── interceptors/   # HTTP error interceptor
│   │   ├── features/
│   │   │   └── dashboard/      # Dashboard feature module
│   │   │       └── components/ # All dashboard components
│   │   ├── shared/             # Reusable components & charts
│   │   │   ├── components/     # Skeleton, Toast, Navbar
│   │   │   └── charts/         # Chart abstraction layer
│   │   ├── store/              # Signals-based state
│   │   │   ├── events.state.ts
│   │   │   ├── metrics.state.ts
│   │   │   ├── anomalies.state.ts
│   │   │   └── ui.state.ts
│   │   └── styles/             # CSS theming
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

## 💻 Manual Development Setup

### Backend

```bash
cd backend
npm install
npm run dev  # Runs on http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm start    # Runs on http://localhost:4200
```

## 🔧 Environment Variables

### Backend
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

### Frontend
The frontend uses a **runtime configuration** strategy to support "Build Once, Deploy Anywhere".

- **Local Development**: Uses `public/env.js` (default values)
- **Production**: `docker-entrypoint.sh` automatically generates `env.js` from environment variables at runtime.

No build-time configuration is needed for API URLs!

## 🛡️ Error Handling

### Backend Error Simulation
The backend includes a 5% random error injection middleware that simulates server failures:
- Randomly returns 500 Internal Server Error
- Helps test frontend resilience
- Excluded from `/health` endpoint

### Frontend Error Handling
- **HTTP Interceptor**: Automatically retries failed requests (2 attempts with exponential backoff)
- **WebSocket Reconnection**: Auto-reconnects with exponential backoff on connection loss
- **Toast Notifications**: User-friendly error messages via toast system

## 📡 API Documentation

### REST Endpoints

#### GET /health
Health check endpoint
```json
Response: {
  "status": "ok",
  "timestamp": "2025-12-02T10:00:00.000Z"
}
```

#### GET /stats/overview
Get overview statistics
```json
Response: {
  "totalWorkflowsToday": 45,
  "averageCycleTime": 67,
  "slaCompliance": 94.5,
  "activeAnomaliesCount": 3
}
```

#### GET /stats/timeline
Get timeline events (last 24 hours)
```json
Response: [
  {
    "timestamp": "2025-12-02T10:00:00.000Z",
    "eventType": "workflow_completed",
    "data": { /* WorkflowEvent */ }
  }
]
```

#### GET /stats/anomalies
Get anomalies (last 24 hours)
```json
Response: [
  {
    "id": "...",
    "type": "sla_breach",
    "severity": "high",
    "timestamp": "2025-12-02T10:00:00.000Z",
    "description": "...",
    "workflowId": "WF-1234",
    "hour": 10
  }
]
```

### WebSocket Protocol

**Connection**: `ws://localhost:3000`

**Message Format**:
```json
{
  "type": "event" | "anomaly" | "stats_update",
  "data": { /* Event data */ },
  "timestamp": "2025-12-02T10:00:00.000Z"
}
```

- Events broadcast every 10-20 seconds
- Auto-reconnection with exponential backoff
- Connection status tracking

## 📦 Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Deploying to Cloud Platforms

#### Railway (Recommended for Quick Deployment)

1. Create a Railway account at https://railway.app
2. Install Railway CLI: `npm i -g @railway/cli`
3. Login: `railway login`
4. Initialize project:
   ```bash
   railway init
   ```
5. Deploy:
   ```bash
   railway up
   ```
6. Set environment variables in Railway dashboard
7. Railway will auto-detect Dockerfiles and deploy both services

#### Render

1. Create account at https://render.com
2. Create a **New Web Service** for backend:
   - Connect your Git repository
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
   - Environment: `Node`
3. Create a **New Static Site** for frontend:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist/frontend/browser`
4. Update frontend environment to point to backend URL

#### Azure App Service

1. Install Azure CLI
2. Login: `az login`
3. Create resource group:
   ```bash
   az group create --name legal-workflow-rg --location eastus
   ```
4. Deploy using Docker Compose:
   ```bash
   az webapp create --resource-group legal-workflow-rg \
     --plan myAppServicePlan --name legal-workflow-app \
     --multicontainer-config-type compose \
     --multicontainer-config-file docker-compose.yml
   ```

### Manual Deployment

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
# Serve dist/frontend/browser with any static server
# Or use the built Docker image with Nginx
```

## 🧪 Testing

### Development Testing
1. Start both services: `docker-compose up`
2. Open http://localhost:4200
3. Verify real-time updates are working
4. Toggle theme (dark/light)
5. Test filters and time range selectors
6. Monitor Network tab for WebSocket connection
7. Observe 5% error rate and automatic retries

### Responsive Testing
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

Open DevTools and test all breakpoints.

## 📄 License

This project is built as a demonstration of modern web development practices with Angular 18, Node.js, WebSocket, and Docker.

**Built with ❤️ using Angular 21, Node.js, and ECharts**
