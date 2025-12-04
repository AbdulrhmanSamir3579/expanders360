import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnomaliesState } from '@store/anomalies.state';
import { ChartComponent } from '@shared/charts/chart.component';
import { EChartsOption } from 'echarts';

interface HeatmapCell {
  hour: number;
  severity: string;
  count: number;
  anomalies: any[];
}

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  template: `
    <div class="heatmap-container card">
      <div class="heatmap-header">
        <div>
          <h2 class="card-header">Anomaly Heatmap</h2>
          <p class="card-description">Click any cell to view anomaly details</p>
        </div>
      </div>

      <div class="heatmap-chart">
        <app-chart
          type="heatmap"
          [data]="heatmapData()"
          [height]="'450px'"
          [config]="chartConfig"
          (cellClick)="handleCellClick($event)">
        </app-chart>
      </div>
    </div>

    <!-- Details Modal -->
    @if (selectedCell()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Anomaly Details</h3>
              <p class="modal-subtitle">
                {{ formatHour(selectedCell()!.hour) }}
              </p>
            </div>
            <button class="modal-close" (click)="closeModal()">
              <span>×</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="stats-row">
              <div class="stat-box">
                <span class="stat-label">Total Anomalies</span>
                <span class="stat-value">{{ selectedCell()!.count }}</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">Time Period</span>
                <span class="stat-value">{{ formatHour(selectedCell()!.hour) }}</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">Severity Distribution</span>
                <div class="severity-badges">
                  @for (severity of getSeverityCounts(selectedCell()!.anomalies); track severity.level) {
                    <span class="anomaly-badge" [class]="'badge-' + severity.level.toLowerCase()">
                      {{ severity.level }}: {{ severity.count }}
                    </span>
                  }
                </div>
              </div>
            </div>

            <div class="anomalies-list">
              <h4 class="list-title">Individual Anomalies</h4>
              <div class="anomaly-items">
                @for (anomaly of selectedCell()!.anomalies; track anomaly.id) {
                  <div class="anomaly-item">
                    <div class="anomaly-item-header">
                      <span class="anomaly-badge" [class]="'badge-' + anomaly.severity.toLowerCase()">
                        {{ anomaly.severity }}
                      </span>
                      <span class="anomaly-time">{{ anomaly.timestamp | date: 'HH:mm:ss' }}</span>
                    </div>
                    <h5 class="anomaly-title">{{ anomaly.title }}</h5>
                    <p class="anomaly-description">{{ anomaly.description || 'No description available' }}</p>
                    <div class="anomaly-meta">
                      <span class="meta-item">ID: {{ anomaly.id }}</span>
                      @if (anomaly.type) {
                        <span class="meta-item">Type: {{ anomaly.type }}</span>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .heatmap-container {
      margin-bottom: var(--spacing-xl);
    }

    .heatmap-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-lg);
      gap: var(--spacing-lg);
      flex-wrap: wrap;
    }

    .card-description {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: var(--spacing-xs) 0 0 0;
    }

    .heatmap-chart {
      cursor: pointer;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal);
      padding: var(--spacing-lg);
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      border-radius: 16px;
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: var(--shadow-xl);
      animation: slideUp 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: var(--spacing-xl);
      border-bottom: 1px solid var(--color-border-primary);
    }

    .modal-title {
      font-size: var(--font-size-xl);
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }

    .modal-subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: var(--spacing-xs) 0 0 0;
    }

    .modal-close {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid var(--color-border-primary);
      background: var(--color-bg-primary);
      color: var(--color-text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      line-height: 1;
      transition: all 0.2s ease;
    }

    .modal-close:hover {
      background: var(--color-bg-hover);
      border-color: var(--color-danger);
      color: var(--color-danger);
    }

    .modal-body {
      padding: var(--spacing-xl);
      overflow-y: auto;
      flex: 1;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }

    .stat-box {
      background: var(--color-bg-primary);
      border: 1px solid var(--color-border-primary);
      border-radius: 12px;
      padding: var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .stat-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .stat-value {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .severity-low { color: var(--color-success); }
    .severity-medium { color: var(--color-warning); }
    .severity-high { color: #f97316; }
    .severity-critical { color: var(--color-danger); }

    .severity-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .anomalies-list {
      margin-top: var(--spacing-xl);
    }

    .list-title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-md) 0;
    }

    .anomaly-items {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .anomaly-item {
      background: var(--color-bg-primary);
      border: 1px solid var(--color-border-primary);
      border-radius: 12px;
      padding: var(--spacing-lg);
      transition: all 0.2s ease;
    }

    .anomaly-item:hover {
      border-color: var(--chart-primary);
      box-shadow: var(--shadow-md);
    }

    .anomaly-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-sm);
    }

    .anomaly-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      font-size: var(--font-size-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-low {
      background: var(--color-success-light);
      color: var(--color-success);
    }

    .badge-medium {
      background: var(--color-warning-light);
      color: var(--color-warning);
    }

    .badge-high {
      background: rgba(249, 115, 22, 0.15);
      color: #f97316;
    }

    .badge-critical {
      background: var(--color-danger-light);
      color: var(--color-danger);
    }

    .anomaly-time {
      font-size: var(--font-size-sm);
      color: var(--color-text-tertiary);
      font-family: var(--font-family-mono);
    }

    .anomaly-title {
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .anomaly-description {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: 0 0 var(--spacing-sm) 0;
      line-height: 1.5;
    }

    .anomaly-meta {
      display: flex;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    .meta-item {
      font-size: var(--font-size-xs);
      color: var(--color-text-tertiary);
      font-family: var(--font-family-mono);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .heatmap-header {
        flex-direction: column;
      }

      .legend {
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
      }

      .modal-content {
        max-width: 100%;
        max-height: 100vh;
        border-radius: 0;
      }

      .stats-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HeatmapComponent implements OnInit {
  private anomaliesState = inject(AnomaliesState);

  selectedCell = signal<HeatmapCell | null>(null);

  chartConfig = {
    showLabels: true,
    showGrid: true,
  };

  // Computed signal for heatmap data with enhanced structure
  // In HeatmapComponent, update the heatmapData computed signal:

  heatmapData = computed(() => {
    const byHour = this.anomaliesState.anomaliesByHour();
    const data: any[] = [];
    const cellMap = new Map<string, HeatmapCell>();

    const severityMap = {
      'low': 0,
      'medium': 1,
      'high': 2,
      'critical': 3
    };

    const severityOrder = ['low', 'medium', 'high', 'critical'];

    // Only process hours that have anomalies
    Object.entries(byHour).forEach(([hour, anomalies]) => {
      // Group anomalies by severity for this hour
      const severityGroups: { [key: number]: any[] } = {};

      anomalies.forEach(anomaly => {
        const severityIndex = severityMap[anomaly.severity.toLowerCase() as keyof typeof severityMap];

        if (!severityGroups[severityIndex]) {
          severityGroups[severityIndex] = [];
        }
        severityGroups[severityIndex].push(anomaly);
      });

      // Create data points only for severities that exist in this hour
      Object.entries(severityGroups).forEach(([severityIndex, anomalyGroup]) => {
        const idx = parseInt(severityIndex);
        const key = `${hour}-${idx}`;

        const cell: HeatmapCell = {
          hour: parseInt(hour),
          severity: severityOrder[idx],
          count: anomalyGroup.length,
          anomalies: anomalyGroup
        };

        cellMap.set(key, cell);

        // Push data point - this is what ECharts will render
        data.push({
          x: parseInt(hour),
          y: idx,
          value: cell.count,
          cellData: cell
        });
      });
    });

    console.log('Heatmap data points:', data.length);
    console.log('Sample data:', data.slice(0, 5));

    return data;
  });

  ngOnInit(): void {}

  handleCellClick(cellData: HeatmapCell): void {
    this.selectedCell.set(cellData);
  }

  closeModal(): void {
    this.selectedCell.set(null);
  }

  formatHour(hour: number): string {
    const start = hour.toString().padStart(2, '0');
    const end = ((hour + 1) % 24).toString().padStart(2, '0');
    return `${start}:00 - ${end}:00`;
  }

  getSeverityCounts(anomalies: any[]): { level: string; count: number }[] {
    const counts: { [key: string]: number } = {};

    anomalies.forEach(anomaly => {
      const severity = anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1).toLowerCase();
      counts[severity] = (counts[severity] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => {
        const order = { 'Low': 0, 'Medium': 1, 'High': 2, 'Critical': 3 };
        return (order[a.level as keyof typeof order] || 0) - (order[b.level as keyof typeof order] || 0);
      });
  }
}
