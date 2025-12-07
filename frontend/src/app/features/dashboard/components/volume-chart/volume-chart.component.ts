import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsState } from '@store/events.state';
import { UiState } from '@store/ui.state';
import { ChartComponent } from '@shared/charts/chart.component';

@Component({
  selector: 'app-volume-chart',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  template: `
    <div class="volume-chart-container card">
      <div class="chart-header">
        <h2 class="card-header">Workflow Volume</h2>
        <div class="time-range-filters">
          <button 
            class="btn"
            [class.btn-primary]="selectedTimeRange() === '6h'"
            [class.btn-secondary]="selectedTimeRange() !== '6h'"
            (click)="setTimeRange('6h')">
            6h
          </button>
          <button 
            class="btn"
            [class.btn-primary]="selectedTimeRange() === '12h'"
            [class.btn-secondary]="selectedTimeRange() !== '12h'"
            (click)="setTimeRange('12h')">
            12h
          </button>
          <button 
            class="btn"
            [class.btn-primary]="selectedTimeRange() === '24h'"
            [class.btn-secondary]="selectedTimeRange() !== '24h'"
            (click)="setTimeRange('24h')">
            24h
          </button>
        </div>
      </div>
      <app-chart
        type="bar"
        [data]="volumeData()"
        [height]="'350px'"
        [config]="{ showLabels: true, showGrid: true, hybrid: true }">
      </app-chart>
    </div>
  `,
  styles: [`
    .volume-chart-container {
      margin-bottom: var(--spacing-xl);
    }
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
    }
    
    .card-header {
      margin-bottom: 0;
    }
    
    .time-range-filters {
      display: flex;
      gap: var(--spacing-sm);
    }
    
    .btn {
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-sm);
    }
    
    @media (max-width: 768px) {
      .volume-chart-container {
        padding: 1rem !important;
      }
      
      .chart-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
      }
    }
  `]
})
export class VolumeChartComponent implements OnInit {
  private eventsState = inject(EventsState);
  private uiState = inject(UiState);
  
  selectedTimeRange = this.uiState.selectedTimeRange;
  
  // Computed signal for volume data based on time range
  volumeData = computed(() => {
    const events = this.eventsState.events();
    const range = this.selectedTimeRange();
    const hourCount = range === '6h' ? 6 : range === '12h' ? 12 : 24;
    
    // Group events by hour
    const now = new Date();
    const volumeByHour: { [hour: string]: number } = {};
    
    for (let i = hourCount - 1; i >= 0; i--) {
      const hourDate = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourKey = `${hourDate.getHours()}:00`;
      volumeByHour[hourKey] = 0;
    }
    
    events.forEach(event => {
      const eventDate = new Date(event.timestamp);
      const hoursSinceEvent = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceEvent <= hourCount) {
        const hourKey = `${eventDate.getHours()}:00`;
        volumeByHour[hourKey] = (volumeByHour[hourKey] || 0) + 1;
      }
    });
    
    return Object.entries(volumeByHour).map(([name, value]) => ({ name, value }));
  });
  
  ngOnInit(): void {}
  
  setTimeRange(range: '6h' | '12h' | '24h'): void {
    this.uiState.setTimeRange(range);
  }
}
