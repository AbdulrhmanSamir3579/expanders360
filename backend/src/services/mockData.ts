import { WorkflowEvent, Anomaly, OverviewStats, TimelineEvent } from '../types';

class MockDataService {
  private events: WorkflowEvent[] = [];
  private anomalies: Anomaly[] = [];
  private startTime: Date = new Date();

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    const now = new Date();
    const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
    
    for (let i = 0; i < 24; i++) {
      const hourTimestamp = new Date(currentHour.getTime() - (i * 60 * 60 * 1000));
      const variance = Math.random() * 45 * 60 * 1000;
      const timestamp = new Date(hourTimestamp.getTime() + variance);
      this.events.push(this.generateEvent(timestamp));
    }

    for (let i = 0; i < 8; i++) {
      const randomHourOffset = Math.random() * 24 * 60 * 60 * 1000;
      const timestamp = new Date(currentHour.getTime() - randomHourOffset);
      this.anomalies.push(this.generateAnomaly(timestamp));
    }

    this.events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    this.anomalies.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEvent(timestamp: Date = new Date()): WorkflowEvent {
    const types: WorkflowEvent['type'][] = ['case_intake', 'approval', 'document_review', 'completed', 'delayed', 'sla_breach'];
    const statuses: WorkflowEvent['status'][] = ['completed', 'pending', 'anomaly'];
    
    const type = types[Math.floor(Math.random() * types.length)];
    let status: WorkflowEvent['status'];
    
    if (type === 'completed') {
      status = 'completed';
    } else if (type === 'delayed' || type === 'sla_breach') {
      status = 'anomaly';
    } else {
      status = Math.random() > 0.7 ? 'pending' : 'completed';
    }

    return {
      id: this.generateId(),
      type,
      status,
      timestamp: timestamp.toISOString(),
      title: this.getEventTitle(type),
      duration: Math.floor(Math.random() * 120) + 10
    };
  }

  private getEventTitle(type: WorkflowEvent['type']): string {
    const titles = {
      case_intake: 'New Case Received',
      approval: 'Approval Process',
      document_review: 'Document Review',
      completed: 'Workflow Completed',
      delayed: 'Workflow Delayed',
      sla_breach: 'SLA Breach Detected'
    };
    return titles[type];
  }

  private generateAnomaly(timestamp: Date = new Date()): Anomaly {
    const types: Anomaly['type'][] = ['delay', 'sla_breach', 'stuck_workflow', 'duplicate_case'];
    const severities: Anomaly['severity'][] = ['low', 'medium', 'high', 'critical'];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];

    return {
      id: this.generateId(),
      type,
      severity,
      timestamp: timestamp.toISOString(),
      description: this.getAnomalyDescription(type, severity),
      workflowId: `WF-${Math.floor(Math.random() * 10000)}`,
      hour: timestamp.getHours()
    };
  }

  private getAnomalyDescription(type: Anomaly['type'], severity: Anomaly['severity']): string {
    const descriptions = {
      delay: `${severity.toUpperCase()}: Workflow processing delayed beyond expected timeframe`,
      sla_breach: `${severity.toUpperCase()}: Service Level Agreement deadline exceeded`,
      stuck_workflow: `${severity.toUpperCase()}: Workflow stuck at approval stage`,
      duplicate_case: `${severity.toUpperCase()}: Potential duplicate case detected`
    };
    return descriptions[type];
  }

  public getOverviewStats(): OverviewStats {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayEvents = this.events.filter(e => new Date(e.timestamp) >= today);
    const completedEvents = todayEvents.filter(e => e.status === 'completed');
    
    const totalDuration = completedEvents.reduce((sum, e) => sum + (e.duration || 0), 0);
    const averageCycleTime = completedEvents.length > 0 ? totalDuration / completedEvents.length : 0;
    
    const slaCompliant = todayEvents.filter(e => e.type !== 'sla_breach' && e.type !== 'delayed').length;
    const slaCompliance = todayEvents.length > 0 ? (slaCompliant / todayEvents.length) * 100 : 100;
    
    const todayAnomalies = this.anomalies.filter(a => new Date(a.timestamp) >= today);

    return {
      totalWorkflowsToday: todayEvents.length,
      averageCycleTime: Math.round(averageCycleTime),
      slaCompliance: Math.round(slaCompliance * 10) / 10,
      activeAnomaliesCount: todayAnomalies.length
    };
  }

  public getTimelineEvents(): TimelineEvent[] {
    const now = new Date();
    const past24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEvents = this.events
      .filter(e => new Date(e.timestamp) >= past24Hours)
      .map(e => ({
        timestamp: e.timestamp,
        eventType: this.mapToTimelineEventType(e.type, e.status),
        data: e
      }));

    return recentEvents;
  }

  private mapToTimelineEventType(type: WorkflowEvent['type'], status: WorkflowEvent['status']): TimelineEvent['eventType'] {
    if (status === 'anomaly') return 'anomaly_detected';
    if (type === 'completed') return 'workflow_completed';
    if (type === 'sla_breach' || type === 'delayed') return 'sla_warning';
    return 'workflow_started';
  }

  public getAnomalies(): Anomaly[] {
    const now = new Date();
    const past24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return this.anomalies.filter(a => new Date(a.timestamp) >= past24Hours);
  }

  public addEvent(event?: WorkflowEvent): WorkflowEvent {
    const newEvent = event || this.generateEvent();
    this.events.push(newEvent);
    
    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
    
    return newEvent;
  }

  public addAnomaly(anomaly?: Anomaly): Anomaly {
    const newAnomaly = anomaly || this.generateAnomaly();
    this.anomalies.push(newAnomaly);
    
    // Keep only last 50 anomalies
    if (this.anomalies.length > 50) {
      this.anomalies = this.anomalies.slice(-50);
    }
    
    return newAnomaly;
  }

  public generateRandomEvent(): { type: 'event' | 'anomaly', data: WorkflowEvent | Anomaly } {
    // 70% chance of regular event, 30% chance of anomaly
    if (Math.random() > 0.3) {
      return {
        type: 'event',
        data: this.addEvent()
      };
    } else {
      return {
        type: 'anomaly',
        data: this.addAnomaly()
      };
    }
  }
}

export const mockDataService = new MockDataService();
