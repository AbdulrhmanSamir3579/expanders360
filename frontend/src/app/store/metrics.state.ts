import { Injectable, signal, computed } from '@angular/core';
import { OverviewStats } from '@core/models/workflow.models';

@Injectable({ providedIn: 'root' })
export class MetricsState {
  private _stats = signal<OverviewStats>({
    totalWorkflowsToday: 0,
    averageCycleTime: 0,
    slaCompliance: 100,
    activeAnomaliesCount: 0
  });
  private _loading = signal<boolean>(true);
  private _lastUpdated = signal<Date | null>(null);

  readonly stats = this._stats.asReadonly();
  readonly loading = this._loading.asReadonly();



  readonly cycleTimeStatus = computed(() => {
    const cycleTime = this._stats().averageCycleTime;
    if (cycleTime < 30) return 'fast';
    if (cycleTime < 60) return 'normal';
    if (cycleTime < 90) return 'slow';
    return 'critical';
  });

  readonly slaStatus = computed(() => {
    const compliance = this._stats().slaCompliance;
    if (compliance >= 99) return 'excellent';
    if (compliance >= 98) return 'good';
    if (compliance >= 95) return 'warning';
    return 'critical';
  });

  readonly anomalyStatus = computed(() => {
    const count = this._stats().activeAnomaliesCount;
    if (count === 0) return 'none';
    if (count < 5) return 'low';
    if (count < 10) return 'medium';
    return 'high';
  });

  // Actions
  updateStats(stats: Partial<OverviewStats>): void {
    this._stats.update(current => ({ ...current, ...stats }));
    this._lastUpdated.set(new Date());
  }

  setStats(stats: OverviewStats): void {
    this._stats.set(stats);
    this._lastUpdated.set(new Date());
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }
}
