import {Injectable, signal, computed} from '@angular/core';
import {Anomaly} from '@core/models/workflow.models';


@Injectable({providedIn: 'root'})
export class AnomaliesState {
  private _anomalies = signal<Anomaly[]>([]);
  private _loading = signal<boolean>(true);

  readonly anomalies = this._anomalies.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly anomaliesLast24Hours = computed(() => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return this._anomalies()
      .filter(a => new Date(a.timestamp) >= twentyFourHoursAgo)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  });
  readonly anomaliesByHour = computed(() => {
    const byHour: { [hour: number]: Anomaly[] } = {};
    this.anomaliesLast24Hours().forEach(anomaly => {
      const hour = anomaly.hour ?? new Date(anomaly.timestamp).getHours();
      if (!byHour[hour]) {
        byHour[hour] = [];
      }
      byHour[hour].push(anomaly);
    });
    return byHour;
  });

  // Actions
  addAnomaly(anomaly: Anomaly): void {
    this._anomalies.update(anomalies => [...anomalies, anomaly]);
  }


  setAnomalies(anomalies: Anomaly[]): void {
    this._anomalies.set(anomalies);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }
}
