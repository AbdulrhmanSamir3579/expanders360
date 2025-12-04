import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OverviewStats, TimelineEvent, Anomaly } from '../models/workflow.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly API_URL = (window as any)['API_URL'] || 'http://localhost:3000';
  
  constructor(private http: HttpClient) {}
  
  getOverview(): Observable<OverviewStats> {
    return this.http.get<OverviewStats>(`${this.API_URL}/stats/overview`);
  }
  
  getTimeline(): Observable<TimelineEvent[]> {
    return this.http.get<TimelineEvent[]>(`${this.API_URL}/stats/timeline`);
  }
  
  getAnomalies(): Observable<Anomaly[]> {
    return this.http.get<Anomaly[]>(`${this.API_URL}/stats/anomalies`);
  }
  
  healthCheck(): Observable<{ status: string; timestamp: string }> {
    return this.http.get<{ status: string; timestamp: string }>(`${this.API_URL}/health`);
  }
}
