import { Component, OnInit, OnDestroy, inject, ViewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@core/services/api.service';
import { WebSocketService } from '@core/services/websocket.service';
import { EventsState } from '@store/events.state';
import { MetricsState } from '@store/metrics.state';
import { AnomaliesState } from '@store/anomalies.state';
import { UiState } from '@store/ui.state';
import { StatusCardsComponent } from './components/status-cards/status-cards.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { HeatmapComponent } from './components/heatmap/heatmap.component';
import { VolumeChartComponent } from './components/volume-chart/volume-chart.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatusCardsComponent,
    TimelineComponent,
    HeatmapComponent,
    VolumeChartComponent,
    ToastComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild(ToastComponent) toast!: ToastComponent;

  private apiService = inject(ApiService);
  private wsService = inject(WebSocketService);
  private eventsState = inject(EventsState);
  private metricsState = inject(MetricsState);
  private anomaliesState = inject(AnomaliesState);
  private uiState = inject(UiState);

  private wsSubscription?: Subscription;

  // Connection status
  connectionStatus = signal<'connected' | 'paused' | 'failed'>('connected');

  // UI State
  liveUpdatesEnabled = this.uiState.liveUpdatesEnabled;
  currentTheme = this.uiState.theme;

  ngOnInit(): void {
    // Initialize theme
    this.uiState.initializeTheme();

    // Load initial data
    this.loadInitialData();

    // Connect to WebSocket
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
    this.wsService.disconnect();
  }

  /**
   * Load initial data from API
   */
  private async loadInitialData(): Promise<void> {
    try {
      // Load overview stats
      this.apiService.getOverview().subscribe({
        next: (stats) => {
          this.metricsState.setStats(stats);
          this.metricsState.setLoading(false);
        },
        error: (error) => {
          console.error('Failed to load overview stats:', error);
          this.metricsState.setLoading(false);
          this.connectionStatus.set('failed');
        }
      });

      // Load timeline events
      this.apiService.getTimeline().subscribe({
        next: (timeline) => {
          const events = timeline.map(t => t.data);
          this.eventsState.setEvents(events);
          this.eventsState.setLoading(false);
        },
        error: (error) => {
          console.error('Failed to load timeline:', error);
          this.eventsState.setLoading(false);
        }
      });

      // Load anomalies
      this.apiService.getAnomalies().subscribe({
        next: (anomalies) => {
          this.anomaliesState.setAnomalies(anomalies);
          this.anomaliesState.setLoading(false);
        },
        error: (error) => {
          console.error('Failed to load anomalies:', error);
          this.anomaliesState.setLoading(false);
        }
      });
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.connectionStatus.set('failed');
    }
  }

  /**
   * Connect to WebSocket and handle real-time updates
   */
  private connectWebSocket(): void {
    this.wsService.connect();
    this.connectionStatus.set('connected');

    this.wsSubscription = this.wsService.messages$.subscribe({
      next: (message) => {
        // Only process if live updates are enabled
        if (this.uiState.liveUpdatesEnabled()) {
          this.handleWebSocketMessage(message);
        }
      },
      error: (error) => {
        console.error('WebSocket error:', error);
        this.connectionStatus.set('failed');
        this.toast.show({
          type: 'error',
          message: 'Connection lost. Attempting to reconnect...'
        });
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'event':
        this.eventsState.addEvent(message.data);
        this.toast.show({
          type: 'info',
          message: `New Event: ${message.data.title}`
        });
        break;
      case 'anomaly':
        this.anomaliesState.addAnomaly(message.data);
        this.toast.show({
          type: 'error',
          message: `Anomaly Detected: ${message.data.description || message.data.type || 'Unknown anomaly'}`
        });
        break;
      case 'stats_update':
        this.metricsState.updateStats(message.data);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  /**
   * Toggle live updates on/off
   */
  toggleLiveUpdates(): void {
    const newState = !this.uiState.liveUpdatesEnabled();
    this.uiState.setLiveUpdates(newState);

    if (newState) {
      this.connectionStatus.set('connected');
      this.toast.show({
        type: 'success',
        message: 'Live updates resumed'
      });
    } else {
      this.connectionStatus.set('paused');
      this.toast.show({
        type: 'info',
        message: 'Live updates paused'
      });
    }
  }

  /**
   * Refresh all data
   */
  refreshData(): void {
    this.toast.show({
      type: 'info',
      message: 'Refreshing data...'
    });

    this.metricsState.setLoading(true);
    this.eventsState.setLoading(true);
    this.anomaliesState.setLoading(true);

    this.loadInitialData();
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    this.uiState.toggleDarkMode();
  }

  /**
   * Get readable status text
   */
  getStatusText(): string {
    const status = this.connectionStatus();
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'paused':
        return 'Paused';
      case 'failed':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  }
}
